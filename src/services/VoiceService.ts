// src/services/VoiceService.ts

const GROQ_API_KEY = ""; // Nhớ điền Key của bạn

export const VoiceService = {
  // 1. Chuyển âm thanh thành văn bản (STT) - GIỮ NGUYÊN
  transcribeAudio: async (uri: string) => {
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append("file", { uri, name: "audio.m4a", type: "audio/m4a" });
      formData.append("model", "whisper-large-v3");
      formData.append("language", "vi");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
          body: formData,
        },
      );
      const data = await response.json();
      return data.text || "";
    } catch (e) {
      return "";
    }
  },

  // 2. PHÂN TÍCH Ý ĐỊNH & TRẢ LỜI (AI BRAIN)
  // src/services/VoiceService.ts

  // ...

  processUserRequest: async (text: string) => {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: `Bạn là 'VieGrand' - Trợ lý ảo/Nhân viên hỗ trợ chăm sóc sức khỏe. 
              CÁ TÍNH: Lễ phép, ân cần, chuyên nghiệp. 
              XƯNG HÔ: Tự xưng là 'cháu', gọi người dùng là 'bác/ông/bà'.
              LƯU Ý QUAN TRỌNG: Bạn là nhân viên hỗ trợ, KHÔNG PHẢI con cháu trong gia đình của người dùng.
              
              QUY TẮC XỬ LÝ (ƯU TIÊN THEO THỨ TỰ):
              1. Nếu câu nói chứa hàm ý muốn MỞ, XEM, VÀO hoặc nhắc đến các chức năng sau, bạn BẮT BUỘC trả về JSON { "type": "ACTION" }:
                 - 'tin nhắn', 'nhắn tin', 'tuyên nhắn', 'tình nhắn' -> content: "NAV_CHAT", message: "Dạ, cháu mở tin nhắn ngay ạ"
                 - 'sức khỏe', 'huyết áp', 'nhịp tim', 'so quiet', 'xức khoẻ' -> content: "NAV_HEALTH", message: "Dạ, cháu mở phần kiểm tra sức khỏe ạ"
                 - 'cài đặt', 'thiết lập', 'cài đá', 'cái đà', 'cái đéo', 'cái đặc' -> content: "NAV_SETTINGS", message: "Dạ, cháu vào phần cài đặt cho bác đây ạ"
                 - 'trang chủ', 'màn hình chính', 'về nhà', 'vậy nha', 'vợ nhà' -> content: "NAV_HOME", message: "Dạ, cháu đưa bác về màn hình chính ạ"
                 - 'thời tiết', 'nắng mưa', 'thời tít' -> content: "ACTION_WEATHER", message: "Dạ, bác xem thời tiết ở đây nhé"
                 - 'quay lại', 'trở lại', 'why lai', 'uầy vời' -> content: "GO_BACK", message: "Dạ, cháu quay lại màn hình trước ạ"
                 - 'cứu giúp', 'cấp cứu', 'khẩn cấp', 'sos' -> content: "ACTION_SOS", message: "DẠ, CHÁU ĐANG GỌI CỨU TRỢ KHẨN CẤP ĐÂY Ạ!"

              2. NẾU LÀ CÂU TRÒ CHUYỆN/TÂM SỰ (Không thuộc các chức năng trên):
                 - Phải nhận diện được đối tượng người dùng nhắc đến là 'con/cháu của họ' chứ không phải bạn.
                 - Trả về JSON { "type": "CHAT", "content": "Câu trả lời an ủi, đóng vai nhân viên chăm sóc", "message": "" }
                 - Ví dụ: "Cháu ơi bà buồn quá" -> "Dạ bà ơi, bác nhân viên VieGrand đây ạ. Bà có chuyện gì buồn kể cháu nghe, hoặc bà muốn cháu mở tin nhắn để bà nói chuyện với con cháu cho vui không ạ?"

              CHỈ TRẢ VỀ JSON ĐÚNG CẤU TRÚC.`,
              },
              { role: "user", content: text },
            ],
            temperature: 0,
            response_format: { type: "json_object" },
          }),
        },
      );

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      return {
        type: "CHAT",
        content:
          "Dạ cháu là trợ lý VieGrand, cháu chưa nghe rõ, bác nói lại giúp cháu nhé.",
        message: "",
      };
    }
  },
};
