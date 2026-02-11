// app/safety-checkin-schedule.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafetyCheckInService } from "../src/services/SafetyCheckInService";

export default function SafetyCheckInSchedule() {
  const router = useRouter();
  const [morningEnabled, setMorningEnabled] = useState(false);
  const [eveningEnabled, setEveningEnabled] = useState(false);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customTime, setCustomTime] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await SafetyCheckInService.getSettings();
    setMorningEnabled(settings.morningEnabled || false);
    setEveningEnabled(settings.eveningEnabled || false);
    setCustomEnabled(settings.customEnabled || false);
    setCustomTime(settings.customTime || "");
  };

  const handleSave = async () => {
    if (customEnabled && customTime) {
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(customTime)) {
        Alert.alert("Lỗi", "Định dạng giờ không hợp lệ. Vui lòng nhập HH:MM");
        return;
      }
      const [h, m] = customTime.split(":").map(Number);
      if (h > 23 || m > 59) {
        Alert.alert("Lỗi", "Giờ phải ≤23, phút phải ≤59");
        return;
      }
    }

    await SafetyCheckInService.updateSettings({
      morningEnabled,
      eveningEnabled,
      customEnabled,
      customTime
    });
    Alert.alert("✅ Đã lưu", "Cài đặt nhắc nhở đã được cập nhật");
    router.back();
  };

  const getCustomIcon = () => {
    if (!customTime) return "time";
    const hour = parseInt(customTime.split(":")[0]);
    if (hour >= 5 && hour < 12) return "sunny";
    if (hour >= 12 && hour < 18) return "partly-sunny";
    return "moon";
  };

  const getCustomLabel = () => {
    if (!customTime) return "Tùy chỉnh";
    const hour = parseInt(customTime.split(":")[0]);
    if (hour >= 5 && hour < 12) return "Buổi sáng";
    if (hour >= 12 && hour < 18) return "Buổi chiều";
    return "Buổi tối";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch nhắc điểm danh</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="sunny" size={24} color="#FFA500" />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.label}>Buổi sáng</Text>
              <Text style={styles.time}>7:00 - 9:00</Text>
            </View>
            <Switch value={morningEnabled} onValueChange={setMorningEnabled} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="moon" size={24} color="#4A90E2" />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.label}>Buổi tối</Text>
              <Text style={styles.time}>19:00 - 21:00</Text>
            </View>
            <Switch value={eveningEnabled} onValueChange={setEveningEnabled} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name={getCustomIcon() as any} size={24} color="#9C27B0" />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.label}>{getCustomLabel()}</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={customTime}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9:]/g, "");
                  setCustomTime(filtered);
                }}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>
            <Switch value={customEnabled} onValueChange={setCustomEnabled} />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu cài đặt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white"
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    elevation: 2
  },
  row: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F5FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  textBox: { flex: 1 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  time: { fontSize: 14, color: "#999" },
  input: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    padding: 0
  },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" }
});
