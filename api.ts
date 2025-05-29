import axios from "axios";
import {
  BASE_OPEN_WEATHER_API_URL,
  OPEN_WEATHER_API_KEY,
  URLIX_API_KEY,
} from "./credentials";

export async function currentWeather(latitude: number, longitude: number) {
  const res = await axios.get(
    `${BASE_OPEN_WEATHER_API_URL}weather?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}`
  );
  return res.data;
}

export async function forecastWeather(latitude: number, longitude: number) {
  const res = await axios.get(
    `${BASE_OPEN_WEATHER_API_URL}forecast?lat=${latitude}&lon=${longitude}&appid=${OPEN_WEATHER_API_KEY}`
  );
  return res.data;
}

export async function getShortedURL(url: string, urlName?: string) {
  const res = await axios.post(
    "https://urlix.me/api/create",
    {
      redirectUrl: url,
      urlName: urlName,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": URLIX_API_KEY,
      },
    }
  );
  return res.data;
}
