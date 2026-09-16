import { useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_URL } from "@/lib/api";

/**
 * ChatPanel talks to POST /chat/stream on your FastAPI backend and
 * renders the response as it streams in, chunk by chunk.
 
 */
export default function ChatPanel() {
  // `messages` is an array of { role: "user" | "assistant", text: string }.
  // This is what actually gets rendered on screen as the conversation.
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return; // guard against empty/double sends

    setError(null);
    setInput("");

    // Add the user's message immediately, and an EMPTY assistant message
    // that we'll fill in as chunks arrive. This is what makes the
    // "typing" effect possible - we're not waiting for the full answer
    // before showing anything.
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "assistant", text: "" },
    ]);
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit hit - wait a moment before sending again.");
        }
        throw new Error(`Server responded with ${response.status}`);
      }

  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

       
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop(); 

        for (const rawEvent of events) {
          const line = rawEvent.replace(/^data: /, "").trim();
          if (!line) continue;
          const parsed = JSON.parse(line);

          if (parsed.type === "chunk") {
           
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                text: last.text + parsed.text,
              };
              return updated;
            });
          } else if (parsed.type === "error") {
            setError(parsed.message);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e) {
 
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-80 overflow-y-auto rounded-sm border border-slate-800 bg-slate-950 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Send a message to start streaming a response from Gemini.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="mb-3">
            <span
              className={
                msg.role === "user"
                  ? "text-xs font-semibold text-amber-400"
                  : "text-xs font-semibold text-slate-400"
              }
            >
              {msg.role === "user" ? "you" : "gemini"}
            </span>
            <p className="whitespace-pre-wrap text-sm text-slate-200">
              {msg.text}
              {/* Blinking cursor on the last assistant message while streaming */}
              {isStreaming &&
                msg.role === "assistant" &&
                i === messages.length - 1 && (
                  <span className="animate-pulse">▍</span>
                )}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini something..."
          rows={2}
          className="flex-1"
          disabled={isStreaming}
        />
        <Button onClick={sendMessage} disabled={isStreaming || !input.trim()}>
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
