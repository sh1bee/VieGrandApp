// app/camera-monitor.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CameraMonitorScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Logic chạy đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hàm định dạng thứ trong tuần bằng tiếng Việt
  const getDayName = (day: number) => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[day];
  };

  // Hàm định dạng giờ:phút:giây
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { hour12: false });
  };

  // Hàm định dạng ngày/tháng/năm
  const formatDate = (date: Date) => {
    return `${getDayName(date.getDay())}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  return (
    <ImageBackground
      source={require("../assets/images/home_bg.png")}
      style={styles.background}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* 1. HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Camera Giám Sát</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. KHUNG CAMERA (VIDEO PLAYER PLACEHOLDER) */}
          <View style={styles.cameraContainer}>
            {/* Nút phóng to ở góc */}
            <TouchableOpacity style={styles.fullscreenBtn}>
              <Ionicons name="scan-outline" size={20} color="white" />
            </TouchableOpacity>

            {/* Icon trung tâm */}
            <View style={styles.centerIconBox}>
              <View style={styles.blueCircle}>
                <Ionicons name="videocam" size={40} color="white" />
              </View>
              <Text style={styles.cameraTitle}>Camera Stream</Text>
              <Text style={styles.rtspLink}>
                RTSP: rtsp://103.152.165.178:8554/stream
              </Text>
            </View>

            {/* Trạng thái kết nối (Pill Button) */}
            <View style={styles.connectingBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.connectingText}>Đang kết nối...</Text>
            </View>
          </View>

          {/* 3. THẺ ĐỒNG HỒ (TIME CARD) */}
          <View style={styles.timeCard}>
            <Text style={styles.clockText}>{formatTime(currentTime)}</Text>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
          </View>

          {/* 4. THANH TRẠNG THÁI CUỐI CÙNG */}
          <View style={styles.statusFooter}>
            <View style={styles.greenDot} />
            <Text style={styles.statusFooterText}>Camera đang hoạt động</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "#0055aa", // Màu xanh header chuẩn ảnh
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "white" },

  scrollContent: { padding: 20, alignItems: "center" },

  // Camera Box Styles
  cameraContainer: {
    width: "100%",
    height: width, // Hình vuông hoặc hơi chữ nhật
    backgroundColor: "#111",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    position: "relative",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fullscreenBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
  },
  centerIconBox: { alignItems: "center" },
  blueCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  rtspLink: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 30,
  },

  connectingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    gap: 10,
  },
  connectingText: { color: "#A5D6A7", fontWeight: "500" },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },

  // Time Card Styles
  timeCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginTop: 30,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  clockText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#1A4A8E",
    letterSpacing: 2,
  },
  dateText: { fontSize: 16, color: "#666", marginTop: 10 },

  // Status Footer
  statusFooter: {
    width: "100%",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
    gap: 10,
    elevation: 2,
  },
  statusFooterText: { color: "#2E7D32", fontWeight: "bold", fontSize: 14 },
});
