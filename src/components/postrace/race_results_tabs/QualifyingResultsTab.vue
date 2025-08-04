<template>
  <div class="space-y-3">
    <div 
      v-for="(result, index) in results"
      :key="result.driver_id || index"
      class="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <!-- Position -->
        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
             :class="get_qualifying_position_color(result.gridPosition)">
          {{ result.gridPosition }}
        </div>

        <!-- Driver Photo -->
        <div class="flex-shrink-0">
          <img
            :src="get_driver_headshot(result)"
            :alt="format_driver_name(result)"
            class="w-10 h-10 rounded-full object-cover bg-gray-700"
            @error="handle_image_error"
          />
        </div>

        <!-- Driver Info -->
        <div class="flex-grow min-w-0">
          <div class="flex items-center space-x-2">
            <p class="text-white font-medium text-sm truncate">
              {{ format_driver_name(result) }}
            </p>
            <div class="w-3 h-3 rounded-full"
                 :style="{ backgroundColor: `#${get_team_color(result)}` }">
            </div>
          </div>
          <p class="text-gray-400 text-xs truncate">
            {{ get_team_name(result) }}
          </p>
        </div>

        <!-- Qualifying Times -->
        <div class="text-right">
          <div class="space-y-1">
            <p class="text-white text-sm font-medium">
              {{ result.q3 || result.q2 || result.q1 || result.time || 'N/A' }}
            </p>
            <div class="flex space-x-2 text-xs">
              <span v-if="result.q1" class="text-gray-400">Q1: {{ result.q1 }}</span>
              <span v-if="result.q2" class="text-gray-400">Q2: {{ result.q2 }}</span>
              <span v-if="result.q3" class="text-yellow-400 font-medium">q3: {{ result.q3 }}</span>
            </div>
          </div>
        </div>
      </div>
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
  
  methods: {
    format_driver_name(result) {
      if (result.driver) {
        return `${result.driver.name} ${result.driver.surname}`
      }
      if (result.driver) {
        return result.driver
      }
      return 'Unknown Driver'
    },
    
    get_driver_headshot(driver_name) {
      const driver = this.find_driver_by_name(driver_name.driver)
      // console.log(driver_name);
      return driver?.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    get_team_name(driver_name) {
      const driver = this.find_driver_by_name(driver_name.driver)
      return driver?.team_name || 'Unknown Team'
    },
    
    get_team_color(driver_name) {
      const driver = this.find_driver_by_name(driver_name.driver)
      return driver?.team_colour || '6B7280'
    },
    
    get_qualifying_position_color(position) {
      if (position === 1) return 'bg-red-600'
      if (position <= 10) return 'bg-green-600'
      if (position <= 15) return 'bg-yellow-600'
      return 'bg-gray-600'
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
