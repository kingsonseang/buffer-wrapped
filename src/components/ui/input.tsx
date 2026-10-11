import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "bg-input file:text-foreground placeholder:text-muted-foreground focus-visible:outline-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20 border-border h-9 w-full min-w-0 rounded-full border px-3 py-1 text-base outline-2 outline-offset-2 outline-transparent transition-[color,box-shadow,background-color,outline-color] outline-solid file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
