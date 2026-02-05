// app/health/result.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HealthService } from "../../src/services/HealthService";

export default function HealthResult() {
  const { imageUri, base64 } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // State chứa số đo (Cho phép người dùng sửa nếu AI sai)
  const [metrics, setMetrics] = useState({ sys: "0", dia: "0", pulse: "0" });
  const [evaluation, setEvaluation] = useState({
    status: "...",
    color: "#999",
  });

  // 1. Chạy AI khi vừa vào trang
  useEffect(() => {
    const analyze = async () => {
      if (!base64) return;

      const result: any = await HealthService.analyzeImage(base64 as string);

      // --- KIỂM TRA HỢP LỆ ---
      if (result && result.isValid === false) {
        Alert.alert(
          "Ảnh không hợp lệ",
          "AI không tìm thấy máy đo huyết áp trong ảnh. Vui lòng chụp lại rõ nét hơn.",
          [
            { text: "Chụp lại", onPress: () => router.back() }, // Quay về trang trước
          ],
        );
        return;
      }

      if (result) {
        setMetrics({
          sys: result.sys.toString(),
          dia: result.dia.toString(),
          pulse: result.pulse.toString(),
        });
        setEvaluation(HealthService.evaluateHealth(result.sys, result.dia));
      } else {
        // Trường hợp lỗi mạng quá nặng
        Alert.alert("Lỗi", "Không thể kết nối đến máy chủ AI.");
      }
      setLoading(false);
    };
    analyze();
  }, [base64]);

  // 2. Tự động đánh giá lại mỗi khi người dùng sửa số
  useEffect(() => {
    const sys = parseInt(metrics.sys) || 0;
    const dia = parseInt(metrics.dia) || 0;
    if (sys > 0 && dia > 0) {
      setEvaluation(HealthService.evaluateHealth(sys, dia));
    }
  }, [metrics.sys, metrics.dia]);

  // 3. Lưu dữ liệu thật
  const saveResult = async () => {
    try {
      await HealthService.saveRecord({
        sys: parseInt(metrics.sys),
        dia: parseInt(metrics.dia),
        pulse: parseInt(metrics.pulse),
        note: evaluation.status,
      });
      Alert.alert("Thành công", "Đã lưu kết quả sức khỏe!", [
        { text: "Xem biểu đồ", onPress: () => router.replace("/health/chart") },
      ]);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header & Ảnh */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#0088cc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kết quả phân tích</Text>
          <View style={{ width: 40 }} />
        </View>
        <Image
          source={{ uri: imageUri as string }}
          style={styles.previewImage}
        />

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <ActivityIndicator size="large" color="#0088cc" />
            <Text style={{ marginTop: 10, color: "#666" }}>
              AI đang đọc chỉ số máy đo...
            </Text>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.statusRow}>
              <Ionicons name="medical" size={24} color={evaluation.color} />
              <Text style={[styles.statusText, { color: evaluation.color }]}>
                {evaluation.status}
              </Text>
            </View>

            {/* Các ô nhập liệu (Cho phép sửa) */}
            <InputRow
              label="Huyết áp tâm thu"
              value={metrics.sys}
              onChange={(t: string) => setMetrics({ ...metrics, sys: t })}
              unit="mmHg"
            />
            <InputRow
              label="Huyết áp tâm trương"
              value={metrics.dia}
              onChange={(t: string) => setMetrics({ ...metrics, dia: t })}
              unit="mmHg"
            />
            <InputRow
              label="Nhịp tim"
              value={metrics.pulse}
              onChange={(t: string) => setMetrics({ ...metrics, pulse: t })}
              unit="bpm"
            />
          </View>
        )}

        {!loading && (
          <TouchableOpacity style={styles.saveBtn} onPress={saveResult}>
            <Ionicons name="cloud-upload-outline" size={20} color="white" />
            <Text style={styles.saveBtnText}>Ghi nhận kết quả</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Component ô nhập số
const InputRow = ({ label, value, onChange, unit }: any) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
      />
      <Text style={styles.rowUnit}>{unit}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 20,
    resizeMode: "contain",
    backgroundColor: "#F0F0F0",
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  statusText: { fontSize: 18, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 16, fontWeight: "500", color: "#333" },
  rowUnit: { fontSize: 14, color: "#AAA", marginLeft: 10, width: 40 },
  input: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    minWidth: 60,
    textAlign: "center",
    paddingVertical: 5,
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    padding: 18,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
