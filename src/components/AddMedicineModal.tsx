// src/components/AddMedicineModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Khai báo kiểu dữ liệu cho Props của Modal
interface AddMedicineModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddMedicineModal({
  visible,
  onClose,
  onSave,
}: AddMedicineModalProps) {
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    times: "",
    duration: "",
    note: "",
  });

  const handleSave = () => {
    if (!form.name || !form.dosage) {
      alert("Vui lòng nhập tên thuốc và liều lượng");
      return;
    }
    onSave(form);
    // Reset form sau khi lưu
    setForm({
      name: "",
      dosage: "",
      frequency: "",
      times: "",
      duration: "",
      note: "",
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm thuốc mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Truyền kiểu dữ liệu string cho biến 't' để hết lỗi đỏ */}
            <InputLabel
              label="Tên thuốc *"
              value={form.name}
              onChange={(t: string) => setForm({ ...form, name: t })}
              placeholder="Nhập tên thuốc"
            />
            <InputLabel
              label="Liều lượng *"
              value={form.dosage}
              onChange={(t: string) => setForm({ ...form, dosage: t })}
              placeholder="VD: 100mg, 1 viên"
            />
            <InputLabel
              label="Tần suất *"
              value={form.frequency}
              onChange={(t: string) => setForm({ ...form, frequency: t })}
              placeholder="VD: 1 lần/ngày, 2 lần/ngày"
            />
            <InputLabel
              label="Thời gian"
              value={form.times}
              onChange={(t: string) => setForm({ ...form, times: t })}
              placeholder="VD: 08:00, 20:00"
            />
            <InputLabel
              label="Thời gian dùng"
              value={form.duration}
              onChange={(t: string) => setForm({ ...form, duration: t })}
              placeholder="VD: 30 ngày, Lâu dài"
            />
            <InputLabel
              label="Ghi chú"
              value={form.note}
              onChange={(t: string) => setForm({ ...form, note: t })}
              placeholder="Ghi chú về cách uống thuốc"
              isMultiline
            />
          </ScrollView>

          {/* Nút bấm cuối cùng */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Khai báo kiểu dữ liệu cho Component phụ InputLabel
interface InputLabelProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  isMultiline?: boolean;
}

const InputLabel = ({
  label,
  value,
  onChange,
  placeholder,
  isMultiline,
}: InputLabelProps) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        isMultiline && { height: 80, textAlignVertical: "top" },
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      multiline={isMultiline}
    />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  footer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  cancelText: { fontWeight: "bold", color: "#666", fontSize: 16 },
  saveText: { fontWeight: "bold", color: "white", fontSize: 16 },
});
