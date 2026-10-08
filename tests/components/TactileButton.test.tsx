import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TactileButton from "@/components/ui/TactileButton";

describe("TactileButton Component", () => {
  it("renders with 3D tactile bevel styling and handles click", () => {
    const handleClick = vi.fn();
    render(<TactileButton onClick={handleClick}>Mulai Kuis</TactileButton>);
    const btn = screen.getByRole("button", { name: /Mulai Kuis/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("border-b-4");
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Review Focus #5: Disabled suppression
  it("suppresses click events and removes active movement when disabled", () => {
    const handleClick = vi.fn();
    render(<TactileButton disabled onClick={handleClick}>Terkunci</TactileButton>);
    const btn = screen.getByRole("button", { name: /Terkunci/i });
    expect(btn.hasAttribute("disabled")).toBe(true);
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
    expect(btn.className).toContain("opacity-50");
  });
});
