// app/emergency-settings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import CustomAlert from "../src/components/CustomAlert";

export default function EmergencySettings() {
  const router = useRouter();
  const [contactName, setContactName] = useState("Số khẩn cấp");
  const [phoneNumber, setPhoneNumber] = useState("");

  // 1. Quản lý trạng thái Alert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error",
    title: string,
    message: string,
  ) => {
    setAlertConfig({ visible: true, type, title, message });
  };

  const handleSave = async () => {
    if (phoneNumber.length < 10) {
      showAlert(
        "error",
        "Lỗi nhập liệu",
        "Số điện thoại phải có ít nhất 10 chữ số để đảm bảo an toàn.",
      );
      return;
    }

    try {
      await AsyncStorage.setItem("emergency_name", contactName);
      await AsyncStorage.setItem("emergency_phone", phoneNumber);

      showAlert(
        "success",
        "Thành công",
        "Thông tin số khẩn cấp đã được cập nhật vào hệ thống.",
      );
    } catch (e) {
      showAlert(
        "error",
        "Lỗi hệ thống",
        "Không thể lưu dữ liệu vào bộ nhớ. Vui lòng thử lại.",
      );
    }
  };

  const handleCloseAlert = () => {
    setAlertConfig({ ...alertConfig, visible: false });
    // Nếu lưu thành công thì mới quay lại trang trước khi đóng alert
    if (alertConfig.type === "success") {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER CĂN GIỮA TUYỆT ĐỐI */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0088cc" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Cài đặt số khẩn cấp</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* THÔNG TIN CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin số khẩn cấp</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên liên hệ</Text>
              <TextInput
                style={styles.input}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Ví dụ: Con trai, Cấp cứu..."
              />
              <Text style={styles.subtext}>Tên hiển thị khi gọi khẩn cấp</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại..."
              />
              <Text style={styles.subtext}>
                Số sẽ được gọi khi nhấn nút khẩn cấp
              </Text>
            </View>
          </View>

          {/* THỬ NGHIỆM CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thử nghiệm</Text>
            <TouchableOpacity style={styles.testBtn} activeOpacity={0.8}>
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.testBtnText}>Thử gọi</Text>
            </TouchableOpacity>
            <Text
              style={[styles.subtext, { textAlign: "center", marginTop: 10 }]}
            >
              Kiểm tra xem số khẩn cấp có hoạt động không
            </Text>
          </View>

          {/* LƯU Ý CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lưu ý:</Text>
            <Text style={styles.noteLine}>
              • Số khẩn cấp sẽ được sử dụng khi nhấn nút "Gọi khẩn cấp" trên màn
              hình chính
            </Text>
            <Text style={styles.noteLine}>
              • Đảm bảo số điện thoại chính xác để tránh gọi nhầm
            </Text>
            <Text style={styles.noteLine}>
              • Có thể thay đổi số này bất cứ lúc nào
            </Text>
            <Text style={styles.noteLine}>
              • Số sẽ được lưu trên server và đồng bộ trên tất cả thiết bị
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Lưu cài đặt</Text>
          </TouchableOpacity>
          {/* 2. ĐẶT COMPONENT ALERT Ở ĐÂY */}
          <CustomAlert
            visible={alertConfig.visible}
            type={alertConfig.type}
            title={alertConfig.title}
            message={alertConfig.message}
            onClose={handleCloseAlert}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* TAB BAR ĐỒNG BỘ 100% VỚI _LAYOUT */}
      <View style={styles.tabBarContainer}>
        <View style={styles.fakeTabBar}>
          <View style={styles.tabColumn}>
            <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
              <Ionicons name="home-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.tabColumn}>
            <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")}>
              <Ionicons name="chatbubble-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabColumn}>
            <View style={styles.micButtonContainer}>
              <View style={styles.micButton}>
                <Ionicons name="mic" size={28} color="white" />
              </View>
            </View>
          </View>

          <View style={styles.tabColumn}>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabColumn}>
            <TouchableOpacity
              style={[styles.tabIconWrapper, styles.activeTabBox]}
              onPress={() => router.back()}
            >
              <Ionicons name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
    position: "relative",
  },
  headerLeftBtn: { zIndex: 2, padding: 5 },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },

  scrollContent: { padding: 20, paddingBottom: 150 },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 20,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 8 },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  subtext: { fontSize: 12, color: "#999", marginTop: 5 },

  testBtn: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  testBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  noteLine: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 5 },

  saveBtn: {
    backgroundColor: "#007AFF",
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    marginBottom: 20,
  },
  saveBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // --- TAB BAR STYLES (COPIED FROM FIXED LAYOUT) ---
  tabBarContainer: { position: "absolute", bottom: 25, left: 20, right: 20 },
  fakeTabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  tabColumn: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  activeTabBox: {
    backgroundColor: "#0088cc",
    shadowColor: "#0088cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  micButtonContainer: { justifyContent: "center", alignItems: "center" },
  micButton: {
    width: 62,
    height: 62,
    backgroundColor: "#0088cc",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    marginTop: -25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
