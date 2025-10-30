"use client"

import { Button } from "@/components/ui/button"
import type React from "react"

interface GoogleButtonProps extends Omit<React.ComponentProps<typeof Button>, "type"> {
  children: React.ReactNode
}

export function GoogleButton({ children, className, ...props }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${className || ""}`}
      {...props}
    >
      <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.61l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.15c-.22-.66-.35-1.36-.35-2.15s.13-1.49.35-2.15V7.01H2.18C1.43 8.15 1 9.45 1 10.75s.43 2.6 1.18 3.74l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.66 2.84c.87-2.6 3.3-4.47 6.16-4.47z"
          fill="#EA4335"
        />
      </svg>
      {children}
    </Button>
  )
}



