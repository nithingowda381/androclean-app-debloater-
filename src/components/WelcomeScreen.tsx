import { Usb, ShieldCheck, AlertCircle, Info, User } from 'lucide-react';

interface WelcomeScreenProps {
    onConnect: () => void;
    connecting: boolean;
    error: string | null;
}

export function WelcomeScreen({ onConnect, connecting, error }: WelcomeScreenProps) {
    return (
        <div className="min-h-screen bg-[var(--color-brand-background)] flex flex-col items-center p-6 md:p-12 relative overflow-x-hidden font-sans">

            <div className="max-w-4xl w-full flex-1 flex flex-col relative z-10 pt-12">

                {/* Header Section */}
                <div className="text-center mb-16 px-4">
                    <div className="inline-flex items-center justify-center mb-6">
                        <img src="/logo.webp" alt="AndroClean Logo" className="w-24 h-24 object-contain rounded-2xl shadow-sm bg-white p-2" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#111827] tracking-tight">
                        AndroClean
                    </h1>
                    <p className="text-[#6B7280] text-lg max-w-2xl mx-auto leading-relaxed">
                        Remove unwanted system apps safely without rooting your Android device. Secure, fast, and driven by WebUSB technology.
                    </p>

                    {error && (
                        <div className="mt-8 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-center gap-3 w-full max-w-2xl mx-auto">
                            <AlertCircle size={20} className="shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <div className="mt-10 max-w-sm mx-auto">
                        <button
                            onClick={onConnect}
                            disabled={connecting}
                            className="w-full bg-[#2F80ED] hover:bg-[#2563EB] text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {connecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Usb size={24} />
                                    Connect Android Device
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className="surface-panel p-6 flex items-start gap-4">
                        <div className="bg-green-100 text-green-600 p-3 rounded-lg"><ShieldCheck size={24} /></div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">Safe Debloating</h3>
                            <p className="text-sm text-[#6B7280]">No root required. Uses standard ADB protocol to uninstall packages locally.</p>
                        </div>
                    </div>
                    <div className="surface-panel p-6 flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Usb size={24} /></div>
                        <div>
                            <h3 className="font-bold text-[#111827] mb-1">ADB Powered</h3>
                            <p className="text-sm text-[#6B7280]">100% secure in-browser communication. Zero user data is transmitted to the cloud.</p>
                        </div>
                    </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full border-t border-gray-200 pt-12 items-stretch">

                    {/* How it Works */}
                    <div className="surface-panel p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="text-[#2F80ED]" size={24} />
                            <h2 className="text-xl font-bold text-[#111827]">How It Works</h2>
                        </div>
                        <ol className="space-y-4 text-sm text-[#4B5563]">
                            <li className="flex gap-3 items-center">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">1</span>
                                Go to Settings &gt; About Phone &gt; Tap "Build Number" 7 times to enable Developer Options.
                            </li>
                            <li className="flex gap-3 items-center">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">2</span>
                                Enable <b>USB Debugging</b> in Developer Options.
                            </li>
                            <li className="flex gap-3 items-center">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">3</span>
                                Connect your device via USB cable to this PC.
                            </li>
                            <li className="flex gap-3 items-center">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-bold text-xs">4</span>
                                Click Connect and authorize the RSA key prompt on your phone screen.
                            </li>
                        </ol>
                    </div>

                    {/* Developer Info & Safety */}
                    <div className="flex flex-col gap-6">
                        <div className="surface-panel p-8 flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="text-[#2F80ED]" size={24} />
                                <h2 className="text-xl font-bold text-[#111827]">About the Developer</h2>
                            </div>
                            <h3 className="text-lg font-bold text-[#111827]">Nithin Gowda M S</h3>
                            <p className="text-sm font-medium text-[#2F80ED] mb-3">Aspiring AIML & Data Science Professional</p>
                            <a
                                href="https://v0-portfolio-website-clone-opal.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-sm font-medium text-white bg-[#111827] hover:bg-[#374151] px-5 py-2.5 rounded-lg transition-colors"
                            >
                                View Portfolio
                            </a>
                        </div>

                        <div className="surface-panel bg-yellow-50/50 border-yellow-200 p-6">
                            <h4 className="text-yellow-800 font-bold mb-2 flex items-center gap-2">
                                <AlertCircle size={18} /> Safety Notice
                            </h4>
                            <p className="text-sm text-yellow-700 leading-relaxed">
                                Removing core system packages may severely affect device functionality or cause bootloops. Stick to apps marked "Safe to Remove" unless you are an advanced user. The developer assumes no liability.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <footer className="mt-16 w-full max-w-4xl border-t border-gray-200 pt-6 pb-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
                <p>Version 3.0.0 WebUSB Edition</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-gray-900 transition-colors">Documentation</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">GitHub</a>
                </div>
            </footer>
        </div>
    );
}
