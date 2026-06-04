import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] border-3 border-border text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)]",
        outline:
          "bg-background text-foreground shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)]",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[3px_3px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_var(--border)]",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-7 gap-1 rounded-sm px-2.5 text-xs in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-sm px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs":
          "size-7 rounded-sm in-data-[slot=button-group]:rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-sm in-data-[slot=button-group]:rounded-sm",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
