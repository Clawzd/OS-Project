import toastLib from "react-hot-toast";

export function useToast() {
  return {
    toast: ({ title, description, variant }) => {
      const text =
        title && description ? `${title} — ${description}` : title || description || "";
      if (variant === "destructive") {
        toastLib.error(text);
      } else {
        toastLib.success(text);
      }
    },
  };
}
