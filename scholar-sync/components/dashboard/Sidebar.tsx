import SidebarItem from "@/components/dashboard/SidebarItem";
import { MenuIcon } from "@/components/dashboard/Icons";

export type SidebarItemData = {
    id: string;
    label: string;
};

type SidebarProps = {
    isOpen: boolean;
    isCollapsed: boolean;
    items: SidebarItemData[];
    selectedId: string;
    onSelect: (id: string) => void;
    onToggleCollapse: () => void;
};

export default function Sidebar({
    isOpen,
    isCollapsed,
    items,
    selectedId,
    onSelect,
    onToggleCollapse,
}: SidebarProps) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-slate-200 shadow-sm transform transition-all duration-200 md:static md:translate-x-0 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } ${isCollapsed ? "w-20" : "w-64"}`}
        >
            <div className="px-5 py-6">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                            Menu
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label="Collapse menu"
                    >
                        <MenuIcon className="h-4 w-4" />
                    </button>
                </div>
                <nav className="mt-5 space-y-1">
                    {items.map((item) => (
                        <SidebarItem
                            key={item.id}
                            label={item.label}
                            isActive={selectedId === item.id}
                            isCollapsed={isCollapsed}
                            onClick={() => onSelect(item.id)}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    );
}
