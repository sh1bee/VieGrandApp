import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  Dimensions,
  Image,
  StyleSheet,
  View
} from "react-native";

const logo = require("../assets/images/logo_viegrand.png");

export default function RootLayout() {
  const [splashVisible, setSplashVisible] = useState(true); // hiện khi khởi động
  const opacity = useRef(new Animated.Value(1)).current;
  const appState = useRef(AppState.currentState);

  const showSplash = (duration = 900) => {
    setSplashVisible(true);
    opacity.setValue(1);
    // Ẩn dần
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }, duration);
  };

  useEffect(() => {
    // Ẩn splash lần đầu sau 1s
    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }, 1000);

    // Lắng nghe khi app trở về foreground
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        showSplash(400); // hiển thị nhanh khi trở về foreground
      }
      appState.current = next;
    });

    return () => {
      clearTimeout(t);
      sub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. Màn hình khởi động */}
        <Stack.Screen name="index" />

        {/* 2. Các nhóm màn hình (Folder) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 3. Các màn hình lẻ (nằm trực tiếp trong app/) */}
        <Stack.Screen name="chat-detail" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        {/* ...Thêm các tên file khác nếu cần, nhưng Expo Router thường tự động nhận diện... */}
      </Stack>

      {splashVisible && (
        <Animated.View style={[styles.overlay, { opacity }]}>
          <View style={styles.logoBox}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logoBox: {
    width: Math.min(220, width * 0.5),
    height: Math.min(220, width * 0.5),
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
