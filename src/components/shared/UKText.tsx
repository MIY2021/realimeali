import { toUKSpelling } from "@/utils/ukSpelling";
import { ReactNode } from "react";

/**
 * UKText Component
 * Automatically converts US spellings to UK spellings in user-facing text
 * 
 * Usage:
 * <UKText>This is my favorite color</UKText>
 * // Renders: "This is my favourite colour"
 * 
 * <UKText>{someVariable}</UKText>
 * // Automatically converts US spellings in the variable
 */
interface UKTextProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function UKText({ children, className, as: Component = 'span' }: UKTextProps) {
  // Convert children to string if it's a string, otherwise render as-is
  const content = typeof children === 'string' 
    ? toUKSpelling(children)
    : children;
  
  return <Component className={className}>{content}</Component>;
}

/**
 * Hook version for programmatic use
 * Use this when you need to convert a string value
 */
export function useUKText(text: string): string {
  return toUKSpelling(text);
}

