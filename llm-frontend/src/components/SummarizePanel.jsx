import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";

const STYLES = [
  { value: "concise", label: "Concise" },
  { value: "bullet_points", label: "Bullet points" },
  { value: "detailed", label: "Detailed" },
];

/**
 * SummarizePanel calls POST /summarize - a plain request/response call
 */
export default function SummarizePanel() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState("concise");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSummarize() {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSummary("");

    try {
      const response = await fetch(`${API_URL}/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        // FastAPI's error responses put the message in `detail`.
        throw new Error(data.detail || `Server responded with ${response.status}`);
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text to summarize..."
        rows={6}
      />

      <div className="flex items-center gap-2">
        {/* Plain native <select>, styled with Tailwind to match the rest
            of the UI. shadcn has a fancier Radix-based Select component,
            but a native <select> is simpler to understand as a beginner
            and works identically from the user's point of view. */}
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-sm border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Button onClick={handleSummarize} disabled={isLoading || !text.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Summarize
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {summary && (
        <div className="rounded-sm border border-slate-800 bg-slate-950 p-3">
          <p className="mb-1 text-xs font-semibold text-slate-400">summary</p>
          <p className="whitespace-pre-wrap text-sm text-slate-200">{summary}</p>
        </div>
      )}
    </div>
  );
}
