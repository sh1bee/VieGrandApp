// components/CustomButton.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

// Khai báo những gì nút này cần nhận vào (Text hiển thị, Hàm xử lý khi bấm)
interface Props {
  title: string;
  onPress: () => void;
}

export default function CustomButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: "#0055aa",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: "center", // Căn giữa chữ
    marginVertical: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
