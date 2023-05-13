import * as functions from "firebase-functions";
import * as line from "@line/bot-sdk";
// import * as admin from "firebase-admin";
import express from "express";

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
async function handleEvent(event: line.WebhookEvent): Promise<any> {
  if (
    event.type === "message" &&
    event.message.type === "text" &&
    event.message.text === "観光スポットを見つける"
  ) {
    // const getUserId: string | undefined = event.source.userId;
    const replyToken: string = event.replyToken;

    // 応答メッセージを送信します
    await client.replyMessage(replyToken, {
      type: "text",
      text: "テスト",
    });
  }
}

// Cloud Functionsにエクスポート
exports.lineBotV01 = functions.https.onRequest(app);