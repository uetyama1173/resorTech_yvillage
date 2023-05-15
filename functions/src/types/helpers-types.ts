export interface QuestionContent {
    question: string;
    answerQueries: { [key: string]: string };
  }
  
export interface userHasAnswer {
    ans_1: number;
    ans_2: number;
    ans_3: number;
  }
  
export interface spotDataCalInput {
    id: string;
    ans_1: number;
    ans_2: number;
    ans_3: number;
  }
  
export interface spotDataCalOutput {
    id: string;
    cosineSimilarity: number;
  }
  
export interface spotDataJSON {
    id: string;
    outline: string;
    img_url: string;
  }
  
// export interface FlexMessage {
//     type: 'flex';
//     altText: string;
//     contents: {
//       type: string;
//       body: { type: string; layout: string; contents: any[]; };
//       footer: { type: string; layout: string; spacing: string; contents: any[]; flex: number; };
//     };
//   }