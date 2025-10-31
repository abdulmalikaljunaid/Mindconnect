import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// التحقق من وجود المتغيرات البيئية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.error("SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓" : "✗")
}

// استخدام Service Role Key للوصول الكامل
const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

// Ensure no caching for admin creation endpoint
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // التحقق من وجود supabaseAdmin
    if (!supabaseAdmin) {
      console.error("Supabase Admin client is not initialized")
      return NextResponse.json(
        { 
          error: "خطأ في إعداد الخادم - SUPABASE_SERVICE_ROLE_KEY غير موجود في ملف .env.local",
          details: "يرجى إضافة SUPABASE_SERVICE_ROLE_KEY في ملف .env.local"
        },
        { status: 500 }
      )
    }

    const { email, password, name, secret } = await request.json()

    // التحقق من السر
    const expectedSecret = process.env.ADMIN_CREATION_SECRET || "mindconnect-admin-2024"
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "غير مصرح - كلمة السر الإدارية غير صحيحة" },
        { status: 401 }
      )
    }

    // التحقق من البيانات
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور والاسم مطلوبة" },
        { status: 400 }
      )
    }

    // إنشاء المستخدم في Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: "admin"
      }
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: `فشل إنشاء المستخدم: ${authError.message}` },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "فشل إنشاء المستخدم" },
        { status: 500 }
      )
    }

    // إنشاء الملف الشخصي
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        name,
        email,
        role: "admin",
        is_approved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error("Profile error:", profileError)
      // حذف المستخدم من Auth إذا فشل إنشاء الملف الشخصي
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `فشل إنشاء الملف الشخصي: ${profileError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name
      },
      message: "تم إنشاء حساب الأدمن بنجاح!"
    })

  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ غير متوقع" },
      { status: 500 }
    )
  }
}

