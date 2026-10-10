import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Design System Tokens & Configuration", () => {
  it("defines Islamic Oasis & Warm Gold color tokens in styles/globals.css", () => {
    const cssContent = fs.readFileSync(path.resolve(__dirname, "../styles/globals.css"), "utf-8");
    expect(cssContent).toContain("#FDFBF7");
    expect(cssContent).toContain("#047857");
    expect(cssContent).toContain("#F59E0B");
    expect(cssContent).toContain("#F3E8D6");
  });

  it("configures Tailwind v4 dark variant and True OLED black tokens", () => {
    const cssContent = fs.readFileSync(path.resolve(__dirname, "../styles/globals.css"), "utf-8");
    expect(cssContent).toContain("@custom-variant dark");
    expect(cssContent).toContain("#000000"); // True OLED black
    expect(cssContent).toContain("#09090B"); // Dark card surface
    expect(cssContent).toContain("#27272A"); // Hairline border
  });

  it("configures Amiri and Nunito fonts in app/layout.tsx", () => {
    const layoutContent = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layoutContent).toContain("Amiri");
    expect(layoutContent).toContain("Nunito");
  });

  it("configures anti-FOUC theme script and dark body class in app/layout.tsx", () => {
    const layoutContent = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf-8");
    expect(layoutContent).toContain("suppressHydrationWarning");
    expect(layoutContent).toContain("data-theme");
    expect(layoutContent).toContain("dark:bg-[#000000]");
  });
});
