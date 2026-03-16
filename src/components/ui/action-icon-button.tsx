'use client'

import * as React from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionTone = 'default' | 'primary' | 'destructive'

const toneClasses: Record<ActionTone, string> = {
  default: 'text-muted-foreground hover:text-foreground',
  primary: 'text-muted-foreground hover:text-primary',
  destructive: 'text-muted-foreground hover:text-destructive',
}

type SharedActionProps = {
  label: string
  tone?: ActionTone
  dataTestId?: string
}

type TooltipPosition = {
  top: number
  left: number
}

function ActionTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const triggerRef = React.useRef<HTMLSpanElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState<TooltipPosition | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const computePosition = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition({
      top: rect.top - 6,
      left: rect.left + rect.width / 2,
    })
  }, [])

  const handleOpen = React.useCallback(() => {
    computePosition()
    setOpen(true)
  }, [computePosition])

  const handleClose = React.useCallback(() => {
    setOpen(false)
  }, [])

  React.useEffect(() => {
    if (!open) return

    const handleWindowChange = () => computePosition()

    window.addEventListener('scroll', handleWindowChange, true)
    window.addEventListener('resize', handleWindowChange)

    return () => {
      window.removeEventListener('scroll', handleWindowChange, true)
      window.removeEventListener('resize', handleWindowChange)
    }
  }, [open, computePosition])

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {children}
      </span>
      {mounted && open && position
        ? createPortal(
            <span
              className="pointer-events-none fixed z-[9999] rounded-md bg-slate-950 px-2 py-1 text-xs font-medium text-white shadow-lg"
              style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {label}
            </span>,
            document.body
          )
        : null}
    </>
  )
}

type ActionIconButtonProps = SharedActionProps &
  Omit<ButtonProps, 'children'> & {
    children: React.ReactNode
  }

export function ActionIconButton({
  label,
  tone = 'default',
  variant = 'ghost',
  size = 'sm',
  className,
  dataTestId,
  children,
  ...props
}: ActionIconButtonProps) {
  return (
    <ActionTooltip label={label}>
      <Button
        variant={variant}
        size={size}
        aria-label={label}
        className={cn(toneClasses[tone], className)}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </Button>
    </ActionTooltip>
  )
}

type ActionIconLinkProps = SharedActionProps &
  Omit<React.ComponentProps<typeof Link>, 'href' | 'children'> & {
    href: string
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
    className?: string
    children: React.ReactNode
  }

export function ActionIconLink({
  href,
  label,
  tone = 'default',
  className,
  dataTestId,
  variant = 'ghost',
  size = 'sm',
  children,
  ...props
}: ActionIconLinkProps) {
  return (
    <ActionTooltip label={label}>
      <Button
        asChild
        variant={variant}
        size={size}
        aria-label={label}
        className={cn(toneClasses[tone], className)}
        data-testid={dataTestId}
      >
        <Link href={href} {...props}>
          {children}
        </Link>
      </Button>
    </ActionTooltip>
  )
}
