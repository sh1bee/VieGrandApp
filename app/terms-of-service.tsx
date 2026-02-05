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

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER CĂN GIỮA TUYỆT ĐỐI */}
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
          <Text style={styles.headerTitle}>Điều khoản dịch vụ</Text>
          <Text style={styles.headerSub}>Cập nhật lần cuối: 15/12/2024</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>1. Chấp nhận điều khoản</Text>
          <Text style={styles.paragraph}>
            Bằng việc tải xuống, cài đặt hoặc sử dụng ứng dụng VieGrand ("Ứng
            dụng"), bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản dịch
            vụ này ("Điều khoản"). Nếu bạn không đồng ý với bất kỳ phần nào của
            các điều khoản này, vui lòng không sử dụng Ứng dụng.
          </Text>

          <Text style={styles.sectionTitle}>2. Mô tả dịch vụ</Text>
          <Text style={styles.paragraph}>
            VieGrand là một ứng dụng di động được thiết kế để hỗ trợ người cao
            tuổi và gia đình của họ trong việc giao tiếp, theo dõi sức khỏe, và
            quản lý cuộc sống hàng ngày. Ứng dụng bao gồm các tính năng như:
          </Text>
          <Text style={styles.bulletPoint}>
            • Giao tiếp với gia đình và bạn bè
          </Text>
          <Text style={styles.bulletPoint}>
            • Theo dõi sức khỏe và nhắc nhở thuốc
          </Text>
          <Text style={styles.bulletPoint}>• Gọi khẩn cấp và báo động</Text>
          <Text style={styles.bulletPoint}>• Giải trí và trò chơi</Text>
          <Text style={styles.bulletPoint}>
            • Đọc sách và nội dung giáo dục
          </Text>

          <Text style={styles.sectionTitle}>3. Đăng ký và tài khoản</Text>
          <Text style={styles.paragraph}>
            Để sử dụng đầy đủ tính năng, người dùng cần tạo tài khoản. Bạn có
            trách nhiệm bảo mật Private Key của mình. Chúng tôi không chịu trách
            nhiệm cho bất kỳ tổn thất nào phát sinh từ việc lộ thông tin bảo
            mật.
          </Text>
          <Text style={styles.bulletPoint}>
            • Cung cấp thông tin chính xác và cập nhật
          </Text>
          <Text style={styles.bulletPoint}>
            • Không chia sẻ tài khoản với người lạ
          </Text>
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
