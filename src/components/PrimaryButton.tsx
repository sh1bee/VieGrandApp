// src/components/PrimaryButton.tsx
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/Colors";

interface Props {
  title: string;
  onPress: () => void;
}

const { width } = Dimensions.get("window");

export default function PrimaryButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    width: width * 0.9, // Chiếm 90% chiều rộng màn hình
    paddingVertical: 15,
    borderRadius: 8, // Bo góc nhẹ giống hình
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  text: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
});
