// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications"; // <--- 1. PHẢI THÊM DÒNG NÀY
import { Tabs, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import VoiceModal from "../../src/components/VoiceModal";
import { auth, db } from "../../src/config/firebase";
import { NotificationService } from "../../src/services/NotificationService";

const CustomFloatingButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    activeOpacity={0.8}
    style={styles.micButtonContainer}
    onPress={onPress}
  >
    <View style={styles.micButton}>{children}</View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const router = useRouter();
  const [voiceVisible, setVoiceVisible] = useState(false);

  // --- LOGIC LẮNG NGHE THÔNG BÁO & ÂM THANH TOÀN CỤC ---
  useEffect(() => {
    let unsubscribe: () => void;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        NotificationService.initNotifications();

        // Lấy mốc thời gian ngay lúc mở app để không bị bắn thông báo cũ
        const startTime = Timestamp.now();

        const q = query(
          collection(db, "users", user.uid, "notifications"),
          where("createdAt", ">=", startTime),
          orderBy("createdAt", "desc"),
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const data = change.doc.data();
              // KÍCH HOẠT TING TING VÀ BANNER
              if (!data.isDone) {
                NotificationService.scheduleReminder(
                  data.title,
                  data.content,
                  data.date,
                  data.time,
                  change.doc.id,
                  data.type, // <--- TRUYỀN THÊM TYPE VÀO ĐÂY
                );
              }
            }
          });

          // Cập nhật Badge (Số đỏ trên icon App ngoài màn hình chính)
          // Đếm các thông báo isRead === false trong database
          const unreadQuery = query(
            collection(db, "users", user.uid, "notifications"),
            where("isRead", "==", false),
          );

          getDocs(unreadQuery).then((snap) => {
            Notifications.setBadgeCountAsync(snap.size);
          });
        });
      }
    });

    return () => {
      authUnsub();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const TabIcon = ({ name, focused }: { name: any; focused: boolean }) => (
    <View style={[styles.tabIconWrapper, focused && styles.activeTabBox]}>
      <Ionicons
        name={focused ? name.replace("-outline", "") : name}
        size={24}
        color={focused ? "white" : "#999"}
      />
    </View>
  );

  const handleVoiceAction = (command: string) => {
    setVoiceVisible(false);
    switch (command) {
      case "NAV_HOME":
        router.replace("/(tabs)");
        break;
      case "NAV_CHAT":
        router.push("/(tabs)/chat");
        break;
      case "NAV_HEALTH":
        router.push("/health");
        break;
      case "NAV_SETTINGS":
        router.push("/settings");
        break;
      case "GO_BACK":
        router.back();
        break;
      case "ACTION_SOS":
        alert("Đang gọi khẩn cấp!");
        break;
      case "ACTION_WEATHER":
        router.replace("/(tabs)");
        break;
      default:
        alert("Xin lỗi, tôi không hiểu lệnh này.");
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: {
            height: 70,
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: (p) => (
              <TabIcon name="home-outline" focused={p.focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: (p) => (
              <TabIcon name="chatbubble-outline" focused={p.focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="voice"
          options={{
            tabBarButton: (p) => (
              <CustomFloatingButton onPress={() => setVoiceVisible(true)}>
                <Ionicons name="mic" size={28} color="white" />
              </CustomFloatingButton>
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            tabBarIcon: (p) => (
              <TabIcon name="heart-outline" focused={p.focused} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.push("/health");
            },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: (p) => (
              <TabIcon name="settings-outline" focused={p.focused} />
            ),
          }}
        />
      </Tabs>

      <VoiceModal
        visible={voiceVisible}
        mode="command"
        onAction={handleVoiceAction}
        onClose={() => setVoiceVisible(false)}
      />
    </>
  );
}

// Bổ sung getDocs vào import firebase/firestore ở trên nếu chưa có
import { getDocs } from "firebase/firestore";

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 0,
  },
  tabIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginTop: 10,
  },
  activeTabBox: { backgroundColor: "#0088cc" },
  micButtonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    position: "absolute",
    top: -18,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
