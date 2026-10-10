import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import ToastNotification from "@/components/ui/ToastNotification";

describe("ToastNotification Component", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(
      <ToastNotification message={null} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders toast message and handles click close", () => {
    const handleClose = vi.fn();
    render(
      <ToastNotification
        message="Data setoran berhasil disimpan!"
        type="success"
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Data setoran berhasil disimpan!")).toBeDefined();

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("auto closes after the given duration", () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();

    render(
      <ToastNotification
        message="Peringatan koin hampir habis"
        type="error"
        duration={2000}
        onClose={handleClose}
      />
    );

    expect(handleClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
