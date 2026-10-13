"use client";

import { useFormStatus } from "react-dom";
import { primaryButton } from "@/lib/ui";

// A submit button that shows a busy label while the form is being sent.
export default function SubmitButton({ children, pendingText = "Saving…", className = primaryButton }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
