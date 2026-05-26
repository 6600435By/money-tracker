/** Координаты Минска (WGS84) — Open-Meteo Forecast API */
export const MINSK_LATITUDE = 53.9
export const MINSK_LONGITUDE = 27.559
export const MINSK_TIMEZONE = 'Europe/Minsk'

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'

export interface CurrentWeather {
  time: string
  temperature: number
  weatherCode: number
}

export interface DayForecast {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
}

export interface MinskWeather {
  current: CurrentWeather
  tomorrow: DayForecast
}

interface OpenMeteoResponse {
  current?: {
    time?: string
    temperature_2m?: number
    weather_code?: number
  }
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
  }
}

/** Текущая погода и прогноз на завтра для Минска */
export async function fetchMinskWeather(): Promise<MinskWeather | null> {
  const params = new URLSearchParams({
    latitude: String(MINSK_LATITUDE),
    longitude: String(MINSK_LONGITUDE),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: MINSK_TIMEZONE,
    forecast_days: '2',
  })

  try {
    const response = await fetch(`${FORECAST_API}?${params}`, {
      next: { revalidate: 900 },
    })

    if (!response.ok) return null

    const data = (await response.json()) as OpenMeteoResponse
    const { current, daily } = data

    if (
      current?.time == null ||
      current.temperature_2m == null ||
      current.weather_code == null ||
      !daily?.time?.length ||
      daily.time.length < 2 ||
      daily.weather_code?.[1] == null ||
      daily.temperature_2m_max?.[1] == null ||
      daily.temperature_2m_min?.[1] == null
    ) {
      return null
    }

    return {
      current: {
        time: current.time,
        temperature: current.temperature_2m,
        weatherCode: current.weather_code,
      },
      tomorrow: {
        date: daily.time[1],
        weatherCode: daily.weather_code[1],
        tempMax: daily.temperature_2m_max[1],
        tempMin: daily.temperature_2m_min[1],
      },
    }
  } catch (error) {
    console.error('fetchMinskWeather error:', error)
    return null
  }
}

/** Краткое описание по WMO weather_code (Open-Meteo) */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Ясно'
  if (code <= 3) return 'Облачно'
  if (code === 45 || code === 48) return 'Туман'
  if (code >= 51 && code <= 57) return 'Морось'
  if (code >= 61 && code <= 67) return 'Дождь'
  if (code >= 71 && code <= 77) return 'Снег'
  if (code >= 80 && code <= 82) return 'Ливень'
  if (code >= 85 && code <= 86) return 'Снегопад'
  if (code >= 95) return 'Гроза'
  return 'Погода'
}

export function formatCurrentTemperature(temp: number): string {
  return `${Math.round(temp)}°`
}

export function formatDayTemperature(max: number, min: number): string {
  return `${Math.round(max)}°/${Math.round(min)}°`
}

export function formatObservationTime(isoTime: string): string {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
