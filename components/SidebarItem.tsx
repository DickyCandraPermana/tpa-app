export default function SidebarItem({
  label,
  isActive,
  onClick,
  isCollapsed = false,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 ${
        isActive ? "bg-gray-200 font-semibold" : ""
      }`}
    >
      {/* Icon placeholder (optional) */}
      <span className="mr-2">📁</span>

      {/* Hide label when collapsed */}
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
