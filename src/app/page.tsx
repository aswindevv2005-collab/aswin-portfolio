import AnimatedBackground from "@/components/AnimatedBackground";
import AIChatbot from "@/components/AIChatbot";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center selection:bg-cyan-500/30">
      <AnimatedBackground />
      <AIChatbot />
    </main>
  );
}
