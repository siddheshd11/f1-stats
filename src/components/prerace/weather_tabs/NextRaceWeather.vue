<template>
  <div class="space-y-4">
    <transition name="fade" appear enter-active-class="transition-opacity duration-500"
      leave-active-class="transition-opacity duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">

      <div v-if="loading" class="flex flex-col items-center justify-center p-3">
        <svg class='size-10 sm:size-15' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="#D80032" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>
        <span class="text-red-500">Loading...</span>
      </div>

      <div v-else-if="error" class="text-center py-6">
        <div class="text-red-400 text-sm">{{ error }}</div>
      </div>

      <div v-else>
        <!-- Weekend Overview -->
        <div class="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 class="text-white font-medium mb-3">Weekend Weather Overview</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="day in weekend_forecast" :key="day.day"
                 class="bg-gray-800/50 rounded-lg p-3 text-center">
              <p class="text-white font-medium text-sm">{{ day.day }}</p>
              <div class="text-3xl my-2">{{ day.icon }}</div>
              <p class="text-blue-400 font-bold">{{ day.temp }}°C</p>
              <p class="text-gray-400 text-xs">{{ day.condition }}</p>
              <div v-if="day.rain_chance > 20" class="mt-2">
                <p class="text-blue-300 text-xs">{{ day.rain_chance }}% rain</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Forecasts -->
        <div class="space-y-3">
          <div v-for="session in session_forecasts" :key="session.name"
               class="bg-gray-800/50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-white font-medium">{{ session.name }}</h4>
              <span class="text-gray-400 text-xs">{{ session.date }} {{ session.time }}</span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl mb-1">{{ session.icon }}</div>
                <p class="text-white text-sm">{{ session.condition }}</p>
              </div>
              <div class="text-center">
                <p class="text-blue-400 text-lg font-bold">{{ session.temp }}°C</p>
                <p class="text-gray-400 text-xs">Temperature</p>
              </div>
              <div class="text-center">
                <p class="text-green-400 text-lg font-bold">{{ session.humidity }}%</p>
                <p class="text-gray-400 text-xs">Humidity</p>
              </div>
              <div class="text-center">
                <p class="text-purple-400 text-lg font-bold">{{ session.rain_chance }}%</p>
                <p class="text-gray-400 text-xs">Rain Chance</p>
              </div>
            </div>
            
            <div v-if="session.rain_chance > 30" 
                 class="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <p class="text-blue-300 text-xs">
                ⚠️ High chance of rain - expect potential wet/inters weather tire strategies
              </p>
            </div>
          </div>
        </div>

        <!-- Weather Alerts -->
        <div v-if="weather_alerts.length > 0" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 class="text-red-400 font-medium mb-2 flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Weather Alerts
          </h3>
          <div class="space-y-1">
            <p v-for="alert in weather_alerts" :key="alert" class="text-red-300 text-sm">• {{ alert }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'

export default {
  name: 'NextRaceWeather',
  
  props: {
    next_race_info: {
      type: Object,
      default: () => null
    }
  },
  
  data() {
    return {
      loading: false,
      error: null,
      forecast_data: null
    }
  },
  
  computed: {
    circuit_coordinates() {
      // Get coordinates directly from the next_race object
      if (this.next_race_info?.Circuit?.Location) {
        const location = this.next_race_info.Circuit.Location
        return {
          lat: parseFloat(location.lat),
          lon: parseFloat(location.long) // Note: Ergast API uses 'long' not 'lon'
        }
      }
      return null
    },

    weekend_forecast() {
      if (!this.forecast_data?.list) return []
      
      const race_date = new Date(this.next_race_info?.date || new Date())
      const friday = new Date(race_date)
      friday.setDate(race_date.getDate() - 2)
      const saturday = new Date(race_date)
      saturday.setDate(race_date.getDate() - 1)
      
      const days = [
        { date: friday, name: 'Friday' },
        { date: saturday, name: 'Saturday' },
        { date: race_date, name: 'Sunday' }
      ]
      
      return days.map(day => {
        const target_time = new Date(day.date)
        target_time.setHours(14, 0, 0, 0)
        
        const forecast = this.find_closest_forecast(target_time)
        
        return {
          day: day.name,
          icon: this.get_weather_icon(forecast?.weather?.[0]?.main),
          temp: Math.round(forecast?.main?.temp || 0),
          condition: this.get_weather_condition(forecast?.weather?.[0]?.main),
          rain_chance: Math.round((forecast?.pop || 0) * 100)
        }
      })
    },
    
    session_forecasts() {
      if (!this.forecast_data?.list || !this.next_race_info) return []
      
      // Use actual session times from the race data
      const sessions = this.get_session_schedule_from_race_data()
      
      return sessions.map(session => {
        const forecast = this.find_closest_forecast(session.datetime)
        
        return {
          name: session.name,
          date: session.date,
          time: session.time,
          icon: this.get_weather_icon(forecast?.weather?.[0]?.main),
          condition: this.get_weather_condition(forecast?.weather?.[0]?.main),
          temp: Math.round(forecast?.main?.temp || 0),
          humidity: Math.round(forecast?.main?.humidity || 0),
          rain_chance: Math.round((forecast?.pop || 0) * 100)
        }
      })
    },
    
    weather_alerts() {
      const alerts = []
      
      const race_session = this.session_forecasts.find(s => s.name === 'Race')
      if (race_session && race_session.rain_chance > 50) {
        alerts.push('High probability of rain during the race - wet weather tires likely needed')
      }

      const qualifying_session = this.session_forecasts.find(s => s.name === 'Qualifying')
      if (qualifying_session && qualifying_session.rain_chance > 40) {
        alerts.push('Rain possible during qualifying - could shuffle grid positions')
      }
      
      const race_temp = race_session?.temp
      if (race_temp && race_temp > 35) {
        alerts.push('High ambient temperature expected - increased tire degradation likely')
      }
      if (race_temp && race_temp < 10) {
        alerts.push('Low ambient temperature expected - tire warming challenges likely')
      }
      
      return alerts
    }
  },
  
  async mounted() {
    if (this.next_race_info && this.circuit_coordinates) {
      await this.load_weather_forecast()
    }
  },

  watch: {
    next_race_info: {
      handler(new_race_info) {
        if (new_race_info && this.circuit_coordinates) {
          this.load_weather_forecast()
        }
      },
      immediate: true
    }
  },
  
  methods: {
    async load_weather_forecast() {
      if (!this.circuit_coordinates) {
        console.warn('No circuit coordinates available for weather forecast')
        this.error = 'Circuit coordinates not available'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        console.log('Getting weather for:', this.next_race_info.Circuit.circuitName)
        console.log('Coordinates from race data:', this.circuit_coordinates)
        
        // Get weather forecast from Open-Meteo using real coordinates
        this.forecast_data = await api_service.get_weather_forecast(
          this.circuit_coordinates.lat,
          this.circuit_coordinates.lon
        )
        
        console.log('Weather forecast loaded:', this.forecast_data)
        
      } catch (error) {
        console.error('Error loading weather forecast:', error)
        this.error = 'Failed to load weather forecast: ' + error.message
      } finally {
        this.loading = false
      }
    },
    
    get_session_schedule_from_race_data() {
      // Use actual session data from the race object
      const sessions = []
      
      if (this.next_race_info.FirstPractice) {
        sessions.push({
          name: 'Practice 1',
          datetime: new Date(this.next_race_info.FirstPractice.date + 'T' + this.next_race_info.FirstPractice.time),
          date: this.format_session_date_from_datetime(this.next_race_info.FirstPractice.date),
          time: this.format_session_time_from_datetime(this.next_race_info.FirstPractice.time)
        })
      }
      
      if (this.next_race_info.SecondPractice) {
        sessions.push({
          name: 'Practice 2',
          datetime: new Date(this.next_race_info.SecondPractice.date + 'T' + this.next_race_info.SecondPractice.time),
          date: this.format_session_date_from_datetime(this.next_race_info.SecondPractice.date),
          time: this.format_session_time_from_datetime(this.next_race_info.SecondPractice.time)
        })
      }
      
      if (this.next_race_info.ThirdPractice) {
        sessions.push({
          name: 'Practice 3',
          datetime: new Date(this.next_race_info.ThirdPractice.date + 'T' + this.next_race_info.ThirdPractice.time),
          date: this.format_session_date_from_datetime(this.next_race_info.ThirdPractice.date),
          time: this.format_session_time_from_datetime(this.next_race_info.ThirdPractice.time)
        })
      }
      
      if (this.next_race_info.Qualifying) {
        sessions.push({
          name: 'Qualifying',
          datetime: new Date(this.next_race_info.Qualifying.date + 'T' + this.next_race_info.Qualifying.time),
          date: this.format_session_date_from_datetime(this.next_race_info.Qualifying.date),
          time: this.format_session_time_from_datetime(this.next_race_info.Qualifying.time)
        })
      }
      
      // Race session
      sessions.push({
        name: 'Race',
        datetime: new Date(this.next_race_info.date + 'T' + this.next_race_info.time),
        date: this.format_session_date_from_datetime(this.next_race_info.date),
        time: this.format_session_time_from_datetime(this.next_race_info.time)
      })
      
      return sessions
    },
    
    format_session_date_from_datetime(date_string) {
      const date = new Date(date_string)
      return date.toLocaleDateString('en-US', {
        weekday: 'long'
      })
    },
    
    format_session_time_from_datetime(time_string) {
      // Convert from UTC time to local time display
      const time_parts = time_string.replace('Z', '').split(':')
      const hours = parseInt(time_parts[0])
      const minutes = time_parts[1]
      
      // Convert to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM'
      const display_hours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
      
      return `${display_hours}:${minutes} ${period} UTC`
    },
    
    find_closest_forecast(target_time) {
      if (!this.forecast_data?.list) return null
      
      let closest_forecast = null
      let smallest_diff = Infinity
      
      this.forecast_data.list.forEach(forecast => {
        const forecast_time = new Date(forecast.dt * 1000)
        const diff = Math.abs(target_time - forecast_time)
        
        if (diff < smallest_diff) {
          smallest_diff = diff
          closest_forecast = forecast
        }
      })
      
      return closest_forecast
    },
    
    get_weather_icon(weather_main) {
      const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️'
      }
      return icons[weather_main] || '☀️'
    },
    
    get_weather_condition(weather_main) {
      const conditions = {
        'Clear': 'Clear Sky',
        'Clouds': 'Cloudy',
        'Rain': 'Rain',
        'Drizzle': 'Light Rain',
        'Thunderstorm': 'Thunderstorm',
        'Snow': 'Snow',
        'Mist': 'Misty',
        'Fog': 'Foggy'
      }
      return conditions[weather_main] || 'Clear'
    }
  }
}
</script>

