import * as admin from "firebase-admin";
import * as serviceAccount from "../../serviceAccountKey.json";

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

// // Userの持つ回答情報
// interface HasUserData {
//   answer: Record<string, number>;
//   question_id: Record<string, number>;
// }

// 質問文
interface QuestionData {
  question: string;
  answerQueries: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
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
   * @returns {any} - ユーザの回答
   */
  async getUserAnsdata() {
    // Firestoreからuserの回答を取得するロジック
    const docRef = await firestore.collection("users").doc(this.userId).get();
    const HasUserData: any = docRef.data(); //TODO: anyをなくしたい
    return HasUserData;
  }

  //Userの回答を更新する
  async updateUserdata(
    propertyName: string,
    subPropertyName: string,
    newValue: number
  ): Promise<void> {
    const docRef = firestore.collection("users").doc(this.userId);
    await docRef.update({ [`${propertyName}.${subPropertyName}`]: newValue });
  }

  /**
   * 質問番号に応じて，質問内容を取得する関数
   * @param {number} question_id - 質問番号
   * @returns {QuestionData} - ユーザの回答
   * @example {question: '年齢はいくつですか？', answerQueries: { '1': '20代', '2': '30~40代', '3': '50~60代', '4': '60代以上' }}
   */
  async getQuestionData(question_id: number): Promise<QuestionData> {
    let result: QuestionData = { question: '', answerQueries: {1: '', 2: '', 3: '', 4: ''} };
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

  /**
   * 観光地情報を取得する
   * @returns {Promise<SpotDataJSON[]>} - 観光地情報
   */
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


  /**
   * cos類似度の結果から，観光地情報を取得する
   * @param {spotDataCalOutput[]} cosineSimilarityResult - 観光地名とコサイン類似度が格納されたオブジェクトの配列
   * @returns {spotDataJSON[]} - 観光地情報
   */
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
//   // インスタンス生成
//   const instance_John = new UserRepository("John");

//   // initializeUser() のテスト
//   await instance_John.initializeUser();
//   let initialData = await instance_John.getUserAnsdata();
//   console.log(initialData);  // ここで初期化の結果を確認

//   // updateUserdata() のテスト
//   await instance_John.updateUserdata("answer", "ans_1", 1);
//   let updatedData = await instance_John.getUserAnsdata();
//   console.log(updatedData);  // ここで更新の結果を確認

//   // getQuestionData() のテスト
//   let questionData = await instance_John.getQuestionData(1);
//   console.log(questionData);  // ここで質問データの取得結果を確認

//   // getSpotDataCal() のテスト
//   let spotData = await instance_John.getSpotDataCal();
//   console.log(spotData);  // ここで観光地情報の取得結果を確認

//   // getSpotDataById() のテスト
//   let cosineSimilarityResult = [
//     { id: "国営越後丘稜公園", cosineSimilarity: 0.9958705948858224 },
//     { id: "寺泊", cosineSimilarity: 0.9914601339836675 },
//     { id: "長岡花火館", cosineSimilarity: 0.7637626158259734 },
//   ];
//   let spotDataById = await instance_John.getSpotDataById(cosineSimilarityResult);
//   console.log(spotDataById);  // ここで観光地情報の取得結果を確認
// }

// test();

