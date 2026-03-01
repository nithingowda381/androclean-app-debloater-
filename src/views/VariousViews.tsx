import { useState, useEffect } from 'react';
import { adbManager, eventBus } from '../lib/adb';
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
            <section className="surface-panel p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[var(--color-brand-secondary)] tracking-tight">Device Dashboard</h2>
                        <p className="text-sm text-[var(--color-brand-muted)] mt-1">Live device and package summary from current ADB session.</p>
                    </div>
                    <div className="text-xs text-[var(--color-brand-muted)] bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] px-3 py-1.5 rounded-full w-fit">
                        Session Connected
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="surface-panel p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">Android Version</p>
                    <p className="text-3xl font-black text-[var(--color-brand-secondary)] mt-2">{stats.androidVersion}</p>
                </div>
                <div className="surface-panel p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">Total Apps</p>
                    <p className="text-3xl font-black text-[var(--color-brand-secondary)] mt-2">{stats.totalApps}</p>
                </div>
                <div className="surface-panel p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">System Apps</p>
                    <p className="text-3xl font-black text-[var(--color-brand-secondary)] mt-2">{stats.systemApps}</p>
                </div>
                <div className="surface-panel p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-[var(--color-brand-primary)]/30">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-brand-muted)]">Potential Bloat</p>
                    <p className="text-3xl font-black text-[var(--color-brand-primary)] mt-2">{stats.bloatApps}</p>
                </div>
            </section>
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

    const applyMiuiProfile = async () => {
        try {
            const installedRaw = await adbManager.shell('pm list packages');
            const installedSet = new Set(
                installedRaw
                    .split('\n')
                    .map(line => line.trim().replace(/^package:/, ''))
                    .filter(Boolean)
            );

            const filteredPackages = xiaomiPackages.filter(pkg => installedSet.has(pkg));
            await applyProfile('Xiaomi', filteredPackages);
        } catch (err) {
            console.error('Failed to scan installed MIUI packages:', err);
            setResult({ profile: 'Xiaomi', success: 0, fail: 0 });
        }
    };

    const applyDisableProfile = async (profileName: string, packages: string[]) => {
        setApplying(profileName);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < packages.length; i++) {
            const pkg = packages[i];
            setProgress({ current: i + 1, total: packages.length, target: pkg });

            try {
                const out = await adbManager.shell(`pm disable-user --user 0 ${pkg}`);
                const lower = out.toLowerCase();
                if (
                    lower.includes('new state: disabled-user') ||
                    lower.includes('disabled-user') ||
                    lower.includes('already disabled')
                ) {
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

    const applyColorOsProfile = async () => {
        try {
            const installedRaw = await adbManager.shell('pm list packages');
            const installedSet = new Set(
                installedRaw
                    .split('\n')
                    .map(line => line.trim().replace(/^package:/, ''))
                    .filter(Boolean)
            );

            const filteredPackages = colorOsDisablePackages.filter(pkg => installedSet.has(pkg));
            await applyDisableProfile('Oppo', filteredPackages);
        } catch (err) {
            console.error('Failed to scan installed ColorOS packages:', err);
            setResult({ profile: 'Oppo', success: 0, fail: 0 });
        }
    };

    const samsungPackages = [
        'com.samsung.android.bixby.agent', 'com.samsung.android.bixby.wakeup',
        'com.samsung.android.app.spage', 'com.samsung.android.game.gamehome',
        'com.sec.android.app.browser', 'com.samsung.android.email.provider'
    ];

    const xiaomiPackages = [
        'com.xiaomi.ab',
        'com.xiaomi.aiasst.service',
        'com.xiaomi.bluetooth',
        'com.xiaomi.gamecenter.sdk.service',
        'com.xiaomi.joyose',
        'com.xiaomi.mi_connect_service',
        'com.xiaomi.micloud.sdk',
        'com.xiaomi.migameservice',
        'com.xiaomi.miplay_client',
        'com.xiaomi.mircs',
        'com.xiaomi.mirror',
        'com.xiaomi.payment',
        'com.xiaomi.powerchecker',
        'com.xiaomi.simactivate.service',
        'com.xiaomi.xmsf',
        'com.xiaomi.xmsfkeeper',
        'com.milink.service',
        'com.miui.analytics',
        'com.miui.audioeffect',
        'com.miui.audiomonitor',
        'com.miui.bugreport',
        'com.miui.cit',
        'com.miui.cloudbackup',
        'com.miui.cloudservice',
        'com.miui.cloudservice.sysbase',
        'com.miui.contentcatcher',
        'com.miui.daemon',
        'com.miui.hybrid',
        'com.miui.hybrid.accessory',
        'com.miui.maintenancemode',
        'com.miui.micloudsync',
        'com.miui.miservice',
        'com.miui.mishare.connectivity',
        'com.miui.misound',
        'com.miui.nextpay',
        'com.miui.personalassistant',
        'com.miui.phrase',
        'com.miui.smsextra',
        'com.miui.systemAdSolution',
        'com.miui.touchassistant',
        'com.miui.translation.kingsoft',
        'com.miui.translation.xmcloud',
        'com.miui.translation.youdao',
        'com.miui.translationservice',
        'com.miui.voiceassist',
        'com.miui.voicetrigger',
        'com.miui.vsimcore',
        'com.miui.wmsvc',
        'com.mobiletools.systemhelper',
        'com.android.chrome',
        'com.google.android.apps.youtube.music',
        'com.linkedin.android',
        'com.jewelsblast.ivygames.Adventure.free',
        'com.amazon.mShop.android.shopping',
        'com.ss.android.ugc.trill',
        'com.booking',
        'com.xiaomi.scanner',
        'com.miui.weather2',
        'com.xiaomi.smarthome',
        'com.miui.android.fashiongallery',
        'com.crazy.juicer.xm',
        'com.spotify.music',
        'com.sukhavati.gotoplaying.bubble.BubbleShooter.mint',
        'com.netflix.mediaclient',
        'com.mi.global.bbs',
        'com.agoda.mobile.consumer',
        'com.xiaomi.midrop',
        'com.block.puzzle.game.hippo.mi',
        'com.duokan.phone.remotecontroller',
        'com.logame.eliminateintruder3d',
        'cn.wps.xiaomi.abroad.lite',
        'com.xiaomi.calendar',
        'com.nf.snake',
        'com.google.android.apps.subscriptions.red',
        'com.google.android.googlequicksearchbox',
        'com.mintgames.wordtrip',
        'ctrip.english',
        'com.google.android.apps.photos',
        'com.mintgames.triplecrush.tile.fun',
        'com.amazon.appmanager',
        'com.mi.global.shop',
        'com.facebook.katana',
        'com.shopee.sg'
    ];

    const colorOsDisablePackages = [
        'com.caf.fmradio',
        'com.coloros.activation',
        'com.coloros.activation.overlay.common',
        'com.coloros.alarmclock',
        'com.coloros.appmanager',
        'com.coloros.assistantscreen',
        'com.coloros.athena',
        'com.coloros.avastofferwall',
        'com.coloros.backuprestore',
        'com.coloros.backuprestore.remoteservice',
        'com.coloros.bootreg',
        'com.coloros.calculator',
        'com.coloros.childrenspace',
        'com.coloros.compass2',
        'com.coloros.encryption',
        'com.coloros.filemanager',
        'com.coloros.floatassistant',
        'com.coloros.focusmode',
        'com.coloros.gallery3d',
        'com.coloros.gamespace',
        'com.coloros.gamespaceui',
        'com.coloros.healthcheck',
        'com.coloros.ocrscanner',
        'com.coloros.oppomultiapp',
        'com.coloros.oshare',
        'com.coloros.phonemanager',
        'com.coloros.phonenoareainquire',
        'com.coloros.pictorial',
        'com.coloros.resmonitor',
        'com.coloros.safesdkproxy',
        'com.coloros.sauhelper',
        'com.coloros.sceneservice',
        'com.coloros.screenrecorder',
        'com.coloros.securepay',
        'com.coloros.smartdrive',
        'com.coloros.soundrecorder',
        'com.coloros.speechassist',
        'com.coloros.translate.engine',
        'com.coloros.video',
        'com.coloros.wallet',
        'com.coloros.weather.service',
        'com.coloros.weather2',
        'com.coloros.widget.smallweather',
        'com.coloros.wifibackuprestore',
        'com.dsi.ant.server',
        'com.nearme.browser',
        'com.nearme.themestore',
        'com.oppo.aod',
        'com.oppo.atlas',
        'com.oppo.bttestmode',
        'com.oppo.criticallog',
        'com.oppo.gmail.overlay',
        'com.oppo.lfeh',
        'com.oppo.logkit',
        'com.oppo.market',
        'com.oppo.mimosiso',
        'com.oppo.music',
        'com.oppo.nw',
        'com.oppo.operationManual',
        'com.oppo.ovoicemanager',
        'com.oppo.partnerbrowsercustomizations',
        'com.oppo.qualityprotect',
        'com.oppo.quicksearchbox',
        'com.oppo.rftoolkit',
        'com.oppo.ScoreAppMonitor',
        'com.oppo.sos',
        'com.oppo.startlogkit',
        'com.oppo.usageDump',
        'com.oppo.usercenter',
        'com.oppo.webview',
        'com.oppo.wifirf',
        'com.oppoex.afterservice',
        'com.redteamobile.roaming.deamon'
    ];

    const onePlusPackages = [
        'com.oneplus.store', 'com.oneplus.membership',
        'net.oneplus.weather', 'com.heytap.usercenter'
    ];

    const realmePackages = [
        'com.heytap.market', 'com.heytap.browser',
        'com.coloros.music', 'com.coloros.video'
    ];

    const motorolaPackages = [
        'com.motorola.genie', 'com.motorola.help',
        'com.motorola.ccc.notification', 'com.motorola.fmplayer'
    ];

    return (
        <div className="space-y-6 relative">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Recommended Debloat Profiles</h2>
            <p className="text-[var(--color-brand-muted)] max-w-2xl">
                Apply community-tested, one-click profiles to safely remove manufacturer telemtry and bloatware based on your device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
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
                        onClick={applyMiuiProfile}
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

                {/* Oppo Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">Oppo ColorOS Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Targets Oppo browser, cloud, and bundled service apps commonly considered removable.</p>
                    <button
                        onClick={applyColorOsProfile}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'Oppo' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'Oppo' && progress && (
                        <p className="text-xs text-center text-[var(--color-brand-muted)] mt-2 animate-pulse truncate">Removing: {progress.target.split('.').pop()}</p>
                    )}
                </div>

                {/* OnePlus Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">OnePlus OxygenOS Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Removes OnePlus store/membership and selected optional service packages.</p>
                    <button
                        onClick={() => applyProfile('OnePlus', onePlusPackages)}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'OnePlus' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'OnePlus' && progress && (
                        <p className="text-xs text-center text-[var(--color-brand-muted)] mt-2 animate-pulse truncate">Removing: {progress.target.split('.').pop()}</p>
                    )}
                </div>

                {/* Realme Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">Realme UI Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Clears ad/market and media utility apps often bundled on Realme devices.</p>
                    <button
                        onClick={() => applyProfile('Realme', realmePackages)}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'Realme' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'Realme' && progress && (
                        <p className="text-xs text-center text-[var(--color-brand-muted)] mt-2 animate-pulse truncate">Removing: {progress.target.split('.').pop()}</p>
                    )}
                </div>

                {/* Motorola Profile */}
                <div className="surface-panel p-6 hover:border-[var(--color-brand-primary)] transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-brand-secondary)]">Motorola Profile</h3>
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] text-xs font-bold px-2 py-1 rounded">Safe</span>
                    </div>
                    <p className="text-sm text-[var(--color-brand-muted)] mb-6">Removes common Motorola companion/help/background utility packages.</p>
                    <button
                        onClick={() => applyProfile('Motorola', motorolaPackages)}
                        disabled={applying !== null}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {applying === 'Motorola' ? (
                            <><RefreshCw size={16} className="animate-spin" /> {progress?.current} / {progress?.total}</>
                        ) : "Apply Profile"}
                    </button>
                    {applying === 'Motorola' && progress && (
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
    return (
        <div className="space-y-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Application Settings</h2>
            <p className="text-sm text-[var(--color-brand-muted)]">No configurable options available.</p>
        </div>
    );
}
