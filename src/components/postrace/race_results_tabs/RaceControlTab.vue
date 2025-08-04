<template>
  <div class="space-y-3">
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

      <div v-else-if="!race_control_messages.length" class="text-center py-4">
        <div class="text-gray-400 text-sm">No race control messages available</div>
      </div>

      <div v-else>
        <!-- Race Control Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div class="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
            <p class="text-red-400 font-bold text-lg">{{ statistics.red_flags }}</p>
            <p class="text-gray-400 text-xs">Red Flags</p>
          </div>
          <div class="bg-orange-500/10 border border-orange-500/30 rounded p-2 text-center">
            <p class="text-orange-400 font-bold text-lg">{{ statistics.safety_cars }}</p>
            <p class="text-gray-400 text-xs">Safety Cars</p>
          </div>
          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-center">
            <p class="text-yellow-400 font-bold text-lg">{{ statistics.yellow_flags }}</p>
            <p class="text-gray-400 text-xs">Yellow Flags</p>
          </div>
          <div class="bg-blue-500/10 border border-blue-500/30 rounded p-2 text-center">
            <p class="text-blue-400 font-bold text-lg">{{ statistics.blue_flags }}</p>
            <p class="text-gray-400 text-xs">Blue Flags</p>
          </div>
        </div>

        <!-- Race Control Timeline -->
        <div class="relative pl-6">
          <!-- Timeline Line -->
          <div class="absolute left-2 top-0 bottom-2 w-0.5 bg-gray-600"></div>
          
          <div class="space-y-4">
            <div 
              v-for="(message, index) in filtered_messages"
              :key="index"
              class="relative flex items-start"
              :class="get_message_highlight_class(message)"
            >
              <!-- Timeline Dot -->
              <div class="absolute -left-6 top-10 flex-shrink-0 z-10">
                <div class="w-4 h-4 rounded-full border-2 bg-gray-900"
                     :class="get_timeline_dot_color(message)">
                </div>
              </div>

              <!-- Message Content -->
              <div class="flex-grow bg-gray-800/30 rounded-lg p-3 ml-2">
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-white text-sm font-medium">
                      {{ get_message_category_display(message) }}
                    </span>
                    <span v-if="message.driver_number" 
                          class="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                      #{{ message.driver_number }}
                    </span>
                    <span v-if="message.flag" 
                          class="text-xs px-2 py-0.5 rounded font-medium"
                          :class="get_flag_badge_class(message.flag)">
                      {{ message.flag }}
                    </span>
                  </div>
                  <span class="text-gray-400 text-xs flex-shrink-0">
                    {{ format_time(message.date) }}
                  </span>
                </div>
                
                <p class="text-gray-300 text-sm leading-relaxed">
                  {{ message.message }}
                </p>
                
                <div v-if="message.sector || message.lap_number" class="flex items-center space-x-3 mt-2">
                  <span v-if="message.sector" class="text-gray-500 text-xs">
                    Sector {{ message.sector }}
                  </span>
                  <span v-if="message.lap_number" class="text-gray-500 text-xs">
                    Lap {{ message.lap_number }}
                  </span>
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
  name: 'RaceControlTab',
  
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
      race_control_messages: []
    }
  },
  
  computed: {
    filtered_messages() {
      return this.race_control_messages
        .filter(message => message.message && message.message.trim())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    },

    statistics() {
      const stats = {
        red_flags: 0,
        safety_cars: 0,
        yellow_flags: 0,
        blue_flags: 0,
        black_flags: 0
      }

      this.filtered_messages.forEach(message => {
        if (message.flag === 'RED') stats.red_flags++
        if (message.category === 'SafetyCar' || 
            message.message?.toLowerCase().includes('safety car')) stats.safety_cars++
        if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') stats.yellow_flags++
        if (message.flag === 'BLUE') stats.blue_flags++
        if (message.flag === 'BLACK') stats.black_flags++
      })

      return stats
    }
  },
  
  async mounted() {
    if (this.session_key) {
      await this.load_race_control_data()
    }
  },

  watch: {
    session_key: {
      handler(new_session_key) {
        if (new_session_key) {
          this.load_race_control_data()
        }
      },
      immediate: false
    }
  },
  
  methods: {
    async load_race_control_data() {
      if (!this.session_key) {
        console.warn('No session key available for race control data')
        return
      }

      this.loading = true
      this.error = null

      try {
        console.log(`Loading race control data for session ${this.session_key}`)
        
        this.race_control_messages = await api_service.get_race_control_data(this.session_key)
        console.log('Race control messages loaded:', this.race_control_messages.length)
        
      } catch (error) {
        console.error('Error loading race control data:', error)
        this.error = 'Failed to load race control data'
      } finally {
        this.loading = false
      }
    },

    get_message_highlight_class(message) {
      if (message.flag === 'RED') return 'bg-red-500/5'
      if (message.category === 'SafetyCar' || 
          message.message?.toLowerCase().includes('safety car')) return 'bg-orange-500/5'
      if (message.flag === 'BLACK') return 'bg-gray-800/20'
      if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') return 'bg-yellow-500/5'
      if (message.flag === 'BLUE') return 'bg-blue-500/5'
      return ''
    },

    get_timeline_dot_color(message) {
      if (message.flag === 'RED') return 'bg-red-500 border-red-500'
      if (message.category === 'SafetyCar' || 
          message.message?.toLowerCase().includes('safety car')) return 'bg-orange-500 border-orange-500'
      if (message.flag === 'BLACK') return 'bg-gray-800 border-gray-800'
      if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') return 'bg-yellow-500 border-yellow-500'
      if (message.flag === 'BLUE') return 'bg-blue-500 border-blue-500'
      if (message.flag === 'GREEN') return 'bg-green-500 border-green-500'
      return 'bg-gray-500 border-gray-500'
    },

    get_flag_badge_class(flag) {
      const classes = {
        'RED': 'bg-red-600 text-white',
        'YELLOW': 'bg-yellow-500 text-black',
        'DOUBLE YELLOW': 'bg-yellow-600 text-white',
        'GREEN': 'bg-green-600 text-white',
        'BLUE': 'bg-blue-600 text-white',
        'BLACK': 'bg-gray-900 text-white',
        'CHEQUERED': 'bg-gray-200 text-black',
        'CLEAR': 'bg-gray-600 text-white'
      }
      return classes[flag] || 'bg-gray-500 text-white'
    },

    get_message_category_display(message) {
      if (message.flag) {
        return `🏁 ${message.flag} Flag`
      }
      
      const categories = {
        'SafetyCar': '🚗 Safety Car',
        'Drs': '⚡ DRS',
        'Other': '📢 Race Control',
        'CarEvent': '🏎️ Car Event'
      }
      return categories[message.category] || '📢 Race Control'
    },

    format_time(date_string) {
      try {
        const date = new Date(date_string)
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      } catch (error) {
        return 'Invalid Time'
      }
    }
  }
}
</script>
