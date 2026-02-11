// app/stroke-risk.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StrokeRiskService } from "../src/services/StrokeRiskService";

const { width } = Dimensions.get("window");

export default function StrokeRisk() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [useNormalData, setUseNormalData] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [useNormalData]);

  const loadAnalysis = async () => {
    try {
      const data = await StrokeRiskService.getAnalysis(useNormalData);
      setAnalysis(data);
    } catch (e) {
      console.log("Lỗi load analysis:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang phân tích...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
      </SafeAreaView>
    );
  }

  const { score, risk, recommendations, profile } = analysis;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nguy cơ đột quỵ</Text>
        <TouchableOpacity 
          style={styles.hiddenBtn} 
          onPress={() => setUseNormalData(!useNormalData)}
        >
          <View style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle" size={24} color="#FF9800" />
          <Text style={styles.disclaimerText}>
            Công cụ hỗ trợ sàng lọc, không thay thế chẩn đoán y tế
          </Text>
        </View>

        {/* Điểm nguy cơ - Card lớn gradient */}
        <LinearGradient
          colors={
            risk.level === "high"
              ? ["#FF5252", "#FF1744"]
              : risk.level === "medium"
                ? ["#FFA726", "#FF6F00"]
                : ["#66BB6A", "#43A047"]
          }
          style={styles.scoreCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.scoreHeader}>
            <Ionicons name="pulse" size={40} color="white" />
            <Text style={styles.scoreLabel}>ĐIỂM NGUY CƠ</Text>
          </View>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>

          <View style={styles.riskBadge}>
            <Ionicons
              name={
                risk.level === "high"
                  ? "warning"
                  : risk.level === "medium"
                    ? "alert-circle"
                    : "checkmark-circle"
              }
              size={24}
              color="white"
            />
            <Text style={styles.riskText}>Nguy cơ {risk.label}</Text>
          </View>
        </LinearGradient>

        {/* Thông tin cá nhân - Cards nhỏ */}
        <Text style={styles.sectionTitle}>📋 Thông tin sức khỏe</Text>
        <View style={styles.infoGrid}>
          <InfoCard icon="person" label="Tuổi" value={`${profile.age}`} />
          <InfoCard
            icon="fitness"
            label="BMI"
            value={profile.bmi?.toFixed(1) || "N/A"}
            alert={profile.bmi > 25}
          />
          <InfoCard
            icon="heart"
            label="Huyết áp"
            value={profile.hasHypertension ? "Có" : "Không"}
            alert={profile.hasHypertension}
          />
          <InfoCard
            icon="medical"
            label="Bệnh tim"
            value={profile.hasHeartDisease ? "Có" : "Không"}
            alert={profile.hasHeartDisease}
          />
        </View>

        {/* Khuyến nghị */}
        <Text style={styles.sectionTitle}>💡 Khuyến nghị</Text>
        <View style={styles.recommendCard}>
          {recommendations.map((rec: string, index: number) => (
            <View key={index} style={styles.recItem}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Nút hành động */}
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="calendar" size={24} color="white" />
          <Text style={styles.actionBtnText}>Đặt lịch khám ngay</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoCard = ({ icon, label, value, unit, alert }: any) => (
  <View style={[styles.infoCard, alert && styles.infoCardAlert]}>
    <Ionicons name={icon} size={32} color={alert ? "#FF5722" : "#007AFF"} />
    <Text style={styles.infoValue}>{value}</Text>
    {unit && <Text style={styles.infoUnit}>{unit}</Text>}
    <Text style={styles.infoLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    elevation: 2,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  hiddenBtn: { padding: 8 },
  content: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 15, fontSize: 16, color: "#666" },
  errorText: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
    fontSize: 16,
  },

  disclaimerCard: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
    alignItems: "center",
    elevation: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: "#E65100",
    lineHeight: 20,
    fontWeight: "500",
  },

  scoreCard: {
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  scoreHeader: { alignItems: "center", marginBottom: 20 },
  scoreLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: 2,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  scoreNumber: { fontSize: 72, fontWeight: "bold", color: "white" },
  scoreMax: { fontSize: 32, color: "rgba(255,255,255,0.8)", marginLeft: 8 },
  riskBadge: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 10,
    alignItems: "center",
  },
  riskText: { color: "white", fontWeight: "bold", fontSize: 18 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    marginTop: 10,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: (width - 52) / 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "#E3F2FD",
  },
  infoCardAlert: { borderColor: "#FFEBEE" },
  infoValue: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 12 },
  infoUnit: { fontSize: 14, color: "#999", marginTop: 2 },
  infoLabel: { fontSize: 13, color: "#666", marginTop: 8, fontWeight: "500" },

  recommendCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },
  recItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    gap: 12,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginTop: 6,
  },
  recText: { flex: 1, fontSize: 15, color: "#333", lineHeight: 22 },

  actionBtn: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 12,
    elevation: 6,
    shadowColor: "#007AFF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  actionBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
