
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={3000}
      visibleToasts={1}
      closeButton={true}
      position="bottom-right"
      expand={false}
      richColors={false}
      toastOptions={{
        style: {
          fontSize: '14px',
          backgroundColor: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-800 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: 
            "group-[.toast]:bg-white group-[.toast]:text-gray-800 group-[.toast]:border-gray-200",
          error:
            "group-[.toast]:bg-white group-[.toast]:text-gray-800 group-[.toast]:border-gray-200",
          icon: "group-[.toast]:text-green-600",
          closeButton: "group-[.toast]:bg-white group-[.toast]:text-gray-600 group-[.toast]:border-gray-200 group-[.toast]:hover:bg-gray-50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
export default Toaster as typeof Sonner
