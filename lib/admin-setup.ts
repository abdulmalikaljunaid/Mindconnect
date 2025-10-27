/**
 * وظائف إدارية آمنة - للمطورين فقط
 * هذه الوظائف يجب أن تُستخدم فقط في بيئة التطوير أو من قبل المطورين المعتمدين
 */

import { supabaseClient } from "@/lib/supabase-client"
import type { UserRole } from "@/lib/auth"

/**
 * إنشاء حساب إداري جديد (للمطورين فقط)
 * يجب استخدام هذه الوظيفة فقط في بيئة آمنة
 */
export async function createAdminAccount(
  email: string, 
  password: string, 
  name: string,
  adminSecret: string
) {
  // التحقق من السر الإداري
  const expectedSecret = process.env.ADMIN_CREATION_SECRET || "super-secret-admin-key-2024"
  if (!expectedSecret || adminSecret !== expectedSecret) {
    throw new Error("Unauthorized: Invalid admin creation secret")
  }

  // إنشاء الحساب الإداري مباشرة في قاعدة البيانات
  const { data: userId, error } = await supabaseClient.rpc('create_admin_account_direct', {
    admin_email: email,
    admin_name: name
  })

  if (error) {
    throw error
  }

  return {
    id: userId,
    email,
    name,
    role: "admin" as UserRole,
  }
}

/**
 * ترقية مستخدم موجود إلى إداري (للمطورين فقط)
 */
export async function promoteToAdmin(
  userId: string,
  adminSecret: string
) {
  // التحقق من السر الإداري
  const expectedSecret = process.env.ADMIN_CREATION_SECRET || "super-secret-admin-key-2024"
  if (!expectedSecret || adminSecret !== expectedSecret) {
    throw new Error("Unauthorized: Invalid admin creation secret")
  }

  // تحديث الدور إلى إداري
  const { error } = await supabaseClient
    .from("profiles")
    .update({ 
      role: "admin",
      is_approved: true 
    })
    .eq("id", userId)

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * قائمة بجميع الإداريين (للمطورين فقط)
 */
export async function listAdmins(adminSecret: string) {
  // التحقق من السر الإداري
  const expectedSecret = process.env.ADMIN_CREATION_SECRET || "super-secret-admin-key-2024"
  if (!expectedSecret || adminSecret !== expectedSecret) {
    throw new Error("Unauthorized: Invalid admin creation secret")
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return data
}
