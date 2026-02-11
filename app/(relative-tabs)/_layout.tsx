// app/(relative-tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
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
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native"; // Thêm Platform
import { auth, db } from "../../src/config/firebase";
import { NotificationService } from "../../src/services/NotificationService";

export default function RelativeTabLayout() {
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: () => void;
    let unsubscribeBadge: () => void;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Chỉ khởi tạo trên điện thoại
        if (Platform.OS !== "web") {
          NotificationService.initNotifications();
        }

        const startTime = Timestamp.now();
        const qNew = query(
          collection(db, "users", user.uid, "notifications"),
          where("createdAt", ">=", startTime),
          orderBy("createdAt", "desc"),
        );

        unsubscribe = onSnapshot(qNew, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && Platform.OS !== "web") {
              const data = change.doc.data();
              NotificationService.triggerLocalNotification(
                data.title,
                data.body,
              );
            }
          });
        });

        // LUỒNG BADGE: Chỉ chạy trên Mobile để tránh lỗi nodeValue (Ảnh 1)
        if (Platform.OS !== "web") {
          const qUnread = query(
            collection(db, "users", user.uid, "notifications"),
            where("isRead", "==", false),
          );
          unsubscribeBadge = onSnapshot(qUnread, (snap) => {
            Notifications.setBadgeCountAsync(snap.size);
          });
        }
      }
    });

    return () => {
      authUnsub();
      if (unsubscribe) unsubscribe();
      if (unsubscribeBadge) unsubscribeBadge();
    };
  }, []);

  // ... (Phần TabIcon và return Tabs giữ nguyên như cũ)
  const TabIcon = ({ name, focused }: { name: any; focused: boolean }) => (
    <View style={[styles.iconWrapper, focused && styles.activeWrapper]}>
      <Ionicons
        name={focused ? name : name + "-outline"}
        size={24}
        color={focused ? "white" : "#999"}
      />
    </View>
  );

  return (
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
          tabBarIcon: (p) => <TabIcon name="home" focused={p.focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: (p) => <TabIcon name="chatbubble" focused={p.focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: (p) => <TabIcon name="stats-chart" focused={p.focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: (p) => <TabIcon name="settings" focused={p.focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingBottom: 0,
    borderTopWidth: 0,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  activeWrapper: {
    backgroundColor: "#0088cc",
    shadowColor: "#0088cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
