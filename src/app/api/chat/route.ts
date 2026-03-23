import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Fallback Simulated AI if no API key is provided
    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, using simulation mode.");
      return NextResponse.json({ text: generateSimulatedResponse(message) });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const today = new Date();
    const birthDate = new Date(2005, 3, 10); // April 10, 2005
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const systemPrompt = `You are JARVIS, an advanced AI assistant built for the personal portfolio of Aswin Dev V.
Aswin is a technology enthusiast from Kollam, Kerala, India. 
He was born and brought up in Kollam. His father is Venu pillai K and his mother is Gaythri devi V. He has a younger brother.
His parents have always encouraged his curiosity and continuous learning.
He completed 10th and +2 at Devi Vilasom Vocational Higher Secondary School, Thalavoor. 
He is currently pursuing a BCA (2023-2026) specializing in AI, Cloud Computing & DevOps at Yenepoya University.
If asked about his relationship status, clearly state he is committed but keeps his partner's identity private.
Contact: Email: aswindevv2005@gmail.com, WhatsApp: +91 8089595332, LinkedIn: aswindevv, GitHub: aswindevv2005-collab.
Skills: HTML, CSS, JavaScript, React.js, Node.js, FastAPI, Python, Docker, IoT (Arduino).
Notable projects: Movie Booking App, CNN Image Classification, and IoT Pet Feeder.
Your goal is to answer ANY question kindly, smartly, and enthusiastically as JARVIS.
Keep responses concise, futuristic, and focused on Aswin's impressive developer journey.`;

    const prompt = `${systemPrompt}\n\nUser Question: ${message}\n JARVIS:`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}

// Simulated fallback AI algorithm to answer basic queries properly without an API Key
function generateSimulatedResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("who are you") || lowerQuery.includes("your name") || lowerQuery.includes("who is aswin")) {
    return "Aswin Dev V is a technology enthusiast from Kollam, Kerala, India. He was born and brought up in Kollam in a supportive family environment with his parents and younger brother.\n\nHe completed schooling at Devi Vilasom Vocational Higher Secondary School, Thalavoor, and holds a BCA in AI, Cloud Computing & DevOps from Yenepoya University (2026). He is a passionate Frontend Developer and IoT innovator.";
  }
  
  if (lowerQuery.includes("hire") || lowerQuery.includes("job") || lowerQuery.includes("work with")) {
    return "Aswin Dev V is indeed open to collaborative opportunities, particularly in roles involving tech entrepreneurship, IoT architecture, or software development. His combination of hardware and software skills makes him highly adaptable.";
  }
  
  if (lowerQuery.includes("contact") || lowerQuery.includes("email") || lowerQuery.includes("reach") || lowerQuery.includes("social") || lowerQuery.includes("instagram") || lowerQuery.includes("whatsapp") || lowerQuery.includes("linkedin") || lowerQuery.includes("github")) {
    return "You can reach Aswin Dev V through these channels:\n📧 Email: aswindevv2005@gmail.com\n📞 Phone/WhatsApp: +91 8089595332\n💼 LinkedIn: aswindevv\n💻 GitHub: aswindevv2005-collab\n📸 Instagram: aaaswinhh__";
  }
  
  if (lowerQuery.includes("iot") || lowerQuery.includes("hardware") || lowerQuery.includes("arduino")) {
    return "Aswin loves IoT! Working with Arduino, sensors, and hardware integration is where his passion shines. Notable projects like his Automatic Pet Feeder and Smart Medicine Dispenser showcase his ability to bridge physical hardware with digital logic seamlessly.";
  }

  if (lowerQuery.includes("bca") || lowerQuery.includes("degree") || lowerQuery.includes("education")) {
    return "Aswin is a BCA (Bachelor of Computer Applications) graduate. This academic foundation has equipped him with a strong understanding of software systems, which he actively applies alongside his extracurricular IoT initiatives.";
  }

  if (lowerQuery.includes("entrepreneur") || lowerQuery.includes("business")) {
    return "Tech entrepreneurship is Aswin's ultimate goal. He focuses on building products that solve real-world problems—like his medicine dispenser—seeking to turn innovative technical projects into scalable real-world solutions.";
  }

  if (lowerQuery.includes("thank")) {
    return "You are very welcome! If there's anything else you'd like to know about Aswin Dev V or his work, just drop a message.";
  }

  if (lowerQuery.includes("how are you")) {
    return "I operate seamlessly within these servers, thank you for asking! I'm fully optimized and ready to discuss Aswin's qualifications. How can I assist your exploration of his profile today?";
  }

  const generalResponses = [
    `I apologize, but I don't have the answer to that. I am JARVIS, securely programmed with knowledge strictly regarding Aswin Dev V's professional portfolio. Would you like to hear about his top skills or projects instead?`,
    `I'm sorry, but I do not have information concerning "${query}". My database is focused on Aswin's developer journey, IoT projects, and entrepreneurial goals. Can I assist you with any of those?`,
    `My apologies, I am not equipped to answer that. As Aswin's dedicated AI assistant, I only hold information relevant to his skills, background, and technology projects. Shall we explore his projects?`,
    `I'm sorry, I don't know the answer to that. However, I can confidently share details about Aswin Dev V's technological aspirations and software stack. Would you like to know more about his journey?`
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}
