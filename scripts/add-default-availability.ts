/**
 * Script to add default availability for all approved doctors
 * Run with: npx tsx scripts/add-default-availability.ts
 * 
 * Note: Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment
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
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  console.error("\nPlease set these in your .env.local file")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Default availability: Sunday to Thursday, 9 AM to 5 PM, 30-minute slots
const DEFAULT_AVAILABILITY = [
  { weekday: 0, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }, // Sunday
  { weekday: 1, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }, // Monday
  { weekday: 2, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }, // Tuesday
  { weekday: 3, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }, // Wednesday
  { weekday: 4, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30 }, // Thursday
]

async function addDefaultAvailability() {
  try {
    console.log("🔍 جلب قائمة الأطباء المعتمدين...")

    // Get all approved doctors
    const { data: doctorProfiles, error: fetchError } = await supabase
      .from("doctor_profiles")
      .select("profile_id")
      .eq("approval_status", "approved")

    if (fetchError) {
      console.error("❌ فشل جلب قائمة الأطباء:", fetchError.message)
      return
    }

    if (!doctorProfiles || doctorProfiles.length === 0) {
      console.log("⚠️  لا توجد أطباء معتمدين في النظام")
      return
    }

    console.log(`✅ تم العثور على ${doctorProfiles.length} طبيب معتمد\n`)

    let successCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const doctor of doctorProfiles) {
      const doctorId = doctor.profile_id

      try {
        // Check if doctor already has availability for ALL weekdays
        const { data: existingAvailability } = await supabase
          .from("doctor_availability")
          .select("weekday")
          .eq("doctor_id", doctorId)
          .eq("is_active", true)

        // If doctor has availability for all 5 weekdays (Sun-Thu), skip
        const existingWeekdays = new Set(existingAvailability?.map(a => a.weekday) || [])
        const requiredWeekdays = new Set([0, 1, 2, 3, 4]) // Sunday to Thursday
        
        if (existingWeekdays.size >= 5 && [...requiredWeekdays].every(d => existingWeekdays.has(d))) {
          console.log(`⏭️  الدكتور ${doctorId} لديه أوقات توفر كاملة - تم التخطي`)
          skippedCount++
          continue
        }

        // If doctor has partial availability, add missing weekdays
        if (existingWeekdays.size > 0) {
          console.log(`⚠️  الدكتور ${doctorId} لديه أوقات توفر جزئية - سيتم إضافة الأيام المفقودة`)
        }

        // Add default availability only for missing weekdays
        const availabilityToInsert = DEFAULT_AVAILABILITY
          .filter(avail => !existingWeekdays.has(avail.weekday))
          .map((avail) => ({
            ...avail,
            doctor_id: doctorId,
            is_active: true,
          }))

        if (availabilityToInsert.length === 0) {
          console.log(`⏭️  الدكتور ${doctorId} لديه جميع الأيام - تم التخطي`)
          skippedCount++
          continue
        }

        const { error: insertError } = await supabase
          .from("doctor_availability")
          .insert(availabilityToInsert)

        if (insertError) {
          console.error(`❌ فشل إضافة الأوقات للدكتور ${doctorId}:`, insertError.message)
          errorCount++
        } else {
          console.log(`✅ تم إضافة أوقات التوفر الافتراضية للدكتور ${doctorId}`)
          successCount++
        }
      } catch (err: any) {
        console.error(`❌ خطأ في إضافة الأوقات للدكتور ${doctorId}:`, err.message)
        errorCount++
      }
    }

    console.log("\n" + "=".repeat(50))
    console.log("📊 ملخص النتائج:")
    console.log(`✅ نجح: ${successCount}`)
    console.log(`⏭️  تم التخطي: ${skippedCount}`)
    console.log(`❌ فشل: ${errorCount}`)
    console.log("=".repeat(50))
  } catch (error: any) {
    console.error("❌ خطأ عام:", error.message)
  }
}

// Run the script
addDefaultAvailability()
  .then(() => {
    console.log("\n✨ تم الانتهاء!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ فشل السكربت:", error)
    process.exit(1)
  })

