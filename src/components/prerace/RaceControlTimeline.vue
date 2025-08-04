<template>
  <div class="bg-black rounded-lg overflow-hidden shadow-lg">
    <div class="border-b border-gray-700 p-4">
      <h2 class="text-white text-xl font-semibold flex items-center">
        <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Race Control Timeline
      </h2>
      <p v-if="last_race_info" class="text-gray-400 text-sm mt-1">
        {{ last_race_info.race_name }} • {{ format_date(last_race_info.date_start) }}
      </p>
    </div>

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

      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-400">{{ error }}</div>
      </div>

      <div v-else-if="!last_race_info" class="text-center py-8">
        <div class="text-gray-400">Waiting for race data...</div>
      </div>

      <div v-else class="p-4">
        <!-- Statistics Bar -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div class="bg-gray-800/50 rounded p-2 text-center">
            <p class="text-red-500 font-bold text-lg">{{ statistics.red_flags }}</p>
            <p class="text-gray-400 text-xs">Red Flags</p>
          </div>
          <div class="bg-gray-800/50 rounded p-2 text-center">
            <p class="text-orange-500 font-bold text-lg">{{ statistics.safety_cars }}</p>
            <p class="text-gray-400 text-xs">Safety Cars</p>
          </div>
          <div class="bg-gray-800/50 rounded p-2 text-center">
            <p class="text-yellow-500 font-bold text-lg">{{ statistics.yellow_flags }}</p>
            <p class="text-gray-400 text-xs">Yellow Flags</p>
          </div>
          <div class="bg-gray-800/50 rounded p-2 text-center">
            <p class="text-purple-500 font-bold text-lg">{{ statistics.penalties }}</p>
            <p class="text-gray-400 text-xs">Penalties</p>
          </div>
          <div class="bg-gray-800/50 rounded p-2 text-center">
            <p class="text-blue-500 font-bold text-lg">{{ statistics.blue_flags }}</p>
            <p class="text-gray-400 text-xs">Blue Flags</p>
          </div>
        </div>

        <!-- Timeline Container -->
        <div class="bg-gray-800/50 rounded-lg h-96 overflow-y-auto custom-scrollbar">
          <div class="p-4 relative">
            <!-- Vertical Timeline Line -->
            <div class="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-600"></div>
            
            <div class="space-y-3">
              <div 
                v-for="(message, index) in filtered_messages"
                :key="index"
                class="flex items-start space-x-3 group hover:bg-gray-800/50 rounded p-2 transition-colors relative"
                :class="get_message_highlight(message)"
              >
                <!-- Timeline Dot -->
                <div class="flex-shrink-0 mt-1 relative z-10">
                  <div class="w-3 h-3 rounded-full border-2"
                       :class="get_dot_color(message)">
                  </div>
                </div>

                <!-- Message Content -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <span class="text-white text-sm font-medium">
                        {{ get_message_category(message) }}
                      </span>
                      <span v-if="message.driver_number" 
                            class="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                        #{{ message.driver_number }}
                      </span>
                      <span v-if="message.flag" 
                            class="text-xs px-2 py-0.5 rounded font-medium"
                            :class="get_flag_class(message.flag)">
                        {{ message.flag }}
                      </span>
                    </div>
                    <span class="text-gray-400 text-xs flex-shrink-0">
                      {{ format_time(message.date) }}
                    </span>
                  </div>
                  
                  <p class="text-gray-300 text-sm mt-1 leading-relaxed">
                    {{ message.message }}
                  </p>
                  
                  <div v-if="message.sector || message.lap_number" class="flex items-center space-x-3 mt-1">
                    <span v-if="message.sector" class="text-gray-500 text-xs">
                      Sector {{ message.sector }}
                    </span>
                    <span v-if="message.lap_number" class="text-gray-500 text-xs">
                      Lap {{ message.lap_number }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="filtered_messages.length === 0" class="text-center py-8">
                <div class="text-gray-400">No race control messages available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'
import { api_service } from '@/services/api.js'

export default {
  name: 'RaceControlTimeline',
  
  data() {
    return {
      race_store: use_race_store(),
      loading: false,
      error: null,
      race_control_messages: []
    }
  },
  
  computed: {
    last_race_info() {
      return this.race_store.get_last_race_held
    },

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
        penalties: 0,
        blue_flags: 0
      }

      this.filtered_messages.forEach(message => {
        if (message.flag === 'RED') stats.red_flags++
        if (message.category === 'SafetyCar') stats.safety_cars++
        if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') stats.yellow_flags++
        if (message.message?.includes('PENALTY')) stats.penalties++
        if (message.flag === 'BLUE') stats.blue_flags++
      })

      return stats
    }
  },
  
  async mounted() {
    if (this.last_race_info) {
      await this.load_race_control_data()
    }
  },

  watch: {
    last_race_info: {
      handler(new_race_info) {
        if (new_race_info && !this.race_control_messages.length) {
          this.load_race_control_data()
        }
      },
      immediate: true
    }
  },
  
  methods: {
    async load_race_control_data() {
      if (!this.last_race_info?.race_session?.session_key) {
        console.warn('No session key available for race control data')
        return
      }

      this.loading = true
      this.error = null

      try {
        const session_key = this.last_race_info.race_session.session_key
        console.log(`Loading race control data for session ${session_key}`)
        
        this.race_control_messages = await api_service.get_race_control_data(session_key)
        console.log('Race control messages loaded:', this.race_control_messages.length)
        
      } catch (error) {
        console.error('Error loading race control data:', error)
        this.error = 'Failed to load race control data'
      } finally {
        this.loading = false
      }
    },

    get_message_highlight(message) {
      if (message.flag === 'RED') return 'bg-opacity-10 border-l-4 border-red-500 bg-red-500/10'
      if (message.category === 'SafetyCar') return 'bg-opacity-10 border-l-4 border-orange-500 bg-orange-500/10'
      if (message.flag === 'BLACK') return 'bg-opacity-10 border-l-4 border-gray-800 bg-gray-800/20'
      if (message.message?.includes('PENALTY')) return 'bg-opacity-10 border-l-4 border-purple-500 bg-purple-500/10'
      if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') return 'bg-opacity-10 border-l-4 border-yellow-500 bg-yellow-500/10'
      return ''
    },

    get_dot_color(message) {
      if (message.flag === 'RED') return 'bg-red-500 border-red-500'
      if (message.category === 'SafetyCar') return 'bg-orange-500 border-orange-500'
      if (message.flag === 'BLACK') return 'bg-gray-800 border-gray-800'
      if (message.message?.includes('PENALTY')) return 'bg-purple-500 border-purple-500'
      if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') return 'bg-yellow-500 border-yellow-500'
      if (message.flag === 'BLUE') return 'bg-blue-500 border-blue-500'
      if (message.flag === 'GREEN') return 'bg-green-500 border-green-500'
      return 'bg-gray-500 border-gray-500'
    },

    get_flag_class(flag) {
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

    get_message_category(message) {
      const categories = {
        'Flag': '🏁 Flag',
        'SafetyCar': '🚗 Safety Car',
        'Drs': '⚡ DRS',
        'Other': '📢 Race Control',
        'CarEvent': '🏎️ Car Event'
      }
      return categories[message.category] || message.category || 'Race Control'
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
    },

    format_date(date_string) {
      const date = new Date(date_string)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D80032;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #EF233C;
}

/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>
