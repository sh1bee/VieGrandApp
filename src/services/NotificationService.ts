// src/services/NotificationService.ts
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
        importance: Notifications.AndroidImportance.MAX, // Mức cao nhất để hiện banner & chuông
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: "default", // Sử dụng tiếng Ting mặc định hệ thống
      });
    }
  },
  // 1. Xin quyền
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

  // 2. Lưu lịch sử (Để hiện chấm đỏ badge)
  sendInAppNotification: async (
    userId: string,
    title: string,
    body: string,
    type: "chat" | "reminder",
  ) => {
    try {
      // Quan trọng: Dùng serverTimestamp() để đồng bộ thời gian tuyệt đối
      await addDoc(collection(db, "users", userId, "notifications"), {
        title,
        body,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  },

  // 3. ĐÃ BỔ SUNG: Lên lịch thông báo hệ thống (Chạy cả khi tắt máy)
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
        // Tùy biến icon/tiêu đề dựa theo loại nhắc nhở
        let prefix = "⏰ Nhắc nhở";
        if (type === "pill") prefix = "💊 Đến giờ uống thuốc";
        if (type === "water") prefix = "💧 Đến giờ uống nước";
        if (type === "exercise") prefix = "🏃 Đến giờ tập thể dục";

        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: `${prefix}: ${title}`, // VD: 💊 Đến giờ uống thuốc: Aspirin
            body: `Nội dung: ${body}`,
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
      console.log(error);
    }
  },

  // 4. Đánh dấu đã đọc
  markAsRead: async (userId: string, notifId: string) => {
    try {
      const ref = doc(db, "users", userId, "notifications", notifId);
      await updateDoc(ref, { isRead: true });
    } catch (e) {
      console.error(e);
    }
  },
  // 3. Hàm kích hoạt thông báo hệ thống ngay lập tức (Trigger)
  triggerLocalNotification: async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // null = Hiện ngay lập tức
    });
  },
};
