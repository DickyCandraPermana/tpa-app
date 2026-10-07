import { describe, it, expect } from "vitest";
import { calculateQuizResults } from "../hooks/useQuizSession";

describe("useQuizSession state calculations", () => {
  it("calculates quiz score percent and correct answers accurately", () => {
    const isCorrectMap: { [key: number]: boolean } = {
      0: true,
      1: false,
      2: true,
      3: true,
    };
    const totalQuestions = 4;

    const result = calculateQuizResults(isCorrectMap, totalQuestions);
    expect(result.correctCount).toBe(3);
    expect(result.scorePercent).toBe(75);
    expect(result.isPerfectScore).toBe(false);
  });

  it("handles 100% perfect score correctly", () => {
    const isCorrectMap: { [key: number]: boolean } = {
      0: true,
      1: true,
    };
    const totalQuestions = 2;

    const result = calculateQuizResults(isCorrectMap, totalQuestions);
    expect(result.correctCount).toBe(2);
    expect(result.scorePercent).toBe(100);
    expect(result.isPerfectScore).toBe(true);
  });
});
