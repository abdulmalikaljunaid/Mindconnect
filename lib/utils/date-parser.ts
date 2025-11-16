/**
 * دالة لتحويل التواريخ الطبيعية بالعربية إلى تاريخ ISO
 */

export function parseNaturalDate(dateString: string, timeString?: string): string | null {
  if (!dateString) return null;

  // دمج التاريخ والوقت في نص واحد للبحث
  const fullText = timeString ? `${dateString} ${timeString}` : dateString;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // تنظيف النص للبحث عن التاريخ
  const dateOnly = dateString.toLowerCase().trim();
  
  // التواريخ النسبية الشائعة
  const relativeDates: Record<string, number> = {
    "اليوم": 0,
    "غداً": 1,
    "غدا": 1,
    "بعد غد": 2,
    "بعد غداً": 2,
    "بعد غدا": 2,
    "بعد غدٍ": 2,
  };

  // الأيام بالأسبوع
  const weekdays: Record<string, number> = {
    "الأحد": 0,
    "الاحد": 0,
    "الإثنين": 1,
    "الاثنين": 1,
    "الثلاثاء": 2,
    "الاربعاء": 3,
    "الأربعاء": 3,
    "الخميس": 4,
    "الجمعة": 5,
    "السبت": 6,
  };

  let targetDate = new Date(today);

  // التحقق من التواريخ النسبية
  if (relativeDates[dateOnly] !== undefined) {
    targetDate.setDate(today.getDate() + relativeDates[dateOnly]);
  }
  // التحقق من أيام الأسبوع
  else if (weekdays[dateOnly] !== undefined) {
    const targetDay = weekdays[dateOnly];
    const currentDay = today.getDay();
    let daysToAdd = targetDay - currentDay;
    
    // إذا كان اليوم المطلوب هو اليوم نفسه أو مضى، نأخذه الأسبوع القادم
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    targetDate.setDate(today.getDate() + daysToAdd);
  }
  // محاولة parsing التاريخ مباشرة
  else {
    try {
      // محاولة parsing بصيغ مختلفة
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      } else {
        return null; // لا يمكن parsing التاريخ
      }
    } catch {
      return null;
    }
  }

  // محاولة استخراج الوقت من نفس النص إذا كان موجوداً
  const timePattern = /(\d{1,2}):?(\d{2})?\s*(صباح|مساء|م|ص|PM|AM)?|(الساعة|ساعة)\s*(\d{1,2})/i;
  const timeMatch = fullText.match(timePattern);
  
  let hours = 9; // الوقت الافتراضي: 9 صباحاً
  let minutes = 0;

  if (timeString || timeMatch) {
    const timeStr = timeString || timeMatch?.[0] || "";
    
    // البحث عن رقم الوقت
    const hourMatch = fullText.match(/(\d{1,2}):?(\d{2})?/);
    if (hourMatch) {
      hours = parseInt(hourMatch[1]);
      minutes = parseInt(hourMatch[2] || "0");
      
      // التحقق من صباح/مساء في النص الكامل
      const lowerFullText = fullText.toLowerCase();
      if (lowerFullText.includes("مساء") || lowerFullText.includes("مساءً") || lowerFullText.match(/\d+\s*م\b/) || lowerFullText.includes("pm")) {
        if (hours < 12 && hours > 0) hours += 12;
      } else if (lowerFullText.includes("صباح") || lowerFullText.match(/\d+\s*ص\b/) || lowerFullText.includes("am")) {
        if (hours === 12) hours = 0;
      }
    } else {
      // تحويل أوقات نصية شائعة
      const timeKeywords: Record<string, number> = {
        "صباح": 9,
        "الصباح": 9,
        "ظهر": 12,
        "الظهر": 12,
        "عصر": 15,
        "العصر": 15,
        "مساء": 18,
        "المساء": 18,
        "ليل": 20,
        "الليل": 20,
      };
      
      for (const [key, hour] of Object.entries(timeKeywords)) {
        if (fullText.toLowerCase().includes(key)) {
          hours = hour;
          break;
        }
      }
    }
  }

  targetDate.setHours(hours, minutes, 0, 0);

  // إرجاع التاريخ بصيغة ISO
  return targetDate.toISOString();
}

/**
 * تحسين التاريخ الطبيعي من رسالة المستخدم
 */
export function extractDateFromMessage(message: string): { date: string | null; time: string | null } {
  // أنماط للبحث عن التواريخ والأوقات
  const datePatterns = [
    /(اليوم|غداً|غدا|بعد غد|بعد غداً|بعد غدا)/i,
    /(الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الاربعاء|الأربعاء|الخميس|الجمعة|السبت)/,
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
  ];

  const timePatterns = [
    /(\d{1,2}):(\d{2})/,
    /(صباح|الصباح|ظهر|الظهر|عصر|العصر|مساء|المساء|ليل|الليل)/,
  ];

  let dateMatch: RegExpMatchArray | null = null;
  let timeMatch: RegExpMatchArray | null = null;

  for (const pattern of datePatterns) {
    dateMatch = message.match(pattern);
    if (dateMatch) break;
  }

  for (const pattern of timePatterns) {
    timeMatch = message.match(pattern);
    if (timeMatch) break;
  }

  return {
    date: dateMatch ? dateMatch[0] : null,
    time: timeMatch ? timeMatch[0] : null,
  };
}

