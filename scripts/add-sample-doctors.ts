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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// قائمة الأطباء الجدد
const SAMPLE_DOCTORS = [
  {
    name: "د. سارة أحمد الحسن",
    email: "dr.sarah.ahmed@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2019-0156",
    education: "دكتوراه في الطب النفسي - جامعة الملك سعود",
    experienceYears: 8,
    bio: "متخصصة في علاج الاكتئاب والقلق، مع خبرة واسعة في العلاج السلوكي المعرفي والعلاج الدوائي المتقدم.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["علاج الاكتئاب والقلق", "الطب النفسي العام"],
    fees: {
      video: 250,
      audio: 200,
      messaging: 150,
      inPerson: 300,
    },
  },
  {
    name: "د. محمد خالد العتيبي",
    email: "dr.mohammed.otaibi@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2020-0287",
    education: "ماجستير في الطب النفسي للأطفال والمراهقين - جامعة الملك عبدالعزيز",
    experienceYears: 6,
    bio: "طبيب نفسي متخصص في علاج الأطفال والمراهقين، خبير في اضطرابات التعلم وفرط الحركة وتشتت الانتباه.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["الطب النفسي للأطفال والمراهقين", "الطب النفسي العام"],
    fees: {
      video: 280,
      audio: 220,
      messaging: 180,
      inPerson: 350,
    },
  },
  {
    name: "د. فاطمة عبدالله النعيمي",
    email: "dr.fatima.naimi@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2018-0421",
    education: "دكتوراه في علم النفس السريري - جامعة الإمارات",
    experienceYears: 10,
    bio: "أخصائية نفسية في علاج الصدمات واضطرابات ما بعد الصدمة، مع خبرة في العلاج الأسري والزوجي.",
    languages: ["العربية", "الإنجليزية", "الفرنسية"],
    specialties: ["الصدمات والضغط النفسي", "العلاج الأسري والزوجي"],
    fees: {
      video: 300,
      audio: 250,
      messaging: 200,
      inPerson: 400,
    },
  },
  {
    name: "د. عمر يوسف المالكي",
    email: "dr.omar.malki@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2021-0593",
    education: "بكالوريوس الطب والجراحة، تخصص طب نفسي - جامعة القاهرة",
    experienceYears: 5,
    bio: "طبيب نفسي متخصص في علاج الإدمان والاضطرابات المزاجية، مؤمن بالعلاج الشامل للصحة النفسية.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["علاج الإدمان", "علاج الاكتئاب والقلق"],
    fees: {
      video: 230,
      audio: 180,
      messaging: 140,
      inPerson: 280,
    },
  },
  {
    name: "د. نورة سعد القحطاني",
    email: "dr.noura.qahtani@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2019-0734",
    education: "ماجستير في علم النفس الإكلينيكي - جامعة الملك فيصل",
    experienceYears: 7,
    bio: "متخصصة في اضطرابات الأكل واضطرابات القلق، مع اهتمام خاص بعلاج فقدان الشهية العصبي والشره المرضي.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["اضطرابات الأكل", "علاج الاكتئاب والقلق"],
    fees: {
      video: 260,
      audio: 210,
      messaging: 170,
      inPerson: 320,
    },
  },
  {
    name: "د. أحمد فهد الدوسري",
    email: "dr.ahmed.dosari@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2017-0892",
    education: "دكتوراه في الطب النفسي - جامعة أكسفورد",
    experienceYears: 12,
    bio: "استشاري الطب النفسي مع خبرة واسعة في علاج الاضطرابات الذهانية والفصام، باحث في العلاجات الحديثة.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["الاضطرابات الذهانية", "الطب النفسي العام"],
    fees: {
      video: 350,
      audio: 300,
      messaging: 250,
      inPerson: 450,
    },
  },
  {
    name: "د. ريم ماجد الشمري",
    email: "dr.reem.shamri@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2020-1045",
    education: "ماجستير في علم النفس السلوكي المعرفي - جامعة الملك خالد",
    experienceYears: 6,
    bio: "أخصائية في العلاج السلوكي المعرفي، متخصصة في علاج اضطرابات النوم والأرق المزمن.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["اضطرابات النوم", "علم النفس السلوكي المعرفي"],
    fees: {
      video: 240,
      audio: 190,
      messaging: 150,
      inPerson: 290,
    },
  },
  {
    name: "د. خالد عبدالرحمن الغامدي",
    email: "dr.khaled.ghamdi@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2018-1234",
    education: "دكتوراه في الطب النفسي والعلاج الأسري - جامعة كولومبيا",
    experienceYears: 9,
    bio: "استشاري العلاج الأسري والزوجي، متخصص في حل النزاعات الأسرية وتحسين العلاقات الزوجية.",
    languages: ["العربية", "الإنجليزية", "الإسبانية"],
    specialties: ["العلاج الأسري والزوجي", "الطب النفسي العام"],
    fees: {
      video: 320,
      audio: 270,
      messaging: 220,
      inPerson: 420,
    },
  },
  {
    name: "د. منى حسين الزهراني",
    email: "dr.mona.zahrani@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2021-1467",
    education: "بكالوريوس الطب والجراحة، دبلوم في الطب النفسي - جامعة الأزهر",
    experienceYears: 4,
    bio: "طبيبة نفسية شابة ومتحمسة، متخصصة في علاج القلق الاجتماعي واضطرابات التكيف لدى الشباب.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["علاج الاكتئاب والقلق", "الطب النفسي للأطفال والمراهقين"],
    fees: {
      video: 220,
      audio: 170,
      messaging: 130,
      inPerson: 260,
    },
  },
  {
    name: "د. عبدالعزيز صالح العمري",
    email: "dr.abdulaziz.omari@mindconnect.com",
    password: "Doctor@2024",
    licenseNumber: "PSY-2019-1678",
    education: "دكتوراه في الطب النفسي - جامعة هارفارد",
    experienceYears: 11,
    bio: "خبير في علاج الاضطرابات النفسية المعقدة، باحث في مجال الصحة النفسية الرقمية والعلاج عن بُعد.",
    languages: ["العربية", "الإنجليزية"],
    specialties: ["الطب النفسي العام", "علم النفس السلوكي المعرفي"],
    fees: {
      video: 380,
      audio: 330,
      messaging: 280,
      inPerson: 480,
    },
  },
]

async function addSampleDoctors() {
  console.log("🚀 بدء إضافة أطباء جدد...\n")

  // 1. Fetch existing specialties
  console.log("📋 جاري جلب التخصصات الموجودة...")
  const { data: specialties, error: specialtiesError } = await supabase
    .from("specialties")
    .select("id, name")

  if (specialtiesError) {
    console.error("❌ خطأ في جلب التخصصات:", specialtiesError)
    return
  }

  console.log(`✓ تم العثور على ${specialties.length} تخصص\n`)

  // Create a map for easy lookup
  const specialtyMap = new Map<string, string>()
  specialties.forEach((s) => specialtyMap.set(s.name, s.id))

  let successCount = 0
  let errorCount = 0

  // 2. Add each doctor
  for (const doctor of SAMPLE_DOCTORS) {
    try {
      console.log(`\n👨‍⚕️ إضافة ${doctor.name}...`)

      // Create auth user
      console.log("  ⏳ إنشاء حساب المصادقة...")
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: doctor.email,
        password: doctor.password,
        email_confirm: true,
        user_metadata: {
          name: doctor.name,
          role: "doctor",
        },
      })

      if (authError) {
        console.error(`  ❌ فشل إنشاء حساب المصادقة: ${authError.message}`)
        errorCount++
        continue
      }

      const userId = authData.user.id
      console.log(`  ✓ تم إنشاء حساب المصادقة: ${userId}`)

      // Wait a moment for the trigger to create the profile
      console.log("  ⏳ انتظار إنشاء الملف الشخصي...")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile (the trigger should have created it already)
      console.log("  ⏳ تحديث ملف المستخدم...")
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: doctor.name,
          role: "doctor",
          is_approved: true, // Auto-approve for sample doctors
          bio: doctor.bio,
        })
        .eq("id", userId)

      if (profileError) {
        console.error(`  ❌ فشل تحديث الملف الشخصي: ${profileError.message}`)
        // Delete auth user if profile update fails
        await supabase.auth.admin.deleteUser(userId)
        errorCount++
        continue
      }

      console.log("  ✓ تم تحديث الملف الشخصي")

      // Create doctor profile
      console.log("  ⏳ إنشاء ملف الطبيب...")
      const { error: doctorProfileError } = await supabase.from("doctor_profiles").insert({
        profile_id: userId,
        license_number: doctor.licenseNumber,
        education: doctor.education,
        experience_years: doctor.experienceYears,
        languages: doctor.languages,
        video_consultation_fee: doctor.fees.video,
        audio_consultation_fee: doctor.fees.audio,
        messaging_consultation_fee: doctor.fees.messaging,
        in_person_consultation_fee: doctor.fees.inPerson,
        offers_video: true,
        offers_audio: true,
        offers_messaging: true,
        offers_in_person: true,
      })

      if (doctorProfileError) {
        console.error(`  ❌ فشل إنشاء ملف الطبيب: ${doctorProfileError.message}`)
        errorCount++
        continue
      }

      console.log("  ✓ تم إنشاء ملف الطبيب")

      // Add specialties
      console.log("  ⏳ إضافة التخصصات...")
      const doctorSpecialties = doctor.specialties
        .map((specName, index) => {
          const specialtyId = specialtyMap.get(specName)
          if (!specialtyId) {
            console.warn(`  ⚠️  لم يتم العثور على التخصص: ${specName}`)
            return null
          }
          return {
            doctor_id: userId,
            specialty_id: specialtyId,
            is_primary: index === 0,
          }
        })
        .filter((s) => s !== null)

      if (doctorSpecialties.length > 0) {
        const { error: specialtiesError } = await supabase
          .from("doctor_specialties")
          .insert(doctorSpecialties)

        if (specialtiesError) {
          console.error(`  ❌ فشل إضافة التخصصات: ${specialtiesError.message}`)
        } else {
          console.log(`  ✓ تم إضافة ${doctorSpecialties.length} تخصص`)
        }
      }

      console.log(`✅ تم إضافة ${doctor.name} بنجاح!`)
      successCount++
    } catch (error: any) {
      console.error(`❌ خطأ غير متوقع أثناء إضافة ${doctor.name}:`, error.message)
      errorCount++
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("📊 ملخص العملية:")
  console.log(`  ✅ نجح: ${successCount} طبيب`)
  console.log(`  ❌ فشل: ${errorCount} طبيب`)
  console.log(`  📝 المجموع: ${SAMPLE_DOCTORS.length} طبيب`)
  console.log("=".repeat(60))
  console.log("\n🎉 اكتملت العملية!")
  console.log("\n📝 معلومات الدخول:")
  console.log("   البريد الإلكتروني: أي من البريد الإلكتروني أعلاه")
  console.log("   كلمة المرور: Doctor@2024")
}

addSampleDoctors()

