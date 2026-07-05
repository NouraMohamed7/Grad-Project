import axios from "axios";

const BASE_URL = "https://medconnect-one-pi.vercel.app/api/api";

// ─── Auth Helper ─────────────────────────────────────────────
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Common Headers ────────────────────────────────────────
const getHeaders = () => ({
  Accept: "application/json",
  ...getAuthHeader(),
});

// ═══════════════════════════════════════════════════════════
// CHAT API FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * 1. GET /v1/conversations/contacts
 *    بيجيب كل الأشخاص اللي ممكن تكلمهم (Suppliers أو Doctors)
 *    الـ Response: { success: true, data: [{ id, fullname, role, email }] }
 */
export const getContacts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/conversations/contacts`, {
      headers: getHeaders(),
    });
    return response.data; // { success, data: [...] }
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 2. GET /v1/conversations
 *    بيجيب كل المحادثات اللي عندك
 *    الـ Response: { success: true, data: [] } ← ممكن يكون فاضي لو مفيش محادثات
 */
export const getConversations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/conversations`, {
      headers: getHeaders(),
    });
    return response.data; // { success, data: [...] }
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 3. GET /v1/conversations/{id}/messages
 *    بيجيب الرسائل بتاعت محادثة معينة
 *    افتراض: الـ endpoint بيكون بالشكل ده
 *    لو الـ API مختلف قولي أعدله
 */
export const getMessages = async (conversationId) => {
  const response = await axios.get(
    `${BASE_URL}/v1/conversations/${conversationId}/messages`,
    {
      headers: getHeaders(),
    }
  );

  return response.data.data;
};

/**
 * 4. POST /v1/conversations/messages
 *    بيبعت رسالة جديدة
 *    Body: { receiver_id: number, message: string }
 *    الـ Response: { success: true, message: "Message sent.", data: {...} }
 */
export const sendMessage = async (receiverId, messageText) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/conversations/messages`,
      {
        receiver_id: receiverId,
        message: messageText,
      },
      { headers: getHeaders() }
    );
    return response.data; // { success, message, data: { message, conversation } }
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * 5. PATCH /v1/conversations/{id}/read
 *    بيعلم المحادثة إنها اتقريت
 *    الـ Response: { success: true, message: "Marked as read." }
 */
export const markAsRead = async (conversationId) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/v1/conversations/${conversationId}/read`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};