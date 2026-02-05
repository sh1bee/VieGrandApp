// src/components/Input/CustomInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  isPassword?: boolean;
  error?: string; // <--- Thêm cái này để nhận thông báo lỗi
  keyboardType?: "default" | "numeric" | "email-address"; // Thêm loại bàn phím
}

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  error,
  keyboardType = "default",
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, error ? styles.errorBorder : null]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textGray}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.icon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={Colors.light.textGray}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Nếu có lỗi thì hiện dòng chữ đỏ bên dưới */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    width: "100%",
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red", // Viền đỏ khi lỗi
  },
  input: {
    flex: 1,
    height: "100%",
    color: Colors.light.text,
    fontSize: 16,
  },
  icon: { marginLeft: 10 },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});
