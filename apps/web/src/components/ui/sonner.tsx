"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Shared toast design — white background, green border and text.
//
// Applied via Sonner CSS custom properties so every toast type (success,
// error, warning, info, loading, default) inherits the same appearance
// without per-call overrides.
//
// Variables reference:
//   --normal-*   → base / toast() calls
//   --success-*  → toast.success()
//   --error-*    → toast.error()
//   --warning-*  → toast.warning()  (Sonner falls back to --normal-* if unset)
//   --info-*     → toast.info()     (same fallback)
// ─────────────────────────────────────────────────────────────────────────────
const TOAST_BG     = "#ffffff"
const TOAST_TEXT   = "#15803d"   // green-700
const TOAST_BORDER = "#16a34a"   // green-600

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon        className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon    className="size-4" />,
        loading: <Loader2Icon     className="size-4 animate-spin" />,
      }}
      style={
        {
          // Base (toast() / toast.message())
          "--normal-bg":     TOAST_BG,
          "--normal-text":   TOAST_TEXT,
          "--normal-border": TOAST_BORDER,

          // toast.success()
          "--success-bg":     TOAST_BG,
          "--success-text":   TOAST_TEXT,
          "--success-border": TOAST_BORDER,

          // toast.error()
          "--error-bg":     TOAST_BG,
          "--error-text":   TOAST_TEXT,
          "--error-border": TOAST_BORDER,

          // Shape / radius — unchanged from original
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          // Colour the icon to match the text so it inherits the green
          icon: "text-[#16a34a]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
