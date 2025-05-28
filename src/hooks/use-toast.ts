
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "destructive" | "default";
};

export function useToast() {
  return {
    toasts: [],
    toast: (data?: ToastProps) => {
      if (!data) {
        sonnerToast.success("Success");
        return;
      }

      const { title, description, variant } = data;
      
      if (variant === "destructive") {
        sonnerToast.error(title || "Error", {
          description: description
        });
      } else {
        sonnerToast.success(title || "Success", {
          description: description
        });
      }
    },
    dismiss: () => {
      sonnerToast.dismiss();
    },
  };
}

export const toast = (data?: ToastProps) => {
  const { title, description, variant } = data || {};
  
  if (variant === "destructive") {
    sonnerToast.error(title || "Error", {
      description: description
    });
  } else {
    sonnerToast.success(title || "Success", {
      description: description
    });
  }
};
