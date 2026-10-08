import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ScoreCelebration from "@/components/features/ScoreCelebration";

describe("ScoreCelebration Modal", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 3 stars and mumtaz celebration for 100% score", () => {
    render(
      <ScoreCelebration
        isOpen={true}
        scorePercent={100}
        correctCount={5}
        totalQuestions={5}
        sessionPoints={15}
        onRestart={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/Mumtaz! Kamu Hebat!/i)).toBeDefined();
    expect(screen.getByText("+15 🪙")).toBeDefined();
  });

  // Review Focus #4: 0% boundary handling
  it("renders encouraging message without crash or NaN when score is 0%", () => {
    render(
      <ScoreCelebration
        isOpen={true}
        scorePercent={0}
        correctCount={0}
        totalQuestions={5}
        sessionPoints={0}
        onRestart={vi.fn()}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/Tetap Semangat!/i)).toBeDefined();
    expect(screen.getByText("0%")).toBeDefined();
    expect(screen.getByText("+0 🪙")).toBeDefined();
  });
});
