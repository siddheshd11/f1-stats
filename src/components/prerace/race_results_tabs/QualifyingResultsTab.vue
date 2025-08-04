<template>
  <div class="space-y-3">
    <div 
      v-for="(result, index) in displayed_results"
      :key="result.driver_id || index"
      class="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-4 hover:bg-gray-800 transition-colors"
    >
      <!-- Position -->
      <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
           :class="get_qualifying_position_color(result.gridPosition)">
        {{ result.gridPosition }}
      </div>

      <!-- Driver Photo -->
      <div class="flex-shrink-0">
        <img
          :src="get_driver_headshot(result.driver_name || result.driver)"
          :alt="result.driver_name || result.driver"
          class="w-10 h-10 rounded-full object-cover bg-gray-700"
          @error="handle_image_error"
        />
      </div>

      <!-- Driver Info -->
      <div class="flex-grow min-w-0">
        <div class="flex items-center space-x-2">
          <p class="text-white font-medium text-sm truncate">
            {{ result.driver.name }} {{result.driver.surname}}
          </p>
          <div class="w-3 h-3 rounded-full"
               :style="{ backgroundColor: `#${get_team_color(result.driver_name || result.driver)}` }">
          </div>
        </div>
        <p class="text-gray-400 text-xs truncate">
          {{ get_team_name(result.driver_name || result.driver) }}
        </p>
      </div>

      <!-- Qualifying Times -->
      <div class="flex-grow">
        <div class="flex flex-col md:flex-row md:space-x-4 text-xs justify-end">
          <div v-if="result.q1" class="text-gray-300">
            <span class="text-gray-500">Q1:</span> {{ result.q1 }}
          </div>
          <div v-if="result.q2" class="text-gray-300">
            <span class="text-gray-500">Q2:</span> {{ result.q2 }}
          </div>
          <div v-if="result.q3" class="text-yellow-400 font-medium">
            <span class="text-gray-500">Q3:</span> {{ result.q3 }}
          </div>
        </div>
        <p v-if="!result.q1 && !result.q2 && !result.q3" class="text-white text-sm">
          {{ result.time || result.best_time || 'N/A' }}
        </p>
      </div>
    </div>
    <!-- Show All/Show Less Button -->
    <div v-if="results.length > 5" class="text-center pt-2">
      <button
        @click="show_all=!show_all"
        class="px-4 py-2 cursor-pointer f1-primary hover:f1-secondary text-white text-xs rounded-lg transition-colors"
      >
        {{ show_all ? `Show Top 5` : `Show All ${results.length}` }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualifyingResultsTab',
  
  props: {
    results: {
      type: Array,
      default: () => []
    },
    drivers_data: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      show_all: false
    }
  },

  computed: {
    displayed_results() {
      if (this.show_all) {
        return this.results
      }
      return this.results.slice(0, 5)
    }
  },
  
  methods: {
    get_qualifying_position_color(position) {
      if (position === 1) return 'bg-red-600'
      if (position <= 10) return 'bg-green-600'
      if (position <= 15) return 'bg-yellow-600'
      return 'bg-gray-600'
    },
    
    get_driver_headshot(driver_name) {
      const driver = this.find_driver_by_name(driver_name)
      return driver?.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    get_team_name(driver_name) {
      const driver = this.find_driver_by_name(driver_name)
      return driver?.team_name || 'Unknown Team'
    },
    
    get_team_color(driver_name) {
      const driver = this.find_driver_by_name(driver_name)
      return driver?.team_colour || '6B7280'
    },
    
    find_driver_by_name(driver_name) {
      if (!driver_name || !this.drivers_data) return null
      
      return this.drivers_data.find(driver => {
        const full_name = `${driver.first_name} ${driver.last_name}`.toLowerCase()
        const search_name = `${driver_name.name} ${driver_name.surname}`.toLowerCase()
        return full_name.includes(search_name) || search_name.includes(full_name)
      })
    },
    
    handle_image_error(event) {
      event.target.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    }
  }
}
</script>
