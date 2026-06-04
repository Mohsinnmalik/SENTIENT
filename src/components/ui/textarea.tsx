import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-[var(--radius)] border-3 border-border bg-card px-3 py-2 text-base text-foreground transition-all outline-none placeholder:text-muted-foreground shadow-[3px_3px_0px_0px_var(--border)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:shadow-[5px_5px_0px_0px_var(--border)] disabled:pointer-events-none disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
