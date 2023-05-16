import * as functions from "firebase-functions";
import * as line from "@line/bot-sdk";
// import * as admin from "firebase-admin";
import express from "express";

import { UserRepository } from "./firebase/firebase"; //　データクラス
import {
  calculateCosineSimilarity,
  createCarouselTemplate,
  getRandomUnaskedQuestion,
  QuestionJSON,
} from "./helpers/utils";

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

  const replyToken: string = event.replyToken;

  if (
    event.type === "message" &&
    event.message.type === "text" &&
    event.message.text === "観光スポットを見つける"
  ) {
    await firestore.initializeUser(); //TODO: null値にする

    // Userの回答情報を取得する
    const HasUserAnsData = await firestore.getUserAnsdata();
    const question_Id = await getRandomUnaskedQuestion(
      HasUserAnsData.question_id
    );

    // 質問IDを更新する
    await firestore.updateUserdata("question_id", "que_1", question_Id);

    // 質問内容を取得する
    const questionData = await firestore.getQuestionData(question_Id);
    const questionMeessage: any = QuestionJSON(questionData); //TODO: anyをなくす

    // 応答メッセージを送信する
    await client.replyMessage(replyToken, questionMeessage);
  }

  if (event.type === "postback") {
    //User情報
    const HasUserAnsData = await firestore.getUserAnsdata();

    if (
      HasUserAnsData.question_id.que_1 &&
      HasUserAnsData.question_id.que_2 &&
      HasUserAnsData.question_id.que_3
    ) {
      // Userの回答情報を更新する
      await firestore.updateUserdata("answer", "ans_3", event.postback.data);

      // Userの回答情報を取得する
      const HasUserAnsData = await firestore.getUserAnsdata();
      const spotData = await firestore.getSpotDataCal();

      //cos類似度で計算
      const cosSimilarity = await calculateCosineSimilarity(
        spotData,
        HasUserAnsData.answer
      );

      const result: any = await firestore.getSpotDataById(cosSimilarity);
      const resultMessage: any = await createCarouselTemplate(result); //TODO: anyをなくす

      console.log(resultMessage)

      // 応答メッセージを送信する
      await client.replyMessage(replyToken, resultMessage);
    }

    if (HasUserAnsData.question_id.que_2) {
      // Userの回答情報を更新する
      await firestore.updateUserdata("answer", "ans_2", event.postback.data);

      // ランダムで質問番号を取得する
      const question_Id = await getRandomUnaskedQuestion(
        HasUserAnsData.question_id
      );

      // Userの質問番号を更新する
      await firestore.updateUserdata("question_id", "que_3", question_Id);

      // 質問内容を取得する
      const questionData = await firestore.getQuestionData(question_Id);
      const questionMeessage: any = QuestionJSON(questionData); //TODO: anyをなくす

      // 応答メッセージを送信する
      await client.replyMessage(replyToken, questionMeessage);
    }

    if (HasUserAnsData.question_id.que_1) {
      // Userの回答情報を更新する
      await firestore.updateUserdata("answer", "ans_1", event.postback.data);

      // ランダムで質問番号を取得する
      const question_Id = await getRandomUnaskedQuestion(
        HasUserAnsData.question_id
      );

      // Userの質問番号を更新する
      await firestore.updateUserdata("question_id", "que_2", question_Id);

      // 質問内容を取得する
      const questionData = await firestore.getQuestionData(question_Id);
      const questionMeessage: any = QuestionJSON(questionData); //TODO: anyをなくす

      // 応答メッセージを送信する
      await client.replyMessage(replyToken, questionMeessage);
    }
  }
}

// Cloud Functionsにエクスポート
exports.lineBotV01 = functions.https.onRequest(app);
