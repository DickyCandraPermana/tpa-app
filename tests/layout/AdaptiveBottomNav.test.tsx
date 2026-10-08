import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AdaptiveBottomNav from "@/components/layout/AdaptiveBottomNav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AdaptiveBottomNav Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 5 santri tabs when role is 'santri'", () => {
    render(<AdaptiveBottomNav role="santri" activePath="/dashboard" />);
    expect(screen.getByText("Peta")).toBeDefined();
    expect(screen.getByText("Materi")).toBeDefined();
    expect(screen.getByText("Kuis")).toBeDefined();
    expect(screen.getByText("Toko")).toBeDefined();
    expect(screen.getByText("Profil")).toBeDefined();
  });

  it("renders 4 ustaz tabs when role is 'ustaz'", () => {
    render(<AdaptiveBottomNav role="ustaz" activePath="/dashboard" />);
    expect(screen.getByText("Progres")).toBeDefined();
    expect(screen.getByText("Modul")).toBeDefined();
    expect(screen.getByText("Klaim")).toBeDefined();
    expect(screen.getByText("Akun")).toBeDefined();
  });

  // Review Focus #2: Fallback resilience
  it("gracefully falls back to santri navigation if role is unrecognized or undefined", () => {
    render(<AdaptiveBottomNav role={undefined as any} activePath="/dashboard" />);
    expect(screen.getByText("Peta")).toBeDefined();
    expect(screen.getByText("Materi")).toBeDefined();
    expect(screen.getByText("Kuis")).toBeDefined();
  });
});
