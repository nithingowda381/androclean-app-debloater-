import { LayoutDashboard, PackageSearch, Star, Save, ClipboardList, Settings, LifeBuoy } from 'lucide-react';

export type ViewState = 'dashboard' | 'packages' | 'recommended' | 'backup' | 'logs' | 'settings' | 'help';

interface SidebarProps {
    currentView: ViewState;
    onViewChange: (view: ViewState) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'packages', label: 'App Packages', icon: PackageSearch },
        { id: 'recommended', label: 'Recommended Debloat', icon: Star },
        { id: 'backup', label: 'Backup & Restore', icon: Save },
        { id: 'logs', label: 'Logs & Monitor', icon: ClipboardList },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <aside className="w-64 bg-[var(--color-brand-surface)] border-r border-[var(--color-brand-border)] flex flex-col h-screen fixed left-0 top-0 z-40">
            <div className="p-6 border-b border-[var(--color-brand-border)]">
                <h1 className="text-xl font-bold flex items-center gap-3 text-[var(--color-brand-secondary)]">
                    <img src="/logo.webp" alt="AndroClean Logo" className="w-8 h-8 object-contain rounded-md" />
                    <span>AndroClean</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                                : 'text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-background)] hover:text-[var(--color-brand-secondary)]'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-[var(--color-brand-primary)]' : ''} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--color-brand-border)]">
                <button
                    onClick={() => onViewChange('help')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-background)] hover:text-[var(--color-brand-secondary)] transition-colors"
                >
                    <LifeBuoy size={18} />
                    Help & Docs
                </button>
            </div>
        </aside>
    );
}
