import { Link } from "react-router-dom";
import { Mail, FileText, CalendarClock, BookOpen, MessageSquare, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  { title: "Smart Email Generator", desc: "Craft polished emails in seconds with tone & audience controls.", icon: Mail, url: "/email", gradient: "from-blue-500 to-cyan-500" },
  { title: "Meeting Notes Summarizer", desc: "Turn raw notes into key points, decisions, and action items.", icon: FileText, url: "/notes", gradient: "from-purple-500 to-pink-500" },
  { title: "AI Task Planner", desc: "Prioritize and schedule your day with AI-powered planning.", icon: CalendarClock, url: "/planner", gradient: "from-amber-500 to-orange-500" },
  { title: "Research Assistant", desc: "Summarize articles and extract key insights instantly.", icon: BookOpen, url: "/research", gradient: "from-emerald-500 to-teal-500" },
  { title: "Chat Assistant", desc: "Ask anything about workplace tasks, productivity, and more.", icon: MessageSquare, url: "/chat", gradient: "from-indigo-500 to-violet-500" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-2xl gradient-hero p-8 md:p-12 border">
        <div className="flex items-center gap-2 text-sm text-primary mb-3">
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">Powered by AI</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
          Your AI <span className="text-gradient">workplace assistant</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Automate emails, notes, planning, and research—so you can focus on the work that matters.
        </p>
        <div className="flex gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Instant results</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Review-friendly</div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link key={f.url} to={f.url}>
              <Card className="p-6 hover:shadow-elegant transition-smooth cursor-pointer group h-full border-border/60">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-md`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-smooth">{f.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
                <div className="flex items-center text-sm text-primary font-medium">
                  Open <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-smooth" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
