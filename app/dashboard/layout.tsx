"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SidebarItem from "@/components/SidebarItem";
import { MenuIcon, ChevronLeftIcon } from "lucide-react"; // optional icon

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("Overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { uid, clearAuth, loading } = useAuth();

  const contentComponents: Record<string, () => void> = {
    Overview: () => router.push("/dashboard/profile"),
    Courses: () => router.push("/dashboard/courses"),
    Settings: () => router.push("/dashboard/settings"),
    Exchange: () => router.push("/dashboard/exchange"),
    Logout: () => {
      clearAuth();
      router.push("/login");
    },
  };

  useEffect(() => {
    if (!uid && !loading) {
      router.push("/login");
    }
  }, [uid, loading, router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } transition-all duration-300 p-4 bg-white shadow-md flex flex-col justify-between`}
      >
        <div>
          {/* Header & Toggle Button */}
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <h1 className="text-xl font-bold whitespace-nowrap">
                Profile Menu
              </h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded hover:bg-gray-100"
              title="Toggle sidebar"
            >
              {isCollapsed ? (
                <MenuIcon size={20} />
              ) : (
                <ChevronLeftIcon size={20} />
              )}
            </button>
          </div>

          {/* Sidebar Items */}
          <nav className="space-y-2">
            {Object.keys(contentComponents).map((key) => (
              <SidebarItem
                key={key}
                label={key}
                isActive={activeSection === key}
                isCollapsed={isCollapsed} // tambahkan prop ini ke SidebarItem
                onClick={() => {
                  setActiveSection(key);
                  contentComponents[key]();
                }}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
