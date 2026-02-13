import * as React from "react"
import { cn } from "@/lib/utils"

export type InputType = "text" | "email" | "password" | "number"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  type?: InputType
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
