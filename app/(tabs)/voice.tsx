// app/(tabs)/voice.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import VoiceModal from "../../src/components/VoiceModal";

export default function VoiceScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.1)" }}>
      <VoiceModal
        visible={visible}
        command="tin nhắn"
        onClose={() => {
          setVisible(false);
          router.back(); // Khi đóng modal thì quay lại trang trước đó
        }}
      />
    </View>
  );
}
