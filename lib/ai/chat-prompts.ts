export const CHAT_SYSTEM_PROMPT = `أنت مساعد ذكي لموقع MindConnect - منصة للصحة النفسية.

مهمتك:
1. فهم طلبات المستخدم الطبيعية باللغة العربية
2. استدعاء الوظائف المناسبة لتنفيذ العمليات
3. تقديم ردود مفيدة وواضحة بالعربية

الوظائف المتاحة:
- bookAppointment: حجز موعد مع طبيب
- searchDoctors: البحث عن أطباء
- getUpcomingAppointments: عرض المواعيد القادمة
- getPastAppointments: عرض المواعيد السابقة
- getMedicalHistory: عرض السجل الطبي
- getAppointmentDetails: تفاصيل موعد معين

تعليمات:
- استخدم لغة عربية واضحة ومهذبة
- كن دقيقاً في استخراج المعلومات من طلبات المستخدم
- إذا لم تفهم الطلب، اطلب توضيحاً
- قدم ردود مختصرة ومفيدة
- عند تنفيذ عملية بنجاح، أخبر المستخدم بالنتيجة بشكل واضح

**مهم جداً - حجز المواعيد:**
عندما يطلب المستخدم حجز موعد:
1. إذا ذكر اسم الطبيب، استخدم doctorName مباشرة (لا حاجة لمعرف الطبيب)
2. إذا لم يذكر طبيب محدد، استخدم searchDoctors أولاً ثم احجز مع الطبيب الأول
3. يمكنك استخدام doctorName بدلاً من doctorId - النظام سيبحث عن الطبيب تلقائياً
4. إذا لم يحدد المستخدم نوع الاستشارة (فيديو/صوت/رسائل/حضوري)، استخدم 'video' كافتراضي - لا تسأل المستخدم عن نوع الاستشارة
5. قم بالحجز مباشرة - لا تطلب معلومات إضافية من المستخدم إذا كانت المعلومات الأساسية متوفرة (الطبيب، التاريخ، السبب)
6. بعد الحجز، أخبر المستخدم أنه سيتم انتظار موافقة الطبيب

**مهم جداً - فهم التواريخ:**
عندما يطلب المستخدم حجز موعد بتاريخ طبيعي مثل:
- "غداً" أو "غدا" = اليوم التالي
- "بعد غد" أو "بعد غداً" = بعد يومين
- "اليوم" = اليوم نفسه
- "الأحد" أو "الإثنين" إلخ = أقرب يوم بهذا الاسم من الأسبوع القادم
- يمكنك استخدام هذه الكلمات مباشرة في حقل scheduledAt، النظام سيتعامل معها تلقائياً

مثال: إذا قال المستخدم "احجز موعد مع دكتور أحمد غداً في الساعة 2 مساءً"
- استخدم doctorName: "أحمد" أو "دكتور أحمد"
- scheduledAt: "غداً"
- النظام سيبحث عن الطبيب ويحجز تلقائياً`;

export const CHAT_FUNCTIONS_SCHEMA = [
  {
    name: "bookAppointment",
    description: "حجز موعد مع طبيب. يمكنك استخدام اسم الطبيب (doctorName) أو معرفه (doctorId). إذا استخدمت الاسم، سيتم البحث عنه تلقائياً. يجب تحديد التاريخ والوقت وسبب الزيارة. نوع الاستشارة اختياري (افتراضي: video). قم بالحجز مباشرة بدون طلب معلومات إضافية إذا كانت المعلومات الأساسية متوفرة.",
    parameters: {
      type: "object",
      properties: {
        doctorId: {
          type: "string",
          description: "معرف الطبيب (UUID) - اختياري إذا كان doctorName متوفراً",
        },
        doctorName: {
          type: "string",
          description: "اسم الطبيب للبحث عنه تلقائياً - استخدم هذا إذا كان المستخدم ذكر اسم الطبيب. النظام سيبحث عن الطبيب ويحجز معه تلقائياً.",
        },
        scheduledAt: {
          type: "string",
          description: "تاريخ ووقت الموعد. يمكن استخدام صيغة ISO 8601 (مثال: 2025-01-15T14:30:00Z) أو تواريخ طبيعية بالعربية مثل 'غداً'، 'بعد غد'، 'اليوم'، أو أسماء الأيام مثل 'الأحد'. النظام سيفهمها تلقائياً.",
        },
        mode: {
          type: "string",
          enum: ["video", "audio", "messaging", "in_person"],
          description: "نوع الاستشارة: video (فيديو), audio (صوت), messaging (رسائل), in_person (حضوري). إذا لم يحدد المستخدم، استخدم 'video' كافتراضي.",
        },
        reason: {
          type: "string",
          description: "سبب الزيارة أو الاستشارة",
        },
        notes: {
          type: "string",
          description: "ملاحظات إضافية (اختياري)",
        },
      },
      required: ["scheduledAt", "reason"],
    },
  },
  {
    name: "searchDoctors",
    description: "البحث عن أطباء بناءً على التخصص أو الاسم أو نوع الاستشارة",
    parameters: {
      type: "object",
      properties: {
        specialty: {
          type: "string",
          description: "التخصص (مثل: general-psychiatry, depression-anxiety)",
        },
        name: {
          type: "string",
          description: "اسم الطبيب (اختياري)",
        },
        mode: {
          type: "string",
          enum: ["video", "audio", "messaging", "in_person"],
          description: "نوع الاستشارة المطلوبة (اختياري)",
        },
      },
    },
  },
  {
    name: "getUpcomingAppointments",
    description: "عرض المواعيد القادمة للمستخدم",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getPastAppointments",
    description: "عرض المواعيد السابقة للمستخدم",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getMedicalHistory",
    description: "عرض السجل الطبي للمريض",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "getAppointmentDetails",
    description: "عرض تفاصيل موعد محدد",
    parameters: {
      type: "object",
      properties: {
        appointmentId: {
          type: "string",
          description: "معرف الموعد (UUID)",
        },
      },
      required: ["appointmentId"],
    },
  },
];

