'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type ConfirmState = ConfirmOptions & {
  open: boolean
  resolve?: (value: boolean) => void
}

const ConfirmContext = createContext<{
  confirm: (options?: ConfirmOptions) => Promise<boolean>
} | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false })

  const confirm = useCallback((options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: options?.title ?? 'Подтверждение',
        description: options?.description,
        confirmText: options?.confirmText ?? 'Подтвердить',
        cancelText: options?.cancelText ?? 'Отмена',
        destructive: options?.destructive ?? false,
        resolve,
      })
    })
  }, [])

  const onClose = useCallback((value: boolean) => {
    setState((prev) => {
      prev.resolve?.(value)
      return { open: false }
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {/* Dialog */}
      <AlertDialog open={state.open}>
        <AlertDialogContent className="bg-[#16161c] border border-[#2a2a35] text-white rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {state.title}
            </AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription className="text-white/70">
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:gap-2">
            <AlertDialogCancel
              onClick={() => onClose(false)}
              className="rounded-full border border-[#2a2a35] bg-transparent text-white hover:bg-[#1a1a22]"
            >
              {state.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onClose(true)}
              className={
                state.destructive
                  ? 'rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white'
                  : 'rounded-full bg-[#00a3ff] hover:bg-[#0088cc] text-black'
              }
            >
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx.confirm
}
