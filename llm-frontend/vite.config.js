import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite reads this file to know how to build/serve your app.
// The `resolve.alias` part lets you write `import x from "@/components/x"`
// instead of `import x from "../../components/x"` - much easier to read
// once a project has more than a couple of folders. "@" is a convention
// borrowed from shadcn/ui, which expects it to point at your `src/` folder.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
