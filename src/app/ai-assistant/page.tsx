'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! I am the CivicAI Assistant. I can help you find government exams, schemes, and scholarships you are eligible for. What would you like to know today?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'This is a simulated premium response. I am analyzing your query against official government sources.'
      }]);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">CivicAI Assistant</h1>
        <p className="text-foreground-muted max-w-2xl mx-auto">Your personalized, intelligent guide to discovering government opportunities. Ask me anything.</p>
      </div>

      <div className="max-w-4xl mx-auto w-full h-[calc(100vh-18rem)] min-h-[500px] relative">
        {/* Animated Glowing Border Background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur opacity-25 animate-pulse"></div>
        
        {/* Main Chat Container */}
        <div className="relative h-full bg-card rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-border flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between relative overflow-hidden">
             <div className="absolute right-0 top-0 opacity-10">
                <Sparkles className="h-32 w-32 -mt-10 -mr-10" />
              </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center shadow-inner border border-white/20">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">CivicAI</h2>
                <p className="text-white/80 text-xs flex items-center gap-1.5 font-medium mt-0.5">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span> Verifying against official sources
                </p>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 p-2.5 text-xs font-semibold text-amber-700 text-center flex items-center justify-center gap-2 border-b border-amber-100">
            <ShieldAlert className="h-4 w-4" />
            Verify all AI-generated dates and links on official government portals before applying.
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                  msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-primary to-secondary text-white'
                }`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white border border-border rounded-tr-sm text-foreground' 
                    : 'bg-primary/5 border border-primary/10 rounded-tl-sm text-foreground'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border">
            {messages.length === 1 && (
               <div className="flex flex-wrap gap-2 mb-4 justify-center">
                 {['Check my eligibility for SSC CGL', 'State scholarships in UP', 'Documents for Passport'].map((prompt, i) => (
                   <button 
                     key={i}
                     onClick={() => setInput(prompt)}
                     className="text-xs font-medium bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                   >
                     {prompt} <ChevronRight className="h-3 w-3" />
                   </button>
                 ))}
               </div>
            )}
            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything... e.g. Which government jobs am I eligible for?"
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-6 py-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all text-base"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl px-8 flex items-center justify-center shadow-md transition-all font-semibold gap-2"
              >
                Send <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
