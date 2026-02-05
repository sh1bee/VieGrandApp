// src/constants/Colors.ts

// Định nghĩa màu chung
const primaryColor = "#0F4C81"; // Màu xanh VieGrand

export const Colors = {
  // Cấu hình cho chế độ Sáng (Light Mode)
  light: {
    text: "#1A1A1A",
    background: "#FFFFFF",
    primary: primaryColor,
    textGray: "#666666",
    inactiveDot: "#D9D9D9",
    icon: "#687076", // Màu icon mặc định
    tabIconDefault: "#687076",
    tabIconSelected: primaryColor,
  },
  // Cấu hình cho chế độ Tối (Dark Mode) - Tạm thời để giống hệt Light
  dark: {
    text: "#FFFFFF",
    background: "#151718",
    primary: primaryColor,
    textGray: "#9BA1A6",
    inactiveDot: "#404040",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FFFFFF",
  },
};
