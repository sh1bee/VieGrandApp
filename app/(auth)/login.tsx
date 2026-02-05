// app/(auth)/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomInput from "../../src/components/Input/CustomInput";
import PrimaryButton from "../../src/components/PrimaryButton";
import { auth, db } from "../../src/config/firebase";
import { Colors } from "../../src/constants/Colors";

const bgImage = require("../../assets/images/onboarding_bg.png");
const logo = require("../../assets/images/logo_viegrand.png");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm thông báo dùng chung cho cả Web và Mobile
  const notify = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    console.log(">>> Đang thử đăng nhập với:", email);

    if (!email || !password) {
      notify("Thông báo", "Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true); // Bật xoay xoay
    try {
      // 1. Đăng nhập với Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      console.log(">>> Auth thành công, UID:", user.uid);

      // 2. Lấy thông tin chi tiết từ Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(">>> Dữ liệu User:", userData);

        // 3. Lưu vào máy
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("userRole", userData.role || "elder");
        await AsyncStorage.setItem("userName", userData.name || "Người dùng");
        await AsyncStorage.setItem("userEmail", email);

        // 4. Phân luồng trang chủ
        if (userData.role === "relative") {
          router.replace("/(relative-tabs)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        notify("Lỗi", "Tài khoản tồn tại nhưng không có dữ liệu hồ sơ.");
      }
    } catch (error: any) {
      console.error(">>> Lỗi Firebase:", error.code, error.message);
      let errorMsg = "Kiểm tra lại email hoặc mật khẩu.";
      if (error.code === "auth/network-request-failed")
        errorMsg = "Lỗi kết nối mạng.";
      if (error.code === "auth/user-not-found")
        errorMsg = "Tài khoản không tồn tại.";

      notify("Đăng nhập thất bại", errorMsg);
    } finally {
      setLoading(false); // Tắt xoay xoay
    }
  };

  return (
    <ImageBackground
      source={bgImage}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              <Text style={styles.title}>Chào mừng trở lại!</Text>
              <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
            </View>

            <View style={styles.form}>
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <CustomInput
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
              />

              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPass}
              >
                <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 20, alignItems: "center" }}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color={Colors.light.primary}
                  />
                ) : (
                  <PrimaryButton title="Đăng nhập" onPress={handleLogin} />
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { width: 150, height: 120, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: Colors.light.textGray },
  form: { marginBottom: 30 },
  forgotPass: { alignSelf: "flex-end", marginTop: 10 },
  forgotPassText: { color: Colors.light.primary, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  footerText: { color: Colors.light.textGray, fontSize: 15 },
  registerText: {
    color: Colors.light.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
});
