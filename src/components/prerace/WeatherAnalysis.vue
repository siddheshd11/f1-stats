<template>
  <div class="bg-black rounded-lg overflow-hidden shadow-lg">
    <div class="border-b border-gray-700 p-4">
      <h2 class="text-white text-xl font-semibold flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        Weather Analysis
      </h2>
      <p class="text-gray-400 text-sm mt-1">Race weather conditions and forecasts</p>
    </div>

    <div class="p-4">
      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-700 mb-4 justify-center">
        <button
          @click="active_tab = 'last_race'"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="active_tab === 'last_race' 
            ? 'text-blue-500 border-b-2 border-blue-500' 
            : 'text-gray-400 hover:text-gray-300'"
        >
          Last Race Weather
        </button>
        <button
          @click="active_tab = 'next_race'"
          class="px-4 py-2 text-sm font-medium transition-colors ml-6"
          :class="active_tab === 'next_race' 
            ? 'text-blue-500 border-b-2 border-blue-500' 
            : 'text-gray-400 hover:text-gray-300'"
        >
          Next Race Forecast
        </button>
      </div>

      <!-- Tab Content -->
      <LastRaceWeather 
        v-if="active_tab === 'last_race'"
        :last_race_info="last_race_info"
      />
      <NextRaceWeather 
        v-if="active_tab === 'next_race'"
        :next_race_info="next_race_info"
      />
    </div>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'
import LastRaceWeather from './weather_tabs/LastRaceWeather.vue'
import NextRaceWeather from './weather_tabs/NextRaceWeather.vue'

export default {
  name: 'WeatherAnalysis',
  
  components: {
    LastRaceWeather,
    NextRaceWeather
  },
  
  data() {
    return {
      race_store: use_race_store(),
      active_tab: 'last_race'
    }
  },
  
  computed: {
    last_race_info() {
      return this.race_store.get_last_race_held
    },

    next_race_info() {
      return this.race_store.get_next_race_info
    }
  }
}
</script>
