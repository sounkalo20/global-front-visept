import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] px-3 py-1.5 text-sm text-gray-900 dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF] transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:border-brand-500 dark:focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1F2937]/50 disabled:text-gray-400 dark:disabled:text-[#9CA3AF] aria-invalid:border-destructive dark:aria-invalid:border-destructive shadow-xs",
        className
      )}
      {...props} />
  );
}

export { Input }
