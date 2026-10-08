import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import ProfilePage from "@/app/dashboard/profile/page";

const mockUseAuth = {
  uid: "santri-001",
  username: "Ahmad Santri",
  email: "santri@sibaq.id",
  avatarURL: "https://res.cloudinary.com/dogolfub6/image/upload/v1/sibaq/avatars/avatar1.jpg",
  totalPoint: 120,
  completedCourse: ["course-1", "course-2"],
  role: "santri",
  setUid: vi.fn(),
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/auth", () => ({
  logoutUser: vi.fn(),
}));

describe("ProfilePage Component Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders profile header, username, points, and completed courses", () => {
    render(<ProfilePage />);

    expect(screen.getByText("Ahmad Santri")).toBeDefined();
    expect(screen.getByText("santri@sibaq.id")).toBeDefined();
    expect(screen.getByText(/120/)).toBeDefined();
    expect(screen.getByText(/2 Materi ⭐/)).toBeDefined();
    expect(screen.getByText("Santri Teladan")).toBeDefined();
  });

  it("opens AvatarUploadModal when clicking avatar profile button", () => {
    render(<ProfilePage />);

    const avatarButton = screen.getByTestId("avatar-edit-button");
    expect(avatarButton).toBeDefined();

    fireEvent.click(avatarButton);

    // Modal title should now appear
    expect(screen.getByText("Ubah Foto Profil")).toBeDefined();
    expect(screen.getByText(/maksimal 5mb/i)).toBeDefined();
  });
});
