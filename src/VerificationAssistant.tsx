import { useState, useRef, useEffect } from 'react';
import { getStructuredGeminiModel } from './lib/gemini';
import type { StartupEcosystemNode } from './schema';

// 1. IMPORT THE BACKGROUND CSS
import './CredentialsBackground.css';

interface VerificationAssistantProps {
  initialMissingReasoning: string;
  fileOrLinkContext: string;
  onComplete: (data: StartupEcosystemNode) => void;
  fileName?: string;
  fileSize?: string;
}

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

export default function VerificationAssistant({
                                                initialMissingReasoning,
                                                fileOrLinkContext,
                                                onComplete,
                                                fileName,
                                                fileSize
                                              }: VerificationAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Hello! I'm reviewing your company credentials. I've identified some missing information that we'll need to complete your verification.\n\n${initialMissingReasoning}`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const model = getStructuredGeminiModel();
      const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n') + `\nUSER: ${userText}`;

      const prompt = `
        You are an AI Verification Assistant for an innovation ecosystem.
        We are extracting company data markers for any company type: Company Name, Company Type, Primary Industry, Operating Stage, Key Capabilities, Operational Needs, Target Markets, and Business Model.

        Original Document/Link Content:
        """
        ${fileOrLinkContext}
        """

        Chat History so far clarifying missing information:
        """
        ${historyText}
        """

        Evaluate all the provided information. If you have enough information to confidently fill out all required company data markers, set isDataSufficient to true.
        If not, set isDataSufficient to false and explain exactly what is still missing in a conversational tone in 'missingFieldsReasoning'.
      `;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const parsedData = JSON.parse(textResponse) as StartupEcosystemNode;

      if (parsedData.isDataSufficient) {
        onComplete(parsedData);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: parsedData.missingFieldsReasoning }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error while verifying your data. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
      // 2. WRAP WITH BACKGROUND CLASSES AND RELATIVE CONTAINER
      <div className="min-h-screen w-full relative overflow-x-hidden overflow-y-auto py-12">
        {/* BACKGROUND LAYER */}
        <div className="credentials-bg-container">
          <div className="bg-pattern" />
        </div>

        {/* FOREGROUND CONTENT */}
        <div className="relative z-10">
          <div className="flex h-[80vh] w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Left Panel - Document Preview */}
            <div className="w-1/2 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="font-semibold text-slate-700">Document Preview</span>
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center">
                <div className="w-20 h-24 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3B4569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <p className="font-medium text-slate-700">{fileName || 'Attached Document'}</p>
                {fileSize && <p className="text-slate-400 text-sm mt-1">{fileSize}</p>}
              </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className="w-1/2 flex flex-col bg-slate-50/30">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3B4569] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                      <line x1="8" y1="16" x2="8" y2="16"></line>
                      <line x1="16" y1="16" x2="16" y2="16"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">AI Verification Assistant</h3>
                    <p className="text-emerald-500 text-xs flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-500 text-xs font-medium">
                  Screen 2: AI Verification
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                          className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                              msg.role === 'user'
                                  ? 'bg-slate-100 text-slate-800 rounded-br-sm'
                                  : 'bg-[#3B4569] text-white rounded-bl-sm shadow-md'
                          }`}
                          style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {msg.text}
                      </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[#3B4569] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-16 h-10">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 relative">
                  <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your response here..."
                      disabled={isTyping}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-[#3B4569] focus:ring-1 focus:ring-[#3B4569] transition-all disabled:opacity-50"
                  />
                  <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[#3B4569] text-white disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-[#2D3552] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-0.5">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}