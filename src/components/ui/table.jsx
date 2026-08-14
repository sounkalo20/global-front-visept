"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-gray-50/80 dark:bg-[#1F2937] [&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-[#374151]", className)}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 divide-y divide-gray-100 dark:divide-[#374151]/60", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-gray-200 dark:border-[#374151] bg-gray-50/50 dark:bg-[#1F2937]/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-gray-100 dark:border-[#374151]/60 transition-colors hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-brand-50/50 dark:data-[state=selected]:bg-brand-950/30",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] uppercase tracking-wider whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle text-sm text-gray-800 dark:text-[#F9FAFB] whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
