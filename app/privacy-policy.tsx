import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <View style={styles.backBtnCircle}>
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Chính sách bảo mật</Text>
          <Text style={styles.headerSub}>Cập nhật lần cuối: 15/12/2024</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
          <Text style={styles.paragraph}>
            VieGrand ("chúng tôi", "của chúng tôi", hoặc "công ty") cam kết bảo
            vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách
            chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi
            bạn sử dụng ứng dụng VieGrand.
          </Text>
          <Text style={styles.paragraph}>
            Bằng việc sử dụng Ứng dụng, bạn đồng ý với việc thu thập và sử dụng
            thông tin theo chính sách này.
          </Text>

          <Text style={styles.sectionTitle}>
            2. Thông tin chúng tôi thu thập
          </Text>
          <Text style={styles.subSectionTitle}>2.1 Thông tin cá nhân</Text>
          <Text style={styles.paragraph}>
            Chúng tôi có thể thu thập các thông tin cá nhân sau đây:
          </Text>
          <Text style={styles.bulletPoint}>• Tên, email, số điện thoại</Text>
          <Text style={styles.bulletPoint}>
            • Thông tin hồ sơ (tuổi, giới tính, địa chỉ)
          </Text>
          <Text style={styles.bulletPoint}>
            • Thông tin sức khỏe (nhóm máu, bệnh mãn tính, dị ứng)
          </Text>
          <Text style={styles.bulletPoint}>• Thông tin liên hệ khẩn cấp</Text>
          <Text style={styles.bulletPoint}>• Ảnh đại diện và ảnh sức khỏe</Text>
        </View>
      </ScrollView>

      {/* TAB BAR GIẢ ĐỒNG BỘ */}
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
            <View style={styles.micButton}>
              <Ionicons name="mic" size={28} color="white" />
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
    height: 90,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
    position: "relative",
    justifyContent: "center",
  },
  headerLeftBtn: { position: "absolute", left: 15, zIndex: 2, top: 25 },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    top: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  headerSub: { fontSize: 13, color: "#999", marginTop: 4 },

  scrollContent: { padding: 20, paddingBottom: 150 },
  contentCard: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginTop: 15,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginBottom: 15,
    textAlign: "justify",
  },
  bulletPoint: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    marginLeft: 10,
    marginBottom: 5,
  },

  // Tab Bar Styles (Đã đồng bộ 100%)
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
