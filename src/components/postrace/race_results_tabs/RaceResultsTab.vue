<template>
  <div class="space-y-3">
    <div 
      v-for="(result, index) in results"
      :key="result.driver_id || index"
      class="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
    >
      <!-- Main Driver Info Row -->
      <div class="flex items-center space-x-3">
        <!-- Position -->
        <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
             :class="get_position_color(result.position)">
          {{ result.position }}
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

        <!-- Race Time & Points -->
        <div class="text-right">
          <p class="text-white text-sm font-medium">
            {{ result.Time?.time || result.time || result.status || 'N/A' }}
          </p>
          <p class="text-red-500 text-xs font-bold">
            {{ result.points || '0' }} pts
          </p>
        </div>
      </div>

      <!-- Tire Strategy Row -->
      <div v-if="get_driver_tire_strategy(result).length > 0" 
           class="mt-3 pl-11">
        <div class="flex items-center space-x-1 flex-wrap">
          <span class="text-gray-500 text-xs mr-2">Tire Strategy:</span>
          <div 
            v-for="(tire, tire_index) in get_driver_tire_strategy(result)"
            :key="tire_index"
            class="flex items-center space-x-1"
          >
            <div class="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center p-2"
                 :class="get_tire_color(tire.compound)">
              <span class="text-black text-xs font-bold">
                {{ get_tire_letter(tire.compound) }}
              </span>
            </div>
            <!-- <span class="text-gray-400 text-xs">{{ tire.stint_number }}</span> -->
            <span v-if="tire_index < get_driver_tire_strategy(result).length - 1" 
                  class="text-gray-600 text-xs mx-1">→</span>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
export default {
  name: 'RaceResultsTab',
  
  props: {
    results: {
      type: Array,
      default: () => []
    },
    drivers_data: {
      type: Array,
      default: () => []
    },
    stint_data: {
      type: Array,
      default: () => []
    }
  },
  
  methods: {
    format_driver_name(result) {
      // console.log(result);
      if (result.driver?.name) {
        return `${result.driver.name} ${result.driver.surname}`
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
    
    get_driver_tire_strategy(driver_name) {

      const driver = this.find_driver_by_name(driver_name.driver)

      // console.log(driver, this.stint_data.length)


      if (!driver?.driver_number || !this.stint_data.length) return []

      // console.log(driver)

      // Find stints for this driver
      const driver_stints = this.stint_data.filter(stint => 
        stint.driver_number === driver.driver_number
      )

      // console.log(driver_stints)
      // Sort by stint number and return tire info
      return driver_stints
        .sort((a, b) => a.stint_number - b.stint_number)
        .map(stint => ({
          stint_number: stint.stint_number,
          compound: stint.compound,
          lap_start: stint.lap_start,
          lap_end: stint.lap_end
        }))
    },

    get_tire_color(compound) {
      const tire_colors = {
        'SOFT': 'bg-red-500',
        'MEDIUM': 'bg-yellow-500', 
        'HARD': 'bg-gray-200',
        'INTERMEDIATE': 'bg-green-500',
        'WET': 'bg-blue-500'
      }
      return tire_colors[compound?.toUpperCase()] || 'bg-gray-500'
    },

    get_tire_letter(compound) {
      const tire_letters = {
        'SOFT': 'S',
        'MEDIUM': 'M',
        'HARD': 'H', 
        'INTERMEDIATE': 'I',
        'WET': 'W'
      }
      return tire_letters[compound?.toUpperCase()] || '?'
    },
    
    get_position_color(position) {
      if (position === 1) return 'bg-yellow-500'
      if (position === 2) return 'bg-gray-400'
      if (position === 3) return 'bg-amber-600'
      if (position <= 10) return 'bg-green-600'
      return 'bg-gray-600'
    },
    
    find_driver_by_name(driver_name) {
      // console.log(driver_name);
      if (!driver_name || !this.drivers_data) return null
      
      return this.drivers_data.find(driver => {
        const full_name = `${driver.first_name} ${driver.last_name}`.toLowerCase()
        const search_name = `${driver_name.name} ${driver_name.surname}`.toLowerCase()
        // console.log(full_name, search_name)
        return full_name.includes(search_name) || search_name.includes(full_name)
      })
    },
    
    handle_image_error(event) {
      event.target.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    }
  }
}
</script>
