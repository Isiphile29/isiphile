import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, CheckCircle2, ListTodo, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai";
import { AIDisclaimer } from "@/components/AIDisclaimer";

interface Summary {
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
}

export default function NotesSummarizer() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);

  const summarize = async () => {
    if (notes.trim().length < 30) {
      toast.error("Please paste meeting notes (at least a few sentences).");
      return;
    }
    setLoading(true);
    try {
      const r = await callAI("summarize", `Summarize these meeting notes:\n\n${notes}`);
      setResult(r);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">Turn messy notes into clean summaries.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <Label>Paste your meeting notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste raw meeting notes, transcript, or bullet points here..."
          rows={10}
          maxLength={20000}
        />
        <Button onClick={summarize} disabled={loading} className="gradient-primary">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
          Summarize
        </Button>
      </Card>

      {result && (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Key Discussion Points</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {result.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-success" style={{ color: "hsl(var(--success))" }} />
              <h3 className="font-semibold">Decisions Made</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {result.decisions.map((d, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{d}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Action Items</h3>
            </div>
            <div className="space-y-3">
              {result.actionItems.map((a, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-2 p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1 text-sm">{a.task}</div>
                  <Badge variant="secondary">{a.owner}</Badge>
                  <Badge variant="outline">{a.deadline}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <div className="md:col-span-2"><AIDisclaimer /></div>
        </div>
      )}
    </div>
  );
}
