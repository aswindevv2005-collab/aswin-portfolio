"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Bot, User, MicOff } from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  type?: "text" | "photo_childhood" | "photo_present" | "projects" | "skills" | "journey";
};

const SUGGESTIONS = [
  "Who is Aswin Dev?",
  "What are his skills?",
  "Show his projects",
  "Show present photo",
  "Show childhood photo",
  "Tell me about his journey",
  "What are his future goals?",
  "How to contact him?",
];

const INITIAL_BOT_MESSAGE: Message = {
  id: "init",
  sender: "bot",
  text: `👋 Welcome to Aswin Dev's Portfolio\n\nI'm JARVIS, Aswin's AI assistant. This entire portfolio is a conversation — just ask me anything!\n\nHere are some things you can ask:\n"Who is Aswin Dev?" — Learn about him\n"What are his skills?" — See his expertise\n"Show his projects" — Explore what he's built\n"Show present photo" or "Show childhood photo" — See his photos\n"Tell me about his journey" — His timeline from childhood to now\n"How to contact him?" — Reach out and say hi!\n\n💬 Type a message or tap a suggestion below to get started!`,
  type: "text",
};

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [inputVal, setInputVal] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Initialize Speech Recognition
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
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          // Auto send after hearing
          handleSend(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Microphone not supported in this browser.");
      }
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: "user", text, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    const lower = text.toLowerCase();
    
    // Hardcoded structural responses (UI commands)
    let botMsg: Message = { id: (Date.now() + 1).toString(), sender: "bot", text: "", type: "text" };

    const TIMEZONE_MAP: Record<string, string> = {
      "india": "Asia/Kolkata", "usa": "America/New_York", "new york": "America/New_York",
      "california": "America/Los_Angeles", "uk": "Europe/London", "london": "Europe/London",
      "dubai": "Asia/Dubai", "uae": "Asia/Dubai", "tokyo": "Asia/Tokyo", "japan": "Asia/Tokyo",
      "australia": "Australia/Sydney", "sydney": "Australia/Sydney", "germany": "Europe/Berlin",
      "france": "Europe/Paris", "paris": "Europe/Paris", "canada": "America/Toronto",
      "singapore": "Asia/Singapore", "china": "Asia/Shanghai", "brazil": "America/Sao_Paulo",
    };

    const timeMatch = lower.match(/(?:what is the |current )?time in ([a-z\s]+)\??/);
    let matchedTimezone: string | null = null;
    let locationName = "";

    if (timeMatch && timeMatch[1]) {
      const queryLoc = timeMatch[1].trim();
      if (TIMEZONE_MAP[queryLoc]) {
        matchedTimezone = TIMEZONE_MAP[queryLoc];
        locationName = queryLoc;
      }
    }

    if (lower === "time" || lower === "what is the time" || lower === "what is the current time") {
      botMsg.text = "The current local time is " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ".";
    } else if (matchedTimezone) {
      try {
        const timeStr = new Date().toLocaleTimeString('en-US', { timeZone: matchedTimezone, hour: '2-digit', minute: '2-digit', hour12: true });
        botMsg.text = `The current time in ${locationName.charAt(0).toUpperCase() + locationName.slice(1)} is ${timeStr}.`;
      } catch (e) {
        // Fallback
      }
    } else if (lower.includes("father") && lower.includes("mother")) {
      botMsg.text = "Aswin Dev's father name is Venu pillai K and his mother name is Gaythri devi V. Here is a precious family photo!";
      botMsg.type = "photo_family" as any;
      setTimeout(() => setSelectedImage("/family-1.jpg"), 700);
    } else if (lower.includes("father")) {
      botMsg.text = "Aswin Dev's father name is Venu pillai K.";
      botMsg.type = "photo_family" as any;
      setTimeout(() => setSelectedImage("/family-1.jpg"), 700);
    } else if (lower.includes("mother")) {
      botMsg.text = "Aswin Dev's mother name is Gaythri devi V.";
      botMsg.type = "photo_family" as any;
      setTimeout(() => setSelectedImage("/family-1.jpg"), 700);
    } else if (lower.includes("parents") || lower.includes("family")) {
      botMsg.text = "Aswin Dev's father is Venu pillai K and his mother is Gaythri devi V. Here is their family photo!";
      botMsg.type = "photo_family" as any;
      setTimeout(() => setSelectedImage("/family-1.jpg"), 700);
    } else if (lower.includes("born") || lower.includes("birth") || lower.includes("age") || lower.includes("dob")) {
      const birthDate = new Date(2005, 3, 10); // April 10, 2005
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
      botMsg.text = `Aswin Dev V is ${age} years old. He was born on 10/04/2005.`;
    } else if (lower.includes("contact") || lower.includes("email") || lower.includes("phone") || lower.includes("number") || lower.includes("linkedin") || lower.includes("github") || lower.includes("instagram") || lower.includes("whatsapp") || lower.includes("social")) {
      botMsg.text = "Here is Aswin Dev's direct contact information. Feel free to reach out!";
      botMsg.type = "contact" as any;
    } else if (lower.includes("marriage") || lower.includes("relationship") || lower.includes("girlfriend") || lower.includes("dating") || lower.includes("committed") || lower.includes("single") || lower.includes("married")) {
      botMsg.text = "Aswin Dev V is currently committed in a relationship, but he respectfully keeps his partner's identity private.";
    } else if (lower.includes("kollam") || lower.includes("where is") || lower.includes("from")) {
      botMsg.text = "Aswin Dev V is from Kollam, Kerala, India. He was born and brought up in Kollam and takes great pride in his roots there!";
    } else if (lower.includes("who is") || lower.includes("who are you") || lower.includes("tell me about") || lower.includes("yourself") || lower.includes("biography") || lower.includes("profile")) {
      botMsg.text = "Aswin Dev V is a technology enthusiast from Kollam, Kerala, India. He was born and brought up in Kollam in a supportive family environment. His father (Venu pillai K) and mother (Gaythri devi V) have always encouraged his learning, and he also has a younger brother.\n\nAswin completed his 10th standard and Higher Secondary (+2) at Devi Vilasom Vocational Higher Secondary School, Thalavoor. Since childhood, he has had a strong curiosity about technology and how systems work.\n\nHe holds a BCA in AI, Cloud Computing & DevOps from Yenepoya University. Aswin is deeply interested in IT, automation, and IoT solutions, building practical projects like his IoT pet feeder and smart devices.";
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
    } else if (lower.includes("future goals")) {
      botMsg.text = "Aswin's goal is to develop scalable web solutions, master modern frontend technologies, and continuously innovate at the intersection of web development, AI, and IoT.";
    } else if (lower.includes("certif")) {
      botMsg.text = "Aswin is certified in the National Cadet Corps (NCC) and National Service Scheme (NSS), demonstrating leadership, discipline, and community teamwork.";
    } else if (lower.includes("hello") || lower.includes("hi ") || lower === "hi" || lower.includes("hlo")) {
      botMsg.text = "Hello! I am JARVIS, Aswin's AI Assistant. How can I help you explore his resume and portfolio today?";
    } else {
      // Send to proper AI if not a structual UI command
      setMessages((prev) => [...prev, { id: 'loading', sender: "bot", text: "Processing your request...", type: "text" }]);
      
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text })
        });
        
        const data = await res.json();
        
        // Remove loading
        setMessages((prev) => prev.filter(m => m.id !== 'loading'));

        if (!res.ok) {
          botMsg.text = `[SYSTEM ERROR] ${data.error || "Failed to reach AI Core."}`;
          botMsg.type = "text";
        } else {
          botMsg.text = data.text;
          botMsg.type = "text";
        }
      } catch (err) {
        setMessages((prev) => prev.filter(m => m.id !== 'loading'));
        botMsg.text = "[SYSTEM ERROR] Network offline or JARVIS AI is unavailable.";
        botMsg.type = "text";
      }
    }

    if (botMsg.text !== "") {
      setMessages((prev) => [...prev, botMsg]);
    }
  };

  const renderMessageContent = (msg: Message | { type: string, [key: string]: any }) => {
    return (
      <div className="flex flex-col">
        {msg.text && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>
        )}
        
        {msg.type === "photo_childhood" && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <img onClick={() => setSelectedImage("/childhood-2.jpg")} src="/childhood-2.jpg" alt="Childhood 1" className="cursor-pointer hover:border-cyan-400 transition-colors h-48 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
            <img onClick={() => setSelectedImage("/childhood-3.jpg")} src="/childhood-3.jpg" alt="Childhood 2" className="cursor-pointer hover:border-cyan-400 transition-colors h-48 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
            <img onClick={() => setSelectedImage("/childhood-1.png")} src="/childhood-1.png" alt="Childhood 3" className="cursor-pointer hover:border-cyan-400 transition-colors h-48 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
          </div>
        )}

        {msg.type === "photo_family" && (
          <div className="mt-3">
            <img onClick={() => setSelectedImage("/family-1.jpg")} src="/family-1.jpg" alt="Family" className="cursor-pointer hover:border-cyan-400 transition-colors w-64 h-auto rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
          </div>
        )}

        {msg.type === "photo_present" && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <img onClick={() => setSelectedImage("/present-1.jpg")} src="/present-1.jpg" alt="Present 1" className="cursor-pointer hover:border-cyan-400 transition-colors h-64 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
            <img onClick={() => setSelectedImage("/present-2.jpg")} src="/present-2.jpg" alt="Present 2" className="cursor-pointer hover:border-cyan-400 transition-colors h-64 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
            <img onClick={() => setSelectedImage("/present-3.png")} src="/present-3.png" alt="Present 3" className="cursor-pointer hover:border-cyan-400 transition-colors h-64 w-auto object-cover rounded-lg border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0" />
          </div>
        )}

        {msg.type === "projects" && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <h4 className="font-bold text-cyan-400 mb-2">Movie Booking Application</h4>
              <p className="text-xs text-gray-300 mb-1">React • JS • HTML • CSS • REST API</p>
              <p className="text-sm text-gray-400">Full-stack platform with dynamic UI for seat selection and real-time availability via API.</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <h4 className="font-bold text-cyan-400 mb-2">Image Classification using CNN</h4>
              <p className="text-xs text-gray-300 mb-1">Python • FastAPI • Docker • Deep Learning</p>
              <p className="text-sm text-gray-400">Deployed a CNN model trained on CIFAR-10 resolving inference via real-time REST API.</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <h4 className="font-bold text-cyan-400 mb-2">Automatic Pet Feeder</h4>
              <p className="text-xs text-gray-300 mb-1">Arduino • Embedded C • IoT</p>
              <p className="text-sm text-gray-400">Built using Arduino Uno, RTC, Servo motors, and Keypad for accurate time-based food schedules.</p>
            </div>
          </div>
        )}

        {msg.type === "skills" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {["React.js", "JavaScript", "HTML/CSS", "Bootstrap", "Node.js", "REST APIs", "FastAPI", "Python", "Java", "C", "Docker", "Git/GitHub", "Power BI", "Arduino/IoT"].map(s => (
              <span key={s} className="px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full text-cyan-300 text-sm shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                {s}
              </span>
            ))}
          </div>
        )}

        {msg.type === "contact" && (
          <div className="mt-4 flex flex-col gap-3 glass-card p-5 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-950/40">
            <h3 className="text-lg font-bold text-white tracking-wider flex items-center gap-2 mb-2">Connect with Aswin</h3>
            <a href="mailto:aswindevv2005@gmail.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]">📧</div>
              <span className="text-sm">aswindevv2005@gmail.com</span>
            </a>
            <a href="tel:+918089595332" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]">📞</div>
              <span className="text-sm">+91 8089595332</span>
            </a>
            <a href="https://wa.me/918089595332" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center group-hover:bg-green-500/20 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.5)]">💬</div>
              <span className="text-sm">WhatsApp</span>
            </a>
            <a href="https://www.linkedin.com/in/aswindevv/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]">💼</div>
              <span className="text-sm">linkedin.com/in/aswindevv</span>
            </a>
            <a href="https://github.com/aswindevv2005-collab" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center group-hover:bg-gray-500/30 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">💻</div>
              <span className="text-sm">GitHub</span>
            </a>
            <a href="https://www.instagram.com/aaaswinhh__?utm_source=qr&igsh=MWV3OHZnZWMybGZsdg==" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-300 hover:text-pink-400 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-pink-900/50 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:shadow-[0_0_10px_rgba(236,72,153,0.5)]">📸</div>
              <span className="text-sm">Instagram</span>
            </a>
          </div>
        )}

        {msg.type === "journey" && (
          <div className="mt-3 border-l-2 border-cyan-500/50 ml-2 pl-4 flex flex-col gap-5">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]"></div>
              <p className="text-xs text-cyan-500 font-bold">2021</p>
              <p className="text-sm text-gray-200">Secondary Education - Devi Vilasom Vocational Higher Secondary School, Thalavoor</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]"></div>
              <p className="text-xs text-cyan-500 font-bold">2023</p>
              <p className="text-sm text-gray-200">Higher Secondary Education - Devi Vilasom Vocational Higher Secondary School, Thalavoor</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]"></div>
              <p className="text-xs text-cyan-500 font-bold">2026</p>
              <p className="text-sm text-gray-200">BCA (AI, Cloud Computing & DevOps) at Yenepoya University</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl 2xl:max-w-6xl mx-auto flex flex-col h-[90dvh] md:h-[85vh] relative z-10 pt-4 md:pt-10 px-4 sm:px-6 md:px-0">
      
      {/* Photo Lightbox / Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={selectedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-full object-contain rounded-lg border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mb-4 md:mb-6 mt-4 md:mt-0"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Bot className="text-cyan-400 w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-wider text-white">Aswin Dev V</h1>
          <p className="text-[10px] md:text-xs text-cyan-500/80 font-mono tracking-widest">AI-Powered Portfolio • Ask me anything</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          <span className="text-[10px] md:text-xs text-cyan-400 font-mono hidden sm:inline-block">JARVIS Online</span>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 pr-2 scrollbar-hide flex flex-col gap-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Bot size={16} className="text-cyan-400" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === "user" 
                  ? "bg-cyan-600/20 border border-cyan-500/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-tr-sm" 
                  : "bg-white/5 backdrop-blur-md border border-white/10 text-gray-200 rounded-tl-sm shadow-xl"
                }`}
              >
                {renderMessageContent(msg)}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                  <User size={16} className="text-indigo-400" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Suggestion Chips */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 mb-4 justify-center"
      >
        {SUGGESTIONS.map(sugg => (
          <button 
            key={sugg} 
            onClick={() => handleSend(sugg)}
            className="px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition-all neon-hover"
          >
            {sugg}
          </button>
        ))}
      </motion.div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-50"></div>
        <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full p-2 py-3 shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all">
          <button 
            onClick={toggleMic}
            className={`p-3 mx-2 rounded-full transition-colors flex items-center justify-center ${
              isListening ? "text-red-400 bg-red-500/20 animate-pulse shadow-[0_0_15px_rgba(248,113,113,0.5)]" : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50"
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputVal)}
            placeholder={isListening ? "Listening..." : "Ask about Aswin... skills, projects, journey, photos..."}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-2"
          />
          <button 
            onClick={() => handleSend(inputVal)}
            className="p-3 mx-2 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all"
          >
            <Send size={18} className="translate-x-0.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
          Powered by JARVIS AI • Aswin Dev's Interactive Portfolio
        </p>
      </motion.div>
    </div>
  );
}
