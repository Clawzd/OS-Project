import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        className: "dark:bg-card dark:text-foreground dark:border-border",
        style: {
          borderRadius: "0.5rem",
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        },
      }}
    />
  );
}
