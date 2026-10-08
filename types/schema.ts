import { z } from "zod";

export const UserRoleSchema = z.preprocess((val) => {
  if (val === "user" || !val) return "santri";
  if (val === "ustadz") return "ustaz";
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
  description: z.string().optional(),
  pointsRequired: z.number().int().positive(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
});
export type Reward = z.infer<typeof RewardSchema>;

export const RedeemRequestStatusSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const upper = val.toUpperCase();
    if (upper === "PENDING" || upper === "APPROVED" || upper === "REJECTED") {
      return upper;
    }
  }
  return val;
}, z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"));

export type RedeemRequestStatus = z.infer<typeof RedeemRequestStatusSchema>;

export const RedeemRequestSchema = z.preprocess((raw: any) => {
  if (raw && typeof raw === "object") {
    const points = raw.pointsRequired ?? raw.cost ?? 0;
    const createdAt = raw.createdAt ?? raw.timestamp;
    return {
      ...raw,
      pointsRequired: points,
      cost: points,
      createdAt: createdAt,
      userName: raw.userName || "Santri",
      rewardName: raw.rewardName || "Hadiah Santri",
    };
  }
  return raw;
}, z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID wajib diisi"),
  userName: z.string().default("Santri"),
  rewardId: z.string().min(1, "Reward ID wajib diisi"),
  rewardName: z.string().default("Hadiah Santri"),
  pointsRequired: z.number().int().positive("Poin harus bilangan bulat positif"),
  cost: z.number().int().positive().optional(),
  status: RedeemRequestStatusSchema,
  ustadzId: z.string().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  createdAt: z.any().optional(),
  timestamp: z.any().optional(),
  resolvedAt: z.any().optional(),
  updatedAt: z.any().optional(),
}));

export type RedeemRequest = z.infer<typeof RedeemRequestSchema>;

export const CoinTransactionSourceSchema = z.enum([
  "QUIZ",
  "REWARD_REDEEM",
  "MANUAL_ADJUSTMENT",
  "DAILY_BONUS",
  "REWARD_REFUND",
]);
export type CoinTransactionSource = z.infer<typeof CoinTransactionSourceSchema>;

export const CoinTransactionSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  amount: z.number().int(),
  type: z.enum(["EARNED", "SPENT"]),
  source: CoinTransactionSourceSchema,
  referenceId: z.string().optional(),
  description: z.string().default(""),
  createdAt: z.any().optional(),
});
export type CoinTransaction = z.infer<typeof CoinTransactionSchema>;

export const SetoranLogSchema = z.object({
  id: z.string().optional(),
  santriId: z.string().min(1),
  santriName: z.string().min(1),
  jilid: z.string().min(1),
  page: z.number().int().positive(),
  notes: z.string().optional(),
  kelancaran: z.enum(["LANCAR", "CUKUP", "MENGULANG"]).default("LANCAR"),
  bonusCoin: z.number().int().nonnegative().default(1),
  ustadzId: z.string().min(1),
  createdAt: z.any().optional(),
});
export type SetoranLog = z.infer<typeof SetoranLogSchema>;

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
