import * as React from "react"
import { cn } from "@/lib/utils"

type TooltipSide = "top" | "bottom" | "left" | "right"
type TooltipAlign = "start" | "center" | "end"

interface TooltipContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLDivElement | null>
  tooltipRef: React.RefObject<HTMLDivElement | null>
  side: TooltipSide
  sideOffset: number
  align: TooltipAlign
  delay: number
}

const TooltipContext = React.createContext<TooltipContextValue>({
  open: false,
  setOpen: () => {},
  triggerRef: React.createRef(),
  tooltipRef: React.createRef(),
  side: 'top',
  sideOffset: 4,
  align: 'center',
  delay: 300,
})

function TooltipProvider({ children, delay = 300 }: { children: React.ReactNode; delay?: number }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef, tooltipRef, side: 'top', sideOffset: 4, align: 'center', delay }}>
      {children}
    </TooltipContext.Provider>
  )
}

function Tooltip({ 
  children, 
  open, 
  onOpenChange,
  defaultOpen = false 
}: { 
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const actualOpen = isControlled ? open : internalOpen
  const setActualOpen = onOpenChange || setInternalOpen
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<number | null>(null)
  const { delay } = React.useContext(TooltipContext)

  const handleOpen = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => setActualOpen(true), delay)
  }, [setActualOpen, delay])

  const handleClose = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActualOpen(false)
  }, [setActualOpen])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const contextValue = React.useMemo(() => ({
    open: actualOpen,
    setOpen: setActualOpen as React.Dispatch<React.SetStateAction<boolean>>,
    triggerRef,
    tooltipRef,
    side: 'top' as TooltipSide,
    sideOffset: 4,
    align: 'center' as TooltipAlign,
    delay,
  }), [actualOpen, setActualOpen, delay])

  return (
    <TooltipContext.Provider value={contextValue}>
      {typeof children === 'function' ? (children as (props: { open: boolean }) => React.ReactNode)({ open: actualOpen }) : children}
    </TooltipContext.Provider>
  )
}

function TooltipTrigger({ 
  children, 
  asChild = false 
}: { 
  children: React.ReactNode
  asChild?: boolean 
}) {
  const { open, setOpen, triggerRef } = React.useContext(TooltipContext)

  const handleMouseEnter = () => setOpen(true)
  const handleMouseLeave = () => setOpen(false)
  const handleFocus = () => setOpen(true)
  const handleBlur = () => setOpen(false)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{
      onMouseEnter?: () => void
      onMouseLeave?: () => void
      onFocus?: () => void
      onBlur?: () => void
      ref?: React.Ref<HTMLDivElement>
    }>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ref: triggerRef,
    })
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-block"
    >
      {children}
    </div>
  )
}

function TooltipContent({
  children,
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
}: { 
  children: React.ReactNode
  className?: string
  side?: TooltipSide
  sideOffset?: number
  align?: TooltipAlign
}) {
  const { open, triggerRef } = React.useContext(TooltipContext)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const offset = sideOffset || 4
      let top = 0
      let left = 0

      switch (side) {
        case 'top':
          top = rect.top - 8
          left = align === 'center' ? rect.left + rect.width / 2 : align === 'end' ? rect.right : rect.left
          break
        case 'bottom':
          top = rect.bottom + 8
          left = align === 'center' ? rect.left + rect.width / 2 : align === 'end' ? rect.right : rect.left
          break
        case 'left':
          top = rect.top + rect.height / 2
          left = rect.left - 8
          break
        case 'right':
          top = rect.top + rect.height / 2
          left = rect.right + 8
          break
      }

      setPosition({ top, left })
    }
  }, [open, side, sideOffset, align, triggerRef])

  if (!open) return null

  const sideClasses: Record<TooltipSide, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses: Record<TooltipSide, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-primary',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-brand-primary',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-brand-primary',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-brand-primary',
  }

  return (
    <div
      ref={tooltipRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: align === 'center' ? 'translateX(-50%)' : align === 'end' ? 'translateX(-100%)' : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      className={cn(sideClasses[side] || sideClasses.top, className)}
    >
      <div className="relative">
        <div className={cn(
          "px-4 py-2.5 rounded-xl text-xs font-bold text-primary-foreground",
          "bg-brand-primary shadow-lg shadow-brand-primary/30",
          "border border-brand-primary/50",
          "backdrop-blur-sm",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}>
          {children}
        </div>
        <div className={cn("absolute w-0 h-0", arrowClasses[side] || arrowClasses.top)} />
      </div>
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
