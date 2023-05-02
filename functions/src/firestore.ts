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
  await firestore
    .collection("users")
    .doc(userId)
    .set({
      answer: { ans_1: 0, ans_2: 0, ans_3: 0 },
      question_id: { que_1: 0, que_2: 0, que_3: 0 },
    });
}

//値の読み取り // 質問ID 回答ID
async function readUsers(userId: string) {
  const docRef = await firestore.collection("users").doc(userId).get();
  const HasUserAns = docRef.data();
  return HasUserAns;
}


//回答の更新
async function updateUserAnswer(userId: string, updatedAnswer: any) {
  const docRef = firestore.collection('users').doc(userId);
  await docRef.update({ answer: updatedAnswer });
}

//質問IDの更新
async function updateUserQuestionId(userId: string, updatedQuestionId: any) {
  const docRef = firestore.collection('users').doc(userId);
  await docRef.update({ question_id: updatedQuestionId });
}



async function test() {
  const userId = "John";
  await readUsers(userId);
}

test();
