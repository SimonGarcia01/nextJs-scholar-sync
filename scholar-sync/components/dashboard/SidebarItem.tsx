type SidebarItemProps = {
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
};

export default function SidebarItem({
    label,
    isActive,
    isCollapsed,
    onClick,
}: SidebarItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
            }`}
        >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {!isCollapsed && <span>{label}</span>}
        </button>
    );
}
