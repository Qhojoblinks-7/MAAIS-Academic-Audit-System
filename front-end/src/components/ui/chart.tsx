"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipContentProps, TooltipPayloadEntry } from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color

    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  )
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { config: ChartConfig }
>(({ id, config, className, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart-container"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-hidden",
          "[&_.recharts-sector]:outline-hidden",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = React.ComponentPropsWithoutRef<"div"> &
  TooltipContentProps & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    labelClassName?: string
    color?: string
  }

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      labelClassName,
      labelFormatter,
      labelKey,
      nameKey,
      color,
      ...props
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const item = payload[0] as TooltipPayloadEntry
      const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)

      const value =
        !labelKey && typeof label === "string"
          ? config[label]?.label ?? label
          : itemConfig?.label

      if (labelFormatter) {
        const formatted = labelFormatter(value, payload)
        return (
          <div className={cn("font-medium", labelClassName)}>
            {formatted}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      active,
      payload,
      label,
      hideLabel,
      labelFormatter,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {(payload as TooltipPayloadEntry[])
            .filter((item) => item.type !== "none")
            .map((item) => {
              const key = `${nameKey ?? item?.dataKey ?? item?.name ?? "value"}`
              const itemConfig = getPayloadConfigFromPayload(config, item, key)

              const indicatorColor = color ?? item.color

              return (
                <div
                  key={item.dataKey?.toString()}
                  className="flex items-center gap-2"
                >
                  {!hideIndicator && (
                    <div
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-[2px]",
                        indicator === "line" && "h-4 w-2.5 shrink-0 rounded-none",
                        indicator === "dashed" && "h-4 w-2.5 shrink-0 rounded-none",
                      )}
                      style={{ backgroundColor: indicatorColor }}
                    />
                  )}
                  <div className="flex flex-1 justify-between">
                    <span className="text-muted-foreground">
                      {itemConfig?.label ?? item?.name}
                    </span>
                    {item.value !== undefined && (
                      <span className="font-mono tabular-nums">
                        {typeof item.value === "number"
                          ? item.value.toLocaleString()
                          : item.value}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string,
) {
  if (!payload) return undefined

  const payloadPayload = payload?.payload

  let configLabelKey: string = key

  if (typeof payload[key] === "string") {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return config[configLabelKey] ?? config[key]
}

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
}
