
import { useState } from "react";

export function useMobileLayout() {
  const [mobileLayout, setMobileLayout] = useState<string>(() => {
    return localStorage.getItem('mobileRecipeLayout') || '1';
  });

  const handleMobileLayoutChange = (value: string) => {
    if (value) {
      setMobileLayout(value);
      localStorage.setItem('mobileRecipeLayout', value);
    }
  };

  return {
    mobileLayout,
    handleMobileLayoutChange,
  };
}
