import * as functions from "firebase-functions";
import * as line from "@line/bot-sdk";
// import * as admin from "firebase-admin";
import express from "express";

import { UserRepository } from "./firebase/firebase"; //　データクラス
import { getRandomUnaskedQuestion, QuestionJSON } from "./helpers/utils";

// LINE初期化
const configJson = require("../credentials.json");
const config = {
  channelSecret: configJson.channel_secret,
  channelAccessToken: configJson.channel_access_token,
};
const client = new line.Client(config);

// APIハンドラー
const app = express();
app.post("/", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// イベント処理
async function handleEvent(event: any): Promise<any> {
  // DB接続
  const firestore = new UserRepository(event.source.userId);

  if (
    event.type === "message" &&
    event.message.type === "text" &&
    event.message.text === "観光スポットを見つける"
  ) {
    const replyToken: string = event.replyToken;

    // Userの回答情報を初期化する
    await firestore.initializeUser();

    // Userの回答情報を取得する
    const HasUserAnsData = await firestore.getUserAnsdata();
    const question_Id = await getRandomUnaskedQuestion(
      HasUserAnsData.question_id
    );

    // 質問文を生成する
    const questionData = await firestore.getQuestionData(question_Id);
    const questionMeessage: any = QuestionJSON(questionData); //TODO: anyをなくす

    // 応答メッセージを送信する
    await client.replyMessage(replyToken, questionMeessage);
  }
}

// Cloud Functionsにエクスポート
exports.lineBotV01 = functions.https.onRequest(app);
