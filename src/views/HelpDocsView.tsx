import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, LifeBuoy } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'bot' | 'user';
    text: string;
}

export function HelpDocsView() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'bot',
            text: "Hi there! I'm your Debloat Assistant. How can I help you today? \n\nI can answer questions about:\n• Device Connection Issues\n• Safe vs. Unsafe Packages\n• How to Restore Apps\n• Bootloops & Recovery"
        }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate bot typing delay
        setTimeout(() => {
            const response = generateBotResponse(userMsg.text);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', text: response }]);
        }, 600);
    };

    const generateBotResponse = (query: string): string => {
        const lower = query.toLowerCase();

        if (lower.includes('connect') || lower.includes('not detected') || lower.includes('usb')) {
            return "If your device isn't connecting:\n1. Ensure 'USB Debugging' is enabled in Developer Options.\n2. Try changing the USB connection mode to 'File Transfer' (MTP) or 'PTP'.\n3. Check if your browser supports WebUSB (Chrome/Edge are recommended).\n4. Try a different USB port or cable.";
        }

        if (lower.includes('safe') || lower.includes('remove') || lower.includes('debloat')) {
            return "Our 'App Packages' tab automatically highlights known manufacturer bloatware and indicates if it's 'Safe' to remove. Try using the 'Recommended Debloat' presets for a hassle-free, tested removal process. Always be careful removing core system components like 'System UI'.";
        }

        if (lower.includes('restore') || lower.includes('backup') || lower.includes('bring back')) {
            return "If you want to reinstall an app you removed via this tool, you can often bring it back by running the adb command `cmd package install-existing <package_name>` via a terminal, or by factory resetting your device if critical services are broken. We highly recommend using the 'Backup Packages' feature before making sweeping changes.";
        }

        if (lower.includes('bootloop') || lower.includes('brick') || lower.includes('crash')) {
            return "Bootloops usually occur when a highly critical system package is removed. Unfortunately, the only way to recover from a severe bootloop is usually to enter your device's Recovery Mode (by holding Power + Volume Up/Down while booting) and performing a Factory Reset. This will wipe data, which is why caution is advised.";
        }

        return "I'm a simple support bot! While I might not understand everything, I'm here to help with connection troubleshooting, safe package selection, and general Android Debloating workflows. Could you clarify your question?";
    };

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] p-2.5 rounded-lg">
                    <LifeBuoy size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-brand-secondary)]">Help & Support Bot</h2>
                    <p className="text-[var(--color-brand-muted)] text-sm">Automated assistant to troubleshoot common issues.</p>
                </div>
            </div>

            <div className="surface-panel flex-1 flex flex-col overflow-hidden">
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-brand-background)]">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] text-[var(--color-brand-primary)]'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl whitespace-pre-wrap text-sm ${msg.role === 'user'
                                        ? 'bg-[var(--color-brand-primary)] text-white rounded-tr-none'
                                        : 'bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] text-[var(--color-brand-secondary)] rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[var(--color-brand-surface)] border-t border-[var(--color-brand-border)]">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your issue here (e.g. 'device not connecting')..."
                            className="flex-1 bg-[var(--color-brand-background)] border border-[var(--color-brand-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] text-[var(--color-brand-secondary)]"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="btn-primary w-12 h-10 flex items-center justify-center p-0 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
