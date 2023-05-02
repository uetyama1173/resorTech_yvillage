import * as admin from "firebase-admin";
import * as serviceAccount from "../serviceAccountKey.json";

//認証情報を使ってFirebase Admin SDKの初期化
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id,
});
const firestore = admin.firestore();


//ユーザー情報を初期化
async function initializeUser(userId: string) {
    await firestore.collection("users").doc(userId).set({
      answer: { ans_1: 0, ans_2: 0, ans_3: 0 },
      question_id: { que_1: 0, que_2: 0, que_3: 0 },
    });
  }



//テスト関数
async function test(){
    await initializeUser("John")
}

test();
