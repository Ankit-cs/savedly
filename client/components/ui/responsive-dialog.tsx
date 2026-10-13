"use client"

import type { ReactNode } from "react"

import { BottomSheet } from "@/components/arc/bottom-sheet/bottom-sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * A dialog on a desktop, a bottom sheet on a phone.
 *
 * On a phone a centred box is a poor fit: it sits away from the thumb and
 * fights the keyboard. There the same content rises from the bottom edge as
 * Arc's bottom sheet, which can be dragged down to dismiss. On wider screens
 * it is the app's ordinary dialog.
 *
 * Both draw the title and pad the content, so pass the content bare.
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  hideDescription = false,
  detents = [0.9],
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Keeps the description for screen readers only (desktop). The sheet always shows it. */
  hideDescription?: boolean
  /** Phone only: resting heights as fractions of the screen. One value is a fixed height. */
  detents?: number[]
  /** On the desktop dialog, for its width. */
  className?: string
  children: ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onOpenChange} title={title} description={hideDescription ? undefined : description} detents={detents}>
        {children}
      </BottomSheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("gap-0 p-0", className)}>
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          {description && <DialogDescription className={cn(hideDescription && "sr-only")}>{description}</DialogDescription>}
        </DialogHeader>
        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
