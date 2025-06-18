"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SidebarItem = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 ${
      isActive ? "bg-blue-600 text-white" : "hover:bg-blue-100 text-gray-700"
    }`}
  >
    {label}
  </button>
);

const ProfileOverview = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Profile Overview</h2>
    <p className="mb-2">Name: Froerybell</p>
    <p className="mb-2">Email: froery@example.com</p>
    <p>Points: 1200</p>
  </div>
);

const Courses = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Your Courses</h2>
    <ul className="pl-5 space-y-2 list-disc">
      <li>TPA Basic Logic</li>
      <li>Arabic Reading</li>
      <li>Listening to Arabic Phrases</li>
    </ul>
  </div>
);

const Settings = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Settings</h2>
    <p>Change password, notification settings, etc.</p>
  </div>
);

const contentComponents: Record<string, JSX.Element> = {
  Overview: <ProfileOverview />,
  Courses: <Courses />,
  Settings: <Settings />,
};

export default function dashboard() {
  const [activeSection, setActiveSection] = useState("Overview");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 p-4 bg-white shadow-md">
        <h1 className="mb-4 text-xl font-bold">Profile Menu</h1>
        {Object.keys(contentComponents).map((key) => (
          <SidebarItem
            key={key}
            label={key}
            isActive={activeSection === key}
            onClick={() => setActiveSection(key)}
          />
        ))}
      </aside>

      <main className="flex-1 p-8">{contentComponents[activeSection]}</main>
    </div>
  );
}
