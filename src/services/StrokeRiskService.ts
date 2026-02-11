// src/services/StrokeRiskService.ts
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Mock data cho user "wzoLe5coNBdylq2NCDnmGoLlhty1"
const MOCK_USER_DATA = {
  uid: "wzoLe5coNBdylq2NCDnmGoLlhty1",
  profile: {
    age: 68,
    gender: "male",
    hasHypertension: true,
    hasHeartDisease: false,
    smokingStatus: "former", // never, former, current
    bmi: 26.5,
  },
  dailyData: [
    {
      date: "2024-01-15",
      systolic: 145,
      diastolic: 92,
      heartRate: 78,
      glucose: 110,
    },
    {
      date: "2024-01-14",
      systolic: 142,
      diastolic: 88,
      heartRate: 75,
      glucose: 105,
    },
    {
      date: "2024-01-13",
      systolic: 148,
      diastolic: 95,
      heartRate: 82,
      glucose: 115,
    },
    {
      date: "2024-01-12",
      systolic: 140,
      diastolic: 85,
      heartRate: 76,
      glucose: 108,
    },
    {
      date: "2024-01-11",
      systolic: 152,
      diastolic: 98,
      heartRate: 85,
      glucose: 120,
    },
  ],
};

// Mock data bình thường (nguy cơ thấp)
const NORMAL_USER_DATA = {
  uid: "wzoLe5coNBdylq2NCDnmGoLlhty1",
  profile: {
    age: 48,
    gender: "male",
    hasHypertension: false,
    hasHeartDisease: false,
    smokingStatus: "never",
    bmi: 24.0,
  },
  dailyData: [
    {
      date: "2024-01-15",
      systolic: 128,
      diastolic: 82,
      heartRate: 72,
      glucose: 100,
    },
    {
      date: "2024-01-14",
      systolic: 126,
      diastolic: 80,
      heartRate: 70,
      glucose: 98,
    },
    {
      date: "2024-01-13",
      systolic: 125,
      diastolic: 79,
      heartRate: 71,
      glucose: 96,
    },
    {
      date: "2024-01-12",
      systolic: 129,
      diastolic: 83,
      heartRate: 73,
      glucose: 102,
    },
    {
      date: "2024-01-11",
      systolic: 127,
      diastolic: 81,
      heartRate: 72,
      glucose: 99,
    },
  ],
};

// Mock data trung bình (nguy cơ vừa phải)
const MEDIUM_USER_DATA = {
  uid: "wzoLe5coNBdylq2NCDnmGoLlhty1",
  profile: {
    age: 58,
    gender: "male",
    hasHypertension: true,
    hasHeartDisease: false,
    smokingStatus: "former",
    bmi: 24.5,
  },
  dailyData: [
    {
      date: "2024-01-15",
      systolic: 132,
      diastolic: 84,
      heartRate: 72,
      glucose: 102,
    },
    {
      date: "2024-01-14",
      systolic: 135,
      diastolic: 86,
      heartRate: 74,
      glucose: 105,
    },
    {
      date: "2024-01-13",
      systolic: 130,
      diastolic: 82,
      heartRate: 70,
      glucose: 100,
    },
    {
      date: "2024-01-12",
      systolic: 138,
      diastolic: 88,
      heartRate: 76,
      glucose: 108,
    },
    {
      date: "2024-01-11",
      systolic: 133,
      diastolic: 85,
      heartRate: 73,
      glucose: 103,
    },
  ],
};

export const StrokeRiskService = {
  // Tính điểm nguy cơ đột quỵ (0-100)
  calculateRiskScore: (profile: any, recentData: any[]) => {
    let score = 0;

    // Yếu tố tuổi (0-25 điểm)
    if (profile.age > 65) score += 25;
    else if (profile.age > 55) score += 15;
    else if (profile.age > 45) score += 5;

    // Tiền sử bệnh (0-30 điểm)
    if (profile.hasHypertension) score += 20;
    if (profile.hasHeartDisease) score += 10;

    // Hút thuốc (0-15 điểm)
    if (profile.smokingStatus === "current") score += 15;
    else if (profile.smokingStatus === "former") score += 5;

    // BMI (0-10 điểm)
    if (profile.bmi > 30) score += 10;
    else if (profile.bmi > 25) score += 5;

    // Dữ liệu hằng ngày - trung bình 5 ngày gần nhất (0-20 điểm)
    if (recentData.length > 0) {
      const avgSys =
        recentData.reduce((sum, d) => sum + d.systolic, 0) / recentData.length;
      const avgDia =
        recentData.reduce((sum, d) => sum + d.diastolic, 0) / recentData.length;

      if (avgSys > 140 || avgDia > 90) score += 20;
      else if (avgSys > 130 || avgDia > 85) score += 10;
    }

    return Math.min(score, 100);
  },

  // Phân tầng nguy cơ
  getRiskLevel: (score: number) => {
    if (score < 30) return { level: "low", color: "#4CAF50", label: "Thấp" };
    if (score < 60)
      return { level: "medium", color: "#FFC107", label: "Trung bình" };
    return { level: "high", color: "#FF0000", label: "Cao" };
  },

  // Gợi ý hành động
  getRecommendations: (score: number, profile: any) => {
    const recommendations = [];

    if (score >= 60) {
      recommendations.push("🚨 Khuyến nghị gặp bác sĩ tim mạch trong tuần này");
      recommendations.push("📊 Theo dõi huyết áp 2 lần/ngày");
    } else if (score >= 30) {
      recommendations.push("⚠️ Theo dõi huyết áp hằng ngày");
      recommendations.push("🏃 Tăng cường vận động nhẹ 30 phút/ngày");
    } else {
      recommendations.push("✅ Duy trì lối sống lành mạnh");
      recommendations.push("📅 Kiểm tra sức khỏe định kỳ 6 tháng/lần");
    }

    if (profile.hasHypertension) {
      recommendations.push("🧂 Hạn chế muối < 5g/ngày");
    }
    if (profile.smokingStatus === "current") {
      recommendations.push("🚭 Cần bỏ thuốc lá ngay");
    }

    return recommendations;
  },

  // Lấy dữ liệu phân tích (mock hoặc thật)
  getAnalysis: async (dataType: "high" | "normal" | "medium" = "high") => {
    const user = auth.currentUser;

    // Nếu là user mock, trả về mock data
    if (user?.uid === MOCK_USER_DATA.uid) {
      let mockData;
      if (dataType === "normal") {
        mockData = NORMAL_USER_DATA;
      } else if (dataType === "medium") {
        mockData = MEDIUM_USER_DATA;
      } else {
        mockData = MOCK_USER_DATA;
      }

      const score = StrokeRiskService.calculateRiskScore(
        mockData.profile,
        mockData.dailyData,
      );
      const risk = StrokeRiskService.getRiskLevel(score);
      const recommendations = StrokeRiskService.getRecommendations(
        score,
        mockData.profile,
      );

      return {
        score,
        risk,
        recommendations,
        profile: mockData.profile,
        recentData: mockData.dailyData,
      };
    }

    // Nếu là user thật, lấy từ Firestore
    if (!user) throw new Error("Chưa đăng nhập");

    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (!docSnap.exists()) {
      return {
        score: 0,
        risk: { level: "low", color: "#4CAF50", label: "Chưa có dữ liệu" },
        recommendations: [],
      };
    }

    const userData = docSnap.data();
    const profile = userData.strokeProfile || {};
    const recentData = userData.recentHealthData || [];

    const score = StrokeRiskService.calculateRiskScore(profile, recentData);
    const risk = StrokeRiskService.getRiskLevel(score);
    const recommendations = StrokeRiskService.getRecommendations(
      score,
      profile,
    );

    return { score, risk, recommendations, profile, recentData };
  },

  // Lưu thông tin profile
  saveProfile: async (profile: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập");

    await updateDoc(doc(db, "users", user.uid), {
      strokeProfile: profile,
    });
  },
};
