import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuizAttempt, QuizAttemptSchema } from "@/types/schema";

export const formatQuizAttemptPayload = (
  userId: string,
  courseId: string,
  correctAnswers: number,
  totalQuestions: number,
  answers: Record<string, string> = {}
): Omit<QuizAttempt, "id"> => {
  const calculatedScore = totalQuestions > 0
    ? Math.min(100, Math.max(0, Math.round((correctAnswers / totalQuestions) * 100)))
    : 0;

  return {
    userId,
    courseId,
    score: calculatedScore,
    totalQuestions,
    correctAnswers,
    answers,
    completedAt: new Date().toISOString(),
  };
};

export const recordQuizAttempt = async (
  userId: string,
  courseId: string,
  correctAnswers: number,
  totalQuestions: number,
  answers: Record<string, string> = {}
): Promise<{ success: boolean; id?: string; score: number; error?: string }> => {
  try {
    const payload = formatQuizAttemptPayload(
      userId,
      courseId,
      correctAnswers,
      totalQuestions,
      answers
    );

    const docRef = await addDoc(collection(db, "quiz_attempts"), {
      ...payload,
      completedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id, score: payload.score };
  } catch (error: any) {
    console.error("Error recording quiz attempt:", error);
    return {
      success: false,
      score: 0,
      error: error?.message || "Failed to record quiz attempt",
    };
  }
};

export const getUserQuizAttempts = async (
  userId: string,
  courseId?: string,
  maxItems: number = 10
): Promise<QuizAttempt[]> => {
  try {
    let q = query(
      collection(db, "quiz_attempts"),
      where("userId", "==", userId),
      orderBy("completedAt", "desc"),
      limit(maxItems)
    );

    if (courseId) {
      q = query(
        collection(db, "quiz_attempts"),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
        orderBy("completedAt", "desc"),
        limit(maxItems)
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return QuizAttemptSchema.parse({
        id: docSnap.id,
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate().toISOString() : data.completedAt,
      });
    });
  } catch (error) {
    console.error("Error fetching user quiz attempts:", error);
    return [];
  }
};
