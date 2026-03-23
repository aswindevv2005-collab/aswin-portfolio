"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Bot, User, MicOff, X, Mail, Phone, MessageCircle, ExternalLink } from "lucide-react";

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
  "Tell me about his journey",
  "How to contact him?",
];

const INITIAL_BOT_MESSAGE: Message = {
  id: "init",
  sender: "bot",
  text: `👋 Welcome to Aswin Dev's Portfolio\n\nI'm JARVIS, Aswin's AI assistant. This entire portfolio is a conversation — just ask me anything!\n\n💬 Type a message or tap a suggestion below to get started!`,
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

    const TIMEZONE_MAP: Record<string, string> = {
      "india": "Asia/Kolkata", "usa": "America/New_York", "uk": "Europe/London", "london": "Europe/London",
      "dubai": "Asia/Dubai", "uae": "Asia/Dubai", "japan": "Asia/Tokyo", "tokyo": "Asia/Tokyo",
      "australia": "Australia/Sydney", "singapore": "Asia/Singapore", "canada": "America/Toronto",
      "germany": "Europe/Berlin", "france": "Europe/Paris", "china": "Asia/Shanghai",
      "kerala": "Asia/Kolkata", "kollam": "Asia/Kolkata",
    };
    const timeMatch = lower.match(/(?:what is the |current )?time in ([a-z\s]+)\??/);
    
    if (lower === "time" || lower === "what is the time") {
      botMsg.text = "The current local time is " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ".";
    } else if (timeMatch && timeMatch[1] && TIMEZONE_MAP[timeMatch[1].trim()]) {
      const loc = timeMatch[1].trim();
      const timeStr = new Date().toLocaleTimeString('en-US', { timeZone: TIMEZONE_MAP[loc], hour: '2-digit', minute: '2-digit', hour12: true });
      botMsg.text = `The current time in ${loc.charAt(0).toUpperCase() + loc.slice(1)} is ${timeStr}.`;
    } else if (lower.includes("marriage") || lower.includes("relationship") || lower.includes("status") || lower.includes("girlfriend") || lower.includes("committed")) {
      botMsg.text = "Aswin Dev V is currently committed in a relationship, but he respectfully keeps his partner's identity private.";
    } else if (lower.includes("father") || lower.includes("mother") || lower.includes("parents") || lower.includes("family")) {
      botMsg.text = "Aswin Dev's father is Venu pillai K and his mother is Gaythri devi V. He also has a younger brother. Here is their family photo!";
      botMsg.type = "photo_family";
      setTimeout(() => setSelectedImage("/family-1.jpg"), 800);
    } else if (lower.includes("born") || lower.includes("birth") || lower.includes("age") || lower.includes("dob")) {
      const birthDate = new Date(2005, 3, 10); // April 10, 2005
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      botMsg.text = `Aswin Dev V was born on 10/04/2005. He is currently ${age} years old.`;
    } else if (lower.includes("who is") || lower.includes("who are you") || lower.includes("yourself")) {
      botMsg.text = "Aswin Dev V is a technology enthusiast from Kollam, Kerala, India. He was born and brought up in Kollam in a supportive family environment. His father and mother have always encouraged his learning, and he also has a younger brother.\n\nAswin completed his 10th standard at DVVHSS Thalavoor and continued his Higher Secondary (+2) at the same school. From a young age, he developed a strong curiosity about technology and how systems work.\n\nAfter school, he pursued a Bachelor of Computer Applications (BCA) at Yenepoya University, where he strengthened his knowledge in computers, programming, and modern technologies.\n\nAswin is particularly interested in IT, automation, and innovative technology solutions. He enjoys learning new technologies and building practical projects such as IoT systems and smart automation devices.\n\nHe believes in continuous learning and creative problem-solving, and his goal is to use technology to build useful products.";
    } else if (lower.includes("skills")) {
      botMsg.text = "Aswin possesses a robust stack across Frontend, Backend, and IoT. Here are his top technical skills:";
      botMsg.type = "skills";
    } else if (lower.includes("projects")) {
      botMsg.text = "Aswin has built several fascinating full-stack and IoT projects. Here are the highlights:";
      botMsg.type = "projects";
    } else if (lower.includes("childhood photo")) {
      botMsg.text = "Here is a glimpse of Aswin from his childhood days!";
      botMsg.type = "photo_childhood";
    } else if (lower.includes("present photo")) {
      botMsg.text = "Here is Aswin Dev V, present day.";
      botMsg.type = "photo_present";
    } else if (lower.includes("journey") || lower.includes("education")) {
      botMsg.text = "Aswin's academic journey and accomplishments:";
      botMsg.type = "journey";
    } else if (lower.includes("contact") || lower.includes("reach") || lower.includes("social")) {
      botMsg.text = "Here is Aswin Dev's direct contact information. Feel free to reach out!";
      botMsg.type = "contact";
    } else {
      setMessages((prev) => [...prev, { id: 'loading', sender: "bot", text: "Processing your request...", type: "text" }]);
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
        botMsg.text = "[SYSTEM ERROR] Network offline or JARVIS AI is unavailable.";
      }
    }

    if (botMsg.text) setMessages((prev) => [...prev, botMsg]);
  };

  const renderMessageContent = (msg: Message) => {
    return (
      <div className="flex flex-col">
        {msg.text && <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>}
        
        {msg.type === "photo_childhood" && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["/childhood-1.png", "/childhood-2.jpg", "/childhood-3.jpg"].map(src => (
              <img key={src} onClick={() => setSelectedImage(src)} src={src} alt="Childhood" className="h-40 w-auto rounded-lg border-2 border-cyan-500/50 shrink-0 cursor-pointer hover:border-cyan-400" />
            ))}
          </div>
        )}

        {msg.type === "photo_family" && (
          <div className="mt-3">
            <img onClick={() => setSelectedImage("/family-1.jpg")} src="/family-1.jpg" alt="Family" className="w-64 h-auto rounded-lg border-2 border-cyan-500/50 cursor-pointer" />
          </div>
        )}

        {msg.type === "photo_present" && (
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["/present-1.jpg", "/present-2.jpg", "/present-3.png"].map(src => (
              <img key={src} onClick={() => setSelectedImage(src)} src={src} alt="Present" className="h-48 w-auto rounded-lg border-2 border-cyan-500/50 shrink-0 cursor-pointer hover:border-cyan-400" />
            ))}
          </div>
        )}

        {msg.type === "skills" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {["React.js", "FastAPI", "Python", "C", "Docker", "IoT", "JavaScript", "HTML/CSS", "Node.js", "Java", "Arduino", "Bootstrap"].map(s => (
              <span key={s} className="px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full text-cyan-300 text-sm shadow-[0_0_8px_rgba(6,182,212,0.2)]">{s}</span>
            ))}
          </div>
        )}

        {msg.type === "projects" && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <h4 className="font-bold text-cyan-400 mb-1">Movie Booking Web App</h4>
              <p className="text-xs text-gray-300 mb-1">React • JS • HTML • CSS • REST API</p>
              <p className="text-sm text-gray-400">Full-stack platform with dynamic UI for seat selection and real-time availability.</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <h4 className="font-bold text-cyan-400 mb-1">CNN Image Classification</h4>
              <p className="text-xs text-gray-300 mb-1">Python • FastAPI • Docker • Deep Learning</p>
              <p className="text-sm text-gray-400">Deployed a CNN model trained on CIFAR-10 via real-time REST API.</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <h4 className="font-bold text-cyan-400 mb-1">Automatic Pet Feeder</h4>
              <p className="text-xs text-gray-300 mb-1">Arduino • Embedded C • IoT</p>
              <p className="text-sm text-gray-400">Built using Arduino Uno, RTC, Servo motors for accurate food schedules.</p>
            </div>
          </div>
        )}

        {msg.type === "journey" && (
          <div className="mt-4 border-l-2 border-cyan-500/50 ml-1 pl-4 space-y-4">
            <div><p className="text-xs text-cyan-500 font-bold">2021</p><p className="text-sm text-gray-200">Secondary Education - DVVHSS Thalavoor</p></div>
            <div><p className="text-xs text-cyan-500 font-bold">2023</p><p className="text-sm text-gray-200">Higher Secondary - DVVHSS Thalavoor</p></div>
            <div><p className="text-xs text-cyan-500 font-bold">2026</p><p className="text-sm text-gray-200">Pursuing BCA (AI, Cloud & DevOps) at Yenepoya University</p></div>
          </div>
        )}

        {msg.type === "contact" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="mailto:aswindevv2005@gmail.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900/60 transition-all"><Mail size={16} /> Email</a>
            <a href="https://wa.me/918089595332" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-green-400 hover:bg-cyan-900/60 transition-all"><MessageCircle size={16} /> WhatsApp</a>
            <a href="https://www.instagram.com/aaaswinhh__?utm_source=qr&igsh=MWV3OHZnZWMybGZsdg==" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-pink-400 hover:bg-cyan-900/60 transition-all"><ExternalLink size={16} /> Instagram</a>
            <a href="https://github.com/aswindevv2005-collab" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-white hover:bg-cyan-900/60 transition-all"><ExternalLink size={16} /> GitHub</a>
            <a href="https://www.linkedin.com/in/aswindevv" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-blue-400 hover:bg-cyan-900/60 transition-all"><ExternalLink size={16} /> LinkedIn</a>
            <a href="tel:+918089595332" className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900/60 transition-all"><Phone size={16} /> Phone</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[94dvh] md:h-[88vh] w-full max-w-4xl mx-auto md:rounded-3xl overflow-hidden relative z-10 p-2 md:p-6">
      
      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[110]"><X size={28} /></button>
            <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
            <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setSelectedImage(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center gap-3 mb-4 md:mb-6 px-2">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Bot className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-wider text-white">Aswin Dev V</h1>
          <p className="text-[10px] md:text-xs text-cyan-500/80 font-mono tracking-widest uppercase">JARVIS Online • AI Assistant</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-hide space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex w-full items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "bot" ? "bg-cyan-950/80 border border-cyan-500/30 text-cyan-400" : "bg-indigo-600 border border-indigo-400 text-white"}`}>
                {msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender === "user" ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tr-sm" : "bg-white/5 backdrop-blur-md border border-white/10 text-gray-200 rounded-tl-sm shadow-xl"}`}>
                {renderMessageContent(msg)}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </main>

      <footer className="mt-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 py-2 bg-cyan-950/40 border border-cyan-500/30 rounded-full text-xs text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all shadow-lg">{s}</button>
          ))}
        </div>

        <div className="relative flex items-center bg-gray-950/80 backdrop-blur-xl border border-cyan-500/30 rounded-full p-2">
          <button onClick={toggleMic} className={`p-3 mx-2 rounded-full transition-colors ${isListening ? "bg-red-500 text-white shadow-lg animate-pulse" : "text-gray-400 hover:text-cyan-400"}`}><MicOff size={20} /></button>
          <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend(inputVal)} placeholder="Ask JARVIS about Aswin..." className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 px-2" />
          <button onClick={() => handleSend(inputVal)} className="p-3 mx-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"><Send size={18} /></button>
        </div>
        <p className="text-center text-[9px] text-gray-600 mt-4 uppercase tracking-widest font-bold">Powered by JARVIS AI • Aswin Dev V</p>
      </footer>
    </div>
  );
}
