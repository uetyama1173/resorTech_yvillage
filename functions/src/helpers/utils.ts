interface QuestionContent {
  question: string;
  answerQueries: { [key: string]: string };
}

const questionContent = {
  question: "年齢はいくつですか？",
  answerQueries: {
    "1": "20代",
    "2": "30~40代",
    "3": "50~60代",
    "4": "60代以上",
  },
};

//JSON形式の質問を作成する関数
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
}


console.log(QuestionJSON(questionContent))
