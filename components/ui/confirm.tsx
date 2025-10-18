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
  const defaultDangerText = 'Данные в локальном хранилище будут очищены, и вы выйдете из аккаунта. Чтобы снова получить доступ, войдите в аккаунт заново.'
  const defaultText = 'Проверьте данные и подтвердите выполнение действия.'
  const descToShow = description ?? (isDanger ? defaultDangerText : defaultText)

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Drawer open={state.open} onOpenChange={(open) => { if (!open) onCancel() }}>
        <DrawerContent className="w-full sm:max-w-xl sm:mx-auto rounded-t-3xl sm:rounded-2xl border border-[#2a2a35] bg-[#16161c] text-white [&>div:first-child]:hidden min-h-[38vh]">
          <DrawerHeader className="px-5 pt-5 pb-2 sm:px-6">
            <DrawerTitle className="text-white text-2xl md:text-xl font-semibold leading-tight">{title}</DrawerTitle>
            {descToShow && (
              <DrawerDescription className={cn(isDanger ? 'text-red-400' : 'text-white/70', 'text-base md:text-sm mt-1')}>{descToShow}</DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter className="flex-col-reverse md:flex-row md:justify-end gap-3 md:gap-2 px-5 pb-5 sm:px-6">
            <DrawerClose asChild>
              <Button onClick={onCancel} variant="outline" className="w-full md:w-auto h-11 rounded-xl bg-transparent border border-white/15 text-white hover:bg-white/10">
                {cancelText}
              </Button>
            </DrawerClose>
            <Button
              onClick={onConfirm}
              className={cn(
                'w-full md:w-auto h-11 rounded-xl font-medium',
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
