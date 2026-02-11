// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications"; // 4. Thêm import Notifications
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform, // 3. Đã có Platform ở đây
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import các tài nguyên và dịch vụ
import FamilyConnectModal from "../../src/components/FamilyConnectModal";
import { auth, db } from "../../src/config/firebase";
import { NotificationService } from "../../src/services/NotificationService"; // 5. Thêm import Service
import {
  getWeather,
  getWeatherIcon,
  getWeatherName,
} from "../../src/utils/weatherService";

const { width } = Dimensions.get("window");

const bgImage = require("../../assets/images/home_bg.png");
const avatarUrl = "https://i.pravatar.cc/150?img=11";

const weatherImages: any = {
  cloudy: require("../../assets/images/weather_cloudy.png"),
  rain_light: require("../../assets/images/weather_rain_light.png"),
  rain_heavy: require("../../assets/images/weather_rain_heavy.png"),
};

const getDayLabel = (dateString: string, index: number) => {
  if (index === 0) return "Hôm nay";
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const date = new Date(dateString);
  return days[date.getDay()];
};

const FeatureButton = ({
  icon,
  label,
  iconColor,
  isEmergency,
  onPress,
}: any) => (
  <TouchableOpacity
    style={styles.featureItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.featureIconBox,
        isEmergency && { backgroundColor: "#FF3B30" },
      ]}
    >
      <Ionicons
        name={icon}
        size={28}
        color={isEmergency ? "white" : iconColor}
      />
    </View>
    <Text
      style={[
        styles.featureText,
        isEmergency && { color: "#FF3B30", fontWeight: "bold" },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();

  const [name, setName] = useState("Đang tải...");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [temp, setTemp] = useState(0);
  const [weatherType, setWeatherType] = useState("cloudy");
  const [weatherLabel, setWeatherLabel] = useState("Đang tải...");
  const [forecast, setForecast] = useState<any[]>([]);
  const [locationName, setLocationName] = useState("Đang xác định...");
  const [showConnect, setShowConnect] = useState(false);
  const [myKey, setMyKey] = useState("");
  const [isFetchingKey, setIsFetchingKey] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyInput, setEmergencyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  // --- 1. LOGIC LẤY THÔNG TIN USER REALTIME ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const unsubscribeDoc = onSnapshot(
          doc(db, "users", user.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setName(userData.name || "Người dùng");
              setAvatarUrl(userData.avatarUrl || "");
              setMyKey(userData.privateKey || "");
              AsyncStorage.setItem("userName", userData.name || "Người dùng");
            }
          },
        );
        return () => unsubscribeDoc();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- 2. LOGIC LẮNG NGHE THÔNG BÁO (HIỆN SỐ ĐỎ & NỔ CHUÔNG) ---
  useEffect(() => {
    let unsubscribe: () => void;
    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        NotificationService.initNotifications();
        const startTime = Timestamp.now();

        // Lắng nghe tin nhắn/nhắc nhở mới để nổ chuông
        const q = query(
          collection(db, "users", user.uid, "notifications"),
          where("createdAt", ">=", startTime),
          orderBy("createdAt", "desc"),
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              if (Platform.OS !== "web") {
                NotificationService.triggerLocalNotification(
                  data.title,
                  data.body,
                );
              }
            }
          });
        });

        // Lắng nghe tổng số tin chưa đọc để hiện Badge (số đỏ)
        const qUnread = query(
          collection(db, "users", user.uid, "notifications"),
          where("isRead", "==", false),
        );
        const unsubUnread = onSnapshot(qUnread, (snap) => {
          setUnreadCount(snap.size);
          if (Platform.OS !== "web")
            Notifications.setBadgeCountAsync(snap.size);
        });

        return () => {
          if (unsubscribe) unsubscribe();
          unsubUnread();
        };
      }
    });
    return () => authUnsub();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. Cập nhật thời gian online lên Firestore cho VPS theo dõi
        updateDoc(doc(db, "users", user.uid), {
          lastLoginAt: serverTimestamp()
        });

        // 2. Lắng nghe dữ liệu User
        const unsubDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setName(userData.name || "Người dùng");
            
            // --- KIỂM TRA SỐ KHẨN CẤP ---
            // Nếu chưa có số trong database -> Bắt buộc hiện Modal
            if (!userData.emergency_phone || userData.emergency_phone.trim() === "") {
              setShowEmergencyModal(true);
            } else {
              // Nếu có rồi thì lưu vào máy để dùng cho nút gọi đỏ
              AsyncStorage.setItem("emergency_phone", userData.emergency_phone);
              setShowEmergencyModal(false);
            }
          }
        });
        return () => unsubDoc();
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- HÀM LƯU SỐ KHẨN CẤP BẮT BUỘC ---
  const handleForceSavePhone = async () => {
    if (emergencyInput.length < 10) {
      Alert.alert("Thông báo", "Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          emergency_phone: emergencyInput
        });
        await AsyncStorage.setItem("emergency_phone", emergencyInput);
        Alert.alert("Thành công", "Đã lưu số điện thoại người thân.");
        setShowEmergencyModal(false);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể kết nối với máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };


  // --- 3. LOGIC THỜI TIẾT THEO VỊ TRÍ ---
  useEffect(() => {
    const loadWeather = async () => {
      try {
        let lat = 10.82;
        let lon = 106.63;
        let cityName = "TP. Hồ Chí Minh";
        const { status } = await Location.requestForegroundPermissionsAsync();
        const isGPSEnabled = await Location.hasServicesEnabledAsync();

        if (status === "granted" && isGPSEnabled) {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
          const addr = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lon,
          });
          if (addr[0]) cityName = addr[0].district || addr[0].city || cityName;
        }
        setLocationName(cityName);

        const weatherData = await getWeather(lat, lon);
        if (weatherData) {
          const currentCode = weatherData.current.weather_code;
          setTemp(Math.round(weatherData.current.temperature_2m));
          setWeatherType(getWeatherIcon(currentCode));
          setWeatherLabel(getWeatherName(currentCode));

          // FIX LỖI BIẾN DAILY TẠI ĐÂY
          setForecast(
            weatherData.daily.time.map((time: string, index: number) => ({
              date: time,
              max: Math.round(weatherData.daily.temperature_2m_max[index]),
              icon: getWeatherIcon(weatherData.daily.weather_code[index]),
            })),
          );
        }
      } catch (e) {}
    };
    loadWeather();
  }, []);

  const handleEmergencyCall = async () => {
    try {
      const phoneNumber = await AsyncStorage.getItem("emergency_phone");
      if (!phoneNumber) {
        Alert.alert("Cảnh báo", "Chưa cài đặt số khẩn cấp!", [
          {
            text: "Cài đặt",
            onPress: () => router.push("/emergency-settings"),
          },
          { text: "Hủy" },
        ]);
        return;
      }
      Linking.openURL(`tel:${phoneNumber.replace(/\s/g, "")}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gọi điện.");
    }
  };
  const registerPushToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const token =
        await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        // Lưu token vào mảng fcmTokens (dùng arrayUnion để không bị trùng)
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          lastLoginAt: serverTimestamp(), // Cập nhật giờ online
        });
      }
    }
  };
  registerPushToken();

  const handleOpenConnect = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setShowConnect(true);
    if (!myKey) {
      setIsFetchingKey(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists() && !snap.data().privateKey) {
          const autoKey = Math.random()
            .toString(36)
            .substring(2, 14)
            .toUpperCase();
          await updateDoc(userRef, { privateKey: autoKey });
          setMyKey(autoKey);
        } else if (snap.exists()) {
          setMyKey(snap.data().privateKey);
        }
      } catch (e) {
        setMyKey("ERR_NETWORK");
      } finally {
        setIsFetchingKey(false);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => router.push("/profile")}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Chào buổi sáng</Text>
                <Text style={styles.userName}>{name}</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleOpenConnect}
              >
                <Ionicons name="grid-outline" size={24} color="#0055aa" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#0055aa"
                />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <LinearGradient
              colors={["#007AFF", "#0055aa"]}
              style={styles.weatherCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.weatherInfo}>
                <Text style={styles.tempText}>{temp}°</Text>
                <Text style={styles.tempRange}>
                  H:{forecast[0]?.max || temp + 2}° L:{temp - 2}°
                </Text>
                <Text style={styles.location}>{locationName}</Text>
              </View>
              <View style={styles.weatherVisual}>
                <Image
                  source={weatherImages[weatherType] || weatherImages.cloudy}
                  style={styles.weatherIconMain}
                  resizeMode="contain"
                />
                <Text style={styles.weatherCondition}>{weatherLabel}</Text>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Dự báo 3 ngày</Text>
            <View style={styles.forecastRow}>
              {forecast.length > 0 ? (
                forecast.map((day, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Image
                      source={weatherImages[day.icon]}
                      style={styles.smallWeatherIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.forecastTemp}>{day.max}°</Text>
                    <Text style={styles.forecastDay}>
                      {getDayLabel(day.date, index)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={{ padding: 20 }}>
                  <ActivityIndicator color="#0088cc" />
                </View>
              )}
            </View>

            <LinearGradient
              colors={["#2c3e50", "#4ca1af"]}
              style={styles.premiumCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="star" size={20} color="#F1C40F" />
                <Text style={styles.premiumText}> PREMIUM ACTIVE</Text>
              </View>
              <TouchableOpacity style={styles.manageBtn}>
                <Text style={styles.manageBtnText}>Quản lý</Text>
              </TouchableOpacity>
            </LinearGradient>

            <Text style={styles.sectionTitleCenter}>Chức năng</Text>
            <View style={styles.gridContainer}>
              <FeatureButton
                icon="heart-outline"
                label="Sức khỏe"
                onPress={() => router.push("/health")}
              />
              <FeatureButton
                icon="shield-checkmark-outline"
                label="Điểm danh"
                iconColor="#4CAF50"
                onPress={() => router.push("/safety-checkin")}
              />
              <FeatureButton
                icon="analytics-outline"
                label="Nguy cơ"
                iconColor="#FF9800"
                onPress={() => router.push("/stroke-risk")}
              />
              <FeatureButton icon="play-outline" label="Giải trí" />
              <FeatureButton
                icon="time-outline"
                label="Nhắc nhở"
                onPress={() => router.push("/reminders")}
              />
              <FeatureButton icon="person-outline" label="Gia đình" />
              <FeatureButton
                icon="chatbubble-outline"
                label="Tin nhắn"
                onPress={() => router.push("/chat")}
              />
              <FeatureButton
                icon="settings-outline"
                label="Cài đặt"
                onPress={() => router.push("/settings")}
              />
              <FeatureButton
                icon="call"
                label="Gọi khẩn cấp"
                isEmergency={true}
                onPress={handleEmergencyCall}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
      
      {/* --- MODAL CHẶN (BẮT BUỘC NHẬP SỐ) --- */}
      <Modal visible={showEmergencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="warning" size={40} color="#FF9800" />
            </View>
            <Text style={styles.modalTitle}>Thông tin bắt buộc</Text>
            <Text style={styles.modalDesc}>
              Bác vui lòng nhập số điện thoại của con cháu hoặc người thân để chúng cháu có thể hỗ trợ bác ngay khi cần thiết.
            </Text>

            <TextInput 
              style={styles.modalInput}
              placeholder="Nhập số điện thoại (10 số)..."
              keyboardType="numeric"
              value={emergencyInput}
              onChangeText={setEmergencyInput}
              maxLength={11}
            />

            <TouchableOpacity 
              style={[styles.modalBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleForceSavePhone}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>Lưu và Bắt đầu</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FamilyConnectModal
        visible={showConnect}
        onClose={() => setShowConnect(false)}
        myPrivateKey={myKey}
        isLoading={isFetchingKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%", position: "absolute" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "#0055aa",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  greeting: { color: "#666", fontSize: 14 },
  userName: { color: "#0055aa", fontSize: 18, fontWeight: "bold" },
  headerIcons: { flexDirection: "row", gap: 10 },
  iconBtn: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  weatherCard: {
    margin: 20,
    borderRadius: 25,
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 180,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  weatherInfo: { justifyContent: "space-between" },
  tempText: { fontSize: 60, color: "white", fontWeight: "bold" },
  tempRange: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  location: { color: "white", fontSize: 18, fontWeight: "600" },
  weatherVisual: { alignItems: "center", justifyContent: "center", width: 140 },
  weatherIconMain: { width: 100, height: 100, marginBottom: 5 },
  weatherCondition: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
    marginBottom: 10,
  },
  sectionTitleCenter: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  forecastItem: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: "31%",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    elevation: 3,
  },
  smallWeatherIcon: { width: 40, height: 40, marginBottom: 5 },
  forecastTemp: { fontSize: 20, fontWeight: "bold", color: "#333" },
  forecastDay: { color: "#666", fontSize: 14 },
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  premiumText: { color: "white", fontWeight: "bold", fontSize: 16 },
  manageBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  manageBtnText: { color: "white", fontSize: 12 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  featureItem: { width: "33.33%", alignItems: "center", marginBottom: 20 },
  featureIconBox: {
    width: 65,
    height: 65,
    backgroundColor: "white",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  featureText: { color: "#333", fontSize: 14, fontWeight: "500" },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "white",
    zIndex: 10,
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 25 },
  modalCard: { backgroundColor: 'white', width: '100%', borderRadius: 25, padding: 25, alignItems: 'center' },
  warningIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  modalDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  modalInput: { width: '100%', height: 55, borderWidth: 1, borderColor: '#DDD', borderRadius: 12, paddingHorizontal: 15, fontSize: 18, backgroundColor: '#F9F9F9', marginBottom: 20, textAlign: 'center' },
  modalBtn: { width: '100%', height: 55, backgroundColor: '#007AFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
