// src/utils/weatherService.ts

export const getWeather = async (lat: number, lon: number) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Lỗi lấy thời tiết:", error);
    return null;
  }
};

// Hàm map mã thời tiết WMO sang tên ảnh trong assets
export const getWeatherIcon = (code: number) => {
  // 0: Trời quang, 1-3: Có mây
  if (code <= 3) return "cloudy";

  // 45-48: Sương mù -> Coi như nhiều mây
  if (code <= 48) return "cloudy";

  // 51-67: Mưa phùn / Mưa rào nhẹ
  if (code <= 67) return "rain_light";

  // 71-77: Tuyết (VN hiếm, cứ để mưa nhẹ cho đẹp)
  if (code <= 77) return "rain_light";

  // 80-99: Mưa rào mạnh / Dông bão
  if (code >= 80) return "rain_heavy";

  return "cloudy"; // Mặc định
};

// Hàm map mã thời tiết sang tên tiếng Việt để hiển thị
export const getWeatherName = (code: number) => {
  if (code === 0) return "Trời quang";
  if (code <= 3) return "Nhiều mây";
  if (code <= 48) return "Sương mù";
  if (code <= 67) return "Mưa nhẹ";
  if (code >= 80) return "Mưa dông";
  return "Có mưa";
};
