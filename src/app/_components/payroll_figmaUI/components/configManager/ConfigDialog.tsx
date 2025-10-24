import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ConfigDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="config-dialog" {...props} />;
}

function ConfigDialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="config-dialog-trigger" {...props} />;
}

function ConfigDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="config-dialog-portal" {...props} />;
}

function ConfigDialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="config-dialog-close" {...props} />;
}

function ConfigDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="config-dialog-overlay"
      className={cn(
        "config-dialog-overlay-custom", // Custom class for CSS targeting
        className,
      )}
      {...props}
    />
  );
}

function ConfigDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <ConfigDialogPortal data-slot="config-dialog-portal">
      <ConfigDialogOverlay />
      <DialogPrimitive.Content
        data-slot="config-dialog-content"
        className={cn(
          "config-dialog-content-custom", // Custom class for CSS targeting
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <X />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ConfigDialogPortal>
  );
}

function ConfigDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="config-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function ConfigDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="config-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function ConfigDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="config-dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function ConfigDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="config-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  ConfigDialog,
  ConfigDialogClose,
  ConfigDialogContent,
  ConfigDialogDescription,
  ConfigDialogFooter,
  ConfigDialogHeader,
  ConfigDialogOverlay,
  ConfigDialogPortal,
  ConfigDialogTitle,
  ConfigDialogTrigger,
};
