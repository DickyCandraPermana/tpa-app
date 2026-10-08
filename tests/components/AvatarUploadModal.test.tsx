import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import AvatarUploadModal from "@/components/features/AvatarUploadModal";
import * as imageUploadService from "@/lib/services/imageUploadService";

describe("AvatarUploadModal Component", () => {
  const defaultProps = {
    isOpen: true,
    currentAvatarUrl: "https://example.com/current.jpg",
    userId: "user-123",
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AvatarUploadModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal title, dropzone, and action buttons when open", () => {
    render(<AvatarUploadModal {...defaultProps} />);

    expect(screen.getByText("Ubah Foto Profil")).toBeDefined();
    expect(screen.getByText(/pilih foto/i)).toBeDefined();
    expect(screen.getByText(/maksimal 5mb/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /simpan foto/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /batal/i })).toBeDefined();
  });

  it("calls onClose when Batal button is clicked", () => {
    render(<AvatarUploadModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /batal/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("shows error when a non-image file is selected", async () => {
    render(<AvatarUploadModal {...defaultProps} />);

    const input = screen.getByTestId("avatar-file-input");
    const fakePdf = new File(["dummy"], "doc.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [fakePdf] } });

    await waitFor(() => {
      expect(
        screen.getByText(/format file harus berupa gambar/i)
      ).toBeDefined();
    });
  });

  it("successfully uploads image and updates firestore profile", async () => {
    const uploadSpy = vi
      .spyOn(imageUploadService, "uploadImage")
      .mockResolvedValueOnce({
        url: "https://res.cloudinary.com/dogolfub6/image/upload/new.jpg",
        publicId: "sibaq/avatars/new",
      });

    const updateAvatarSpy = vi
      .spyOn(imageUploadService, "updateUserAvatar")
      .mockResolvedValueOnce(undefined);

    render(<AvatarUploadModal {...defaultProps} />);

    const input = screen.getByTestId("avatar-file-input");
    const fakeImage = new File(["dummy image"], "avatar.png", { type: "image/png" });

    // Mock URL.createObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => "blob:http://localhost/dummy-preview");

    fireEvent.change(input, { target: { files: [fakeImage] } });

    const submitBtn = screen.getByRole("button", { name: /simpan foto/i });
    expect(submitBtn).toBeDefined();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith(fakeImage, "sibaq/avatars");
      expect(updateAvatarSpy).toHaveBeenCalledWith(
        "user-123",
        "https://res.cloudinary.com/dogolfub6/image/upload/new.jpg"
      );
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(
        "https://res.cloudinary.com/dogolfub6/image/upload/new.jpg"
      );
    });
  });
});
