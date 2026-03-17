import type { Hospital, InterviewQuestion, ReviewCategory } from "./types";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const makeCategory = (
  key: ReviewCategory["key"],
  title: string,
  fields: Array<{ label: string; value: string; updatedAt: string; responses: number }>,
): ReviewCategory => ({
  key,
  title,
  fields,
});

export const hospitals: Hospital[] = [
  {
    id: "a-hospital",
    name: "A病院",
    area: "東京都文京区",
    nearest: "本郷三丁目駅",
    rating: 0,
    reviewCount: 0,
    tags: ["新規", "情報募集中", "初回レビュー待ち"],
    aiSummary: "まだ十分なデータがありません。最初のレビューとインタビュー回答を待っています。",
    categories: [
      makeCategory("access", "交通アクセス", [
        { label: "最寄り駅", value: "未入力", updatedAt: "", responses: 0 },
        { label: "通学時間", value: "未入力", updatedAt: "", responses: 0 },
        { label: "交通費負担", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("schedule", "実習スケジュール", [
        { label: "開始時間", value: "未入力", updatedAt: "", responses: 0 },
        { label: "終了時間", value: "未入力", updatedAt: "", responses: 0 },
        { label: "当直・課外活動", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("assignments", "課題・レポート", [
        { label: "課題量", value: "未入力", updatedAt: "", responses: 0 },
        { label: "レポートの有無", value: "未入力", updatedAt: "", responses: 0 },
        { label: "プレゼン発表", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("atmosphere", "実習の雰囲気", [
        { label: "厳しさ", value: "未入力", updatedAt: "", responses: 0 },
        { label: "自主性 / 指導重視", value: "未入力", updatedAt: "", responses: 0 },
        { label: "教育的かどうか", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("staff", "指導医・スタッフ", [
        { label: "教育熱心さ", value: "未入力", updatedAt: "", responses: 0 },
        { label: "忙しさ", value: "未入力", updatedAt: "", responses: 0 },
        { label: "フィードバック頻度", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("overall", "総合評価", [
        { label: "おすすめ度", value: "未入力", updatedAt: "", responses: 0 },
        { label: "学習量", value: "未入力", updatedAt: "", responses: 0 },
        { label: "満足度", value: "未入力", updatedAt: "", responses: 0 },
      ]),
    ],
    freeReviews: [],
  },
  {
    id: "b-hospital",
    name: "B病院",
    area: "神奈川県横浜市",
    nearest: "桜木町駅",
    rating: 4.1,
    reviewCount: 6,
    tags: ["駅近", "教育熱心", "情報補完中"],
    aiSummary: "教育的な指導と通いやすさの評価が高い一方、課題量と当直の有無はまだ回答数が足りません。",
    categories: [
      makeCategory("access", "交通アクセス", [
        { label: "最寄り駅", value: "桜木町駅から徒歩8分", updatedAt: daysAgo(60), responses: 4 },
        { label: "通学時間", value: "都内から約50分", updatedAt: daysAgo(90), responses: 3 },
        { label: "交通費負担", value: "一部支給あり", updatedAt: daysAgo(110), responses: 2 },
      ]),
      makeCategory("schedule", "実習スケジュール", [
        { label: "開始時間", value: "8:15", updatedAt: daysAgo(45), responses: 3 },
        { label: "終了時間", value: "17:00前後", updatedAt: daysAgo(45), responses: 3 },
        { label: "当直・課外活動", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("assignments", "課題・レポート", [
        { label: "課題量", value: "未入力", updatedAt: "", responses: 0 },
        { label: "レポートの有無", value: "症例レポートあり", updatedAt: daysAgo(38), responses: 2 },
        { label: "プレゼン発表", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("atmosphere", "実習の雰囲気", [
        { label: "厳しさ", value: "穏やかだが質問は多い", updatedAt: daysAgo(31), responses: 3 },
        { label: "自主性 / 指導重視", value: "指導重視", updatedAt: daysAgo(31), responses: 3 },
        { label: "教育的かどうか", value: "かなり教育的", updatedAt: daysAgo(31), responses: 4 },
      ]),
      makeCategory("staff", "指導医・スタッフ", [
        { label: "教育熱心さ", value: "高い", updatedAt: daysAgo(31), responses: 4 },
        { label: "忙しさ", value: "午前は忙しめ", updatedAt: daysAgo(80), responses: 2 },
        { label: "フィードバック頻度", value: "未入力", updatedAt: "", responses: 0 },
      ]),
      makeCategory("overall", "総合評価", [
        { label: "おすすめ度", value: "4.3 / 5", updatedAt: daysAgo(20), responses: 5 },
        { label: "学習量", value: "多い", updatedAt: daysAgo(28), responses: 3 },
        { label: "満足度", value: "高い", updatedAt: daysAgo(20), responses: 5 },
      ]),
    ],
    freeReviews: [
      {
        author: "5年生 / 内科希望",
        postedAt: daysAgo(20),
        body: "朝は少し早いですが、見学だけで終わらず毎日質問の時間がありました。症例レポートはありますが、学びは多いです。",
      },
      {
        author: "6年生 / 総合志向",
        postedAt: daysAgo(47),
        body: "スタッフは忙しい印象でしたが、指導医の説明は丁寧でした。当直やプレゼンの情報は学年によって違いそうです。",
      },
    ],
  },
  {
    id: "c-hospital",
    name: "C病院",
    area: "埼玉県さいたま市",
    nearest: "大宮駅",
    rating: 4.6,
    reviewCount: 12,
    tags: ["情報充実", "更新対象あり", "人気"],
    aiSummary: "全体として満足度は高く、教育機会も豊富です。ただし雰囲気と指導医の特徴は2年以上更新されておらず、再確認が必要です。",
    categories: [
      makeCategory("access", "交通アクセス", [
        { label: "最寄り駅", value: "大宮駅からバス10分", updatedAt: daysAgo(120), responses: 6 },
        { label: "通学時間", value: "都内から約55分", updatedAt: daysAgo(140), responses: 5 },
        { label: "交通費負担", value: "自己負担が中心", updatedAt: daysAgo(170), responses: 4 },
      ]),
      makeCategory("schedule", "実習スケジュール", [
        { label: "開始時間", value: "8:00", updatedAt: daysAgo(100), responses: 7 },
        { label: "終了時間", value: "17:30", updatedAt: daysAgo(100), responses: 7 },
        { label: "当直・課外活動", value: "希望者のみ夕方カンファあり", updatedAt: daysAgo(150), responses: 4 },
      ]),
      makeCategory("assignments", "課題・レポート", [
        { label: "課題量", value: "やや多い", updatedAt: daysAgo(115), responses: 6 },
        { label: "レポートの有無", value: "週1本の症例メモあり", updatedAt: daysAgo(115), responses: 6 },
        { label: "プレゼン発表", value: "最終日にショートプレゼン", updatedAt: daysAgo(115), responses: 5 },
      ]),
      makeCategory("atmosphere", "実習の雰囲気", [
        { label: "厳しさ", value: "適度に厳しい", updatedAt: daysAgo(900), responses: 4 },
        { label: "自主性 / 指導重視", value: "自主性重視", updatedAt: daysAgo(900), responses: 4 },
        { label: "教育的かどうか", value: "教育的", updatedAt: daysAgo(900), responses: 4 },
      ]),
      makeCategory("staff", "指導医・スタッフ", [
        { label: "教育熱心さ", value: "かなり高い", updatedAt: daysAgo(840), responses: 4 },
        { label: "忙しさ", value: "病棟日はかなり忙しい", updatedAt: daysAgo(840), responses: 4 },
        { label: "フィードバック頻度", value: "毎日短くコメントあり", updatedAt: daysAgo(840), responses: 4 },
      ]),
      makeCategory("overall", "総合評価", [
        { label: "おすすめ度", value: "4.7 / 5", updatedAt: daysAgo(90), responses: 9 },
        { label: "学習量", value: "多い", updatedAt: daysAgo(90), responses: 8 },
        { label: "満足度", value: "非常に高い", updatedAt: daysAgo(90), responses: 9 },
      ]),
    ],
    freeReviews: [
      {
        author: "6年生 / 外科志望",
        postedAt: daysAgo(90),
        body: "プレゼン準備は必要ですが、症例の振り返り機会が多く、かなり実践的でした。学習量は多いです。",
      },
      {
        author: "5年生 / 小児科志望",
        postedAt: daysAgo(130),
        body: "アクセスは少し不便ですが、教育体制は整っています。病棟での学びが多く、満足度は高かったです。",
      },
    ],
  },
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "b-night-duty",
    hospitalId: "b-hospital",
    category: "schedule",
    prompt: "B病院では、当直や課外活動はありましたか？",
    helpText: "不足しているスケジュール情報を補完します",
    options: ["なし", "希望者のみ", "あり", "分からない"],
  },
  {
    id: "b-assignment-volume",
    hospitalId: "b-hospital",
    category: "assignments",
    prompt: "B病院の課題量はどの程度でしたか？",
    helpText: "他ユーザーのレビュー閲覧前に、30秒だけ協力してください",
    options: ["少ない", "普通", "多い", "かなり多い"],
  },
  {
    id: "c-atmosphere-refresh",
    hospitalId: "c-hospital",
    category: "atmosphere",
    prompt: "C病院の現在の雰囲気はどちらに近いですか？",
    helpText: "この項目は2年以上更新されていません",
    options: ["穏やか", "やや厳しい", "かなり厳しい", "科による"],
  },
  {
    id: "c-feedback-refresh",
    hospitalId: "c-hospital",
    category: "staff",
    prompt: "C病院の指導医からのフィードバック頻度はどうでしたか？",
    helpText: "古いスタッフ情報の更新に使います",
    options: ["毎日あった", "週数回あった", "少なかった", "分からない"],
  },
];
