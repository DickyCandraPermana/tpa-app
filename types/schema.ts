import { z } from "zod";

export const UserRoleSchema = z.preprocess((val) => {
  if (val === "user" || !val) return "santri";
  return val;
}, z.enum(["santri", "ustaz", "admin"]).default("santri"));
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().nullable().optional(),
  username: z.string().default("Santri Hebat"),
  role: UserRoleSchema,
  avatarURL: z.string().nullable().optional(),
  totalPoint: z.number().int().nonnegative().default(0),
  completedCourse: z.array(z.string()).default([]),
  halaqahId: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().default("Materi Pembelajaran"),
  description: z.string().optional().default(""),
  category: z.string().default("Tahsin / Hijaiyah"),
  level: z.string().default("Dasar"),
  imageUrl: z.string().optional(),
  totalQuestions: z.number().int().positive().default(5),
  order: z.number().int().optional().default(1),
});
export type Course = z.infer<typeof CourseSchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  prompt: z.string().optional(),
  question: z.string().optional(),
  options: z.array(z.string()).min(1),
  correctAnswer: z.string(),
  points: z.number().int().positive().default(1),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  transliteration: z.string().optional(),
  arabicText: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().default("multiple_choice"),
});
export type Question = z.infer<typeof QuestionSchema>;

export const RewardSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  pointsRequired: z.number().int().positive(),
  imageUrl: z.string().optional(),
  stock: z.number().int().nonnegative().optional().default(100),
});
export type Reward = z.infer<typeof RewardSchema>;

export const RedeemRequestSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  rewardId: z.string(),
  rewardName: z.string().optional(),
  cost: z.number().int().positive(),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
  timestamp: z.any().optional(),
});
export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

export const CoinTransactionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  amount: z.number().int(),
  type: z.enum(["EARNED", "SPENT"]),
  source: z.enum(["QUIZ", "REWARD_REDEEM", "MANUAL_ADJUSTMENT", "DAILY_BONUS"]),
  referenceId: z.string().optional(),
  description: z.string().default(""),
  createdAt: z.any().optional(),
});
export type CoinTransaction = z.infer<typeof CoinTransactionSchema>;

export const QuizAttemptSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  courseId: z.string(),
  score: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  correctAnswers: z.number().int().nonnegative(),
  answers: z.record(z.string(), z.string()).default({}),
  completedAt: z.any().optional(),
});
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;

export const HalaqahSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  ustadzId: z.string(),
  description: z.string().optional().default(""),
  createdAt: z.any().optional(),
});
export type Halaqah = z.infer<typeof HalaqahSchema>;
