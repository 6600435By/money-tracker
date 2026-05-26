import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import {
  fetchMinskWeather,
  formatCurrentTemperature,
  formatDayTemperature,
  formatObservationTime,
  weatherCodeLabel,
  type CurrentWeather,
  type DayForecast,
} from '@/lib/open-meteo'

function weatherIcon(code: number): LucideIcon {
  if (code === 0) return Sun
  if (code <= 2) return CloudSun
  if (code === 3) return Cloud
  if (code === 45 || code === 48) return CloudFog
  if (code >= 51 && code <= 57) return CloudDrizzle
  if (code >= 61 && code <= 67) return CloudRain
  if (code >= 71 && code <= 77) return Snowflake
  if (code >= 80 && code <= 82) return CloudRain
  if (code >= 85 && code <= 86) return Snowflake
  if (code >= 95) return CloudLightning
  return Cloud
}

function TodayChip({ current }: { current: CurrentWeather }) {
  const Icon = weatherIcon(current.weatherCode)
  const temp = formatCurrentTemperature(current.temperature)
  const description = weatherCodeLabel(current.weatherCode)
  const observedAt = formatObservationTime(current.time)

  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      title={
        observedAt
          ? `Сегодня, ${observedAt}: ${description}, ${temp}`
          : `Сегодня: ${description}, ${temp}`
      }
    >
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
      <span className="hidden sm:inline text-muted-foreground">Сегодня</span>
      <span className="font-medium text-foreground tabular-nums">{temp}</span>
    </span>
  )
}

function DayChip({
  label,
  day,
}: {
  label: string
  day: DayForecast
}) {
  const Icon = weatherIcon(day.weatherCode)
  const temps = formatDayTemperature(day.tempMax, day.tempMin)
  const description = weatherCodeLabel(day.weatherCode)

  return (
    <span
      className="inline-flex items-center gap-1 shrink-0"
      title={`${label}: ${description}, ${temps}`}
    >
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
      <span className="hidden sm:inline text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{temps}</span>
    </span>
  )
}

export default async function WeatherWidget() {
  const weather = await fetchMinskWeather()

  if (!weather) return null

  return (
    <div
      className="flex items-center gap-2 sm:gap-2.5 text-xs leading-none min-w-0"
      aria-label="Погода в Минске: сегодня (сейчас) и завтра"
    >
      <span className="hidden md:inline text-muted-foreground font-medium shrink-0">
        Минск
      </span>
      <span className="hidden md:inline text-border select-none" aria-hidden>
        ·
      </span>
      <TodayChip current={weather.current} />
      <span className="text-border select-none" aria-hidden>
        ·
      </span>
      <DayChip label="Завтра" day={weather.tomorrow} />
    </div>
  )
}
