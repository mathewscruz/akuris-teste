import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={true}
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-elegant group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-h-[64px] group-[.toaster]:relative group-[.toaster]:overflow-hidden group-[.toaster]:backdrop-blur-sm",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-tight group-[.toast]:mb-1",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:border-0 group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:absolute group-[.toast]:top-2 group-[.toast]:right-2 group-[.toast]:w-5 group-[.toast]:h-5",
          success:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-success group-[.toaster]:bg-success/5",
          error:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-destructive group-[.toaster]:bg-destructive/5",
          warning:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-warning group-[.toaster]:bg-warning/5",
          info:
            "group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary group-[.toaster]:bg-primary/5",
        },
        style: {
          animation: 'slideInFromRight 0.3s ease-out forwards',
        }
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
