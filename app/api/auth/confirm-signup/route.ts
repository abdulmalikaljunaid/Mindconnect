import { NextResponse } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase-admin"

interface ConfirmSignupRequest {
  userId?: string
  email?: string
}

// Always dynamic to reflect immediate auth state changes
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId, email } = (await request.json()) as ConfirmSignupRequest

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const adminClient = getSupabaseAdminClient()

    const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: confirmError.status ?? 400 })
    }

    if (email) {
      await adminClient
        .from("profiles")
        .update({ email })
        .eq("id", userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to confirm signup", error)
    return NextResponse.json({ error: "Failed to confirm signup" }, { status: 500 })
  }
}



