export type ReviewCategoryKey =
  | "access"
  | "schedule"
  | "assignments"
  | "atmosphere"
  | "staff"
  | "overall";

export type ReviewField = {
  label: string;
  value: string;
  updatedAt: string;
  responses: number;
};

export type ReviewCategory = {
  key: ReviewCategoryKey;
  title: string;
  fields: ReviewField[];
};

export type FreeReview = {
  author: string;
  postedAt: string;
  body: string;
};

export type InterviewQuestion = {
  id: string;
  hospitalId: string;
  category: ReviewCategoryKey;
  prompt: string;
  helpText: string;
  options: string[];
};

export type Hospital = {
  id: string;
  name: string;
  area: string;
  nearest: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  aiSummary: string;
  categories: ReviewCategory[];
  freeReviews: FreeReview[];
};
