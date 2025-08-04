<template>
  <div class="space-y-4">
    <h3 class="text-white text-lg font-semibold">Most Wins at This Circuit</h3>

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
    
      <div v-else>
        <!-- Driver Wins -->
        <div class="mb-6">
          <h4 class="text-gray-300 font-medium mb-3">Drivers</h4>
          <div class="space-y-2">
            <div 
              v-for="(driver, index) in driver_wins"
              :key="driver.name"
              class="bg-gray-800 p-3 rounded-lg flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <span class="text-white font-medium">{{ driver.name }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-red-500 font-bold">{{ driver.wins }} wins</span>
                <span class="text-gray-400 text-sm">{{ driver.years }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Constructor Wins -->
        <div>
          <h4 class="text-gray-300 font-medium mb-3">Constructors</h4>
          <div class="space-y-2">
            <div 
              v-for="(team, index) in constructor_wins"
              :key="team.name"
              class="bg-gray-800 p-3 rounded-lg flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {{ index + 1 }}
                </div>
                <span class="text-white font-medium">{{ team.name }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-red-500 font-bold">{{ team.wins }} wins</span>
                <span class="text-gray-400 text-sm">{{ team.years }}</span>
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
  name: 'MostWins',
  
  props: {
    circuit_id: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      driver_wins: [],
      constructor_wins: [],
      loading: false
    }
  },
  
  async mounted() {
    await this.fetch_wins_data()
  },
  
  methods: {
    async fetch_wins_data() {
      this.loading = true
      try {
        const driver_stats = {}
        const constructor_stats = {}
        const current_year = new Date().getFullYear()
        
        // Go back 20 years to get comprehensive data
        for (let year = current_year - 1; year >= current_year - 3; year--) {
          try {
            const races = await api_service.get_race_schedule(year)
            const circuit_race = races.find(race => race.Circuit.circuitId === this.circuit_id)
            
            if (circuit_race) {
              const results = await api_service.get_race_results(year, circuit_race.round)
              if (results && results.Results && results.Results.length > 0) {
                const winner = results.Results[0]
                const driver_name = `${winner.Driver.givenName} ${winner.Driver.familyName}`
                const constructor_name = winner.Constructor.name
                
                // Track driver wins
                if (!driver_stats[driver_name]) {
                  driver_stats[driver_name] = { wins: 0, years: [] }
                }
                driver_stats[driver_name].wins++
                driver_stats[driver_name].years.push(year)
                
                // Track constructor wins
                if (!constructor_stats[constructor_name]) {
                  constructor_stats[constructor_name] = { wins: 0, years: [] }
                }
                constructor_stats[constructor_name].wins++
                constructor_stats[constructor_name].years.push(year)
              }
            }
          } catch (error) {
            console.warn(`Could not fetch data for ${year}`)
          }
        }
        
        // Sort and format data
        this.driver_wins = Object.entries(driver_stats)
          .map(([name, data]) => ({
            name,
            wins: data.wins,
            years: `${Math.min(...data.years)}-${Math.max(...data.years)}`
          }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 5) // Top 5
        
        this.constructor_wins = Object.entries(constructor_stats)
          .map(([name, data]) => ({
            name,
            wins: data.wins,
            years: `${Math.min(...data.years)}-${Math.max(...data.years)}`
          }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 5) // Top 5
          
      } catch (error) {
        console.error('Error fetching wins data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
