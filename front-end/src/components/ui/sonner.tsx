import { Toaster as SonnerToaster } from "sonner"
import { type ToasterProps } from "sonner"
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      <style>{`
        [data-sonner-toaster][data-sonner-theme='light'] {
          --success-bg: #059669;
          --success-border: #059669;
          --success-text: #ffffff;
          --info-bg: #2563eb;
          --info-border: #2563eb;
          --info-text: #ffffff;
          --warning-bg: #d97706;
          --warning-border: #d97706;
          --warning-text: #ffffff;
          --error-bg: #dc2626;
          --error-border: #dc2626;
          --error-text: #ffffff;
        }

        [data-sonner-toast] {
          width: auto !important;
          min-width: auto !important;
          max-width: fit-content !important;
          padding-left: 14px !important;
          padding-right: 14px !important;
          border-radius: 9999px !important;
        }

        [data-sonner-toast] [data-sonner-icon] {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
      <SonnerToaster
        className="toaster group"
        position="bottom-center"
        style={{ zIndex: 9999999999 }}
        richColors
        icons={{
          success: <CheckCircle2 className="size-[18px] text-white" strokeWidth={2.5} />,
          error: <XCircle className="size-[18px] text-white" strokeWidth={2.5} />,
          info: <Info className="size-[18px] text-white" strokeWidth={2.5} />,
          warning: <AlertTriangle className="size-[18px] text-white" strokeWidth={2.5} />,
        }}
        toastOptions={{
          classNames: {
            toast:
              "flex items-center gap-2.5 whitespace-nowrap shadow-lg",
            description: "text-white/90",
            actionButton:
              "group-[.toast]:bg-white/20 group-[.toast]:text-white",
            cancelButton:
              "group-[.toast]:bg-white/20 group-[.toast]:text-white",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
