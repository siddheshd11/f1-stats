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

      <div v-else-if="error" class="text-center py-4">
        <div class="text-red-400 text-sm">{{ error }}</div>
      </div>

      <div v-else-if="!weather_data.length" class="text-center py-4">
        <div class="text-gray-400 text-sm">No weather data available</div>
      </div>

      <div v-else>
        <!-- Weather KPI Cards - Updated with 6 cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center">
            <div class="text-xl mb-1">{{ weather_summary.icon }}</div>
            <p class="text-white text-xs font-medium">{{ weather_summary.condition }}</p>
            <p class="text-gray-400 text-xs">Conditions</p>
          </div>
          
          <div class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center">
            <p class="text-orange-400 text-sm font-bold">{{ weather_averages.avg_air_temp }}°C</p>
            <p class="text-gray-400 text-xs">Air Temp</p>
          </div>

          <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
            <p class="text-red-400 text-sm font-bold">{{ weather_averages.avg_track_temp }}°C</p>
            <p class="text-gray-400 text-xs">Track Temp</p>
          </div>

          <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 text-center">
            <p class="text-purple-400 text-sm font-bold">{{ weather_averages.avg_pressure }} hPa</p>
            <p class="text-gray-400 text-xs">Pressure</p>
          </div>

          <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
            <p class="text-green-400 text-sm font-bold">{{ weather_averages.avg_wind_speed }} km/h</p>
            <p class="text-gray-400 text-xs">Wind Speed</p>
          </div>

          <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-center">
            <p class="text-cyan-400 text-sm font-bold">{{ weather_averages.avg_humidity }}%</p>
            <p class="text-gray-400 text-xs">Humidity</p>
          </div>
        </div>

        <!-- Driver Impact Analysis -->
        <div class="bg-gray-800/30 rounded-lg p-4">
          <h3 class="text-white font-medium mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Impact on Race
          </h3>
          
          <div class="space-y-3">
            <div v-for="impact in race_impacts" :key="impact.type" 
                 class="flex items-start space-x-3 p-3 rounded-lg"
                 :class="get_impact_background(impact.severity)">
              <div class="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                   :class="get_impact_dot(impact.severity)"></div>
              <div class="flex-grow">
                <p class="text-white text-sm font-medium">{{ impact.title }}</p>
                <p class="text-gray-300 text-xs mt-1">{{ impact.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Weather Timeline Summary -->
        <div class="bg-gray-800/30 rounded-lg p-4">
          <h3 class="text-white font-medium mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Race Progression
          </h3>
          
          <div class="space-y-2">
            <div v-for="phase in weather_phases" :key="phase.phase"
                 class="flex items-center justify-between p-2 bg-gray-700/50 rounded">
              <div class="flex items-center space-x-3">
                <span class="text-lg">{{ phase.icon }}</span>
                <div>
                  <p class="text-white text-sm font-medium">{{ phase.phase }}</p>
                  <p class="text-gray-400 text-xs">{{ phase.condition }}</p>
                  <p class="text-gray-500 text-xs">{{ phase.time_range }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-blue-400 text-sm">{{ phase.temp }}°C</p>
                <p class="text-gray-400 text-xs">{{ phase.humidity }}% humidity</p>
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
  name: 'WeatherAnalysisTab',
  
  props: {
    session_key: {
      type: Number,
      default: null
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
    weather_averages() {
      if (!this.weather_data.length) {
        return {
          avg_air_temp: '--',
          avg_track_temp: '--',
          avg_pressure: '--',
          avg_wind_speed: '--',
          avg_humidity: '--'
        }
      }
      
      // Calculate averages for each metric
      const air_temps = this.weather_data.map(d => d.air_temperature).filter(t => t !== null && t !== undefined)
      const track_temps = this.weather_data.map(d => d.track_temperature).filter(t => t !== null && t !== undefined)
      const pressures = this.weather_data.map(d => d.pressure).filter(p => p !== null && p !== undefined)
      const wind_speeds = this.weather_data.map(d => d.wind_speed).filter(w => w !== null && w !== undefined)
      const humidity_values = this.weather_data.map(d => d.humidity).filter(h => h !== null && h !== undefined)
      
      return {
        avg_air_temp: air_temps.length ? Math.round(air_temps.reduce((a, b) => a + b, 0) / air_temps.length) : '--',
        avg_track_temp: track_temps.length ? Math.round(track_temps.reduce((a, b) => a + b, 0) / track_temps.length) : '--',
        avg_pressure: pressures.length ? Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length) : '--',
        avg_wind_speed: wind_speeds.length ? Math.round(wind_speeds.reduce((a, b) => a + b, 0) / wind_speeds.length * 10) / 10 : '--',
        avg_humidity: humidity_values.length ? Math.round(humidity_values.reduce((a, b) => a + b, 0) / humidity_values.length) : '--'
      }
    },

    weather_summary() {
      if (!this.weather_data.length) return { condition: 'No Data', icon: '❓' }
      
      // Calculate rain percentage and temperature for overall condition
      const rainfall = this.weather_data.filter(d => d.rainfall && d.rainfall > 0)
      const air_temps = this.weather_data.map(d => d.air_temperature).filter(t => t !== null)
      const humidity = this.weather_data.map(d => d.humidity).filter(h => h !== null)
      
      const avg_temp = air_temps.length ? air_temps.reduce((a, b) => a + b, 0) / air_temps.length : 0
      const avg_humidity = humidity.length ? humidity.reduce((a, b) => a + b, 0) / humidity.length : 0
      const rain_percentage = (rainfall.length / this.weather_data.length) * 100
      
      // Determine overall condition
      let condition, icon
      if (rain_percentage > 30) {
        condition = 'Wet Conditions'
        icon = '🌧️'
      } else if (rain_percentage > 10) {
        condition = 'Mixed Conditions'
        icon = '⛅'
      } else if (avg_temp > 30) {
        condition = 'Hot & Dry'
        icon = '🌡️'
      } else if (avg_humidity > 80) {
        condition = 'Humid'
        icon = '💨'
      } else {
        condition = 'Clear'
        icon = '☀️'
      }
      
      return { condition, icon }
    },
    
    race_impacts() {
      const impacts = []
      
      if (!this.weather_data.length) return impacts
      
      const air_temps = this.weather_data.map(d => d.air_temperature).filter(t => t !== null)
      const track_temps = this.weather_data.map(d => d.track_temperature).filter(t => t !== null)
      const humidity = this.weather_data.map(d => d.humidity).filter(h => h !== null)
      const rainfall = this.weather_data.filter(d => d.rainfall && d.rainfall > 0)
      const winds = this.weather_data.map(d => d.wind_speed).filter(w => w !== null)
      
      const avg_air_temp = air_temps.length ? air_temps.reduce((a, b) => a + b, 0) / air_temps.length : 0
      const avg_track_temp = track_temps.length ? track_temps.reduce((a, b) => a + b, 0) / track_temps.length : 0
      const avg_humidity = humidity.length ? humidity.reduce((a, b) => a + b, 0) / humidity.length : 0
      const avg_wind = winds.length ? winds.reduce((a, b) => a + b, 0) / winds.length : 0
      const rain_percentage = (rainfall.length / this.weather_data.length) * 100
      
      // Rain impact
      if (rain_percentage > 20) {
        const severity = rain_percentage > 50 ? 'high' : 'medium'
        impacts.push({
          type: 'rain',
          severity,
          title: rain_percentage > 50 ? 'Significant Rain Impact' : 'Intermittent Rain',
          description: rain_percentage > 50 
            ? 'Wet weather tires required, reduced visibility, challenging racing lines. Strategy crucial.'
            : 'Mixed conditions created tire strategy opportunities. Some dry line available.'
        })
      }
      
      // Track temperature impact
      if (avg_track_temp > 45) {
        impacts.push({
          type: 'track_heat',
          severity: avg_track_temp > 55 ? 'high' : 'medium',
          title: 'High Track Temperature',
          description: `Extreme track temperature (${Math.round(avg_track_temp)}°C) caused rapid tire degradation and reduced grip levels.`
        })
      }
      
      // Air temperature impact
      if (avg_air_temp > 35) {
        impacts.push({
          type: 'air_heat',
          severity: 'medium',
          title: 'High Air Temperature Challenge',
          description: `High air temperature (${Math.round(avg_air_temp)}°C) increased engine cooling stress and driver fatigue.`
        })
      } else if (avg_air_temp < 15) {
        impacts.push({
          type: 'cold',
          severity: 'medium',
          title: 'Cold Weather Challenges',
          description: `Low air temperature (${Math.round(avg_air_temp)}°C) made tire warm-up difficult, affecting grip and braking performance.`
        })
      }
      
      // Wind impact
      if (avg_wind > 20) {
        const severity = avg_wind > 30 ? 'high' : 'medium'
        impacts.push({
          type: 'wind',
          severity,
          title: 'Strong Wind Conditions',
          description: `Average wind speed of ${Math.round(avg_wind)} km/h affected car stability, especially in corners and under braking.`
        })
      }
      
      // Humidity impact
      if (avg_humidity > 85) {
        impacts.push({
          type: 'humidity',
          severity: 'low',
          title: 'High Humidity',
          description: `Very humid conditions (${Math.round(avg_humidity)}%) increased driver discomfort and cooling system demands.`
        })
      }
      
      // If no significant impacts
      if (impacts.length === 0) {
        impacts.push({
          type: 'neutral',
          severity: 'low',
          title: 'Stable Weather Conditions',
          description: 'Weather conditions were relatively stable throughout the race, allowing for consistent performance.'
        })
      }
      
      return impacts
    },
    
    weather_phases() {
      if (!this.weather_data.length) return []
      
      // Divide race into 3 phases
      const third = Math.floor(this.weather_data.length / 3)
      const phases = [
        { 
          name: 'Race Start', 
          data: this.weather_data.slice(0, third),
          start_index: 0,
          end_index: third - 1
        },
        { 
          name: 'Mid Race', 
          data: this.weather_data.slice(third, third * 2),
          start_index: third,
          end_index: (third * 2) - 1
        },
        { 
          name: 'Race End', 
          data: this.weather_data.slice(third * 2),
          start_index: third * 2,
          end_index: this.weather_data.length - 1
        }
      ]
      
      return phases.map(phase => {
        const air_temps = phase.data.map(d => d.air_temperature).filter(t => t !== null)
        const humidity = phase.data.map(d => d.humidity).filter(h => h !== null)
        const rainfall = phase.data.filter(d => d.rainfall && d.rainfall > 0)
        
        const avg_temp = air_temps.length ? Math.round(air_temps.reduce((a, b) => a + b, 0) / air_temps.length) : 0
        const avg_humidity = humidity.length ? Math.round(humidity.reduce((a, b) => a + b, 0) / humidity.length) : 0
        const rain_in_phase = (rainfall.length / phase.data.length) * 100
        
        let condition, icon
        if (rain_in_phase > 20) {
          condition = 'Wet'
          icon = '🌧️'
        } else if (rain_in_phase > 5) {
          condition = 'Damp'
          icon = '🌦️'
        } else if (avg_temp > 30) {
          condition = 'Hot'
          icon = '🌡️'
        } else {
          condition = 'Dry'
          icon = '☀️'
        }
        
        // Calculate time range for this phase
        const time_range = this.get_phase_time_range(phase.start_index, phase.end_index)
        
        return {
          phase: phase.name,
          condition,
          icon,
          temp: avg_temp,
          humidity: avg_humidity,
          time_range
        }
      })
    }
  },
  
  async mounted() {
    if (this.session_key) {
      await this.load_weather_data()
    }
  },

  watch: {
    session_key: {
      handler(new_session_key) {
        if (new_session_key) {
          this.load_weather_data()
        }
      },
      immediate: false
    }
  },
  
  methods: {
    async load_weather_data() {
      if (!this.session_key) {
        console.warn('No session key available for weather data')
        return
      }

      this.loading = true
      this.error = null

      try {
        console.log(`Loading weather data for session ${this.session_key}`)
        
        this.weather_data = await api_service.get_weather_data(this.session_key)
        console.log('Weather data loaded:', this.weather_data.length, 'records')
        
      } catch (error) {
        console.error('Error loading weather data:', error)
        this.error = 'Failed to load weather data'
      } finally {
        this.loading = false
      }
    },

    get_phase_time_range(start_index, end_index) {
      if (!this.weather_data.length || start_index >= this.weather_data.length) {
        return 'Time unknown'
      }
      
      try {
        const start_time = new Date(this.weather_data[start_index].date)
        const end_time = new Date(this.weather_data[Math.min(end_index, this.weather_data.length - 1)].date)
        
        const start_formatted = start_time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        
        const end_formatted = end_time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
        
        return `${start_formatted} - ${end_formatted}`
        
      } catch (error) {
        console.error('Error formatting phase time range:', error)
        return 'Time unknown'
      }
    },
    
    get_impact_background(severity) {
      const backgrounds = {
        'low': 'bg-green-500/10',
        'medium': 'bg-yellow-500/10',
        'high': 'bg-red-500/10'
      }
      return backgrounds[severity] || 'bg-gray-500/10'
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
