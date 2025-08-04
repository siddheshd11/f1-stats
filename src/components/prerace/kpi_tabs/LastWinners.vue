<template>
  <div class="space-y-4">
    <h3 class="text-white text-lg font-semibold">Last 3 Winners</h3>
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
   
    
      <div v-else class="space-y-3">
        <div 
          v-for="winner in winners_data"
          :key="winner.year"
          class="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="text-red-500 font-bold text-lg">{{ winner.year }}</div>
            <div>
              <p class="text-white font-medium mb-1">{{ winner.driver }}</p>
              <p class="text-gray-400 text-sm">{{ winner.team }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-white text-sm mb-1">{{ winner.time }}</p>
            <p class="text-gray-400 text-xs">Fastest Lap - {{ winner.fatest_lap }} (L{{winner.fatest_lap_n}})</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'

export default {
  name: 'LastFiveWinners',
  
  props: {
    circuit_id: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      winners_data: [],
      loading: false
    }
  },
  
  async mounted() {
    await this.fetch_winners_data()
  },
  
  methods: {
    async fetch_winners_data() {
      this.loading = true
      try {
        const current_year = new Date().getFullYear()
        const winners = []
        
        for (let year = current_year - 1; year >= current_year - 3; year--) {
          try {
            const races = await api_service.get_race_schedule(year)
            const circuit_race = races.find(race => race.Circuit.circuitId === this.circuit_id)
            
            if (circuit_race) {
              const results = await api_service.get_race_results(year, circuit_race.round)
              if (results && results.Results && results.Results.length > 0) {
                const winner = results.Results[0]
                // console.log(results.Results);
                winners.push({
                  year: year,
                  driver: `${winner.Driver.givenName} ${winner.Driver.familyName}`,
                  team: winner.Constructor.name,
                  time: winner.Time?.time || 'N/A',
                  fatest_lap: winner.FastestLap.Time.time || 'N/A',
                  fatest_lap_n: winner.FastestLap.lap || 'N/A'
                })
              }
            }
          } catch (error) {
            console.warn(`Could not fetch data for ${year}`)
          }
        }
        
        this.winners_data = winners
      } catch (error) {
        console.error('Error fetching winners data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
