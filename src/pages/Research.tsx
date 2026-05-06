import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai";
import { AIDisclaimer } from "@/components/AIDisclaimer";

interface ResearchResult {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  simplified: string;
}

interface Saved { id: string; title: string; result: ResearchResult }

export default function Research() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("research-saved");
    if (s) setSaved(JSON.parse(s));
  }, []);

  const persist = (next: Saved[]) => {
    setSaved(next);
    localStorage.setItem("research-saved", JSON.stringify(next));
  };

  const analyze = async () => {
    if (content.trim().length < 50) { toast.error("Paste an article or topic to analyze."); return; }
    setLoading(true);
    try {
      const r = await callAI("research", `Analyze the following content:\n\n${content}`);
      setResult(r);
    } catch {} finally { setLoading(false); }
  };

  const save = () => {
    if (!result) return;
    const t = title.trim() || `Research ${saved.length + 1}`;
    persist([{ id: crypto.randomUUID(), title: t, result }, ...saved]);
    toast.success("Saved");
    setTitle("");
  };

  const filtered = saved.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Research Assistant</h1>
          <p className="text-sm text-muted-foreground">Summarize and extract insights from anything.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <Label>Paste an article, report, or topic</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} maxLength={30000}
          placeholder="Paste full article text or describe a topic to research..." />
        <Button onClick={analyze} disabled={loading} className="gradient-primary">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
          Analyze
        </Button>
      </Card>

      {result && (
        <Card className="p-6 space-y-5 animate-fade-in">
          <section>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">Key Insights</h3>
            <ul className="space-y-1 text-sm">
              {result.keyInsights.map((k, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{k}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <ul className="space-y-1 text-sm">
              {result.recommendations.map((k, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{k}</li>)}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-2">Simplified Explanation</h3>
            <p className="text-sm text-muted-foreground">{result.simplified}</p>
          </section>
          <div className="flex gap-2 pt-2 border-t">
            <Input placeholder="Title for this research" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
            <Button onClick={save} variant="secondary"><Save className="h-4 w-4 mr-2" />Save</Button>
          </div>
          <AIDisclaimer />
        </Card>
      )}

      {saved.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold">Saved Research</h3>
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            {filtered.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-smooth">
                <button className="text-left flex-1 text-sm font-medium" onClick={() => setResult(s.result)}>
                  {s.title}
                </button>
                <Button variant="ghost" size="icon" onClick={() => persist(saved.filter((x) => x.id !== s.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
