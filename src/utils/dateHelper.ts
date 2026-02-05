// src/utils/dateHelper.ts

// 1. Kiểm tra ngày có tồn tại thật trên lịch không
export const isValidRealDate = (dateStr: string): boolean => {
  // Kiểm tra định dạng cơ bản DD/MM/YYYY
  const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (!regex.test(dateStr)) return false;

  const [day, month, year] = dateStr.split("/").map(Number);

  // Kiểm tra tháng hợp lệ 1-12
  if (month < 1 || month > 12) return false;

  // Dùng logic: Tạo một đối tượng Date rồi kiểm tra ngược lại
  // Nếu ta nhập 32/1, JS sẽ tạo ra ngày 1/2.
  // Ta so sánh ngày cũ (32) với ngày mới (1) -> Thấy khác nhau => Ngày sai.
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// 2. Kiểm tra ngày tương lai (Giữ nguyên và tối ưu)
export const isValidFutureDate = (dateStr: string): boolean => {
  if (!isValidRealDate(dateStr)) return false;

  const [day, month, year] = dateStr.split("/").map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate >= today;
};

// 3. Định dạng giờ thông minh (Giữ nguyên bản cũ của bạn)
export const formatTimeInput = (input: string): string | null => {
  const val = input.replace(/[^0-9]/g, "");
  let hours = 0;
  let mins = 0;
  if (val.length === 1 || val.length === 2) {
    hours = parseInt(val);
  } else if (val.length === 3) {
    hours = parseInt(val[0]);
    mins = parseInt(val.substring(1, 3));
  } else if (val.length === 4) {
    hours = parseInt(val.substring(0, 2));
    mins = parseInt(val.substring(2, 4));
  } else return null;

  if (hours < 0 || hours > 23 || mins < 0 || mins > 59) return null;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

export const getDateStrings = () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  return {
    todayStr: today.toLocaleDateString("vi-VN"),
    tomorrowStr: tomorrow.toLocaleDateString("vi-VN"),
  };
};
