import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import LearningMapNode from "@/components/features/LearningMapNode";

describe("LearningMapNode Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders completed node and triggers onClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <LearningMapNode
        level={1}
        title="Huruf Hijaiyah Dasar"
        arabic="ا ب ت"
        status="completed"
        stars={3}
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Huruf Hijaiyah Dasar")).toBeDefined();
    expect(screen.getByText("⭐⭐⭐")).toBeDefined();
  });

  it("renders current node with active play state", () => {
    const handleClick = vi.fn();
    render(
      <LearningMapNode
        level={2}
        title="Harakat Fathah"
        arabic="َ"
        status="current"
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Harakat Fathah")).toBeDefined();
  });

  it("renders locked node and prevents clicking", () => {
    const handleClick = vi.fn();
    render(
      <LearningMapNode
        level={3}
        title="Tanwin & Sukun"
        status="locked"
        onClick={handleClick}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button.getAttribute("disabled")).not.toBeNull();
  });
});
