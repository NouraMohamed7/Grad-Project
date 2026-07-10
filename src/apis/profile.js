// src/apis/profile.js
// كل التعامل مع الـ API الخاص ببروفايل السابلير موجود هنا في مكان واحد

const BASE_URL = 'https://medconnect-one-pi.vercel.app/api/api';

function getSupplierToken() {
  return localStorage.getItem('supplier_token');
}

/**
 * بيجيب بيانات بروفايل السابلير الحالي.
 * GET /v1/supplier/account
 */
export async function getSupplierProfile() {
  const token = getSupplierToken();

  if (!token) {
    throw new Error('لا يوجد تسجيل دخول، من فضلك سجلي الدخول أولاً');
  }

  const response = await fetch(`${BASE_URL}/v1/supplier/account`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (e) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      'تعذر تحميل بيانات البروفايل، حاولي مرة أخرى';
    throw new Error(message);
  }

  if (!payload || !payload.data) {
    throw new Error('استجابة غير متوقعة من السيرفر');
  }

  return payload.data;
}