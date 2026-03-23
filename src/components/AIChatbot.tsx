"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Bot, User, MicOff, Mail, Phone, ExternalLink, X } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  type?: "text" | "photo_childhood" | "photo_present" | "photo_family" | "projects" | "skills" | "journey" | "contact";
};

const SUGGESTIONS = [
  "Who is Aswin Dev?",
  "What are his skills?",
  "Show his projects",
  "Show family photo",
  "Show present photo",
  "Show childhood photo",
  "How to contact him?",
];

const INITIAL_BOT_MESSAGE: Message = {
  id: "init",
  sender: "bot",
  text: `👋 Welcome to Aswin Dev's Portfolio\n\nI'm JARVIS, Aswin's AI assistant. I've been trained on his entire professional journey and character.\n\nTap a suggestion or type below to explore!`,
  type: "text",
};

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          handleSend(transcript);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    const lower = text.toLowerCase();
    let botMsg: Message = { id: (Date.now() + 1).toString(), sender: "bot", text: "", type: "text" };

    // Structural responses
    if (lower.includes("who is") || lower.includes("who are you") || lower.includes("yourself")) {
      botMsg.text = "Aswin Dev V is a technology enthusiast from Kollam, Kerala, India. He was born and brought up in Kollam in a supportive family environment. His father and mother have always encouraged his learning, and he also has a younger brother.\n\nAswin completed his 10th standard at DVVHSS Thalavoor and continued his Higher Secondary (+2) at the same school. From a young age, he developed a strong curiosity about technology and how systems work.\n\nAfter school, he pursued a Bachelor of Computer Applications (BCA) at Yenepoya University, where he strengthened his knowledge in computers, programming, and modern technologies.\n\nAswin is particularly interested in IT, automation, and innovative technology solutions. He enjoys learning new technologies and building practical projects such as IoT systems and smart automation devices.\n\nHe believes in continuous learning and creative problem-solving, and his goal is to use technology to build useful products.";
    } else if (lower.includes("skills")) {
      botMsg.text = "Aswin possesses a robust stack across Frontend, Backend, and IoT:";
      botMsg.type = "skills";
    } else if (lower.includes("project")) {
      botMsg.text = "Check out these impactful projects built by Aswin Dev V:";
      botMsg.type = "projects";
    } else if (lower.includes("journey") || lower.includes("education")) {
      botMsg.text = "Here is Aswin's academic and professional journey:";
      botMsg.type = "journey";
    } else if (lower.includes("photo") && lower.includes("childhood")) {
      botMsg.text = "Here is a glimpse of Aswin from his childhood!";
      botMsg.type = "photo_childhood";
    } else if (lower.includes("photo") && (lower.includes("present") || lower.includes("now"))) {
      botMsg.text = "Here is Aswin Dev V today!";
      botMsg.type = "photo_present";
    } else if (lower.includes("father") || lower.includes("mother") || lower.includes("parents") || lower.includes("family")) {
      botMsg.text = "Aswin Dev's father is Venu pillai K and his mother is Gaythri devi V. Here is a precious family photo!";
      botMsg.type = "photo_family";
      setTimeout(() => setSelectedImage("/family-1.jpg"), 800);
    } else if (lower.includes("contact") || lower.includes("reach") || lower.includes("social")) {
      botMsg.text = "You can connect with Aswin through these platforms:";
      botMsg.type = "contact";
    } else {
      // API call
      setMessages((prev) => [...prev, { id: 'loading', sender: "bot", text: "...", type: "text" }]);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        setMessages((prev) => prev.filter(m => m.id !== 'loading'));
        botMsg.text = data.text;
      } catch (err) {
        setMessages((prev) => prev.filter(m => m.id !== 'loading'));
        botMsg.text = "I'm having trouble reaching the mainframe. Please try again later.";
      }
    }

    if (botMsg.text) setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="flex flex-col h-screen md:h-[92vh] w-full max-w-3xl mx-auto bg-white shadow-2xl md:rounded-3xl overflow-hidden relative">
      
      {/* Lightbox with EXIT/CLOSE button */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[60]"
            >
              <X size={28} />
            </button>
            <img 
              src={selectedImage} alt="Fullscreen" 
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" 
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white/60 text-xs mt-4 uppercase tracking-widest font-bold">Tap background or [X] to close</p>
            <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setSelectedImage(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Simple Header */}
      <header className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Aswin Dev V</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">JARVIS • Online</span>
          </div>
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-gray-50/30">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.sender === "bot" ? "bg-white border border-gray-100 text-indigo-600" : "bg-indigo-600 text-white"
              }`}>
                {msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}
              </div>
              
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.sender === "user" 
                ? "bg-indigo-600 text-white rounded-tr-sm" 
                : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
              }`}>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {/* Dynamic Content Rendering */}
                {msg.type === "skills" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["React.js", "JavaScript", "Python", "IoT", "FastAPI", "Docker", "Node.js"].map(s => (
                      <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">{s}</span>
                    ))}
                  </div>
                )}

                {msg.type === "projects" && (
                  <div className="mt-4 space-y-3">
                    {[
                      { title: "Movie Booking App", tech: "React, REST API" },
                      { title: "CNN Image Classify", tech: "Python, Docker" },
                      { title: "IoT Pet Feeder", tech: "Arduino, C++" }
                    ].map(p => (
                      <div key={p.title} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-sm text-gray-900">{p.title}</h4>
                        <p className="text-xs text-indigo-600">{p.tech}</p>
                      </div>
                    ))}
                  </div>
                )}

                {msg.type === "journey" && (
                  <div className="mt-4 border-l-2 border-indigo-100 ml-1 pl-4 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                      <p className="font-bold text-xs text-indigo-600 uppercase">2021</p>
                      <p className="text-sm text-gray-700">Secondary Education - DVVHSS Thalavoor</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                      <p className="font-bold text-xs text-indigo-600 uppercase">2023</p>
                      <p className="text-sm text-gray-700">Higher Secondary - DVVHSS Thalavoor</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
                      <p className="font-bold text-xs text-indigo-600 uppercase">2026</p>
                      <p className="text-sm text-gray-700 font-medium">BCA (AI, Cloud & DevOps) at Yenepoya University</p>
                    </div>
                  </div>
                )}

                {msg.type === "contact" && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a href="mailto:aswindevv2005@gmail.com" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <Mail size={14} className="text-red-500" />
                      <span className="text-xs font-medium">Email</span>
                    </a>
                    <a href="https://github.com/aswindevv2005-collab" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <ExternalLink size={14} className="text-gray-900" />
                      <span className="text-xs font-medium">GitHub</span>
                    </a>
                  </div>
                )}

                {msg.type === "photo_family" && (
                  <div className="mt-4">
                    <img onClick={() => setSelectedImage("/family-1.jpg")} src="/family-1.jpg" alt="Family" className="h-48 w-auto rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-400 transition-all" />
                  </div>
                )}

                {(msg.type === "photo_childhood" || msg.type === "photo_present") && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {msg.type === "photo_childhood" ? (
                      <>
                        <img onClick={() => setSelectedImage("/childhood-2.jpg")} src="/childhood-2.jpg" alt="Child" className="h-40 w-auto rounded-xl shadow-sm border border-gray-200 shrink-0 cursor-pointer" />
                        <img onClick={() => setSelectedImage("/childhood-3.jpg")} src="/childhood-3.jpg" alt="Child" className="h-40 w-auto rounded-xl shadow-sm border border-gray-200 shrink-0 cursor-pointer" />
                      </>
                    ) : (
                      <>
                        <img onClick={() => setSelectedImage("/present-1.jpg")} src="/present-1.jpg" alt="Present" className="h-40 w-auto rounded-xl shadow-sm border border-gray-200 shrink-0 cursor-pointer" />
                        <img onClick={() => setSelectedImage("/present-2.jpg")} src="/present-2.jpg" alt="Present" className="h-40 w-auto rounded-xl shadow-sm border border-gray-200 shrink-0 cursor-pointer" />
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </main>

      {/* Footer Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
        
        {/* Suggestion Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 mb-2 px-1">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-200 shadow-inner focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <button onClick={toggleMic} className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-500 text-white shadow-lg animate-pulse" : "text-gray-400 hover:text-indigo-600"}`}>
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputVal)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm px-2"
          />
          <button onClick={() => handleSend(inputVal)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all">
            <Send size={18} />
          </button>
        </div>
        
        <p className="text-center text-[9px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
          Powered by JARVIS AI • Aswin Dev V
        </p>
      </footer>
    </div>
  );
}
