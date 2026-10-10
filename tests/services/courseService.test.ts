import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCourses, getCourseById, getCourseQuestions } from "@/lib/services/courseService";

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
  };
});

describe("Course Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCourses", () => {
    it("returns parsed courses array from Firestore collection", async () => {
      const { getDocs } = await import("firebase/firestore");
      const mockDocs = [
        {
          id: "course-01",
          data: () => ({
            title: "Makharijul Huruf",
            description: "Pengenalan makhraj huruf hijaiyah",
            category: "Tahsin",
            level: "Dasar",
            totalQuestions: 5,
            order: 1,
          }),
        },
        {
          id: "course-02",
          data: () => ({
            title: "Hukum Nun Mati & Tanwin",
            description: "Idzhar, Idgham, Ikhfa, Iqlab",
            category: "Tajwid",
            level: "Menengah",
            totalQuestions: 10,
            order: 2,
          }),
        },
      ];
      (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

      const courses = await getCourses();

      expect(courses).toHaveLength(2);
      expect(courses[0].id).toBe("course-01");
      expect(courses[0].title).toBe("Makharijul Huruf");
      expect(courses[1].id).toBe("course-02");
      expect(courses[1].level).toBe("Menengah");
    });

    it("returns empty array and handles error when getDocs throws", async () => {
      const { getDocs } = await import("firebase/firestore");
      (getDocs as any).mockRejectedValueOnce(new Error("Network offline"));

      const courses = await getCourses();
      expect(courses).toEqual([]);
    });
  });

  describe("getCourseById", () => {
    it("returns parsed course when course document exists", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockResolvedValueOnce({
        exists: () => true,
        id: "course-01",
        data: () => ({
          title: "Makharijul Huruf",
          description: "Pengenalan makhraj",
          category: "Tahsin",
          level: "Dasar",
          totalQuestions: 5,
          order: 1,
        }),
      });

      const course = await getCourseById("course-01");

      expect(course).not.toBeNull();
      expect(course?.id).toBe("course-01");
      expect(course?.title).toBe("Makharijul Huruf");
    });

    it("returns null when course document does not exist", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockResolvedValueOnce({
        exists: () => false,
      });

      const course = await getCourseById("course-unknown");
      expect(course).toBeNull();
    });

    it("returns null and handles error when getDoc throws", async () => {
      const { getDoc } = await import("firebase/firestore");
      (getDoc as any).mockRejectedValueOnce(new Error("Permission denied"));

      const course = await getCourseById("course-err");
      expect(course).toBeNull();
    });
  });

  describe("getCourseQuestions", () => {
    it("returns parsed questions for a given courseId", async () => {
      const { getDocs } = await import("firebase/firestore");
      const mockDocs = [
        {
          id: "q-1",
          data: () => ({
            courseId: "course-01",
            prompt: "Huruf apakah ini: ج ?",
            options: ["Jim", "Ha", "Kha", "Dal"],
            correctAnswer: "Jim",
            points: 1,
          }),
        },
        {
          id: "q-2",
          data: () => ({
            courseId: "course-01",
            question: "Berapa jumlah makharijul huruf utama?",
            options: ["5", "3", "7", "4"],
            correctAnswer: "5",
            points: 1,
          }),
        },
      ];
      (getDocs as any).mockResolvedValueOnce({ docs: mockDocs });

      const questions = await getCourseQuestions("course-01");

      expect(questions).toHaveLength(2);
      expect(questions[0].id).toBe("q-1");
      expect(questions[0].prompt).toBe("Huruf apakah ini: ج ?");
      // Fallback from data.question to prompt
      expect(questions[1].id).toBe("q-2");
      expect(questions[1].prompt).toBe("Berapa jumlah makharijul huruf utama?");
    });

    it("returns empty array when query throws error", async () => {
      const { getDocs } = await import("firebase/firestore");
      (getDocs as any).mockRejectedValueOnce(new Error("Query index missing"));

      const questions = await getCourseQuestions("course-01");
      expect(questions).toEqual([]);
    });
  });
});
