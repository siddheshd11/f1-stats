<template>
  <div class="space-y-6">
    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-400">Loading circuit information...</div>
    </div>
    
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-400">{{ error }}</div>
    </div>
    
    <div v-else>
      <!-- Tab Navigation (Similar to PrevRaceResults) -->
      <div class="bg-gray-900 rounded-lg overflow-hidden">
        <div class="flex border-b border-gray-700">
          <button
            @click="active_tab = 'schedule'"
            class="flex-1 px-3 py-3 text-sm font-medium transition-colors"
            :class="active_tab === 'schedule' 
              ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-gray-300'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Schedule
          </button>
          
          <button
            @click="active_tab = 'stats'"
            class="flex-1 px-3 py-3 text-sm font-medium transition-colors"
            :class="active_tab === 'stats' 
              ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-gray-300'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Stats
          </button>
          
          <button
            @click="active_tab = 'winners'"
            class="flex-1 px-3 py-3 text-sm font-medium transition-colors"
            :class="active_tab === 'winners' 
              ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-gray-300'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a9.014 9.014 0 0 1 5.198.569m-7.718 6.659a6.726 6.726 0 0 0 2.748-1.35m0 0V7.5a6.726 6.726 0 0 1-3.25-1.8m0 1.8a6.726 6.726 0 0 1-3.25 1.8" />
            </svg>
            Winners
          </button>
          
          <button
            @click="active_tab = 'most_wins'"
            class="flex-1 px-3 py-3 text-sm font-medium transition-colors"
            :class="active_tab === 'most_wins' 
              ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
              : 'text-gray-400 hover:text-gray-300'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline mb-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.563.563 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            Wins
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-4 max-h-95 overflow-y-auto custom-scrollbar">
          <race_schedule v-if="active_tab === 'schedule'" :race_data="race_data" />
          <circuit_stats v-if="active_tab === 'stats'" :circuit_data="circuit_data" />
          <last_five_winners v-if="active_tab === 'winners'" :circuit_id="circuit_id" />
          <most_wins v-if="active_tab === 'most_wins'" :circuit_id="circuit_id" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import race_schedule from './kpi_tabs/RaceSchedule.vue'
import circuit_stats from './kpi_tabs/CircuitStats.vue'
import last_five_winners from './kpi_tabs/LastWinners.vue'
import most_wins from './kpi_tabs/MostWins.vue'

export default {
  name: 'CircuitTabs',
  
  components: {
    race_schedule,
    circuit_stats,
    last_five_winners,
    most_wins
  },
  
  props: {
    race_data: {
      type: Object,
      default: () => ({})
    },
    circuit_data: {
      type: Object,
      default: () => ({})
    },
    circuit_id: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      active_tab: 'schedule'
    }
  }
}
</script>
