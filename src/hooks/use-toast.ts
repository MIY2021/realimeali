
import { useRef } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "destructive";
};

// Simple in-memory toast state + callback for dev
let listeners: ((data: ToastProps) => void)[] = [];

export function useToast() {
  const addListener = (cb: (t: ToastProps) => void) => {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter(fn => fn !== cb);
    };
  };
  // No dispatcher implemented, add empty impl
  return {
    toasts: [],
    toast: (data?: ToastProps) => {
      listeners.forEach(fn => fn(data ? data : {}));
    },
    dismiss: () => {},
  };
}
export const toast = (data?: ToastProps) => {
  listeners.forEach(fn => fn(data ? data : {}));
};
