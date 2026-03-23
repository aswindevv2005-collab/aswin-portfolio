import AnimatedBackground from "@/components/AnimatedBackground";
import AIChatbot from "@/components/AIChatbot";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatedBackground />
      <AIChatbot />
    </main>
  );
}
