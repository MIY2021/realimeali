
import * as React from "react";
// Notification popups are now disabled globally.
export function useToast() {
  return {
    toasts: [],
    toast: () => {},
    dismiss: () => {},
  };
}
export const toast = () => {};
