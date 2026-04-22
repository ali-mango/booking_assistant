import { useState, useRef, useEffect } from "react";
import {
  sendMessage,
  getConversations,
  getMessages,
} from "./services/api";
import type { Message } from "./types";

// ============================================
// CHAT WIDGET COMPONENT
// ============================================
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(trimmed, conversationId);
      if (!conversationId) setConversationId(response.conversation_id);

      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => {
      handleSendDirect(text);
    }, 100);
  };

  const handleSendDirect = async (text: string) => {
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage(text, conversationId);
      if (!conversationId) setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-gray-700 rotate-0"
            : "bg-gradient-to-br from-teal-500 to-emerald-500 shadow-teal-300/40"
        }`}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Notification dot */}
      {!isOpen && messages.length === 0 && (
        <div className="fixed bottom-[74px] right-6 z-50 bg-white rounded-xl shadow-lg px-4 py-2.5 text-sm text-gray-700 animate-bounce max-w-[220px]">
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-white rotate-45 shadow-lg" />
          Hi! Need to book an appointment? 😊
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[15px]">SmileCare Assistant</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                  Online — replies instantly
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Welcome to SmileCare!</p>
                <p className="text-xs text-gray-400 mb-5">How can I help you today?</p>
                <div className="flex flex-col gap-2">
                  {[
                    "📋 View services & prices",
                    "📅 Book an appointment",
                    "❌ Cancel my booking",
                  ].map((text) => (
                    <button
                      key={text}
                      onClick={() => handleQuickReply(text.replace(/^..\s/, ""))}
                      className="text-left px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-md text-[13px]"
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-md shadow-sm text-[13px]"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-40 transition-all hover:shadow-md active:scale-95 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-400 mt-1.5">
              Powered by SmileCare AI
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

// ============================================
// LANDING PAGE
// ============================================
export default function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">SmileCare</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#services" className="hover:text-teal-600 transition-colors">Services</a>
            <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-teal-600 transition-colors">Contact</a>
            <button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm">
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Now accepting online bookings
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
              Your smile deserves the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">
                best care
              </span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-lg">
              Book your dental appointment in seconds using our AI assistant. Available 24/7, in English and Filipino.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-7 py-3 rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md shadow-teal-200/50 hover:shadow-lg">
                Book Appointment
              </button>
              <a href="#services" className="px-7 py-3 rounded-xl font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                View Services
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                500+ Patients
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                4.9 Rating
              </div>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                10+ Years
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center overflow-hidden">
              <div className="text-center p-10">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-200/50">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">AI-Powered</p>
                <p className="text-gray-500">Book appointments through natural conversation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 bg-gray-50/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500 max-w-md mx-auto">Professional dental care with transparent pricing. Book any service through our AI assistant.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Dental Checkup", price: "₱300", duration: "20 min", desc: "Basic examination and consultation", icon: "🔍" },
              { name: "Teeth Cleaning", price: "₱500", duration: "30 min", desc: "Professional cleaning and polishing", icon: "✨" },
              { name: "Tooth Extraction", price: "₱1,500", duration: "45 min", desc: "Simple tooth extraction procedure", icon: "🦷" },
              { name: "Filling & Restoration", price: "₱1,000", duration: "45 min", desc: "Dental filling and restoration", icon: "🔧" },
              { name: "Teeth Whitening", price: "₱3,000", duration: "60 min", desc: "Professional whitening treatment", icon: "💎" },
              { name: "Consultation", price: "Free", duration: "15 min", desc: "Talk to our dentist about your needs", icon: "💬" },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all group"
              >
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{service.desc}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-teal-600">{service.price}</span>
                    <span className="text-xs text-gray-400 ml-2">{service.duration}</span>
                  </div>
                  <button className="text-xs font-medium text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Book your appointment in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Start a Chat", desc: "Click the chat bubble and tell us what you need — in English or Filipino." },
              { step: "2", title: "Pick a Time", desc: "Our AI checks real-time availability and shows you open slots." },
              { step: "3", title: "Confirm Booking", desc: "Provide your name and number. Done! You'll see it on your calendar." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-md shadow-teal-200/40">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Contact */}
      <section id="about" className="py-20 px-6 bg-gray-50/80">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About SmileCare</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              SmileCare Dental Clinic has been providing quality dental care in Makati City for over 10 years. Our team of experienced dentists is committed to making every visit comfortable and stress-free.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We're proud to offer AI-powered booking — making it easier than ever to schedule your visit. Just chat with our assistant anytime, day or night.
            </p>
          </div>
          <div id="contact">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Us</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Address</p>
                  <p className="text-sm text-gray-500">123 Main Street, Makati City</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Phone</p>
                  <p className="text-sm text-gray-500">0917-123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Hours</p>
                  <p className="text-sm text-gray-500">Mon-Sat: 9:00 AM - 5:00 PM</p>
                  <p className="text-sm text-gray-400">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">SmileCare Dental Clinic</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 SmileCare. All rights reserved. Powered by AI Booking Assistant.</p>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}