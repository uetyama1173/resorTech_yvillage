import * as admin from "firebase-admin";
import * as serviceAccount from "../serviceAccountKey.json";

// 計算結果
interface spotDataCalOutput {
  id: string;
  cosineSimilarity: number;
}

// 観光地を出力する
interface SpotDataJSON {
  id: string;
  img_url: string;
  outline: string;
}

// Userの持つ回答情報
interface HasUserData {
  answer: Record<string, number>;
  question_id: Record<string, number>;
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: serviceAccount.project_id,
});
const firestore = admin.firestore();


export class UserRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }


  async initializeUser() {
    await firestore
      .collection("users")
      .doc(this.userId)
      .set({
        answer: { ans_1: 0, ans_2: 0, ans_3: 0 },
        question_id: { que_1: 0, que_2: 0, que_3: 0 },
      });
  }

  /**
   * ユーザの回答を取得する
   * @returns {Promise<HasUserData>} - ユーザの回答 
   */
  async getUserAnsdata(): Promise<HasUserData> {
    // Firestoreからuserの回答を取得するロジック
    const docRef = await firestore.collection("users").doc(this.userId).get();
    const HasUserData:any  = docRef.data(); //TODO: anyをなくしたい
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

  /**
   * 質問番号に応じて，質問内容と質問項目を取得する関数
   * @param {number} question_id - 質問番号
   * @returns {Promise<HasUserData>} - ユーザの回答
   */
  //質問番号に応じて，質問内容と質問項目を取得する関数 //returnはオブジェクト
  //{question: '年齢はいくつですか？', answerQueries: { '1': '20代', '2': '30~40代', '3': '50~60代', '4': '60代以上' }}
  async getQuestionData(question_id: number) {
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

  //観光情報を取得する(計算用)
  async getSpotDataCal() {
    const querySnapshot = await firestore.collection("spots").get();
    let spot_param: any = [];
    querySnapshot.forEach((doc) => {
      const param = doc.data().param;
      spot_param.push({
        id: doc.id,
        ans1: param.ans1,
        ans2: param.ans2,
        ans3: param.ans3,
      });
    });
    return spot_param;
  }

  //IDと一致した観光情報を取得する(表示用)
  async getSpotData() {
    const querySnapshot = await firestore.collection("spots").get();
    let spot_param: any = [];
    querySnapshot.forEach((doc) => {
      const param = doc.data().param;
      spot_param.push({
        id: doc.id,
        ans1: param.ans1,
        ans2: param.ans2,
        ans3: param.ans3,
      });
    });
    return spot_param;
  }

  //id情報から観光情報を取得する関数
  //@param [
  //{ id: '国営越後丘稜公園', cosineSimilarity: 0.9958705948858224 },
  //{ id: '寺泊', cosineSimilarity: 0.9914601339836675 },
  //{ id: '長岡花火館', cosineSimilarity: 0.7637626158259734 }]
  async getSpotDataById(cosineSimilarityResult: spotDataCalOutput[]) {
    let results: SpotDataJSON[] = [];
    for (let spot of cosineSimilarityResult) {
      const docRef = firestore.collection("spots").doc(spot.id);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          results.push({
            id: spot.id,
            img_url: data.img_url,
            outline: data.outline,
          });
        }
      } else {
        console.log(`No document found for id: ${spot.id}`);
      }
    }
    return results;
  }
}

// //テスト用
// async function test() {
//   //インスタンス生成
//   const instance_John = new UserRepository("John");
//   //回答値を取得する
//   // let UserObj = await instance_John.getUserdata();
//   let cosineSimilarityResult = [
//     { id: "国営越後丘稜公園", cosineSimilarity: 0.9958705948858224 },
//     { id: "寺泊", cosineSimilarity: 0.9914601339836675 },
//     { id: "長岡花火館", cosineSimilarity: 0.7637626158259734 },
//   ];

//   console.log(await instance_John.getSpotDataById(cosineSimilarityResult));
// }
// //# sourceMappingURL=firebase.js.map

// test();
