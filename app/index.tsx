// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const userRole = await AsyncStorage.getItem("userRole"); // Lấy vai trò đã lưu

      if (isLoggedIn === "true") {
        // PHÂN LUỒNG TẠI ĐÂY
        if (userRole === "relative") {
          router.replace("/(relative-tabs)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        router.replace("/(auth)/login");
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0088cc" />
    </View>
  );
}
