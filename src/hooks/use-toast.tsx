
import { toast as sonnerToast } from "sonner";
import { Check } from "lucide-react";

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
        sonnerToast.success("Success", {
          icon: <Check className="h-4 w-4 text-green-600" />,
        });
        return;
      }

      const { title, description, variant } = data;
      
      if (variant === "destructive") {
        sonnerToast.error(title || "Error", {
          description: description
        });
      } else {
        sonnerToast.success(title || "Success", {
          description: description,
          icon: <Check className="h-4 w-4 text-green-600" />,
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
      description: description,
      icon: <Check className="h-4 w-4 text-green-600" />,
    });
  }
};
