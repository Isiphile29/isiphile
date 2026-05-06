import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { callAI } from "@/lib/ai";
import { AIDisclaimer } from "@/components/AIDisclaimer";

interface ScheduleItem { time: string; task: string; priority: "high" | "medium" | "low"; duration: string }
interface PlanResult { schedule: ScheduleItem[]; tips: string[] }

const priorityColor = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

export default function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const plan = async () => {
    if (!tasks.trim()) { toast.error("List some tasks first."); return; }
    setLoading(true);
    setDone({});
    try {
      const r = await callAI("planner", `Build a prioritized daily/weekly schedule from these tasks and deadlines:\n${tasks}`);
      setResult(r);
    } catch {} finally { setLoading(false); }
  };

  const completed = Object.values(done).filter(Boolean).length;
  const total = result?.schedule.length ?? 0;
  const progress = total ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
          <CalendarClock className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">Prioritize and schedule your work.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <Label>Your tasks & deadlines</Label>
        <Textarea
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          placeholder="e.g.\n- Finish Q3 report (due Friday)\n- Call client about contract (urgent)\n- Review team PRs (today)\n- Update onboarding docs"
          rows={8}
          maxLength={5000}
        />
        <Button onClick={plan} disabled={loading} className="gradient-primary">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarClock className="h-4 w-4 mr-2" />}
          Build Schedule
        </Button>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Progress</h3>
              <span className="text-sm text-muted-foreground">{completed} / {total} done</span>
            </div>
            <Progress value={progress} />
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Your Schedule</h3>
            <div className="space-y-2">
              {result.schedule.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-smooth">
                  <Checkbox
                    checked={!!done[i]}
                    onCheckedChange={(v) => setDone({ ...done, [i]: !!v })}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{item.time}</span>
                      <Badge variant="outline" className={priorityColor[item.priority]}>{item.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{item.duration}</span>
                    </div>
                    <p className={`text-sm ${done[i] ? "line-through text-muted-foreground" : ""}`}>{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="font-semibold">Productivity Tips</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {result.tips.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">•</span>{t}</li>
              ))}
            </ul>
          </Card>

          <AIDisclaimer />
        </div>
      )}
    </div>
  );
}
