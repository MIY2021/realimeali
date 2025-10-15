import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium min-h-[44px] min-w-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CC4A0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // New semantic variants
        primary: "bg-[#CFE6D6] text-[#1A1A1A] hover:bg-[#B8D9C5] shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        secondary: "border border-[#E3E3E3] bg-white text-[#1A1A1A] hover:bg-gray-50",
        tertiary: "bg-transparent hover:bg-black/[0.03] text-[#1A1A1A]",
        // Existing variants for backward compatibility
        default: "bg-primary text-white hover:bg-primary/90",
        destructive: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
        outline: "border border-input bg-background hover:bg-accent hover:text-white",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs min-h-[28px] min-w-[28px]",
        sm: "h-9 px-3 text-sm min-h-[36px] min-w-[36px]",
        md: "h-11 px-4 text-sm min-h-[44px] min-w-[44px]",
        lg: "h-[52px] px-5 text-base min-h-[52px]",
        default: "h-10 px-4 py-2",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
