import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import ScoreCelebration from "@/components/features/ScoreCelebration";
import AvatarUploadModal from "@/components/features/AvatarUploadModal";
import SetoranModal from "@/components/features/SetoranModal";

describe("Zero Gradient Clean Minimalist Rule", () => {
  afterEach(() => {
    cleanup();
  });

  it("ScoreCelebration should not contain any bg-gradient classes", () => {
    const { container } = render(
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
    const gradientElements = container.querySelectorAll('[class*="bg-gradient"]');
    expect(gradientElements.length).toBe(0);
  });

  it("AvatarUploadModal should not contain any bg-gradient classes", () => {
    const { container } = render(
      <AvatarUploadModal
        isOpen={true}
        onClose={vi.fn()}
        currentAvatarUrl={null}
        userId="user-1"
        onSuccess={vi.fn()}
      />
    );
    const gradientElements = container.querySelectorAll('[class*="bg-gradient"]');
    expect(gradientElements.length).toBe(0);
  });

  it("SetoranModal should not contain any bg-gradient classes", () => {
    const santriMock = {
      id: "santri-1",
      name: "Ahmad Santri",
      jilid: "Jilid 2",
      page: 10,
      totalPages: 30,
      completed: 10,
      totalPoint: 50,
    };

    const { container } = render(
      <SetoranModal
        isOpen={true}
        onClose={vi.fn()}
        santri={santriMock}
        ustadzId="ustadz-1"
        onSuccess={vi.fn()}
      />
    );
    const gradientElements = container.querySelectorAll('[class*="bg-gradient"]');
    expect(gradientElements.length).toBe(0);
  });
});
