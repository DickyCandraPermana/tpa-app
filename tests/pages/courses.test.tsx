import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import CoursesPage from "@/app/dashboard/courses/page";

const mockCourses = [
  {
    id: "c-1",
    title: "Mengenal Huruf Hijaiyah Alif - Ba",
    description: "Belajar pelafalan makharijul huruf dasar",
    category: "Hijaiyah",
    level: "Dasar",
    totalQuestions: 5,
  },
  {
    id: "c-2",
    title: "Hukum Nun Mati dan Tanwin",
    description: "Penjelasan Idzhar, Idgham, Ikhfa, dan Iqlab",
    category: "Tajwid",
    level: "Menengah",
    totalQuestions: 8,
  },
  {
    id: "c-3",
    title: "Adab Terhadap Guru dan Mushaf",
    description: "Akhlak mulia santri penghafal Al-Qur'an",
    category: "Adab",
    level: "Dasar",
    totalQuestions: 4,
  },
];

vi.mock("@/lib/courses", () => ({
  getCourses: vi.fn(async () => mockCourses),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    uid: "test-user-123",
    role: "santri",
    completedCourse: [],
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("CoursesPage Interactive Filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders all courses by default", async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeDefined();
      expect(screen.getByText("Hukum Nun Mati dan Tanwin")).toBeDefined();
      expect(screen.getByText("Adab Terhadap Guru dan Mushaf")).toBeDefined();
    });
  });

  it("filters courses when clicking category chip", async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeDefined();
    });

    const tajwidChip = screen.getByRole("button", { name: /Tajwid/i });
    fireEvent.click(tajwidChip);

    expect(screen.getByText("Hukum Nun Mati dan Tanwin")).toBeDefined();
    expect(screen.queryByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeNull();
    expect(screen.queryByText("Adab Terhadap Guru dan Mushaf")).toBeNull();
  });

  it("filters courses by search query", async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Cari modul materi/i);
    fireEvent.change(searchInput, { target: { value: "Akhlak" } });

    expect(screen.getByText("Adab Terhadap Guru dan Mushaf")).toBeDefined();
    expect(screen.queryByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeNull();
    expect(screen.queryByText("Hukum Nun Mati dan Tanwin")).toBeNull();
  });

  it("displays empty state when no courses match filter and resets when clicked", async () => {
    render(<CoursesPage />);

    await waitFor(() => {
      expect(screen.getByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Cari modul materi/i);
    fireEvent.change(searchInput, { target: { value: "ZzzNotFound" } });

    expect(screen.getByText(/Tidak Ada Modul Ditemukan/i)).toBeDefined();

    const resetBtn = screen.getByRole("button", { name: /Reset Filter/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText("Mengenal Huruf Hijaiyah Alif - Ba")).toBeDefined();
  });
});
