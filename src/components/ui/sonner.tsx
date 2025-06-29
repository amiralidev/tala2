"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster !text-black group"
      style={
        {
          "--normal-bg": "var(--popover)",
          // "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          fontFamily: "var(--font-iransans)",
          fontWeight: "bold",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
