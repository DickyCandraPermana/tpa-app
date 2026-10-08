import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import SetoranModal from "@/components/features/SetoranModal";
import * as halaqahService from "@/lib/services/halaqahService";

vi.mock("@/lib/services/halaqahService", () => ({
  recordSantriSetoran: vi.fn(),
}));

const mockSantri = {
  id: "s-1",
  name: "Ahmad Dahlan",
  jilid: "Jilid 3",
  page: 14,
  totalPages: 30,
  completed: 14,
};

describe("SetoranModal Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders modal when open with santri details", () => {
    render(
      <SetoranModal
        isOpen={true}
        santri={mockSantri}
        ustadzId="ustadz-1"
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Catat Setoran Mengaji/i)).toBeDefined();
    expect(screen.getByText("Ahmad Dahlan")).toBeDefined();
    expect(screen.getByRole("button", { name: /Simpan Setoran/i })).toBeDefined();
  });

  it("submits setoran with selected kelancaran and bonus coin", async () => {
    vi.mocked(halaqahService.recordSantriSetoran).mockResolvedValueOnce({
      success: true,
      logId: "log-1",
    });

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <SetoranModal
        isOpen={true}
        santri={mockSantri}
        ustadzId="ustadz-1"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // Click submit
    const submitBtn = screen.getByRole("button", { name: /Simpan Setoran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(halaqahService.recordSantriSetoran).toHaveBeenCalledWith(
        expect.objectContaining({
          santriId: "s-1",
          santriName: "Ahmad Dahlan",
          ustadzId: "ustadz-1",
        })
      );
      expect(handleSuccess).toHaveBeenCalled();
    });
  });
});