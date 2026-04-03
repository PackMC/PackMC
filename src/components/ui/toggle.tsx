import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        packmc: "bg-transparent text-text-muted hover:bg-card hover:text-text-secondary rounded-lg data-[state=on]:bg-card data-[state=on]:text-text-secondary",
        packmc2: "bg-transparent py-5 text-text-muted hover:bg-card hover:text-text-secondary data-[state=on]:bg-card data-[state=on]:text-text-secondary data-[state=on]:bg-text-secondary/10 data-[state=on]:rounded-4xl",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
