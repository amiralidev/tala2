"use client"

import { DirectionProvider } from "@radix-ui/react-direction"

export function Providers({ children }: { children: React.ReactNode }) {
  return <DirectionProvider dir="rtl">{children}</DirectionProvider>
}
