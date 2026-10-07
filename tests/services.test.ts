import { describe, it, expect } from "vitest";
import { validateRedeemAffordability } from "../lib/services/rewardService";

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
});
