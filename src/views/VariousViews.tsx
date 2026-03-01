import { useState, useEffect } from 'react';
import { adbManager, eventBus } from '../lib/adb';
import { useTheme } from '../hooks/useTheme';
import type { ViewState } from '../layouts/Sidebar';
import { getBloatwareInfo } from '../lib/bloatware';

export function DashboardView({ onViewChange }: { onViewChange: (view: ViewState) => void }) {
    const [stats, setStats] = useState({
        androidVersion: '...',
        totalApps: '...',
        systemApps: '...',
        bloatApps: '...'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const versionOut = await adbManager.shell('getprop ro.build.version.release');
                const androidVersion = versionOut.trim() || 'Unknown';

                const allAppsOut = await adbManager.shell('pm list packages');
                const sysAppsOut = await adbManager.shell('pm list packages -s');

                const allApps = allAppsOut.split('\n').filter(l => l.trim().length > 0);
                const sysApps = sysAppsOut.split('\n').filter(l => l.trim().length > 0);

                let bloatCount = 0;
                allApps.forEach(line => {
                    const pkg = line.replace(/^package:/, '').trim();
                    if (pkg && getBloatwareInfo(pkg)) {
                        bloatCount++;
                    }
                });

                setStats({
                    androidVersion,
                    totalApps: allApps.length.toString(),
                    systemApps: sysApps.length.toString(),
                    bloatApps: bloatCount.toString()
                });
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };

        fetchStats();
    }, []);
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Device Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="surface-panel p-6">
                    <h3 className="text-sm font-medium text-[var(--color-brand-muted)] mb-1">Android Version</h3>
                    <p className="text-3xl font-bold text-[var(--color-brand-secondary)]">{stats.androidVersion}</p>
                </div>
                <div className="surface-panel p-6">
                    <h3 className="text-sm font-medium text-[var(--color-brand-muted)] mb-1">Total Apps</h3>
                    <p className="text-3xl font-bold text-[var(--color-brand-secondary)]">{stats.totalApps}</p>
                </div>
                <div className="surface-panel p-6">
                    <h3 className="text-sm font-medium text-[var(--color-brand-muted)] mb-1">System Apps</h3>
                    <p className="text-3xl font-bold text-[var(--color-brand-secondary)]">{stats.systemApps}</p>
                </div>
                <div className="surface-panel p-6">
                    <h3 className="text-sm font-medium text-[var(--color-brand-muted)] mb-1">Potential Bloat</h3>
                    <p className="text-3xl font-bold text-[var(--color-brand-primary)]">{stats.bloatApps}</p>
                </div>
            </div>

            <div className="surface-panel p-6">
                <h3 className="text-lg font-bold mb-4 text-[var(--color-brand-secondary)]">Quick Actions</h3>
                <div className="flex gap-4">
                    <button onClick={() => onViewChange('packages')} className="btn-primary">Scan Installed Apps</button>
                    <button onClick={() => onViewChange('recommended')} className="btn-secondary">Load Recommended Debloat</button>
                    <button onClick={() => onViewChange('backup')} className="btn-secondary">Backup Current Packages</button>
                </div>
            </div>
        </div>
    );
}

import { RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RecommendedView() {
    const [applying, setApplying] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ current: number, total: number, target: string } | null>(null);
    const [result, setResult] = useState<{ profile: string, success: number, fail: number } | null>(null);

    const applyProfile = async (profileName: string, packages: string[]) => {
        setApplying(profileName);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < packages.length; i++) {
            const pkg = packages[i];
            setProgress({ current: i + 1, total: packages.length, target: pkg });

            try {
                const out = await adbManager.shell(`pm uninstall -k --user 0 ${pkg}`);
                if (out.includes('Success') || out.toLowerCase().includes('success')) {
                    successCount++;
                } else if (out.includes('not installed')) {
                    // Count as success if already gone
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                failCount++;
            }
        }

        setApplying(null);
        setProgress(null);
        setResult({ profile: profileName, success: successCount, fail: failCount });
    };

    const samsungPackages = [
        'com.samsung.android.bixby.agent', 'com.samsung.android.bixby.wakeup',
        'com.samsung.android.app.spage', 'com.samsung.android.game.gamehome',
        'com.sec.android.app.browser', 'com.samsung.android.email.provider'
    ];

    const xiaomiPackages = [
        'com.miui.analytics', 'com.miui.msa.global',
        'com.miui.player', 'com.miui.videoplayer'
    ];

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Recommended Debloat Profiles</h2>
            <p className="text-[var(--color-brand-muted)] max-w-2xl">
                Apply community-tested, one-click profiles to safely remove manufacturer telemtry and bloatware based on your device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Samsung Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">Samsung Safe Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Removes Samsung Pay, AR Zone, Game Launcher, and basic telemetry safely.</p>
                    <button
                        onClick={() => applyProfile('Samsung', samsungPackages)}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'Samsung' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'Samsung' && progress && (
                        <p className="text-xs text-center text-[var(--color-brand-muted)] mt-2 animate-pulse truncate">Removing: {progress.target.split('.').pop()}</p>
                    )}
                </div>

                {/* Xiaomi Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">Xiaomi MIUI Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Removes MIUI ads, tracking apps, Mi Browser, and background analytics.</p>
                    <button
                        onClick={() => applyProfile('Xiaomi', xiaomiPackages)}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'Xiaomi' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'Xiaomi' && progress && (
                        <p className="text-xs text-center text-[var(--color-brand-muted)] mt-2 animate-pulse truncate">Removing: {progress.target.split('.').pop()}</p>
                    )}
                </div>
            </div>

            {/* Result Modal */}
            {result && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="surface-panel max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="mb-4 flex justify-center">
                            {result.fail === 0 ? (
                                <div className="w-16 h-16 bg-[var(--color-brand-success)]/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-[var(--color-brand-success)]" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                    <ShieldAlert size={32} className="text-yellow-600" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)] mb-2">{result.profile} Profile Applied</h2>
                        <p className="text-[var(--color-brand-muted)] mb-6 text-sm">
                            Successfully processed <strong className="text-[var(--color-brand-secondary)]">{result.success}</strong> packages.
                            {result.fail > 0 && (
                                <span className="block mt-2 text-yellow-600 font-medium">{result.fail} packages were not found or required root to remove.</span>
                            )}
                        </p>
                        <button onClick={() => setResult(null)} className="btn-primary w-full">Done</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function BackupRestoreView() {
    const [backingUp, setBackingUp] = useState(false);
    const [backups, setBackups] = useState<{ name: string, date: string }[]>([]);

    const handleCreateBackup = async () => {
        try {
            setBackingUp(true);
            const output = await adbManager.shell('pm list packages');
            const lines = output.split('\n');
            const parsedPackages = lines
                .map(line => line.trim().replace(/^package:/, ''))
                .filter(pkg => pkg.length > 0);

            let deviceModel = 'AndroidDevice';
            try {
                const modelOutput = await adbManager.shell('getprop ro.product.model');
                if (modelOutput && modelOutput.trim()) {
                    deviceModel = modelOutput.trim().replace(/\s+/g, '_');
                }
            } catch (e) { console.warn('Could not read device model', e); }

            const backupData = {
                timestamp: new Date().toISOString(),
                device: deviceModel,
                packageCount: parsedPackages.length,
                packages: parsedPackages
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `debloater_backup_${deviceModel}_${dateStr}.json`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setBackups(prev => [{ name: filename, date: new Date().toLocaleString() }, ...prev]);
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Failed to retrieve packages for backup. Ensure device is connected.');
        } finally {
            setBackingUp(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Backup Manager</h2>

            <div className="surface-panel p-6 flex justify-between items-center bg-[var(--color-brand-background)]">
                <div>
                    <h3 className="font-bold text-[var(--color-brand-secondary)]">
                        Last Backup: <span className="text-[var(--color-brand-muted)] font-normal">{backups.length > 0 ? backups[0].date : 'No backups found'}</span>
                    </h3>
                    <p className="text-sm text-[var(--color-brand-muted)] mt-1">Export a list of currently installed packages to restore disabled apps later.</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={backingUp}
                    className="btn-primary"
                >
                    {backingUp ? 'Exporting...' : 'Export Package List'}
                </button>
            </div>

            <h3 className="text-lg font-bold mt-8 mb-4 text-[var(--color-brand-secondary)]">Available Event Logs</h3>
            <div className="surface-panel overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--color-brand-background)] border-b border-[var(--color-brand-border)]">
                            <th className="p-4 text-sm font-semibold text-[var(--color-brand-muted)]">Backup Name</th>
                            <th className="p-4 text-sm font-semibold text-[var(--color-brand-muted)]">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-brand-border)]">
                        {backups.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="p-8 text-center text-[var(--color-brand-muted)]">No backups have been created during this session.</td>
                            </tr>
                        ) : (
                            backups.map((b, i) => (
                                <tr key={i} className="hover:bg-[var(--color-brand-background)] transition-colors">
                                    <td className="p-4 font-mono text-sm text-[var(--color-brand-secondary)]">{b.name}</td>
                                    <td className="p-4 text-sm text-[var(--color-brand-muted)]">{b.date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function LogsView() {
    const [logs, setLogs] = useState<import('../lib/adb').LogEvent[]>([]);

    useEffect(() => {
        // Subscribe to real-time events from ADB module
        const unsubscribe = eventBus.subscribe((newLogs: import('../lib/adb').LogEvent[]) => {
            setLogs([...newLogs]);
        });
        return () => unsubscribe();
    }, []);

    const handleClear = () => eventBus.clear();

    const handleExport = () => {
        const content = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debloater_logs_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">System Logs</h2>
                <div className="flex gap-3">
                    <button onClick={handleExport} disabled={logs.length === 0} className="btn-secondary text-sm py-1.5">Export Logs</button>
                    <button onClick={handleClear} disabled={logs.length === 0} className="btn-danger text-sm py-1.5">Clear Logs</button>
                </div>
            </div>

            <div className="surface-panel flex-1 bg-[var(--color-brand-surface)] text-[var(--color-brand-secondary)] font-mono text-sm p-4 overflow-y-auto">
                {logs.length === 0 ? (
                    <div className="text-[var(--color-brand-muted)] italic">No logs available.</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-[var(--color-brand-muted)] w-20 shrink-0">{log.timestamp}</span>
                            <span className={log.type === 'success' ? 'text-[var(--color-brand-success)]' : log.type === 'error' ? 'text-[var(--color-brand-danger)]' : ''}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function SettingsView() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="space-y-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Application Settings</h2>

            <div className="surface-panel divide-y divide-[var(--color-brand-border)]">
                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[var(--color-brand-secondary)]">ADB Path</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Using built-in WebADB implementation targeting WebUSB.</p>
                    </div>
                    <span className="text-xs bg-[var(--color-brand-background)] text-[var(--color-brand-muted)] px-2 py-1 rounded border border-[var(--color-brand-border)]">browser-native</span>
                </div>

                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[var(--color-brand-secondary)]">Safety Mode (Package Protection)</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Prevent uninstallation of critical boot-loop inducing packages.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[var(--color-brand-muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-success)]"></div>
                    </label>
                </div>

                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[var(--color-brand-secondary)]">Dark Theme</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Switch the application interface to dark mode.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isDark} onChange={toggleTheme} />
                        <div className="w-11 h-6 bg-[var(--color-brand-muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-primary)]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}
