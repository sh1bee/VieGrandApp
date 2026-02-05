// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
