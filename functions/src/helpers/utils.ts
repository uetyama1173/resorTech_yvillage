interface QuestionContent {
  question: string;
  answerQueries: { [key: string]: string };
}

interface userHasAnswer {
  ans_1: number;
  ans_2: number;
  ans_3: number;
}

interface spotDataCalInput{
  id: string;
  ans_1: number;
  ans_2: number;
  ans_3: number;
}

interface spotDataCalOutput{
  id: string;
  cosineSimilarity: number;
}

interface spotDataJSON {
  id: string;
  outline: string;
  img_url: string;
}

// const questionContent = {
//   question: "年齢はいくつですか？",
//   answerQueries: {
//     "1": "20代",
//     "2": "30~40代",
//     "3": "50~60代",
//     "4": "60代以上",
//   },
// };

// 質問を作成する関数
const QuestionJSON = (questionContent: QuestionContent) => {
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


// cos類似の結果から，観光カルーセルを生成する関数
const createCarousel = (spotData: spotData[]) => {

  //カルーセルのテンプレートメッセージを作成して，
  const columns = spotData.map(spot => {
    console.log("観光地名", spot.id)
    return {
      thumbnailImageUrl: spot.img_url,
      title: spot.id,
      text: spot.outline,
      actions: [
        {
          type: "uri",
          label: "詳細",
          uri: `https://resortech-6d2a7.web.app/?id=${encodeURIComponent(spot.id)}`
        }
      ]
    };
  });

  return {
    type: "template",
    altText: "this is a carousel template",
    template: {
      type: "carousel",
      columns: columns
    }
  };
}



/**
 * ユーザーに出題していない質問IDを取得する関数
 * @param userHasAnswer ユーザーが回答した質問ID
 * (firedatastoreクラスの async getUserdata()で取得した値)
 * @param min 最小値
 * @param max 最大値 (質問数)
 * @param excluded 配列形式，除外する値
 * @return Number 指定されていない質問ID
 */
async function getRandomUnaskedQuestion(userHasAnswer: any) {
  const min = 1;
  const max = 3;
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
 * @return sortedCosineSimilarities オブジェクト { id: '国営越後丘稜公園', cosineSimilarity: 0.9958705948858224 },
 */
async function calculateCosineSimilarity(spotData: spotDataCalInput[], userHasAnswer: userHasAnswer) {
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
      Math.pow(spot.ans_1, 2) + Math.pow(spot.ans_2, 2) + Math.pow(spot.ans_3, 2)
    );

    const cosineSimilarity = dotProduct / (UserHNorm * spotNorm);

    return { id: spot.id, cosineSimilarity: cosineSimilarity };
  });

  // Sort the cosineSimilarities array
  const sortedCosineSimilarities = cosineSimilarities.sort(
    (a, b) => b.cosineSimilarity - a.cosineSimilarity
  );

  return sortedCosineSimilarities;
}


// //cos類似テスト データセット
// const spotDataCal = [
//   { id: '国営越後丘稜公園', ans_1: 1, ans_2: 3, ans_3: 4 },
//   { id: '寺泊', ans_1: 1, ans_2: 2, ans_3: 4 },
//   { id: '長岡花火館', ans_1: 2, ans_2: 1, ans_3: 1 }
// ]
// const userHasAnswer = { ans_1: 1, ans_2: 2, ans_3: 3 };

// //出力
// calculateCosineSimilarity(spotDataCal, userHasAnswer).then(console.log); 


/**
 * 観光スポットを出力する関数
 * @param {Object[]} spots - 観光スポットの情報が格納されたオブジェクトの配列
 * @param {string} spots[].id - 観光地の名前
 * @param {string} spots[].img_url - その場所の画像のURL
 * @param {string} spots[].outline - その場所の簡単な説明
 */
async function createCarouselTemplate(cosineSimilarityResult: spotDataJSON[]) {
    const columns = cosineSimilarityResult.map(spot => {
      console.log("観光地名", spot.id)
      return {
        thumbnailImageUrl: spot.img_url,
        title: spot.id,
        text: spot.outline,
        actions: [
          {
            type: "uri",
            label: "詳細",
            uri: `https://resortech-6d2a7.web.app/?id=${encodeURIComponent(spot.id)}`
          }
        ]
      };
    });
  
    return {
      type: "template",
      altText: "this is a carousel template",
      template: {
        type: "carousel",
        columns: columns
      }
    };
}


// let cosineSimilarities = [
//   {
//     id: '国営越後丘稜公園',
//     img_url: 'https://uetyama1173.github.io/ResorTech_img/img/kokuei_park.jpg',
//     outline: 'このスポットは自然が好きで，外で遊びたい方におすすめ '
//   },
//   {
//     id: '寺泊',
//     img_url: 'https://uetyama1173.github.io/ResorTech_img/img/teradomari.jpg',
//     outline: 'このスポットは海が好きで，美味しい海鮮料理を食べたい方におすすめ'
//   },
//   {
//     id: '長岡花火館',
//     img_url: 'https://uetyama1173.github.io/ResorTech_img/img/hanabikan.jpg',
//     outline: 'このスポットは花火が好きで，長岡を知りたい方におすすめ．'
//   }
// ]

// // //出力
// createCarouselTemplate(cosineSimilarities).then(console.log);