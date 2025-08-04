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
        <!-- Weather Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="bg-gray-800/50 rounded-lg p-3 text-center">
            <div class="text-2xl mb-1">{{ get_weather_icon(weather_summary.dominant_condition) }}</div>
            <p class="text-white text-sm font-medium">{{ weather_summary.dominant_condition }}</p>
            <p class="text-gray-400 text-xs">Conditions</p>
          </div>
          
          <div class="bg-gray-800/50 rounded-lg p-3 text-center">
            <p class="text-blue-400 text-lg font-bold">{{ weather_summary.avg_temp }}°C</p>
            <p class="text-gray-400 text-xs">Avg Temperature</p>
          </div>
          
          <div class="bg-gray-800/50 rounded-lg p-3 text-center">
            <p class="text-green-400 text-lg font-bold">{{ weather_summary.avg_humidity }}%</p>
            <p class="text-gray-400 text-xs">Avg Humidity</p>
          </div>
          
          <div class="bg-gray-800/50 rounded-lg p-3 text-center">
            <p class="text-purple-400 text-lg font-bold">{{ weather_summary.avg_pressure }} hPa</p>
            <p class="text-gray-400 text-xs">Avg Pressure</p>
          </div>
        </div>

        <!-- Race Impact Analysis -->
        <div class="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h3 class="text-white font-medium mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Race Impact Analysis
          </h3>
          
          <div class="space-y-2">
            <div v-for="impact in race_impacts" :key="impact.type" 
                 class="flex items-start space-x-3 p-2 rounded"
                 :class="get_impact_class(impact.severity)">
              <div class="w-2 h-2 rounded-full mt-2" :class="get_impact_dot(impact.severity)"></div>
              <div>
                <p class="text-white text-sm font-medium">{{ impact.title }}</p>
                <p class="text-gray-300 text-xs">{{ impact.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Timeline -->
        <div class="bg-gray-800/50 rounded-lg p-4">
          <h3 class="text-white font-medium mb-3">Weather Timeline</h3>
          <div class="h-64 overflow-y-auto custom-scrollbar">
            <div class="space-y-2">
              <div v-for="period in weather_periods" :key="period.time"
                   class="flex items-center justify-between p-2 bg-gray-800/50 rounded text-sm">
                <div class="flex items-center space-x-3">
                  <span class="text-xl">{{ get_weather_icon(period.condition) }}</span>
                  <div>
                    <p class="text-white font-medium">{{ period.time }}</p>
                    <p class="text-gray-400 text-xs">{{ period.condition }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-blue-400">{{ period.temp }}°C</p>
                  <p class="text-gray-400 text-xs">{{ period.humidity }}% humidity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'

export default {
  name: 'LastRaceWeather',
  
  props: {
    last_race_info: {
      type: Object,
      default: () => null
    }
  },
  
  data() {
    return {
      loading: false,
      error: null,
      weather_data: []
    }
  },
  
  computed: {
    weather_summary() {
      if (!this.weather_data.length) return {}
      
      const temps = this.weather_data.map(d => d.air_temperature).filter(t => t)
      const humidity = this.weather_data.map(d => d.humidity).filter(h => h)
      const pressure = this.weather_data.map(d => d.pressure).filter(p => p)
      
      // Determine dominant weather condition
      const conditions = this.weather_data.map(d => this.classify_weather(d)).filter(c => c)
      const condition_counts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1
        return acc
      }, {})
      
      const dominant_condition = Object.keys(condition_counts).reduce((a, b) => 
        condition_counts[a] > condition_counts[b] ? a : b, 'Clear'
      )
      
      return {
        avg_temp: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 'N/A',
        avg_humidity: humidity.length ? Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length) : 'N/A',
        avg_pressure: pressure.length ? Math.round(pressure.reduce((a, b) => a + b, 0) / pressure.length) : 'N/A',
        dominant_condition
      }
    },
    
    race_impacts() {
      const impacts = []
      
      if (!this.weather_data.length) return impacts
      
      // Analyze rain impact
      const rain_periods = this.weather_data.filter(d => d.rainfall && d.rainfall > 0)
      if (rain_periods.length > 0) {
        const rain_percentage = (rain_periods.length / this.weather_data.length) * 100
        impacts.push({
          type: 'rain',
          severity: rain_percentage > 50 ? 'high' : rain_percentage > 20 ? 'medium' : 'low',
          title: 'Rain Impact',
          description: `Rain detected for ${Math.round(rain_percentage)}% of the session. ${rain_percentage > 50 ? 'Significant impact on tire strategy and racing lines.' : 'Minimal impact on race conditions.'}`
        })
      }
      
      // Analyze temperature impact
      const temps = this.weather_data.map(d => d.air_temperature).filter(t => t)
      if (temps.length) {
        const avg_temp = temps.reduce((a, b) => a + b, 0) / temps.length
        if (avg_temp > 35) {
          impacts.push({
            type: 'heat',
            severity: 'medium',
            title: 'High Temperature',
            description: `High ambient temperature (${Math.round(avg_temp)}°C) increased tire degradation and cooling challenges.`
          })
        }
      }
      
      // Analyze wind impact
      const winds = this.weather_data.map(d => d.wind_speed).filter(w => w)
      if (winds.length) {
        const avg_wind = winds.reduce((a, b) => a + b, 0) / winds.length
        if (avg_wind > 15) {
          impacts.push({
            type: 'wind',
            severity: avg_wind > 25 ? 'high' : 'medium',
            title: 'Strong Winds',
            description: `Average wind speed of ${Math.round(avg_wind)} km/h affected car stability and aerodynamics.`
          })
        }
      }
      
      return impacts
    },
    
    weather_periods() {
      if (!this.weather_data.length) return []
      
      // Group data into 15-minute periods
      const periods = []
      const chunk_size = Math.max(1, Math.floor(this.weather_data.length / 12)) // ~12 periods
      
      for (let i = 0; i < this.weather_data.length; i += chunk_size) {
        const chunk = this.weather_data.slice(i, i + chunk_size)
        if (chunk.length === 0) continue
        
        const avg_temp = chunk.map(d => d.air_temperature).filter(t => t).reduce((a, b) => a + b, 0) / chunk.length || 0
        const avg_humidity = chunk.map(d => d.humidity).filter(h => h).reduce((a, b) => a + b, 0) / chunk.length || 0
        
        periods.push({
          time: new Date(chunk[0].date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          condition: this.classify_weather(chunk[0]),
          temp: Math.round(avg_temp),
          humidity: Math.round(avg_humidity)
        })
      }
      
      return periods
    }
  },
  
  async mounted() {
    if (this.last_race_info?.race_session?.session_key) {
      await this.load_weather_data()
    }
  },
  
  watch: {
    last_race_info: {
      handler(new_race_info) {
        if (new_race_info?.race_session?.session_key) {
          this.load_weather_data()
        }
      },
      immediate: true
    }
  },
  
  methods: {
    async load_weather_data() {
      this.loading = true
      this.error = null
      
      try {
        const session_key = this.last_race_info.race_session.session_key
        this.weather_data = await api_service.get_weather_data(session_key)
        console.log('Weather data loaded:', this.weather_data.length, 'records')
      } catch (error) {
        console.error('Error loading weather data:', error)
        this.error = 'Failed to load weather data'
      } finally {
        this.loading = false
      }
    },
    
    classify_weather(weather_point) {
      if (!weather_point) return 'Clear'
      
      if (weather_point.rainfall && weather_point.rainfall > 0) {
        return weather_point.rainfall > 2 ? 'Heavy Rain' : 'Light Rain'
      }
      
      if (weather_point.humidity && weather_point.humidity > 90) {
        return 'Overcast'
      }
      
      if (weather_point.air_temperature && weather_point.air_temperature > 35) {
        return 'Hot'
      }
      
      return 'Clear'
    },
    
    get_weather_icon(condition) {
      const icons = {
        'Clear': '☀️',
        'Hot': '🌡️',
        'Overcast': '☁️',
        'Light Rain': '🌦️',
        'Heavy Rain': '🌧️',
        'Thunderstorm': '⛈️'
      }
      return icons[condition] || '☀️'
    },
    
    get_impact_class(severity) {
      const classes = {
        'low': 'bg-green-500/10',
        'medium': 'bg-yellow-500/10',
        'high': 'bg-red-500/10'
      }
      return classes[severity] || 'bg-gray-500/10'
    },
    
    get_impact_dot(severity) {
      const dots = {
        'low': 'bg-green-500',
        'medium': 'bg-yellow-500',
        'high': 'bg-red-500'
      }
      return dots[severity] || 'bg-gray-500'
    }
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}
</style>
