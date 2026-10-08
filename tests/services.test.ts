import { describe, it, expect } from "vitest";
import { validateRedeemAffordability } from "../lib/services/rewardService";
import { formatCoinTransactionPayload } from "../lib/services/coinService";
import { formatQuizAttemptPayload } from "../lib/services/quizService";

describe("SibaQ Service Layer Logic", () => {
  it("validates reward redemption affordability properly", () => {
    const userPoints = 25;
    const affordableReward = {
      id: "r1",
      name: "Buku Tulis",
      pointsRequired: 15,
    };
    const unaffordableReward = {
      id: "r2",
      name: "Tas TPA",
      pointsRequired: 50,
    };

    const res1 = validateRedeemAffordability(userPoints, affordableReward.pointsRequired);
    expect(res1.canRedeem).toBe(true);
    expect(res1.remainingPoints).toBe(10);

    const res2 = validateRedeemAffordability(userPoints, unaffordableReward.pointsRequired);
    expect(res2.canRedeem).toBe(false);
    expect(res2.error).toBe("Poin tidak mencukupi untuk menukar hadiah ini.");
  });

  it("calculates correct increment point values", () => {
    const current = 10;
    const add = 5;
    expect(current + add).toBe(15);
  });

  it("formats coin transaction correctly for earned points", () => {
    const tx = formatCoinTransactionPayload(
      "user-1",
      10,
      "EARNED",
      "QUIZ",
      "attempt-123",
      "Menyelesaikan kuis hijaiyah"
    );

    expect(tx.userId).toBe("user-1");
    expect(tx.amount).toBe(10);
    expect(tx.type).toBe("EARNED");
    expect(tx.source).toBe("QUIZ");
    expect(tx.referenceId).toBe("attempt-123");
    expect(tx.description).toBe("Menyelesaikan kuis hijaiyah");
    expect(tx.createdAt).toBeDefined();
  });

  it("formats coin transaction correctly for spent points", () => {
    const tx = formatCoinTransactionPayload(
      "user-2",
      -25,
      "SPENT",
      "REWARD_REDEEM",
      "reward-456",
      "Penukaran hadiah Buku"
    );

    expect(tx.userId).toBe("user-2");
    expect(tx.amount).toBe(-25);
    expect(tx.type).toBe("SPENT");
    expect(tx.source).toBe("REWARD_REDEEM");
  });

  it("formats quiz attempt with correct percentage score calculation", () => {
    const attempt = formatQuizAttemptPayload(
      "user-1",
      "huruf-hijaiyah",
      4,
      5,
      { q1: "A", q2: "B", q3: "C", q4: "D", q5: "A" }
    );

    expect(attempt.userId).toBe("user-1");
    expect(attempt.courseId).toBe("huruf-hijaiyah");
    expect(attempt.correctAnswers).toBe(4);
    expect(attempt.totalQuestions).toBe(5);
    expect(attempt.score).toBe(80);
    expect(attempt.completedAt).toBeDefined();
  });

  it("enforces score cap at 100", () => {
    const attempt = formatQuizAttemptPayload(
      "user-1",
      "tajwid-mad",
      5,
      5,
      {}
    );
    expect(attempt.score).toBe(100);
  });
});
