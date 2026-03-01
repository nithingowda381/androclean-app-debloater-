import { Usb, ShieldCheck, AlertCircle, Info, User, CheckCircle2, ChevronRight, Github, BookOpen, HeartHandshake } from 'lucide-react';

interface WelcomeScreenProps {
    onConnect: () => void;
    connecting: boolean;
    error: string | null;
}

export function WelcomeScreen({ onConnect, connecting, error }: WelcomeScreenProps) {
    return (
        <div className="min-h-screen bg-[var(--color-brand-background)] flex flex-col font-sans text-[var(--color-brand-secondary)] overflow-x-hidden">

            {/* Navigation Bar */}
            <nav className="w-full bg-[var(--color-brand-surface)] border-b border-[var(--color-brand-border)] sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="AndroClean Logo" className="w-8 h-8 rounded" />
                        <span className="font-bold text-lg">AndroClean</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-brand-muted)]">
                        <a href="#" className="hover:text-[var(--color-brand-primary)] transition-colors">Home</a>
                        <a href="https://github.com/nithingowda381/androclean-app-debloater-.git" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-primary)] transition-colors">Documentation</a>
                        <a href="https://github.com/nithingowda381/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-brand-primary)] transition-colors">GitHub</a>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center">

                {/* Hero Section */}
                <section className="w-full max-w-4xl px-6 py-20 md:py-32 text-center flex flex-col items-center">
                    <img src="/logo.jpg" alt="AndroClean Logo" className="w-32 h-32 rounded-3xl shadow-lg mb-8" />
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">AndroClean</h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-brand-primary)] mb-6">
                        Clean and optimize your Android device safely.
                    </h2>
                    <p className="text-lg md:text-xl text-[var(--color-brand-muted)] max-w-2xl leading-relaxed mb-12">
                        Remove unwanted system applications without rooting your device. Secure, fast, and powered by WebUSB + Android Debug Bridge.
                    </p>

                    <button
                        onClick={onConnect}
                        disabled={connecting}
                        className="bg-[var(--color-brand-primary)] hover:bg-blue-600 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                    >
                        {connecting ? (
                            <><div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> Connecting...</>
                        ) : (
                            <><Usb size={28} /> Connect Android Device</>
                        )}
                    </button>
                    {error && (
                        <div className="mt-6 text-red-500 font-medium flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-lg">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}
                </section>

                {/* Why Use AndroClean */}
                <section className="w-full bg-[var(--color-brand-surface)] border-y border-[var(--color-brand-border)] py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">Why Use AndroClean</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="p-6 bg-[var(--color-brand-background)] rounded-2xl border border-[var(--color-brand-border)]">
                                <ShieldCheck className="text-[var(--color-brand-success)] mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-3">Safe Debloating</h3>
                                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">Remove unnecessary system apps without modifying system partitions or rooting your device.</p>
                            </div>
                            <div className="p-6 bg-[var(--color-brand-background)] rounded-2xl border border-[var(--color-brand-border)]">
                                <Usb className="text-[var(--color-brand-primary)] mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-3">No Root Required</h3>
                                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">Uses the official Android Debug Bridge protocol to uninstall packages locally on your device.</p>
                            </div>
                            <div className="p-6 bg-[var(--color-brand-background)] rounded-2xl border border-[var(--color-brand-border)]">
                                <AlertCircle className="text-purple-500 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-3">Privacy Focused</h3>
                                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">All operations run locally in your browser. No data is sent to servers.</p>
                            </div>
                            <div className="p-6 bg-[var(--color-brand-background)] rounded-2xl border border-[var(--color-brand-border)]">
                                <CheckCircle2 className="text-orange-500 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-3">Fast Package Management</h3>
                                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">Scan, analyze, and remove unwanted apps in seconds.</p>
                            </div>
                            <div className="p-6 bg-[var(--color-brand-background)] rounded-2xl border border-[var(--color-brand-border)]">
                                <ShieldCheck className="text-[var(--color-brand-primary)] mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-3">Secure Communication</h3>
                                <p className="text-[var(--color-brand-muted)] text-sm leading-relaxed">WebUSB establishes a direct encrypted connection between your browser and your Android device.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Advantages */}
                <section className="w-full max-w-4xl mx-auto py-20 px-6">
                    <h2 className="text-3xl font-bold mb-10 text-center">Key Advantages</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-lg font-medium text-[var(--color-brand-muted)]">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-success)]" size={24} /> Remove manufacturer bloatware</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-success)]" size={24} /> Improve device performance</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-success)]" size={24} /> Reduce background services</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-success)]" size={24} /> Free up storage space</li>
                        <li className="flex items-center gap-3 sm:col-span-2 sm:mx-auto"><CheckCircle2 className="text-[var(--color-brand-success)]" size={24} /> Gain better control over installed packages</li>
                    </ul>
                </section>

                {/* How It Works */}
                <section className="w-full bg-[var(--color-brand-surface)] border-y border-[var(--color-brand-border)] py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="relative">
                                <div className="text-6xl font-black text-[var(--color-brand-primary)]/10 absolute -top-6 -left-2 z-0">1</div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Enable Developer Options</h3>
                                    <p className="text-sm text-[var(--color-brand-muted)]">Go to Settings → About Phone → Tap "Build Number" 7 times.</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center text-[var(--color-brand-border)]"><ChevronRight size={32} /></div>

                            <div className="relative">
                                <div className="text-6xl font-black text-[var(--color-brand-primary)]/10 absolute -top-6 -left-2 z-0">2</div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Enable USB Debugging</h3>
                                    <p className="text-sm text-[var(--color-brand-muted)]">Go to Settings → Developer Options → Turn ON USB Debugging.</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center text-[var(--color-brand-border)]"><ChevronRight size={32} /></div>

                            <div className="relative">
                                <div className="text-6xl font-black text-[var(--color-brand-primary)]/10 absolute -top-6 -left-2 z-0">3</div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Connect Device</h3>
                                    <p className="text-sm text-[var(--color-brand-muted)]">Connect your Android device to this computer using a USB cable.</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center justify-center text-[var(--color-brand-border)]"><ChevronRight size={32} /></div>

                            <div className="relative">
                                <div className="text-6xl font-black text-[var(--color-brand-primary)]/10 absolute -top-6 -left-2 z-0">4</div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Authorize Access</h3>
                                    <p className="text-sm text-[var(--color-brand-muted)]">When prompted on your device, allow the RSA debugging authorization.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Safety Information */}
                <section className="w-full max-w-4xl mx-auto py-20 px-6">
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 md:p-12 text-center">
                        <AlertCircle className="text-orange-500 w-16 h-16 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold mb-6 text-orange-600 dark:text-orange-400">Safety Information</h2>
                        <ul className="space-y-4 text-orange-700 dark:text-orange-300 font-medium text-lg max-w-2xl mx-auto text-left">
                            <li className="flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-1" size={20} />
                                <span>Removing certain system applications may affect device functionality.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-1" size={20} />
                                <span>Only remove applications labeled "Safe to Remove" unless you fully understand the consequences.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <AlertCircle className="shrink-0 mt-1" size={20} />
                                <span>Always review package details before uninstalling.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Developer Info */}
                <section className="w-full bg-[var(--color-brand-surface)] border-t border-[var(--color-brand-border)] py-20 px-6">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                        <div className="w-32 h-32 rounded-full bg-[var(--color-brand-primary)]/10 flex items-center justify-center shrink-0">
                            <User size={64} className="text-[var(--color-brand-primary)]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">About the Developer</h2>
                            <h3 className="text-xl font-medium text-[var(--color-brand-primary)] mb-6">Nithin Gowda M S</h3>
                            <p className="text-[var(--color-brand-muted)] leading-relaxed mb-6">
                                Nithin Gowda M S is an Artificial Intelligence and Machine Learning engineering student focused on building practical software tools that combine system optimization, security, and modern web technologies.
                            </p>
                            <p className="text-[var(--color-brand-muted)] leading-relaxed mb-8">
                                AndroClean was created to provide a safe, accessible, and privacy-focused method for managing and removing unnecessary Android system applications without requiring root access.
                            </p>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[var(--color-brand-border)] bg-[var(--color-brand-background)] py-12 px-6 text-center text-sm text-[var(--color-brand-muted)]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left font-medium">
                        <p className="text-[var(--color-brand-secondary)] font-bold mb-1">AndroClean v1.0</p>
                        <p>Developed By Nithin</p>
                    </div>
                    <div className="flex items-center gap-6 font-bold">
                        <a href="https://github.com/nithingowda381/androclean-app-debloater-.git" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--color-brand-primary)] transition-colors"><BookOpen size={16} /> Documentation</a>
                        <a href="https://github.com/nithingowda381/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--color-brand-primary)] transition-colors"><Github size={16} /> GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
