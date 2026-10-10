import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MobileAppShell from "@/components/layout/MobileAppShell";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    role: "santri",
    username: "Ahmad",
    totalPoint: 150,
    avatarURL: null,
  }),
}));

vi.mock("@/components/layout/AdaptiveTopBar", () => ({
  default: () => <div data-testid="adaptive-topbar">TopBar</div>,
}));

vi.mock("@/components/layout/AdaptiveBottomNav", () => ({
  default: () => <div data-testid="adaptive-bottomnav">BottomNav</div>,
}));

describe("ResponsiveLayout & MobileAppShell", () => {
  it("renders without any decorative background blur blob elements (zero gradient/blob blur)", () => {
    const { container } = render(
      <MobileAppShell>
        <div>Content</div>
      </MobileAppShell>
    );

    // Verify absence of decorative blur blobs
    const blurElements = container.querySelectorAll('[class*="blur-3xl"], [class*="blur-2xl"]');
    expect(blurElements.length).toBe(0);

    const glowBlobElements = container.querySelectorAll('[class*="rounded-full"][class*="blur"]');
    expect(glowBlobElements.length).toBe(0);
  });

  it("applies mobile-first adaptive scaling (max-w-md on mobile, expanding on md and lg)", () => {
    const { container } = render(
      <MobileAppShell>
        <div>Content</div>
      </MobileAppShell>
    );

    const mainContainer = container.querySelector(".max-w-md");
    expect(mainContainer).not.toBeNull();
    // Must expand on md/lg
    expect(mainContainer?.className).toContain("md:max-w-4xl");
    expect(mainContainer?.className).toContain("lg:max-w-5xl");
  });

  it("applies True OLED dark mode background and border classes", () => {
    const { container } = render(
      <MobileAppShell>
        <div>Content</div>
      </MobileAppShell>
    );

    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer.className).toContain("dark:bg-[#000000]");

    const shellContainer = container.querySelector(".max-w-md") as HTMLElement;
    expect(shellContainer.className).toContain("dark:bg-[#000000]");
    expect(shellContainer.className).toContain("dark:md:border-neutral-800");
  });
});
