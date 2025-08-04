<template>
  <div class="space-y-3">
    <div 
      v-for="(result, index) in displayed_results"
      :key="result.driver_id || index"
      class="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center space-x-4 hover:bg-gray-800 transition-colors"
    >
      <!-- Position -->
      <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
           :class="get_position_color(result.position)">
        {{ result.position }}
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
        <div class="text-gray-400 text-xs truncate">
          <p>
            {{ get_team_name(result.driver_name || result.driver) }}
          </p>
          <p class="text-red-500 font-bold text-sm">
            {{ result.points || '0' }} pts
          </p>
        </div>

      </div>

      <!-- Race Stats (Mobile Hidden) -->
      <div class="flex flex-col text-right space-y-2">
        <div class="flex space-x-2 justify-end">
          <p class="text-white text-sm font-medium">
          {{ result.time || result.total_time || 'N/A' }}

          </p>
          
        </div>
        <!-- <p class="text-gray-400 text-xs">
          {{ result.gap || (result.position > 1 ? '+' + (result.gap || 'N/A') : 'Winner') }}
        </p> -->
        <!-- Tire Strategy Row -->
        <div v-if="get_driver_tire_strategy(result.driver_name || result.driver).length > 0" 
             class="mt-2 md:pl-9 pl-3">
          <div class="flex items-center space-x-1 flex-wrap">
            <span class="hidden md:show text-gray-500 text-xs mr-1">Tires:</span>
            <div 
              v-for="(tire, tire_index) in get_driver_tire_strategy(result.driver_name || result.driver)"
              :key="tire_index"
              class="flex items-center space-x-1"
            >
              <div class="p-1 md:p-2 w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center"
                   :class="get_tire_color(tire.compound)">
                <span class="hidden md:show text-xs font-bold">
                  {{ get_tire_letter(tire.compound) }}
                </span>
              </div>
              <!-- <span class="text-gray-400 text-xs">{{ tire.stint_number }}</span> -->
              <span v-if="tire_index < get_driver_tire_strategy(result.driver_name || result.driver).length - 1" 
                    class="text-gray-600 text-xs">→</span>
            </div>
          </div>
        </div>
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
    get_position_color(position) {
      if (position === 1) return 'bg-yellow-500'
      if (position === 2) return 'bg-gray-400'
      if (position === 3) return 'bg-amber-600'
      if (position <= 10) return 'bg-green-600'
      return 'bg-gray-600'
    },

    get_driver_tire_strategy(driver_name) {

      const driver = this.find_driver_by_name(driver_name)

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
    
    get_short_driver_name(driver_name) {
      if (!driver_name) return 'N/A'
      const parts = driver_name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}. ${parts[parts.length - 1]}`
      }
      return driver_name
    },
    
    get_short_team_name(driver_name) {
      const team = this.get_team_name(driver_name)
      const short_names = {
        'McLaren': 'MCL',
        'Ferrari': 'FER',
        'Mercedes': 'MER',
        'Red Bull Racing': 'RBR',
        'Aston Martin': 'AMR',
        'Alpine': 'ALP',
        'Williams': 'WIL',
        'AlphaTauri': 'AT',
        'Alfa Romeo': 'ALF',
        'Haas': 'HAS'
      }
      return short_names[team] || team.substring(0, 3).toUpperCase()
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
