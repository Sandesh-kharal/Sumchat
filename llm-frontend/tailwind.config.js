/** @type {import('tailwindcss').Config} */
export default {
  // "content" tells Tailwind which files to scan for class names like
  // "bg-slate-950" or "text-amber-400". Tailwind only generates CSS for
  // classes it actually finds in these files - that's how it stays small.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // We use ONE typeface family for the whole app - a monospace font
        // - because this is a developer tool for talking to an API, and
        // monospace type reinforces that "console/terminal" feel instead
        // of looking like a generic marketing page.
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
