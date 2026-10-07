import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course, CourseSchema, Question, QuestionSchema } from "@/types/schema";

export const getCourses = async (): Promise<Course[]> => {
  try {
    const snap = await getDocs(collection(db, "courses"));
    return snap.docs.map((d) => {
      return CourseSchema.parse({ id: d.id, ...d.data() });
    });
  } catch (error) {
    console.error("Error fetching courses from Firestore:", error);
    return [];
  }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const courseDoc = await getDoc(doc(db, "courses", id));
    if (!courseDoc.exists()) return null;
    return CourseSchema.parse({ id: courseDoc.id, ...courseDoc.data() });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    return null;
  }
};

export const getCourseQuestions = async (
  courseId: string
): Promise<Question[]> => {
  try {
    const q = query(collection(db, "questions"), where("courseId", "==", courseId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return QuestionSchema.parse({
        id: d.id,
        ...data,
        prompt: data.prompt || data.question,
      });
    });
  } catch (error) {
    console.error("Error fetching course questions:", error);
    return [];
  }
};
