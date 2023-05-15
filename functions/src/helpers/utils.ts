interface QuestionContent {
  question: string;
  answerQueries: { [key: string]: string };
}

interface userHasAnswer {
  ans_1: number;
  ans_2: number;
  ans_3: number;
}

interface spotDataCalInput {
  id: string;
  ans_1: number;
  ans_2: number;
  ans_3: number;
}

interface spotDataCalOutput {
  id: string;
  cosineSimilarity: number;
}

interface spotDataJSON {
  id: string;
  outline: string;
  img_url: string;
}

interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: {
    type: string;
    body: { type: string; layout: string; contents: any[]; };
    footer: { type: string; layout: string; spacing: string; contents: any[]; flex: number; };
  };
}


/**
 * 質問文を作成する関数
 * @param {QuestionContent} question_content 質問内容
 * @returns {Object} question JSON形式の質問文
 */
export const QuestionJSON= (questionContent: QuestionContent) => {
  const contentKey = Object.keys(questionContent.answerQueries);
  const question = {
    type: "flex",
    altText: questionContent.question,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            weight: "bold",
            size: "md",
            text: questionContent.question,
            margin: "none",
            align: "center",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "postback",
              label: questionContent.answerQueries["1"],
              data: contentKey[0],
              displayText: questionContent.answerQueries["1"],
            },
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "postback",
              label: questionContent.answerQueries["2"],
              data: contentKey[1],
              displayText: questionContent.answerQueries["2"],
            },
          },
          {
            type: "button",
            action: {
              type: "postback",
              label: questionContent.answerQueries["3"],
              data: contentKey[2],
              displayText: questionContent.answerQueries["3"],
            },
          },
          {
            type: "button",
            action: {
              type: "postback",
              label: questionContent.answerQueries["4"],
              data: contentKey[3],
              displayText: questionContent.answerQueries["4"],
            },
          },
        ],
        flex: 0,
      },
    },
  };
  return question;
};

/**
 * ユーザーに出題していない質問IDを取得する関数
 * @param userHasAnswer ユーザーが回答した質問ID (firedatastoreクラスの async getUserdata()で取得した値)
 * @returns Number 指定されていない質問ID
 */
export async function getRandomUnaskedQuestion(userHasAnswer: any) {
  const min = 1; // ここは変えない
  const max = 3; // 注: 質問数によって変える
  const excluded = Object.values(userHasAnswer).map(Number);
  let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  while (excluded.includes(randomNum)) {
    randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return randomNum;
}

/**
 * cos類似度計算
 * @param  ex: { ans_1: 0, ans_2: 0, ans_3: 0 }
 * @param spotData firedatastoreクラスの async getSpotDataCal()で取得した値
 * @param userHasAnswer  firedatastoreクラスの async getUserAnsdata()で取得した値
 * @param userHasAnswer ユーザーが回答した質問ID
 * @returns sortedCosineSimilarities オブジェクト { id: '国営越後丘稜公園', cosineSimilarity: 0.9958705948858224 },
 */
export async function calculateCosineSimilarity(
  spotData: spotDataCalInput[],
  userHasAnswer: userHasAnswer
): Promise<spotDataCalOutput[]> {
  
  //cos類似度計算
  const cosineSimilarities = spotData.map((spot: any) => {
    const dotProduct =
      userHasAnswer.ans_1 * spot.ans_1 +
      userHasAnswer.ans_2 * spot.ans_2 +
      userHasAnswer.ans_3 * spot.ans_3;

    const UserHNorm = Math.sqrt(
      Math.pow(userHasAnswer.ans_1, 2) +
        Math.pow(userHasAnswer.ans_2, 2) +
        Math.pow(userHasAnswer.ans_3, 2)
    );
    const spotNorm = Math.sqrt(
      Math.pow(spot.ans_1, 2) +
        Math.pow(spot.ans_2, 2) +
        Math.pow(spot.ans_3, 2)
    );

    const cosineSimilarity = dotProduct / (UserHNorm * spotNorm);

    return { id: spot.id, cosineSimilarity: cosineSimilarity };
  });

  const sortedCosineSimilarities = cosineSimilarities.sort(
    (a, b) => b.cosineSimilarity - a.cosineSimilarity
  );

  return sortedCosineSimilarities;
}

/**
 * 観光スポットを出力する関数
 * @param {Object[]} spots - 観光スポットの情報が格納されたオブジェクトの配列
 * @param {string} spots[].id - 観光地の名前
 * @param {string} spots[].img_url - その場所の画像のURL
 * @param {string} spots[].outline - その場所の簡単な説明
 * @returns {Object} - LINEのカルーセルテンプレート
 */
export async function createCarouselTemplate(cosineSimilarityResult: spotDataJSON[]) {
  const columns = cosineSimilarityResult.map((spot) => {
    console.log("観光地名", spot.id);
    return {
      thumbnailImageUrl: spot.img_url,
      title: spot.id,
      text: spot.outline,
      actions: [
        {
          type: "uri",
          label: "詳細",
          uri: `https://resortech-6d2a7.web.app/?id=${encodeURIComponent(
            spot.id
          )}`,
        },
      ],
    };
  });

  return {
    type: "template",
    altText: "this is a carousel template",
    template: {
      type: "carousel",
      columns: columns,
    },
  };
}
