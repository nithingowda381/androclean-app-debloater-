import { useState } from 'react';
import { Usb, ShieldCheck, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
    onConnect: () => void;
    connecting: boolean;
    error: string | null;
}

export function WelcomeScreen({ onConnect, connecting, error }: WelcomeScreenProps) {
    const [developerPhotoSrc, setDeveloperPhotoSrc] = useState('/developer.jpg');

    const handleDeveloperPhotoError = () => {
        setDeveloperPhotoSrc((prev) => {
            if (prev === '/developer.jpg') return '/developer.png';
            if (prev === '/developer.png') return '/developer.jpeg';
            return '/logo.jpg';
        });
    };

    return (
        <div className="min-h-screen bg-[var(--color-brand-background)] text-[var(--color-brand-secondary)] font-sans">
            <div className="max-w-6xl mx-auto px-6 py-10 md:py-14 space-y-10">
                <section className="surface-panel p-8 md:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        <div className="flex-1">
                            <img
                                src="/logo.jpg"
                                alt="AndroClean Logo"
                                className="w-20 h-20 rounded-2xl object-cover shadow-sm mb-4"
                            />
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">AndroClean</h1>
                            <p className="text-[var(--color-brand-muted)] text-lg leading-relaxed max-w-2xl mb-6">
                                Remove unwanted Android packages safely without root. Everything runs locally in your browser over WebUSB.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={onConnect}
                                    disabled={connecting}
                                    className="btn-primary text-base py-3 px-6 inline-flex items-center justify-center gap-2"
                                >
                                    {connecting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Usb size={18} />
                                            Connect Android Device
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="mt-4 bg-[var(--color-brand-danger)]/10 border border-[var(--color-brand-danger)]/30 text-[var(--color-brand-danger)] rounded-lg p-3 text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="surface-panel p-5 lg:w-[320px]">
                            <h2 className="font-bold mb-3 text-[var(--color-brand-secondary)] flex items-center gap-2">
                                <Info size={16} className="text-[var(--color-brand-primary)]" />
                                Before You Connect
                            </h2>
                            <ol className="space-y-3 text-sm text-[var(--color-brand-muted)]">
                                <li className="flex gap-2">
                                    <span className="font-bold text-[var(--color-brand-primary)]">1.</span>
                                    Enable Developer Options.
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-[var(--color-brand-primary)]">2.</span>
                                    Turn on USB Debugging.
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-bold text-[var(--color-brand-primary)]">3.</span>
                                    Connect device and approve RSA prompt.
                                </li>
                            </ol>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="surface-panel p-5">
                        <ShieldCheck className="text-[var(--color-brand-success)] mb-3" size={22} />
                        <h3 className="font-bold mb-1">Safe Debloat</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Focused on safe package removal with clear warnings before destructive actions.</p>
                    </div>
                    <div className="surface-panel p-5">
                        <Usb className="text-[var(--color-brand-primary)] mb-3" size={22} />
                        <h3 className="font-bold mb-1">No Root Needed</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Uses standard ADB commands over WebUSB directly from your browser.</p>
                    </div>
                    <div className="surface-panel p-5">
                        <CheckCircle2 className="text-[var(--color-brand-primary)] mb-3" size={22} />
                        <h3 className="font-bold mb-1">Fast Workflow</h3>
                        <p className="text-sm text-[var(--color-brand-muted)]">Scan, filter, and remove selected bloatware packages in one flow.</p>
                    </div>
                </section>

                <section className="bg-[var(--color-brand-danger)]/10 border border-[var(--color-brand-danger)]/20 rounded-xl p-4 text-sm text-[var(--color-brand-danger)]">
                    <p className="font-semibold mb-1">Safety Notice</p>
                    <p>Removing critical system packages can break device functionality. Prefer known-safe apps and export backups before bulk removals.</p>
                </section>

                <section className="surface-panel p-6">
                    <h2 className="text-xl font-bold mb-4">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] rounded-lg p-4">
                            <p className="font-semibold mb-1">Step 1</p>
                            <p className="text-[var(--color-brand-muted)]">Enable Developer Options in Android settings.</p>
                        </div>
                        <div className="bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] rounded-lg p-4">
                            <p className="font-semibold mb-1">Step 2</p>
                            <p className="text-[var(--color-brand-muted)]">Enable USB Debugging.</p>
                        </div>
                        <div className="bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] rounded-lg p-4">
                            <p className="font-semibold mb-1">Step 3</p>
                            <p className="text-[var(--color-brand-muted)]">Connect by USB and select your device in browser prompt.</p>
                        </div>
                        <div className="bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] rounded-lg p-4">
                            <p className="font-semibold mb-1">Step 4</p>
                            <p className="text-[var(--color-brand-muted)]">Review packages and debloat carefully.</p>
                        </div>
                    </div>
                </section>

                <section className="surface-panel p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <img
                            src={developerPhotoSrc}
                            alt="Developer profile"
                            onError={handleDeveloperPhotoError}
                            className="w-28 h-28 rounded-full object-cover border border-[var(--color-brand-border)]"
                        />
                        <div>
                            <h2 className="text-xl font-bold mb-1">About the Developer</h2>
                            <p className="font-medium text-[var(--color-brand-primary)] mb-2">Nithin Gowda M S</p>
                            <p className="text-sm text-[var(--color-brand-muted)] leading-relaxed">
                                Built to provide a practical, privacy-first Android debloat workflow using browser-native WebADB.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
