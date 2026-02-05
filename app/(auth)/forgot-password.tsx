// app/(auth)/forgot-password.tsx
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CustomInput from "../../src/components/Input/CustomInput";
import PrimaryButton from "../../src/components/PrimaryButton";
import { Colors } from "../../src/constants/Colors";

const bgImage = require("../../assets/images/onboarding_bg.png");

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.description}>
            Đừng lo! Điều đó xảy ra. Vui lòng nhập email liên kết với tài khoản
            của bạn.
          </Text>

          <View style={{ width: "100%", marginVertical: 20 }}>
            <CustomInput placeholder="Email" />
          </View>

          <PrimaryButton
            title="Gửi mã OTP"
            onPress={() => console.log("Gửi OTP")}
          />

          <TouchableOpacity
            style={{ marginTop: 20 }}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Quay lại Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50, // Đẩy nội dung lên cao một chút cho đẹp
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textGray,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  backText: {
    color: Colors.light.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
});
