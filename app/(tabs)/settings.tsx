// app/(tabs)/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications"; // <--- ĐÃ THÊM IMPORT NÀY
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";

export default function SettingsScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // STATE CHO THÔNG TIN NGƯỜI DÙNG
  const [userName, setUserName] = useState("Người dùng");
  const [userEmail, setUserEmail] = useState("admin@gmail.com");

  const loadData = async () => {
    try {
      const savedPhone = await AsyncStorage.getItem("emergency_phone");
      const savedName = await AsyncStorage.getItem("userName");
      const savedEmail = await AsyncStorage.getItem("userEmail"); // Email lưu lúc đăng nhập

      if (savedPhone) setEmergencyPhone(savedPhone);
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
    } catch (e) {
      console.log("Lỗi load data", e);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  // Hàm test thông báo hệ thống
  const handleTestNotification = async () => {
    // Xin quyền lại cho chắc
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      Alert.alert(
        "Đã lên lịch!",
        "Vui lòng tắt màn hình hoặc thoát ra màn hình chính NGAY. Thông báo sẽ đến sau 5 giây.",
        [{ text: "OK" }],
      );

      // Lên lịch 5 giây sau
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📢 Kiểm tra hệ thống",
          body: "Đây là thông báo khi bạn không mở ứng dụng!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5, // 5 giây
        },
      });
    } else {
      Alert.alert("Lỗi", "Bạn chưa cấp quyền thông báo cho ứng dụng.");
    }
  };

  // Hàm tạo Initials cho Avatar (Ví dụ: Trần Văn Giàu -> TG)
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        await AsyncStorage.clear();
        router.replace("/(auth)/login");
      } catch (error) {
        console.log("Lỗi đăng xuất:", error);
      }
    };

    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (confirmLogout) performLogout();
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: performLogout },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <Text style={styles.headerSub}>Quản lý tài khoản và ứng dụng</Text>
        </View>

        {/* 2. THẺ THÔNG TIN CÁ NHÂN (DỮ LIỆU THẬT) */}
        <LinearGradient
          colors={["#2b5297", "#4a90e2"]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.cardTouch}
            activeOpacity={0.8}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              <View style={styles.starBadge}>
                <Ionicons name="star" size={10} color="#DAA520" />
              </View>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{userName}</Text>
              <Text style={styles.cardEmail}>{userEmail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#00b894", "#55efc4"]}
          style={styles.premiumCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity style={styles.cardTouch} activeOpacity={0.8}>
            <View style={styles.checkIconBox}>
              <Ionicons name="checkmark" size={24} color="white" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.premiumTitle}>Premium Active</Text>
              <Text style={styles.premiumStatus}>Đang hoạt động</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <SectionTitle title="TÀI KHOẢN" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="person"
            title="Thông tin cá nhân"
            onPress={() => router.push("/profile")}
          />
          <MenuItem
            icon="lock-closed"
            title="Bảo mật"
            onPress={() => router.push("/security")}
          />
          <MenuItem icon="camera" title="Dữ liệu khuôn mặt" isLast />
        </View>

        <SectionTitle title="KHẨN CẤP" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="call"
            title="Cài đặt số khẩn cấp"
            rightText={emergencyPhone}
            onPress={() => router.push("/emergency-settings")}
            isLast
          />
        </View>

        <SectionTitle title="PREMIUM" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="star"
            title="Thông tin Premium"
            onPress={() => router.push("/premium-info")}
            isLast
          />
        </View>

        <SectionTitle title="NỘI DUNG" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="shield"
            title="Nội dung hạn chế"
            onPress={() => router.push("/restricted-content")}
            isLast
          />
        </View>

        <SectionTitle title="HỖ TRỢ" />

        <View style={styles.menuGroup}>
          {/*
          <MenuItem
            icon="notifications"
            title="Test thông báo hệ thống (5s)"
            onPress={handleTestNotification}
          />*/}
          <MenuItem
            icon="mic"
            title="Lệnh thoại"
            onPress={() => router.push("/voice-commands")}
          />
          <MenuItem
            icon="help-circle"
            title="Trung tâm hỗ trợ"
            onPress={() => router.push("/help-center")}
          />
          <MenuItem
            icon="document-text"
            title="Điều khoản dịch vụ"
            onPress={() => router.push("/terms-of-service")}
          />
          <MenuItem
            icon="shield-checkmark"
            title="Chính sách bảo mật"
            onPress={() => router.push("/privacy-policy")}
            isLast
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- COMPONENTS CON ---

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const MenuItem = ({ icon, title, rightText, isLast, onPress }: any) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuIconBox}>
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
    {rightText && <Text style={styles.rightText}>{rightText}</Text>}
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 25 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#2c3e50" },
  headerSub: { fontSize: 16, color: "#7f8c8d", marginTop: 5 },
  profileCard: { borderRadius: 20, marginBottom: 15, elevation: 5 },
  premiumCard: { borderRadius: 20, marginBottom: 25, elevation: 5 },
  cardTouch: { flexDirection: "row", alignItems: "center", padding: 20 },
  avatarBox: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#f39c12",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "white", fontSize: 24, fontWeight: "bold" },
  starBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardName: { color: "white", fontSize: 20, fontWeight: "bold" },
  cardEmail: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  checkIconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  premiumStatus: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#95a5a6",
    marginBottom: 10,
    marginTop: 10,
  },
  menuGroup: {
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIconBox: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: { flex: 1, fontSize: 16, color: "#2c3e50", fontWeight: "500" },
  rightText: { color: "#7f8c8d", marginRight: 10 },
  logoutBtn: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    padding: 18,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  logoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
