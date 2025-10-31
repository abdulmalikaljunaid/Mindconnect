"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_URL is not set")
}

if (!supabaseAnonKey) {
  console.warn("Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
}

export const supabaseClient = createBrowserClient<Database>(supabaseUrl as string, supabaseAnonKey as string)

