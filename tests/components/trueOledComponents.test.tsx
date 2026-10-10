import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import AdaptiveTopBar from "@/components/layout/AdaptiveTopBar";
import AdaptiveBottomNav from "@/components/layout/AdaptiveBottomNav";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    role: "santri",
    username: "Fauzan",
    totalPoint: 250,
    avatarURL: null,
  }),
}));

describe("Core UI Components - True OLED Styling & Responsiveness", () => {
  it("TactileCard applies dark OLED background and hairline border classes", () => {
    const { container } = render(<TactileCard>Card Content</TactileCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("dark:bg-[#000000]");
    expect(card.className).toContain("dark:border-neutral-800");
  });

  it("TactileButton secondary variant applies OLED dark styles", () => {
    const { container } = render(
      <TactileButton variant="secondary">Button</TactileButton>
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain("dark:bg-[#000000]");
    expect(button.className).toContain("dark:border-neutral-800");
  });

  it("AdaptiveTopBar header applies dark OLED classes", () => {
    const { container } = render(<AdaptiveTopBar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("dark:bg-[#000000]/95");
    expect(header?.className).toContain("dark:border-neutral-800");
  });

  it("AdaptiveBottomNav applies dark OLED classes and responsive width scaling", () => {
    const { container } = render(<AdaptiveBottomNav role="santri" activePath="/dashboard" />);
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("dark:bg-[#000000]/95");
    expect(nav?.className).toContain("dark:border-neutral-800");
    expect(nav?.className).toContain("md:max-w-lg");
  });
});
