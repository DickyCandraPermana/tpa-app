import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, UserProfileSchema } from "@/types/schema";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    return UserProfileSchema.parse({ uid: snap.id, ...snap.data() });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const addPoints = async (uid: string, points: number): Promise<void> => {
  if (!uid || points <= 0) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      totalPoint: increment(points),
    });
  } catch (error) {
    console.error("Error incrementing user points:", error);
    throw error;
  }
};

export const markCourseCompleted = async (
  uid: string,
  courseId: string
): Promise<void> => {
  if (!uid || !courseId) return;
  try {
    await updateDoc(doc(db, "users", uid), {
      completedCourse: arrayUnion(courseId),
    });
  } catch (error) {
    console.error("Error marking course completed:", error);
    throw error;
  }
};
