import React from 'react'
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 200,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

interface TooltipContentProps 
  extends TooltipPrimitive.Popup.Props, 
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> {
    showArrow?: boolean
  }

function TooltipContent({
  className,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  children,
  showArrow = false,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50 will-change-transform"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // 1. Layout & Typography (matching your design system)
            "z-50 overflow-hidden rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-normal select-none",
            
            // 2. Color System Integration (using your precise HSL tokens)
            "bg-popover text-popover-foreground border border-border shadow-md",
            
            // 3. Tailwind v4 Architecture State Animations
            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
            
            // 4. Directional slide-ins using your custom @utility rules
            "data-[side=bottom]:data-[state=open]:slide-in-from-top-1",
            "data-[side=left]:data-[state=open]:slide-in-from-right-1",
            "data-[side=right]:data-[state=open]:slide-in-from-left-1",
            "data-[side=top]:data-[state=open]:slide-in-from-bottom-1",
            
            className
          )}
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipPrimitive.Arrow className="fill-popover stroke-border stroke-[1px]" />
          )}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }