"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// richColors is required to activate Sonner v2's type-specific colour selectors
// (success/error/warning/info). Without it every toast uses the --normal-* variables.

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
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
          "--normal-bg":     "#ffffff",
          "--normal-text":   "#1c1a14",
          "--normal-border": "#d4cfc6",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
