'use client'

import * as React from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'

export type ConfirmOptions = {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

const ConfirmContext = React.createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{
    open: boolean
    options: ConfirmOptions
    resolve?: (v: boolean) => void
  }>({ open: false, options: {} })

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options: opts, resolve })
    })
  }, [])

  const close = () => setState({ open: false, options: {} })
  const onCancel = () => {
    state.resolve?.(false)
    close()
  }
  const onConfirm = () => {
    state.resolve?.(true)
    close()
  }

  const { title = 'Подтвердите действие', description, confirmText = 'Подтвердить', cancelText = 'Отмена', variant = 'default' } = state.options

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={state.open} onOpenChange={(open) => !open && onCancel()}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[120] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl border p-6 shadow-2xl bg-[#16161c] border-[#2a2a35] text-white">
            <AlertDialog.Title className="text-lg font-medium mb-2">{title}</AlertDialog.Title>
            {description && (
              <AlertDialog.Description className="text-white/70 text-sm mb-4">{description}</AlertDialog.Description>
            )}
            <div className="flex items-center justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  onClick={onCancel}
                  className="px-3 py-2 rounded-lg bg-[#1b1b22] border border-[#2a2a35] text-white/90 hover:bg-[#23232b]"
                >
                  {cancelText}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={onConfirm}
                  className={cn(
                    'px-3 py-2 rounded-lg font-medium',
                    variant === 'danger'
                      ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
                      : 'bg-[#00a3ff] hover:bg-[#0088cc] text-black',
                  )}
                >
                  {confirmText}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
