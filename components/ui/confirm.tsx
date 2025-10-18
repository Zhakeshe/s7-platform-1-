"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

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
  const isDanger = variant === 'danger'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Drawer open={state.open} onOpenChange={(open) => { if (!open) onCancel() }}>
        <DrawerContent className="max-w-lg mx-auto rounded-2xl border border-[#2a2a35] bg-[#16161c] text-white [&>div:first-child]:hidden">
          <DrawerHeader>
            <DrawerTitle className="text-white text-xl font-semibold">{title}</DrawerTitle>
            {description && (
              <DrawerDescription className={cn(isDanger ? 'text-red-400' : 'text-white/70', 'text-sm md:text-base')}>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter className="flex-row justify-end gap-2">
            <DrawerClose asChild>
              <Button onClick={onCancel} variant="outline" className="px-4 py-2.5 rounded-lg bg-[#1b1b22] border border-[#2a2a35] text-white hover:text-white hover:bg-[#23232b]">
                {cancelText}
              </Button>
            </DrawerClose>
            <Button
              onClick={onConfirm}
              className={cn(
                'px-4 py-2.5 rounded-lg font-medium',
                isDanger
                  ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
                  : 'bg-[#00a3ff] hover:bg-[#0088cc] text-black',
              )}
            >
              {confirmText}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
