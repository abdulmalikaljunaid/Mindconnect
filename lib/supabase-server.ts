import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export function createSupabaseServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Cookie may have been deleted or already set
          console.warn("Failed to set cookie:", error)
        }
      },
      remove(name: string, options?: any) {
        try {
          cookieStore.delete({ name, ...options })
        } catch (error) {
          // Cookie may have been already deleted
          console.warn("Failed to delete cookie:", error)
        }
      },
    },
  })
}




