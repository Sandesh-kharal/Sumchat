import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This tiny helper is used by EVERY shadcn-style component. Here's why it
// exists: Tailwind classes are just strings, and when a component accepts
// a `className` prop to let you override styles (e.g. <Button className="w-full">),
// you need a smart way to MERGE those strings without conflicts.
//
// Example problem this solves:
//   Base button style has "px-4", caller passes "px-8" to override it.
//   Naively concatenating gives "px-4 px-8" - CSS then applies whichever
//   comes LAST in the stylesheet, which is unpredictable.
//   twMerge understands Tailwind's own classes and correctly drops the
//   conflicting "px-4", keeping only "px-8".
//
// clsx() first: lets you pass conditional classes, e.g. cn("btn", isActive && "btn-active")
// twMerge() second: cleans up any Tailwind conflicts in the result.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
