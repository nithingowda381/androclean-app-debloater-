import { useState, useEffect, useMemo } from 'react';
import { Package, Search, Trash2, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { adbManager } from '../lib/adb';
import { getBloatwareInfo } from '../lib/bloatware';
import type { BloatwareApp } from '../lib/bloatware';

interface AppInfo {
    packageName: string;
    bloatInfo?: BloatwareApp;
}

export function PackageExplorerView() {
    const [packages, setPackages] = useState<AppInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'bloatware' | 'safe'>('all');

    const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
    const [uninstalling, setUninstalling] = useState<boolean>(false);
    const [uninstallProgress, setUninstallProgress] = useState<{ current: number, total: number, target: string } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [batchResult, setBatchResult] = useState<{ success: number, fail: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPackages = async () => {
        setLoading(true);
        setError(null);
        setSelectedPackages(new Set());
        try {
            const output = await adbManager.shell('pm list packages');
            const lines = output.split('\n');
            const parsedPackages: AppInfo[] = lines
                .map(line => line.trim().replace(/^package:/, ''))
                .filter(pkg => pkg.length > 0)
                .map(pkg => ({
                    packageName: pkg,
                    bloatInfo: getBloatwareInfo(pkg)
                }));
            setPackages(parsedPackages);
        } catch (err: any) {
            console.error('Failed to fetch packages:', err);
            setError('Failed to fetch packages from device. Ensure it is connected properly.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const toggleSelection = (pkgName: string) => {
        const newSelected = new Set(selectedPackages);
        if (newSelected.has(pkgName)) {
            newSelected.delete(pkgName);
        } else {
            newSelected.add(pkgName);
        }
        setSelectedPackages(newSelected);
    };

    const toggleSelectAll = (filteredList: AppInfo[]) => {
        if (selectedPackages.size === filteredList.length && filteredList.length > 0) {
            setSelectedPackages(new Set());
        } else {
            const newSelected = new Set<string>();
            filteredList.forEach(p => newSelected.add(p.packageName));
            setSelectedPackages(newSelected);
        }
    };

    const confirmBatchUninstall = () => {
        if (selectedPackages.size === 0) return;
        setShowConfirm(true);
    };

    const executeBatchUninstall = async () => {
        setShowConfirm(false);
        setUninstalling(true);
        const pkgsArray = Array.from(selectedPackages);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < pkgsArray.length; i++) {
            const pkg = pkgsArray[i];
            setUninstallProgress({ current: i + 1, total: pkgsArray.length, target: pkg });

            try {
                const result = await adbManager.shell(`pm uninstall -k --user 0 ${pkg}`);
                if (result.includes('Success') || result.toLowerCase().includes('success')) {
                    successCount++;
                    setPackages(prev => prev.filter(p => p.packageName !== pkg));
                } else {
                    console.warn(`Failed to uninstall ${pkg}:`, result);
                    failCount++;
                }
            } catch (err: any) {
                console.error(`Error uninstalling ${pkg}:`, err);
                failCount++;
            }
        }

        setUninstalling(false);
        setUninstallProgress(null);
        setSelectedPackages(new Set());
        setBatchResult({ success: successCount, fail: failCount });
    };

    const filteredPackages = useMemo(() => {
        let result = packages;

        if (filter === 'bloatware') {
            result = result.filter(p => !!p.bloatInfo);
        } else if (filter === 'safe') {
            result = result.filter(p => p.bloatInfo && p.bloatInfo.safeToRemove);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.packageName.toLowerCase().includes(query) ||
                (p.bloatInfo?.name?.toLowerCase().includes(query))
            );
        }

        return result.sort((a, b) => {
            if (a.bloatInfo && !b.bloatInfo) return -1;
            if (!a.bloatInfo && b.bloatInfo) return 1;
            return a.packageName.localeCompare(b.packageName);
        });
    }, [packages, filter, searchQuery]);


    return (
        <div className="flex flex-col h-full relative">

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)] flex items-center gap-3">
                        Package Manager
                        <span className="text-sm font-medium bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] px-2.5 py-0.5 rounded-full">
                            {filteredPackages.length} Apps
                        </span>
                    </h2>
                    <p className="text-[var(--color-brand-muted)] text-sm mt-1">Select and remove unnecessary applications safely.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search packages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--color-brand-surface)] text-[var(--color-brand-secondary)] border border-[var(--color-brand-border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-all"
                        />
                    </div>
                    <button onClick={fetchPackages} disabled={loading || uninstalling} className="btn-secondary p-2 inline-flex items-center justify-center" title="Refresh Packages">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[var(--color-brand-secondary)] text-[var(--color-brand-background)]' : 'bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-background)]'}`}>All Packages</button>
                <button onClick={() => setFilter('safe')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'safe' ? 'bg-[var(--color-brand-success)] text-white' : 'bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-background)]'}`}>Safe to Remove</button>
                <button onClick={() => setFilter('bloatware')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'bloatware' ? 'bg-[var(--color-brand-danger)] text-white' : 'bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-background)]'}`}>Manufacturer Bloat</button>
            </div>

            {error && (
                <div className="mb-6 bg-[var(--color-brand-danger)]/10 border border-[var(--color-brand-danger)]/20 text-[var(--color-brand-danger)] p-4 rounded-lg flex items-center gap-3">
                    <ShieldAlert size={20} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Table View */}
            <div className="surface-panel flex-1 overflow-hidden flex flex-col mb-24">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--color-brand-background)] border-b border-[var(--color-brand-border)] sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-[var(--color-brand-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                                        checked={selectedPackages.size === filteredPackages.length && filteredPackages.length > 0}
                                        onChange={() => toggleSelectAll(filteredPackages)}
                                    />
                                </th>
                                <th className="p-4 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">App Name & Package</th>
                                <th className="p-4 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Risk Level</th>
                                <th className="p-4 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-brand-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-[var(--color-brand-muted)]">
                                        <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                                        Scanning device packages...
                                    </td>
                                </tr>
                            ) : filteredPackages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-[var(--color-brand-muted)]">
                                        <Package size={32} className="opacity-40 mx-auto mb-2" />
                                        No packages match your current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredPackages.map((pkg) => {
                                    const isSelected = selectedPackages.has(pkg.packageName);
                                    const isSafe = pkg.bloatInfo?.safeToRemove;
                                    const isKnownBloat = !!pkg.bloatInfo;

                                    return (
                                        <tr
                                            key={pkg.packageName}
                                            className={`hover:bg-[var(--color-brand-background)] transition-colors cursor-pointer ${isSelected ? 'bg-[var(--color-brand-primary)]/5' : ''}`}
                                            onClick={() => toggleSelection(pkg.packageName)}
                                        >
                                            <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[var(--color-brand-border)] text-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(pkg.packageName)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-[var(--color-brand-secondary)]">{pkg.bloatInfo?.name || pkg.packageName.split('.').pop()}</div>
                                                <div className="text-xs text-[var(--color-brand-muted)] font-mono mt-0.5">{pkg.packageName}</div>
                                                {pkg.bloatInfo?.description && (
                                                    <div className="text-xs text-[var(--color-brand-muted)]/80 mt-1.5 max-w-lg">{pkg.bloatInfo.description}</div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {isKnownBloat ? (
                                                    isSafe ? (
                                                        <span className="inline-flex items-center gap-1 bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle2 size={12} /> Safe</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 text-xs font-semibold px-2.5 py-1 rounded-full"><ShieldAlert size={12} /> Moderate</span>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-[var(--color-brand-muted)]/60">System / Unknown</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); toggleSelection(pkg.packageName); confirmBatchUninstall(); }} className="btn-secondary text-xs px-3 py-1.5 !text-[var(--color-brand-danger)] hover:bg-[var(--color-brand-danger)]/5 hover:!border-[var(--color-brand-danger)]">
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Action Bar */}
            {selectedPackages.size > 0 && (
                <div className="fixed bottom-6 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 w-[90%] max-w-3xl surface-panel p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50 flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] p-2.5 rounded-lg">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--color-brand-secondary)]">
                                {selectedPackages.size} Packages Selected
                            </h3>
                            {uninstallProgress ? (
                                <p className="text-sm text-[var(--color-brand-muted)] animate-pulse w-48 truncate">Removing: {uninstallProgress.target.split('.').pop()}</p>
                            ) : (
                                <p className="text-sm text-[var(--color-brand-muted)]">Ready to remove selected apps.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {!uninstalling && <button onClick={() => setSelectedPackages(new Set())} className="btn-secondary">Cancel</button>}
                        <button onClick={confirmBatchUninstall} disabled={uninstalling} className="btn-danger min-w-[120px] flex items-center justify-center gap-2">
                            {uninstalling ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    {uninstallProgress?.current} / {uninstallProgress?.total}
                                </>
                            ) : "Debloat Now"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="surface-panel max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-brand-danger)]/10 flex items-center justify-center mb-4 text-[var(--color-brand-danger)]">
                            <ShieldAlert size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--color-brand-secondary)] mb-2">WARNING: Confirm Removal</h2>
                        <p className="text-[var(--color-brand-muted)] mb-6 text-sm">
                            Removing system packages may affect device functionality or cause bootloops if critical components are removed.
                            <br /><br />
                            You are about to remove <strong className="text-[var(--color-brand-secondary)]">{selectedPackages.size}</strong> packages. This cannot be easily undone without a factory reset.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className="btn-secondary">Cancel</button>
                            <button onClick={executeBatchUninstall} className="btn-danger">Force Remove</button>
                        </div>
                    </div>
                </div>
            )}

            {batchResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="surface-panel max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="mb-4 flex justify-center">
                            {batchResult.fail === 0 ? (
                                <div className="w-16 h-16 bg-[var(--color-brand-success)]/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-[var(--color-brand-success)]" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                    <ShieldAlert size={32} className="text-yellow-600" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)] mb-2">Debloat Complete</h2>
                        <p className="text-[var(--color-brand-muted)] mb-6 text-sm">
                            Successfully removed <strong className="text-[var(--color-brand-secondary)]">{batchResult.success}</strong> packages.
                            {batchResult.fail > 0 && (
                                <span className="block mt-2 text-yellow-600 font-medium">Failed to remove {batchResult.fail} packages. Some system apps require root.</span>
                            )}
                        </p>
                        <button onClick={() => setBatchResult(null)} className="btn-primary w-full">Close</button>
                    </div>
                </div>
            )}

        </div>
    );
}
