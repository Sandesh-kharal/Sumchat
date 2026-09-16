import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import ChatPanel from "@/components/ChatPanel";
import SummarizePanel from "@/components/SummarizePanel";

export default function App() {
  return (
   
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6">
          <h1 className="text-lg font-semibold text-slate-100">
            <span className="text-amber-400">$</span> llm-console
          </h1>
          <p className="text-sm text-slate-500">
            Streaming chat and summarization, backed by Gemini.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Gemini playground</CardTitle>
            <CardDescription>
              Talk to the model directly, or summarize a block of text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chat">
              <TabsList>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="summarize">Summarize</TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                <ChatPanel />
              </TabsContent>
              <TabsContent value="summarize">
                <SummarizePanel />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
