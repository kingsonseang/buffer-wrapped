import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button focus-visible:outline-ring aria-invalid:ring-destructive/20 relative inline-flex shrink-0 rounded-full outline-2 outline-offset-2 outline-transparent outline-solid select-none before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:transition-[translate] before:duration-150 before:ease-out disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        secondary: "",
        ghost: "",
        destructive: "",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const buttonFaceVariants = cva(
  "aria-invalid:border-destructive relative inline-flex w-full items-center justify-center gap-[var(--space-step-1)] rounded-full border border-transparent bg-clip-padding text-center font-normal transition-[background-color,color,translate,outline-color] duration-150 ease-out will-change-[translate] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover:bg-brand-400",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "",
      },
      size: {
        default:
          "px-[1.25em] py-[0.5em] text-[length:var(--font-size-step-0)] has-data-[icon=inline-end]:pe-[1em] has-data-[icon=inline-start]:ps-[1em] [&_svg:not([class*='size-'])]:size-5",
        xs: "gap-1 px-[1em] py-[0.25em] text-[length:var(--font-size-step--2)] has-data-[icon=inline-end]:pe-[0.75em] has-data-[icon=inline-start]:ps-[0.75em] [&_svg:not([class*='size-'])]:size-3",
        sm: "px-[1.25em] py-[0.5em] text-[length:var(--font-size-step--1)] has-data-[icon=inline-end]:pe-[1em] has-data-[icon=inline-start]:ps-[1em] [&_svg:not([class*='size-'])]:size-5",
        lg: "px-[1.25em] py-[1em] text-[length:var(--font-size-step-0)] has-data-[icon=inline-end]:pe-[1em] has-data-[icon=inline-start]:ps-[1em] [&_svg:not([class*='size-'])]:size-5",
        icon: "size-9 px-0 py-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-6 px-0 py-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 px-0 py-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 px-0 py-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> &
  VariantProps<typeof buttonFaceVariants>) {
  const lift = (props as { [key: string]: unknown })["data-translate-on-hover"] !== "false";
  const face =
    variant === "link" ? (
      children
    ) : (
      <span
        data-slot="button-face"
        className={cn(
          buttonFaceVariants({ variant, size }),
          lift && "group-hover/button:-translate-y-0.5",
        )}
      >
        {children}
      </span>
    );
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ variant, className }),
        lift && variant !== "link" && "hover:before:translate-y-0.5",
      )}
      {...props}
    >
      {face}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, buttonFaceVariants };
