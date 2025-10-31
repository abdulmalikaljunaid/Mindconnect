/**
 * Script to check and add availability for a specific doctor
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

// Read .env.local file manually
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
    const lines = envFile.split("\n")
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith("#") || !trimmed) continue
      
      const [key, ...valueParts] = trimmed.split("=")
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "")
      
      if (key === "NEXT_PUBLIC_SUPABASE_URL") {
        supabaseUrl = value
      } else if (key === "SUPABASE_SERVICE_ROLE_KEY") {
        serviceRoleKey = value
      }
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEFAULT_AVAILABILITY = [
  { weekday: 0, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 },
  { weekday: 1, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 },
  { weekday: 2, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 },
  { weekday: 3, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 },
  { weekday: 4, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 },
]

async function checkAndAddAvailability(doctorId: string) {
  try {
    console.log(`🔍 التحقق من الطبيب: ${doctorId}...`)

    // Check if doctor exists and is approved
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, role, is_approved")
      .eq("id", doctorId)
      .single()

    if (!profile) {
      console.error(`❌ الطبيب ${doctorId} غير موجود في قاعدة البيانات`)
      return
    }

    if (profile.role !== "doctor") {
      console.error(`❌ المستخدم ${doctorId} ليس طبيباً`)
      return
    }

    if (!profile.is_approved) {
      console.error(`❌ الطبيب ${doctorId} غير معتمد`)
      return
    }

    console.log(`✅ الطبيب موجود ومعتمد: ${profile.name}`)

    // Check existing availability
    const { data: existingAvailability } = await supabase
      .from("doctor_availability")
      .select("weekday, start_time, end_time, is_active")
      .eq("doctor_id", doctorId)
      .eq("is_active", true)

    console.log(`📅 الأوقات الموجودة: ${existingAvailability?.length || 0}`)
    if (existingAvailability && existingAvailability.length > 0) {
      existingAvailability.forEach(avail => {
        const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
        console.log(`  - ${dayNames[avail.weekday]}: ${avail.start_time} - ${avail.end_time}`)
      })
    }

    // Add default availability if missing
    const existingWeekdays = new Set(existingAvailability?.map(a => a.weekday) || [])
    const availabilityToInsert = DEFAULT_AVAILABILITY
      .filter(avail => !existingWeekdays.has(avail.weekday))
      .map((avail) => ({
        ...avail,
        doctor_id: doctorId,
        is_active: true,
      }))

    if (availabilityToInsert.length === 0) {
      console.log(`✅ الطبيب لديه أوقات توفر كاملة`)
      return
    }

    console.log(`➕ إضافة ${availabilityToInsert.length} أيام توفر...`)

    const { error } = await supabase
      .from("doctor_availability")
      .insert(availabilityToInsert)

    if (error) {
      console.error(`❌ فشل إضافة الأوقات:`, error.message)
    } else {
      console.log(`✅ تم إضافة الأوقات بنجاح!`)
    }
  } catch (error: any) {
    console.error(`❌ خطأ:`, error.message)
  }
}

// Get doctor ID from command line or use the one from the image
const doctorId = process.argv[2] || "b0d947bb-a8d7-4822-9148-535da827b2e6"

checkAndAddAvailability(doctorId)
  .then(() => {
    console.log("\n✨ تم الانتهاء!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ فشل:", error)
    process.exit(1)
  })





