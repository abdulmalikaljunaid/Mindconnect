import { NextResponse } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type { Database } from "@/lib/database.types"

interface ConfirmSignupRequest {
  userId?: string
  email?: string
  name?: string
  role?: string
}

export async function POST(request: Request) {
  try {
    const { userId, email, name, role } = (await request.json()) as ConfirmSignupRequest

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const adminClient = getSupabaseAdminClient()

    // Get user data to extract metadata
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
    
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userData.user

    // Confirm email
    const { error: confirmError } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (confirmError) {
      return NextResponse.json({ error: confirmError.message }, { status: confirmError.status ?? 400 })
    }

    // Check if profile exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    // Create profile if it doesn't exist
    if (!existingProfile) {
      const userRole = (role || user.user_metadata?.role || "patient") as Database['public']['Enums']['role_type']
      
      // Validate role
      const validRole = userRole === "patient" || userRole === "companion" ? userRole : "patient"

      const userName = name || user.user_metadata?.name || user.email?.split("@")[0] || "User"
      const userEmail = email || user.email || ""

      const newProfile: Database['public']['Tables']['profiles']['Insert'] = {
        id: userId,
        email: userEmail,
        name: userName,
        role: validRole,
        is_approved: userRole === "patient" || userRole === "companion", // Auto-approve patients and companions
        avatar_url: (user.user_metadata?.avatar_url as string | null) ?? null,
      }

      const { error: insertError } = await adminClient
        .from("profiles")
        .insert([newProfile] as any)

      if (insertError) {
        console.error("Error creating profile:", insertError)
        // Don't fail if profile already exists (duplicate key error)
        if (insertError.code !== "23505") {
          return NextResponse.json(
            { error: `Failed to create profile: ${insertError.message}` },
            { status: 500 }
          )
        }
      }
    } else if (email) {
      // Update email if profile exists and email is provided
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



