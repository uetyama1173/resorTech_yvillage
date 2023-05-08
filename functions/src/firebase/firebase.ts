import * as admin from "firebase-admin";
import * as serviceAccount from "../serviceAccountKey.json";

//認証
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: serviceAccount.project_id,
});
const firestore = admin.firestore();

// ユーザーの回答を管理するクラス
export class UserRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  //Userの回答を初期化する
  async initializeUser() {
    await firestore
      .collection("users")
      .doc(this.userId)
      .set({
        answer: { ans_1: 0, ans_2: 0, ans_3: 0 },
        question_id: { que_1: 0, que_2: 0, que_3: 0 },
      });
  }

  //Userの回答を取得する
  async getUserdata(): Promise<any> {
    // Firestoreからuserの回答を取得するロジック
    const docRef = await firestore.collection("users").doc(this.userId).get();
    const HasUserData = docRef.data();
    return HasUserData;
  }

  //Userの回答を更新する
  async updateUserdata(
    propertyName: string,
    subPropertyName: string,
    newValue: number
  ): Promise<void> {
    // Firestoreでuserの回答値を更新するロジック
    const docRef = firestore.collection("users").doc(this.userId);
    await docRef.update({ [`${propertyName}.${subPropertyName}`]: newValue });
  }

  //質問番号に応じて，質問内容と質問項目を取得する関数 //returnはオブジェクト
  //{question: '年齢はいくつですか？', answerQueries: { '1': '20代', '2': '30~40代', '3': '50~60代', '4': '60代以上' }}
  async getQuestionData(question_id: string) {
    let result = {};
    const querySnapshot = await firestore
      .collection("questions")
      .where("question_id", "==", question_id)
      .get();
    querySnapshot.forEach((doc) => {
      const answerQueries = doc.data().answers;
      result = {
        question: doc.id,
        answerQueries,
      };
    });
    return result;
  }
}

// //テスト用
// async function test() {
//   //インスタンス生成
//   const instance_John = new UserRepository("John");
//   //回答値を取得する
//   // let UserObj = await instance_John.getUserdata();

//   //質問プロパティの que_1 を更新する
//   const new_que_1_value = 1;
//   await instance_John.updateUserdata("question_id", "que_1", new_que_1_value);
// }
// //# sourceMappingURL=firebase.js.map

// test();
