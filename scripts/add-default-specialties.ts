import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env.local")
    const envContent = readFileSync(envPath, "utf-8")
    
    envContent.split("\n").forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        const value = valueParts.join("=").trim()
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.error("❌ فشل قراءة ملف .env.local")
    process.exit(1)
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ متغيرات البيئة غير موجودة. تأكد من وجود ملف .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DEFAULT_SPECIALTIES = [
  {
    name: "الطب النفسي العام",
    slug: "general-psychiatry",
    description: "التشخيص والعلاج الشامل للاضطرابات النفسية"
  },
  {
    name: "علاج الاكتئاب والقلق",
    slug: "depression-anxiety",
    description: "التخصص في علاج اضطرابات المزاج والقلق"
  },
  {
    name: "الطب النفسي للأطفال والمراهقين",
    slug: "child-adolescent",
    description: "الصحة النفسية للأطفال والمراهقين"
  },
  {
    name: "علاج الإدمان",
    slug: "addiction-treatment",
    description: "علاج إدمان المخدرات والكحول"
  },
  {
    name: "اضطرابات الأكل",
    slug: "eating-disorders",
    description: "علاج اضطرابات الأكل مثل فقدان الشهية والشره"
  },
  {
    name: "الاضطرابات الذهانية",
    slug: "psychotic-disorders",
    description: "علاج الفصام والاضطرابات الذهانية"
  },
  {
    name: "العلاج الأسري والزوجي",
    slug: "family-couples-therapy",
    description: "استشارات العلاقات والعلاج الأسري"
  },
  {
    name: "اضطرابات النوم",
    slug: "sleep-disorders",
    description: "تشخيص وعلاج اضطرابات النوم"
  },
  {
    name: "الصدمات والضغط النفسي",
    slug: "trauma-ptsd",
    description: "علاج اضطراب ما بعد الصدمة والضغط النفسي"
  },
  {
    name: "علم النفس السلوكي المعرفي",
    slug: "cognitive-behavioral",
    description: "العلاج السلوكي المعرفي والتدخلات النفسية"
  }
]

async function addDefaultSpecialties() {
  console.log("🚀 بدء إضافة التخصصات الافتراضية...")

  // 1. إضافة التخصصات إلى الجدول
  for (const specialty of DEFAULT_SPECIALTIES) {
    const { data: existing, error: checkError } = await supabase
      .from("specialties")
      .select("id")
      .eq("slug", specialty.slug)
      .single()

    if (existing) {
      console.log(`✓ التخصص "${specialty.name}" موجود بالفعل`)
      continue
    }

    const { error } = await supabase
      .from("specialties")
      .insert(specialty)

    if (error) {
      console.error(`✗ فشل إضافة "${specialty.name}":`, error.message)
    } else {
      console.log(`✓ تم إضافة "${specialty.name}"`)
    }
  }

  console.log("\n📋 جاري جلب قائمة الأطباء...")

  // 2. جلب جميع الأطباء
  const { data: doctors, error: doctorsError } = await supabase
    .from("doctor_profiles")
    .select("profile_id")

  if (doctorsError) {
    console.error("✗ فشل جلب الأطباء:", doctorsError)
    return
  }

  if (!doctors || doctors.length === 0) {
    console.log("⚠️ لا يوجد أطباء في قاعدة البيانات")
    return
  }

  console.log(`✓ تم العثور على ${doctors.length} طبيب\n`)

  // 3. جلب التخصصات
  const { data: specialties, error: specialtiesError } = await supabase
    .from("specialties")
    .select("id, name")

  if (specialtiesError || !specialties || specialties.length === 0) {
    console.error("✗ فشل جلب التخصصات")
    return
  }

  console.log("🎯 إضافة تخصصات عشوائية للأطباء...\n")

  // 4. إضافة تخصصات عشوائية لكل دكتور
  for (const doctor of doctors) {
    // اختيار 1-3 تخصصات عشوائية
    const numSpecialties = Math.floor(Math.random() * 3) + 1
    const shuffled = [...specialties].sort(() => 0.5 - Math.random())
    const selectedSpecialties = shuffled.slice(0, numSpecialties)

    // التحقق من وجود تخصصات للدكتور
    const { data: existing } = await supabase
      .from("doctor_specialties")
      .select("id")
      .eq("doctor_id", doctor.profile_id)

    if (existing && existing.length > 0) {
      console.log(`⏭️  الدكتور (${doctor.profile_id}) لديه تخصصات بالفعل`)
      continue
    }

    const specialtyInserts = selectedSpecialties.map((spec, index) => ({
      doctor_id: doctor.profile_id,
      specialty_id: spec.id,
      is_primary: index === 0
    }))

    const { error } = await supabase
      .from("doctor_specialties")
      .insert(specialtyInserts)

    if (error) {
      console.error(`✗ فشل إضافة تخصصات للدكتور ${doctor.profile_id}:`, error.message)
    } else {
      const specialtyNames = selectedSpecialties.map(s => s.name).join("، ")
      console.log(`✓ تم إضافة التخصصات للدكتور: ${specialtyNames}`)
    }
  }

  console.log("\n✅ تمت العملية بنجاح!")
}

addDefaultSpecialties()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ حدث خطأ:", error)
    process.exit(1)
  })

