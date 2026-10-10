import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import fs from "fs";
import path from "path";

describe("PWA Service Worker Registration & App Shell", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
    });
  });

  it("renders null without throwing", () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();
  });

  it("public/sw.js exists and contains core cache strategies", () => {
    const swPath = path.resolve(__dirname, "../../public/sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("CACHE_NAME");
    expect(swContent).toContain("install");
    expect(swContent).toContain("activate");
    expect(swContent).toContain("fetch");
    expect(swContent).toContain("/offline.html");
  });

  it("public/offline.html exists and provides fallback UI", () => {
    const offlinePath = path.resolve(__dirname, "../../public/offline.html");
    expect(fs.existsSync(offlinePath)).toBe(true);

    const content = fs.readFileSync(offlinePath, "utf-8");
    expect(content).toContain("Mode Offline SibaQ");
    expect(content).toContain("window.location.reload()");
  });
});
