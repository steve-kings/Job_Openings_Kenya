'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

let messageCounter = 0;
function nextId(): string {
    return `${Date.now()}-${++messageCounter}`;
}

const INITIAL_MESSAGE: Message = {
    id: nextId(),
    role: 'assistant',
    content: "Hi there! I'm the Job Openings Kenya AI Assistant. How can I help you find the latest job openings in Kenya today?"
};

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, scrollToBottom]);

    // Cleanup: abort any in-flight request on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        // Cancel any previous in-flight request
        abortRef.current?.abort();

        const userMsg = input.trim();
        setInput('');
        const userMessage: Message = { id: nextId(), role: 'user', content: userMsg };
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'chat', messages: newMessages }),
                signal: controller.signal,
            });

            const data = await res.json();

            // Aborted requests should not update state (component may be unmounted)
            if (controller.signal.aborted) return;

            if (!res.ok) {
                const errorMsg = data?.error || `Request failed with status ${res.status}`;
                setMessages([...newMessages, { id: nextId(), role: 'assistant', content: errorMsg }]);
                return;
            }

            if (data.reply) {
                setMessages([...newMessages, { id: nextId(), role: 'assistant', content: data.reply }]);
            } else {
                setMessages([...newMessages, { id: nextId(), role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
            }
        } catch (err: unknown) {
            // Silently ignore aborted requests
            if (err instanceof DOMException && err.name === 'AbortError') return;

            setMessages([...newMessages, { id: nextId(), role: 'assistant', content: 'Sorry, an error occurred while processing your request.' }]);
        } finally {
            // Only clear loading state if this controller is still the active one
            if (abortRef.current === controller) {
                setIsLoading(false);
                abortRef.current = null;
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Box — only render when open */}
            {isOpen && (
                <div className="transition-all duration-300 transform origin-bottom-right scale-100 opacity-100 mb-4">
                    <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] text-white p-4 flex items-center justify-between shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Job Openings Kenya AI Assistant</h3>
                                    <p className="text-xs text-green-100">Online and ready to help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    abortRef.current?.abort();
                                    setIsOpen(false);
                                }}
                                aria-label="Close chat"
                                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" role="log" aria-live="polite">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-[#5CB800] text-white' : 'bg-[#4A9900] text-white'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#5CB800] text-white rounded-tr-none' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none whitespace-pre-wrap'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-[#4A9900] text-white flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot size={16} />
                                    </div>
                                    <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <label htmlFor="ai-chat-input" className="sr-only">Type your message</label>
                                <input
                                    id="ai-chat-input"
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5CB800] focus:ring-1 focus:ring-[#5CB800] text-sm text-gray-700 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    aria-label="Send message"
                                    className="absolute right-2 text-[#5CB800] hover:text-[#4A9900] p-1.5 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={20} className={input.trim() && !isLoading ? 'fill-[#5CB800]/10' : ''} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-[#5CB800] to-[#4A9900] hover:shadow-2xl hover:shadow-[#5CB800]/40'}`}
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
