// app/(relative-tabs)/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications"; // 1. Import thư viện thông báo
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../src/config/firebase";

export default function RelativeSettingsScreen() {
  const router = useRouter();

  // States dữ liệu người dùng
  const [userName, setUserName] = useState("Người dùng");
  const [userEmail, setUserEmail] = useState("test@viegrand.com");

  // States cho các nút gạt thông báo
  const [notifApp, setNotifApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const n = await AsyncStorage.getItem("userName");
      const e = await AsyncStorage.getItem("userEmail");
      if (n) setUserName(n);
      if (e) setUserEmail(e);
    };
    loadData();
  }, []);

  // --- 2. HÀM TEST THÔNG BÁO HỆ THỐNG (5 GIÂY) ---
  const handleTestNotification = async () => {
    // Xin quyền từ hệ thống
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      if (Platform.OS === "web") {
        window.alert(
          "Lên lịch thành công! Vui lòng chờ 5 giây. (Lưu ý: Tính năng này hoạt động tốt nhất trên điện thoại)",
        );
      } else {
        Alert.alert(
          "Đã lên lịch!",
          "Vui lòng THOÁT RA màn hình chính hoặc TẮT MÀN HÌNH ngay bây giờ. Thông báo sẽ đến sau 5 giây.",
          [{ text: "Tôi hiểu rồi" }],
        );
      }

      // Lên lịch thông báo sau 5 giây
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 VieGrand: Kiểm tra hệ thống",
          body: "Đây là cách thông báo khẩn cấp hoặc tin nhắn sẽ hiện lên khi bạn không dùng App!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
        },
      });
    } else {
      Alert.alert(
        "Lỗi",
        "Bạn cần cấp quyền thông báo cho ứng dụng trong cài đặt điện thoại.",
      );
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        await AsyncStorage.clear();
        router.replace("/(auth)/login");
      } catch (error) {
        console.log(error);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) performLogout();
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
        {/* TIÊU ĐỀ */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
        </View>

        {/* 1. CARD THÔNG TIN NGƯỜI DÙNG */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("/profile")}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {/* 2. NHÓM THÔNG BÁO & CẢNH BÁO */}
        <SectionTitle title="THÔNG BÁO & CẢNH BÁO" />
        <View style={styles.menuGroup}>
          <SwitchItem
            icon="notifications"
            title="Thông báo ứng dụng"
            value={notifApp}
            onValueChange={setNotifApp}
          />
          <SwitchItem
            icon="mail"
            title="Cảnh báo qua Email"
            value={notifEmail}
            onValueChange={setNotifEmail}
          />
          <SwitchItem
            icon="chatbubble"
            title="Cảnh báo qua SMS"
            value={notifSMS}
            onValueChange={setNotifSMS}
            isLast
          />
        </View>

        {/* 3. NHÓM CHUNG */}
        <SectionTitle title="CHUNG" />
        <View style={styles.menuGroup}>
          <MenuItem icon="globe" title="Ngôn ngữ" rightText="Tiếng Việt" />
          <MenuItem
            icon="camera"
            title="Xem dữ liệu camera"
            onPress={() => router.push("/camera-monitor")}
          />
          <MenuItem
            icon="lock-closed"
            title="Bảo mật"
            onPress={() => router.push("/security")}
          />
          <MenuItem
            icon="chatbubbles"
            title="Chat Realtime"
            onPress={() => router.push("/(relative-tabs)/chat")}
          />
          <MenuItem icon="information-circle" title="Về ứng dụng" isLast />
        </View>

        {/* 4. NHÓM PREMIUM */}
        <SectionTitle title="PREMIUM" />
        <View style={styles.menuGroup}>
          <MenuItem
            icon="flash"
            title="Nâng cấp Premium"
            rightText="Xem chi tiết gói"
            iconColor="#007AFF"
            isLast
            onPress={() => router.push("/premium-info")}
          />
        </View>

        {/* 5. NHÓM HỖ TRỢ */}
        <SectionTitle title="HỖ TRỢ" />
        <View style={styles.menuGroup}>
          {/* NÚT TEST MỚI THÊM VÀO ĐÂY 
          <MenuItem
            icon="notifications-circle"
            title="Test thông báo hệ thống (5s)"
            onPress={handleTestNotification}
            iconColor="#FF9500"
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

        {/* 6. NÚT ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutIconBox}>
            <Ionicons name="log-out" size={20} color="white" />
          </View>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- COMPONENTS CON ---

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionLabel}>{title}</Text>
);

const MenuItem = ({
  icon,
  title,
  rightText,
  isLast,
  onPress,
  iconColor = "#4a90e2",
}: any) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
    onPress={onPress}
  >
    <View style={[styles.menuIconBox, { backgroundColor: iconColor }]}>
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
    {rightText && <Text style={styles.rightText}>{rightText}</Text>}
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const SwitchItem = ({ icon, title, value, onValueChange, isLast }: any) => (
  <View style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={[styles.menuIconBox, { backgroundColor: "#4a90e2" }]}>
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: "#007AFF" }}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: "bold", color: "#1A1A1A" },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 25,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 13, color: "#999" },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#95a5a6",
    marginBottom: 10,
    marginTop: 10,
  },

  menuGroup: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: { flex: 1, fontSize: 16, color: "#333", fontWeight: "500" },
  rightText: { color: "#999", marginRight: 10, fontSize: 14 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    elevation: 2,
    marginTop: 10,
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  logoutText: { fontSize: 18, fontWeight: "bold", color: "#FF3B30" },
});
