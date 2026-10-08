import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ArabicText from "@/components/ui/ArabicText";

describe("ArabicText Component", () => {
  it("renders arabic typography with dir='rtl' attribute", () => {
    render(<ArabicText text="بِسْمِ اللَّهِ" size="xl" />);
    const el = screen.getByText("بِسْمِ اللَّهِ");
    expect(el).toBeDefined();
    expect(el.getAttribute("dir")).toBe("rtl");
    expect(el.className).toContain("font-amiri");
  });

  // Review Focus #3: Empty string & composite harakat safety
  it("renders safely without crash when empty text is passed", () => {
    const { container } = render(<ArabicText text="" />);
    expect(container.querySelector("span")?.getAttribute("dir")).toBe("rtl");
  });
});
