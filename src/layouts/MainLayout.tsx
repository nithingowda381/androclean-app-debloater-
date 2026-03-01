import { useState } from 'react';
import { Sidebar } from './Sidebar';
import type { ViewState } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    onDisconnect: () => void;
    children: (currentView: ViewState, setCurrentView: (view: ViewState) => void) => React.ReactNode;
}

export function MainLayout({ onDisconnect, children }: MainLayoutProps) {
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');

    return (
        <div className="min-h-screen bg-[var(--color-brand-background)] flex">
            {/* Sidebar */}
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />

            {/* Main Content wrapper */}
            <div className="flex-1 flex flex-col ml-64 min-w-0 h-screen overflow-hidden">
                <Header onDisconnect={onDisconnect} />

                <main className="flex-1 p-6 overflow-y-auto">
                    {children(currentView, setCurrentView)}
                </main>
            </div>
        </div>
    );
}
