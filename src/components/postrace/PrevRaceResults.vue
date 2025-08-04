<template>
  <div class="space-y-6">
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
      
      <div v-else>
        <!-- Tab Navigation -->
        <div class="bg-gray-900 rounded-lg overflow-hidden">
          <div class="flex border-b border-gray-700">
            <button
              @click="active_tab = 'race'"
              class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
              :class="active_tab === 'race' 
                ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
              </svg>

              Race Results
            </button>
            <button
              @click="active_tab = 'qualifying'"
              class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
              :class="active_tab === 'qualifying' 
                ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>

              Qualifying
            </button>
            <button
              @click="active_tab = 'control'"
              class="flex-1 px-3 py-3 text-sm font-medium transition-colors"
              :class="active_tab === 'control' 
                ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>

              Race Control
            </button>
            <button
              @click="active_tab = 'weather'"
              class="flex-1 px-2 py-3 text-sm font-medium transition-colors"
              :class="active_tab === 'weather' 
                ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>

              Weather
            </button>
          </div>

          <!-- Tab Content -->
          <div class="p-4 max-h-95 overflow-y-auto custom-scrollbar">
            <RaceResultsTab 
              v-if="active_tab === 'race'"
              :results="race_results"
              :drivers_data="drivers_data"
              :stint_data="stint_data"
            />
            <QualifyingResultsTab 
              v-if="active_tab === 'qualifying'"
              :results="qualifying_results"
              :drivers_data="drivers_data"
            />
            <RaceControlTab 
              v-if="active_tab === 'control'"
              :session_key="session_key"
            />
            <WeatherAnalysisTab 
              v-if="active_tab === 'weather'"
              :session_key="session_key"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'
import RaceResultsTab from './race_results_tabs/RaceResultsTab.vue'
import QualifyingResultsTab from './race_results_tabs/QualifyingResultsTab.vue'
import RaceControlTab from './race_results_tabs/RaceControlTab.vue'
import WeatherAnalysisTab from './race_results_tabs/WeatherAnalysisTab.vue'

export default {
  name: 'PrevRaceResults',
  
  components: {
    RaceResultsTab,
    QualifyingResultsTab,
    RaceControlTab,
    WeatherAnalysisTab
  },
  
  props: {
    race_results: {
      type: Array,
      default: () => []
    },
    qualifying_results: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    session_key: {
      type: Number,
      default: null
    }
  },
  
  data() {
    return {
      active_tab: 'race',
      drivers_data: [],
      stint_data: []
    }
  },
  
  async mounted() {
    await this.load_drivers_data()
    if (this.session_key) {
      await this.load_stint_data()
    }
  },
  
  watch: {
    session_key: {
      handler(new_session_key) {
        if (new_session_key) {
          this.load_stint_data()
        }
      },
      immediate: false
    }
  },
  
  methods: {
    async load_drivers_data() {
      try {
        this.drivers_data = await api_service.get_drivers_data()
      } catch (error) {
        console.error('Failed to load drivers data:', error)
      }
    },
    
    async load_stint_data() {
      try {
        this.stint_data = await api_service.get_stint_data(this.session_key)
        console.log('Stint data loaded:', this.stint_data.length, 'records')
      } catch (error) {
        console.error('Failed to load stint data:', error)
      }
    }
  }
}
</script>
