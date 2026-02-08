// src/services/NotificationService.ts
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../config/firebase";

// Địa chỉ VPS của bạn
const VPS_URL = "http://160.30.113.26:3000";

// Cấu hình cách thông báo hiển thị khi đang mở app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  // 1. Khởi tạo Channel (Bắt buộc để có tiếng Ting trên Android)
  initNotifications: async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "VieGrand Channel",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: "default",
      });
    }
  },

  // 2. Xin quyền thông báo
  requestPermissions: async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  },

  // 3. GỬI THÔNG BÁO QUA VPS & LƯU LỊCH SỬ (ĐÃ CẬP NHẬT)
  sendInAppNotification: async (
    userId: string,
    title: string,
    body: string,
    type: "chat" | "reminder",
  ) => {
    try {
      // BƯỚC A: Lưu vào Firestore để hiện trong tab "Thông báo" của App
      await addDoc(collection(db, "users", userId, "notifications"), {
        title,
        body,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
      });

      // BƯỚC B: Gọi sang VPS để VPS bắn Push Notification ngay lập tức
      console.log(`>>> Đang yêu cầu VPS gửi thông báo tới: ${userId}`);

      fetch(`${VPS_URL}/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          title: title,
          body: body,
          data: { type: type },
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log(">>> Phản hồi từ VPS:", data))
        .catch((err) =>
          console.log(">>> Lỗi gọi VPS (Có thể do Firewall):", err),
        );
    } catch (e) {
      console.error("Lỗi xử lý thông báo:", e);
    }
  },

  // 4. Lấy Token thông báo của máy (Để lưu vào DB cho VPS dùng)
  registerForPushNotificationsAsync: async () => {
    let token: string | null = null;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return null;

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        (Constants as any)?.easConfig?.projectId;

      const tokenObj = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      token = tokenObj.data;
      console.log("✅ Đã lấy được Push Token:", token);
    }
    return token;
  },

  // 5. Lên lịch nhắc nhở hệ thống
  scheduleReminder: async (
    title: string,
    body: string,
    dateStr: string,
    timeStr: string,
    id: string,
    type: string,
  ) => {
    try {
      const [day, month, year] = dateStr.split("/").map(Number);
      const [hour, min] = timeStr.split(":").map(Number);
      const triggerDate = new Date(year, month - 1, day, hour, min);

      const now = new Date();
      if (triggerDate > now) {
        let prefix = "⏰ Nhắc nhở";
        if (type === "pill") prefix = "💊 Đến giờ uống thuốc";
        if (type === "water") prefix = "💧 Đến giờ uống nước";
        if (type === "exercise") prefix = "🏃 Đến giờ tập thể dục";

        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `${prefix}: ${title}`,
            body: body,
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
      }
    } catch (error) {
      console.log("Lỗi lên lịch nhắc nhở:", error);
    }
  },

  // 6. Đánh dấu đã đọc
  markAsRead: async (userId: string, notifId: string) => {
    try {
      const ref = doc(db, "users", userId, "notifications", notifId);
      await updateDoc(ref, { isRead: true });
    } catch (e) {
      console.error(e);
    }
  },

  // 7. Kích hoạt thông báo tại chỗ
  triggerLocalNotification: async (title: string, body: string) => {
    if (Platform.OS === "web") return; // Tránh lỗi trên Web
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });
  },
};
