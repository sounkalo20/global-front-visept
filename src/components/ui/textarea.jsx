import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] px-3 py-2 text-sm text-gray-900 dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF] transition-all outline-none focus-visible:border-brand-500 dark:focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1F2937]/50 disabled:text-gray-400 dark:disabled:text-[#9CA3AF] aria-invalid:border-destructive dark:aria-invalid:border-destructive shadow-xs",
        className
      )}
      {...props} />
  );
}

export { Textarea }
