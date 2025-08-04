<template>
  <div class="bg-black rounded-lg overflow-hidden shadow-lg">
    <div class="border-b border-gray-700 p-4">
      <h2 class="text-white text-xl font-semibold">Last Race Results</h2>
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

      <div v-else class="p-4">
        <!-- Mobile Tabs Layout (shown on small screens) -->
        <div class="lg:hidden">
          <div class="border-b border-gray-700 mb-4">
            <nav class="flex space-x-4 justify-center" aria-label="Tabs">
              <button
                :class="['py-2 px-4 text-sm font-medium focus:outline-none transition-colors', 
                         active_tab === 'race' ? 'border-b-2 border-red-500 text-red-400' : 'text-gray-400 hover:text-red-500']"
                @click="active_tab = 'race'"
              >
                Race Results
              </button>
              <button
                :class="['py-2 px-4 text-sm font-medium focus:outline-none transition-colors', 
                         active_tab === 'qualify' ? 'border-b-2 border-yellow-500 text-yellow-400' : 'text-gray-400 hover:text-yellow-500']"
                @click="active_tab = 'qualify'"
              >
                Qualifying
              </button>
            </nav>
          </div>
          <div>
            <RaceResultsTab 
              v-if="active_tab === 'race'"
              :results="race_results"
              :drivers_data="drivers_data"
              :stint_data="stint_data"
            />
            <QualifyingResultsTab
              v-if="active_tab === 'qualify'"
              :results="qualifying_results"
              :drivers_data="drivers_data"
            />
          </div>
        </div>

        <!-- Desktop Side by Side Layout (shown on large screens and up) -->
        <div class="hidden lg:grid lg:grid-cols-2 gap-6">
          <!-- Race Results Section -->
          <div>
            <div class="flex items-center mb-4">
              <h3 class="text-white text-lg font-medium">Race Results</h3>
              <div class="ml-2 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <RaceResultsTab 
              :results="race_results"
              :drivers_data="drivers_data"
              :stint_data="stint_data"
            />
          </div>

          <!-- Qualifying Results Section -->
          <div>
            <div class="flex items-center mb-4">
              <h3 class="text-white text-lg font-medium">Qualifying</h3>
              <div class="ml-2 w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <QualifyingResultsTab 
              :results="qualifying_results"
              :drivers_data="drivers_data"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<script>
import { use_race_store } from '@/stores/race_store.js'
import { api_service } from '@/services/api.js'
import RaceResultsTab from './race_results_tabs/RaceResultsTab.vue'
import QualifyingResultsTab from './race_results_tabs/QualifyingResultsTab.vue'

export default {
  name: 'LastRaceResults',
  
  components: {
    RaceResultsTab,
    QualifyingResultsTab
  },
  
  data() {
    return {
      race_store: use_race_store(),
      active_tab: 'race',
      loading: false,
      error: null,
      race_results: [],
      qualifying_results: [],
      drivers_data: [],
      stint_data: []
    }
  },
  
  computed: {
    last_race_info() {
      return this.race_store.get_last_race_held
    }
  },
  
  async mounted() {
    await this.load_drivers_data()
    // await this.race_store.get_last_race_on_next_race_circuit()
    await this.load_race_results()
  },

  watch: {
    // Watch for changes in last_race_info
    last_race_info: {
      handler(new_race_info) {
        if (new_race_info && !this.race_results.length) {
          console.log('Race info became available:', new_race_info)
          this.load_race_results()
        }
      },
      immediate: true
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
    
    async load_race_results() {
      console.log( "last race info - ", this.last_race_info);
      if (!this.last_race_info) {
        this.error = 'No last race data available'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const { year, round } = this.last_race_info
        
        // Load both race and qualifying results
        // const [race_data, qualifying_data] = await Promise.all([
        //   ,
        //   api_service.get_qualifying_results_f1api(year, round)
        // ])

        const promises = [
          api_service.get_race_results_f1api(year, round),
          api_service.get_qualifying_results_f1api(year, round)
        ]

        // Add stint data if session_key is available
        const session_key = this.last_race_info.race_session?.session_key
        if (session_key) {
          promises.push(api_service.get_stint_data(session_key))
        }

        const results = await Promise.all(promises)
        const race_data = results[0]
        const qualifying_data = results[1]
        const stint_data = results[2] || []

        

        // console.log(race_data, qualifying_data);
        
        this.race_results = race_data.races.results || []
        this.qualifying_results = qualifying_data.races.qualyResults || []
        this.stint_data = stint_data
        
        
        console.log('Race results loaded:', this.race_results)
        console.log('Qualifying results loaded:', this.qualifying_results)
        console.log('Stint data:', this.stint_data)
        
      } catch (error) {
        console.error('Error loading race results:', error)
        this.error = 'Failed to load race results'
      } finally {
        this.loading = false
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
