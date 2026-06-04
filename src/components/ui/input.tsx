import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[var(--radius)] border-3 border-border bg-card px-3 py-1.5 text-base text-foreground transition-all outline-none placeholder:text-muted-foreground shadow-[3px_3px_0px_0px_var(--border)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:shadow-[5px_5px_0px_0px_var(--border)] disabled:pointer-events-none disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
