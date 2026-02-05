// app/(auth)/register.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore"; // Thêm query, where, getDocs
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../src/config/firebase";

import CustomInput from "../../src/components/Input/CustomInput";
import PrimaryButton from "../../src/components/PrimaryButton";
import PrivateKeyModal from "../../src/components/PrivateKeyModal";
import { Colors } from "../../src/constants/Colors";

const bgImage = require("../../assets/images/onboarding_bg.png");
const logo = require("../../assets/images/logo_viegrand.png");

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [privateKey, setPrivateKey] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [role, setRole] = useState<"elder" | "relative">("elder");
  const [isFinalConfirmation, setIsFinalConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái đang xử lý đăng ký

  // --- 1. HÀM TẠO KEY MẠNH HƠN (TIMESTAMP + RANDOM) ---
  const generateKey = () => {
    // Kết hợp thời gian hiện tại (base36) và một chuỗi ngẫu nhiên để đảm bảo tính duy nhất
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newKey = (timestamp + randomStr).toUpperCase();
    setPrivateKey(newKey);
    console.log("🛠 Đã tạo Private Key mới:", newKey);
  };

  useEffect(() => {
    generateKey();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const validate = () => {
    let isValid = true;
    let newErrors = { name: "", phone: "", email: "", password: "" };
    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
      isValid = false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 số";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }
    if (form.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleCopy = () => {
    setIsFinalConfirmation(false);
    setModalVisible(true);
  };

  const handleRegister = () => {
    if (validate()) {
      setIsFinalConfirmation(true);
      setModalVisible(true);
    } else {
      Alert.alert("Thông báo", "Vui lòng kiểm tra lại thông tin.");
    }
  };

  // --- 2. LOGIC KIỂM TRA TÍNH DUY NHẤT CỦA KEY TRÊN DATABASE ---
  const isKeyUnique = async (key: string) => {
    const q = query(collection(db, "users"), where("privateKey", "==", key));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Trả về true nếu không ai dùng mã này
  };

  // --- 3. HÀM ĐĂNG KÝ CHÍNH THỨC ---
  const onModalContinue = async () => {
    setModalVisible(false);
    if (!isFinalConfirmation) return;

    setIsProcessing(true);
    try {
      // BƯỚC A: Kiểm tra mã QR/PrivateKey có bị trùng không
      const unique = await isKeyUnique(privateKey);
      if (!unique) {
        // Nếu trùng, tự động tạo mã mới và yêu cầu user bấm lại (Rất hiếm khi xảy ra với logic timestamp)
        generateKey();
        setIsProcessing(false);
        Alert.alert(
          "Lỗi hệ thống",
          "Mã bảo mật bị trùng, chúng tôi đã tạo mã mới cho bạn. Vui lòng bấm Đăng ký lại.",
        );
        return;
      }

      // BƯỚC B: Tạo tài khoản Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      const user = userCredential.user;

      // BƯỚC C: Lưu vào Firestore (Đảm bảo gán đúng biến privateKey đang hiện ở UI)
      const userPayload = {
        uid: user.uid,
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.toLowerCase(),
        role: role,
        privateKey: privateKey, // <--- GIÁ TRỊ TỪ STATE HIỆN TẠI
        createdAt: new Date().toISOString(),
        status: "active",
        familyMembers: [], // Khởi tạo mảng gia đình trống
      };

      await setDoc(doc(db, "users", user.uid), userPayload);
      console.log("✅ Đã lưu User với Key:", privateKey);

      // BƯỚC D: Lưu vào máy
      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem("userRole", role);
      await AsyncStorage.setItem("userName", form.name);

      Alert.alert("Thành công", "Tài khoản của bạn đã sẵn sàng!", [
        {
          text: "Bắt đầu",
          onPress: () => {
            if (role === "elder") router.replace("/(tabs)");
            else router.replace("/(relative-tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error.code);
      let msg = "Đăng ký thất bại. Vui lòng thử lại.";
      if (error.code === "auth/email-already-in-use")
        msg = "Email này đã được sử dụng.";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ImageBackground source={bgImage} style={styles.background}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, fontWeight: "bold" }}>
              Đang khởi tạo tài khoản...
            </Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Tạo tài khoản mới</Text>
          </View>

          <CustomInput
            placeholder="Họ và tên"
            value={form.name}
            onChangeText={(t) => handleChange("name", t)}
            error={errors.name}
          />
          <CustomInput
            placeholder="Số điện thoại"
            keyboardType="numeric"
            value={form.phone}
            onChangeText={(t) => handleChange("phone", t)}
            error={errors.phone}
          />
          <CustomInput
            placeholder="Email"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
            error={errors.email}
          />
          <CustomInput
            placeholder="Mật khẩu"
            isPassword={true}
            value={form.password}
            onChangeText={(t) => handleChange("password", t)}
            error={errors.password}
          />

          <View style={styles.keySection}>
            <Text style={styles.label}>Private Key (Mã định danh):</Text>
            <View style={styles.keyDisplay}>
              <Text style={styles.keyText}>{privateKey}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
                onPress={handleCopy}
              >
                <Ionicons name="copy-outline" size={20} color="white" />
                <Text style={styles.actionBtnText}>Sao chép</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#28A745" }]}
                onPress={generateKey}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.actionBtnText}>Tạo mới</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>
              ⚠️ Mã này dùng để khôi phục tài khoản và mua Premium.
            </Text>
          </View>

          <Text style={[styles.label, { alignSelf: "center", marginTop: 10 }]}>
            Chọn vai trò:
          </Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleBtn, role === "elder" && styles.roleBtnActive]}
              onPress={() => setRole("elder")}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={role === "elder" ? "white" : "#666"}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "elder" && styles.roleTextActive,
                ]}
              >
                Người cao tuổi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "relative" && styles.roleBtnActive,
              ]}
              onPress={() => setRole("relative")}
            >
              <Ionicons
                name="people-outline"
                size={20}
                color={role === "relative" ? "white" : "#666"}
              />
              <Text
                style={[
                  styles.roleText,
                  role === "relative" && styles.roleTextActive,
                ]}
              >
                Người thân
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 20 }}>
            <PrimaryButton title="Đăng ký" onPress={handleRegister} />
          </View>

          <View style={styles.footer}>
            <Text style={{ color: "#666" }}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: Colors.light.primary, fontWeight: "bold" }}>
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <PrivateKeyModal
        visible={modalVisible}
        privateKey={privateKey}
        onClose={() => setModalVisible(false)}
        onContinue={onModalContinue}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginVertical: 30 },
  logo: { width: 100, height: 80, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: Colors.light.primary },
  keySection: { marginTop: 10 },
  label: { fontWeight: "bold", marginBottom: 5, color: "#333" },
  keyDisplay: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    marginBottom: 10,
  },
  keyText: {
    fontSize: 16,
    color: "#333",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionBtnText: { color: "white", fontWeight: "bold" },
  noteText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    lineHeight: 18,
  },
  roleContainer: { flexDirection: "row", gap: 15, marginTop: 10 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "white",
  },
  roleBtnActive: { backgroundColor: Colors.light.primary },
  roleText: { color: "#666", fontWeight: "600" },
  roleTextActive: { color: "white" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
});
