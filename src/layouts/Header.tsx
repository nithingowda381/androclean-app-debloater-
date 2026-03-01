import { Cpu, LogOut } from 'lucide-react';

interface HeaderProps {
    onDisconnect: () => void;
}

export function Header({ onDisconnect }: HeaderProps) {
    return (
        <header className="h-16 bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)] flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <div className="bg-[var(--color-brand-primary)]/10 p-2 rounded-lg text-[var(--color-brand-primary)]">
                    <Cpu size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-[var(--color-brand-secondary)]">Device Connected</h2>
                    <p className="text-xs text-[var(--color-brand-success)] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-success)] animate-pulse"></span>
                        Active USB Session
                    </p>
                </div>
            </div>

            <button
                onClick={onDisconnect}
                className="btn-ghost flex items-center gap-2 text-sm"
            >
                <LogOut size={16} />
                Disconnect
            </button>
        </header>
    );
}
