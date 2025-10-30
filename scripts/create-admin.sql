-- SQL Script لإنشاء حساب أدمن مباشرة في Supabase SQL Editor
-- استخدم هذا السكريبت في Supabase Dashboard > SQL Editor

-- الخطوة 1: إنشاء المستخدم في auth.users (استخدم Supabase Dashboard > Authentication > Add User)
-- البريد: abdualmalikadmin@gmail.com
-- كلمة المرور: 774843888
-- Auto Confirm User: نعم

-- الخطوة 2: بعد إنشاء المستخدم، احصل على user_id وقم بتحديث الملف الشخصي
-- استبدل 'USER_ID_HERE' بمعرف المستخدم الفعلي

-- إنشاء أو تحديث الملف الشخصي
INSERT INTO public.profiles (id, name, email, role, is_approved, created_at, updated_at)
VALUES (
  'USER_ID_HERE', -- استبدل هذا بمعرف المستخدم من auth.users
  'Admin User',
  'abdualmalikadmin@gmail.com',
  'admin',
  true,
  now(),
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  is_approved = true,
  updated_at = now();

-- التحقق من نجاح العملية
SELECT id, name, email, role, is_approved 
FROM public.profiles 
WHERE email = 'abdualmalikadmin@gmail.com';

