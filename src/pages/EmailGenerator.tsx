import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Copy, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai";
import { AIDisclaimer } from "@/components/AIDisclaimer";

export default function EmailGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("manager");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please describe what the email is about.");
      return;
    }
    setLoading(true);
    try {
      const prompt = `Write a ${tone} email to a ${audience}. Context: ${topic}`;
      const r = await callAI("email", prompt);
      setResult(r);
    } catch {} finally { setLoading(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <Mail className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">Generate polished emails in seconds.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="coworker">Coworker</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>What's the email about?</Label>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Request a one-week extension on the Q3 report due to delayed data..."
            rows={4}
            maxLength={2000}
          />
        </div>
        <Button onClick={generate} disabled={loading} className="gradient-primary">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
          Generate Email
        </Button>
      </Card>

      {result && (
        <Card className="p-6 space-y-4 animate-fade-in">
          <div>
            <Label>Subject</Label>
            <Input value={result.subject} onChange={(e) => setResult({ ...result, subject: e.target.value })} />
          </div>
          <div>
            <Label>Body</Label>
            <Textarea value={result.body} onChange={(e) => setResult({ ...result, body: e.target.value })} rows={12} />
          </div>
          <div className="flex gap-2">
            <Button onClick={copy} variant="secondary"><Copy className="h-4 w-4 mr-2" />Copy</Button>
            <Button onClick={generate} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Regenerate
            </Button>
          </div>
          <AIDisclaimer />
        </Card>
      )}
    </div>
  );
}
