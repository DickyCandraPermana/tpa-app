import { describe, it, expect } from "vitest";

describe("SibaQ Quiz & Gamification Logic", () => {
  const sampleQuestions = [
    {
      id: "q1",
      prompt: "Manakah huruf Alif?",
      options: ["ا", "ب", "ت", "ث"],
      correctAnswer: "ا",
      points: 2,
    },
    {
      id: "q2",
      prompt: "Manakah huruf Ba?",
      options: ["ا", "ب", "ت", "ث"],
      correctAnswer: "ب",
      points: 2,
    },
    {
      id: "q3",
      prompt: "Manakah huruf Ta?",
      options: ["ا", "ب", "ت", "ث"],
      correctAnswer: "ت",
      points: 2,
    },
  ];

  it("calculates total score percent correctly", () => {
    const isCorrectMap: { [key: number]: boolean } = {
      0: true,
      1: true,
      2: false,
    };

    const totalQuestions = sampleQuestions.length;
    const correctCount = Object.values(isCorrectMap).filter(Boolean).length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    expect(correctCount).toBe(2);
    expect(scorePercent).toBe(67);
  });

  it("computes points earned in session", () => {
    const isCorrectMap: { [key: number]: boolean } = {
      0: true,
      1: false,
      2: true,
    };

    let sessionPoints = 0;
    sampleQuestions.forEach((q, idx) => {
      if (isCorrectMap[idx]) {
        sessionPoints += q.points;
      }
    });

    expect(sessionPoints).toBe(4);
  });

  it("adds completed course ID uniquely without duplicates", () => {
    const currentCompleted = ["course-1", "course-2"];
    const newCourse = "course-3";
    const duplicateCourse = "course-1";

    const addUnique = (list: string[], id: string) => {
      if (!list.includes(id)) {
        return [...list, id];
      }
      return list;
    };

    const updated = addUnique(currentCompleted, newCourse);
    expect(updated).toEqual(["course-1", "course-2", "course-3"]);

    const noDuplicate = addUnique(updated, duplicateCourse);
    expect(noDuplicate).toEqual(["course-1", "course-2", "course-3"]);
  });

  it("validates reward redemption affordability", () => {
    const userPoints = 20;
    const rewardA = { id: "r1", cost: 15 };
    const rewardB = { id: "r2", cost: 25 };

    const canAffordA = userPoints >= rewardA.cost;
    const canAffordB = userPoints >= rewardB.cost;

    expect(canAffordA).toBe(true);
    expect(canAffordB).toBe(false);

    const remainingPoints = userPoints - rewardA.cost;
    expect(remainingPoints).toBe(5);
  });
});
