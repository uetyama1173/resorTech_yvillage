// 計算結果
export interface spotDataCalOutput {
    id: string;
    cosineSimilarity: number;
  }
  
  // 観光地を出力する
export interface SpotDataJSON {
    id: string;
    img_url: string;
    outline: string;
  }
  
  // 質問文
export interface QuestionData {
    question: string;
    answerQueries: {
      1: string;
      2: string;
      3: string;
      4: string;
    };
  }
  
  // // Userの持つ回答情報
  // interface HasUserData {
  //   answer: Record<string, number>;
  //   question_id: Record<string, number>;
  // }