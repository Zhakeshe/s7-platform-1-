import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-[14px] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-[15px] text-white shadow-xs transition-[color,box-shadow,border,background] outline-none placeholder:text-[#a7a7a7] focus-visible:border-[var(--color-border-hover-1)] focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
