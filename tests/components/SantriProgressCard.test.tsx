import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SantriProgressCard from "@/components/features/SantriProgressCard";

describe("SantriProgressCard Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders santri name, initials, and current reading progress", () => {
    render(
      <SantriProgressCard
        santriName="Zaid Al-Khair"
        jilid="Iqro 3"
        page={15}
        totalPages={30}
        completedCount={5}
      />
    );

    expect(screen.getByText("Zaid Al-Khair")).toBeDefined();
    expect(screen.getByText("ZA")).toBeDefined();
    expect(screen.getByText("Iqro 3 • Hal 15 / 30")).toBeDefined();
    expect(screen.getByText("5 Tuntas")).toBeDefined();
    expect(screen.getByText("50%")).toBeDefined();
  });

  it("clamps progress percentage to 100% when page exceeds totalPages", () => {
    render(
      <SantriProgressCard
        santriName="Bilal"
        jilid="Juz Amma"
        page={35}
        totalPages={30}
      />
    );

    expect(screen.getByText("100%")).toBeDefined();
  });

  it("calls onUpdateProgress when button is clicked", () => {
    const handleUpdate = vi.fn();
    render(
      <SantriProgressCard
        santriName="Maryam"
        jilid="Iqro 1"
        page={10}
        onUpdateProgress={handleUpdate}
      />
    );

    const button = screen.getByText("Update Setoran");
    fireEvent.click(button);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
  });
});
