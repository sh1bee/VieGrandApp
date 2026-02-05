// src/services/HealthService.ts
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Key Groq của bạn
const GROQ_API_KEY = "xxxx"; //Nhớ điền key

export const HealthService = {
  analyzeImage: async (base64Image: string) => {
    // Hàm giả lập (Chỉ dùng khi mạng lỗi hoặc API chết)
    const runMockAI = () => {
      console.log("⚠️ API Lỗi, chạy giả lập...");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ sys: 120, dia: 80, pulse: 75, isValid: true });
        }, 1500);
      });
    };

    if (!GROQ_API_KEY || GROQ_API_KEY.includes("xxxx")) return runMockAI();

    try {
      let imageContent = base64Image;
      if (!base64Image.startsWith("data:image")) {
        imageContent = `data:image/jpeg;base64,${base64Image}`;
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    // --- CÂU LỆNH MỚI (PROMPT) NGHIÊM KHẮC HƠN ---
                    text: `Analyze this image carefully. 
                  1. Is this a digital blood pressure monitor displaying numbers?
                  2. If NO (it's a person, animal, landscape, or blurry object), return JSON: {"isValid": false}.
                  3. If YES, extract Systolic (SYS), Diastolic (DIA), Pulse (PUL). Return JSON: {"isValid": true, "sys": number, "dia": number, "pulse": number}.
                  Return ONLY JSON, no other text.`,
                  },
                  {
                    type: "image_url",
                    image_url: { url: imageContent },
                  },
                ],
              },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        },
      );

      const json = await response.json();

      if (json.error) {
        console.error("Groq Error:", json.error.message);
        return runMockAI();
      }

      let content = json.choices[0].message.content;
      content = content.replace(/```json|```/g, "").trim();
      console.log("🤖 AI Trả về:", content);

      const result = JSON.parse(content);

      // --- KIỂM TRA TÍNH HỢP LỆ ---
      if (result.isValid === false) {
        return { isValid: false }; // Báo cho UI biết ảnh sai
      }

      return {
        sys: Number(result.sys) || 0,
        dia: Number(result.dia) || 0,
        pulse: Number(result.pulse) || 0,
        isValid: true,
      };
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      return runMockAI();
    }
  },

  evaluateHealth: (sys: number, dia: number) => {
    if (sys < 90 || dia < 60)
      return {
        status: "Huyết áp thấp",
        color: "#FFA500",
        advice: "Nên uống nhiều nước, ăn đủ bữa.",
      };
    if (sys <= 120 && dia <= 80)
      return {
        status: "Bình thường",
        color: "#4CAF50",
        advice: "Sức khỏe tốt! Hãy duy trì.",
      };
    if (sys <= 129 && dia <= 80)
      return {
        status: "Bình thường cao",
        color: "#FFD700",
        advice: "Cần theo dõi thường xuyên.",
      };
    if (sys <= 139 || dia <= 89)
      return {
        status: "Tăng huyết áp độ 1",
        color: "#FF8C00",
        advice: "Hạn chế ăn mặn, tập thể dục.",
      };
    return {
      status: "Tăng huyết áp độ 2",
      color: "#FF0000",
      advice: "Nguy hiểm! Cần gặp bác sĩ.",
    };
  },

  saveRecord: async (data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");
    await addDoc(collection(db, "users", user.uid, "health_records"), {
      ...data,
      createdAt: serverTimestamp(),
      displayDate: new Date().toLocaleDateString("vi-VN"),
    });
  },

  getRecords: async (days: number = 7) => {
    const user = auth.currentUser;
    if (!user) return [];
    const q = query(
      collection(db, "users", user.uid, "health_records"),
      orderBy("createdAt", "desc"),
      limit(30),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};
