<template>
  <div class="">
    <!-- <h3 class="text-white font-medium mb-4">Select Drivers to Compare (Max 4)</h3> -->
    
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
    
      <div v-else class="space-y-4">
        <!-- Search Input with Pills Inside -->
        <div class="relative">
          <div 
            class="flex flex-wrap items-center gap-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus-within:border-red-500 min-h-[44px] cursor-text"
            @click="focus_input"
          >
            <!-- Selected Driver Pills Inside Input -->
            <div
              v-for="driver_number in selected_drivers"
              :key="driver_number"
              class="flex items-center space-x-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs flex-shrink-0"
            >
              <!-- Driver Photo -->
              <img
                :src="get_driver_photo(driver_number)"
                :alt="get_driver_name(driver_number)"
                class="w-4 h-4 rounded-full object-cover"
                @error="handle_image_error"
              />
              
              <!-- Driver Info -->
              <span class="font-medium">#{{ driver_number }}</span>
              <span class="hidden sm:inline">{{ get_driver_name(driver_number) }}</span>
              
              <!-- Remove Button -->
              <button 
                @click.stop="remove_driver(driver_number)"
                class="hover:bg-red-700 rounded-full p-0.5 transition-colors"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Search Input -->
            <input
              ref="search_input"
              v-model="search_query"
              @focus="show_dropdown = true"
              @blur="handle_blur"
              @keydown="handle_keydown"
              :placeholder="'Select Drivers to Compare - ' + selected_drivers.length + '/4 are selected'"
              class="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none min-w-[120px]"
              :disabled="selected_drivers.length >= 4"
            />
            
            <!-- Search Icon -->
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          <!-- Dropdown -->
          <div 
            v-if="show_dropdown && filtered_drivers.length > 0 && selected_drivers.length < 4"
            class="absolute z-50 w-full bg-black border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            <div
              v-for="(driver, index) in filtered_drivers"
              :key="driver.driver_number"
              @mousedown="select_driver(driver.driver_number)"
              class="flex items-center space-x-3 p-3 hover:bg-gray-800/50 cursor-pointer border-b border-gray-600 last:border-b-0"
              :class="{ 'bg-gray-600': index === highlighted_index }"
            >
              <!-- Driver Photo -->
              <img
                :src="driver.headshot_url || '/imgs/drivers/default_driver.png'"
                :alt="driver.full_name"
                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                @error="handle_image_error"
              />
              
              <!-- Driver Info -->
              <div class="flex-grow min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="text-white font-bold text-sm">#{{ driver.driver_number }}</span>
                  <div 
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: `#${driver.team_colour}` }"
                  ></div>
                </div>
                <p class="text-white text-sm font-medium">{{ driver.first_name }} {{ driver.last_name }}</p>
                <p class="text-gray-400 text-xs truncate">{{ driver.team_name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Text -->
        <!-- <div class="flex items-center justify-between text-sm">
          <div class="text-gray-400">
            {{ selected_drivers.length }}/4 drivers selected
          </div>
          <div v-if="selected_drivers.length >= 4" class="text-yellow-400">
            Maximum drivers selected
          </div>
          <div v-else-if="show_dropdown && search_query && filtered_drivers.length === 0" class="text-gray-500">
            No drivers found
          </div>
        </div> -->
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DriverSelector',
  
  props: {
    available_drivers: {
      type: Array,
      default: () => []
    },
    selected_drivers: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      search_query: '',
      show_dropdown: false,
      highlighted_index: -1
    }
  },
  
  computed: {
    filtered_drivers() {
      if (!this.search_query.trim()) {
        return this.available_drivers
          .filter(driver => !this.is_selected(driver.driver_number))
          .slice(0, 8) // Show first 8 when no search
      }
      
      const query = this.search_query.toLowerCase()
      return this.available_drivers
        .filter(driver => {
          if (this.is_selected(driver.driver_number)) return false
          
          const name = `${driver.first_name} ${driver.last_name}`.toLowerCase()
          const number = driver.driver_number.toString()
          const acronym = driver.name_acronym?.toLowerCase() || ''
          const team = driver.team_name?.toLowerCase() || ''
          
          return name.includes(query) || 
                 number.includes(query) || 
                 acronym.includes(query) || 
                 team.includes(query)
        })
    }
  },
  
  watch: {
    search_query() {
      this.highlighted_index = -1
    }
  },
  
  methods: {
    select_driver(driver_number) {
      if (!this.is_selected(driver_number) && this.selected_drivers.length < 4) {
        const new_selection = [...this.selected_drivers, driver_number]
        this.$emit('drivers-changed', new_selection)
      }
      
      // Clear search and hide dropdown
      this.search_query = ''
      this.show_dropdown = false
      this.highlighted_index = -1
      
      // Keep focus on input for continuous selection
      if (this.selected_drivers.length < 3) { // Will be 4 after this selection
        this.$nextTick(() => {
          this.$refs.search_input?.focus()
        })
      }
    },
    
    remove_driver(driver_number) {
      const new_selection = this.selected_drivers.filter(num => num !== driver_number)
      this.$emit('drivers-changed', new_selection)
      
      // Focus input after removal
      this.$nextTick(() => {
        this.$refs.search_input?.focus()
      })
    },
    
    is_selected(driver_number) {
      return this.selected_drivers.includes(driver_number)
    },
    
    get_driver_name(driver_number) {
      const driver = this.available_drivers.find(d => d.driver_number === driver_number)
      return driver ? driver.name_acronym || `${driver.first_name} ${driver.last_name}` : `#${driver_number}`
    },
    
    get_driver_photo(driver_number) {
      const driver = this.available_drivers.find(d => d.driver_number === driver_number)
      return driver?.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    handle_image_error(event) {
      event.target.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    focus_input() {
      this.$refs.search_input?.focus()
    },
    
    handle_blur() {
      // Delay hiding dropdown to allow click events
      setTimeout(() => {
        this.show_dropdown = false
        this.highlighted_index = -1
      }, 150)
    },
    
    handle_keydown(event) {
      if (!this.show_dropdown || this.filtered_drivers.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.highlighted_index = Math.min(
            this.highlighted_index + 1, 
            this.filtered_drivers.length - 1
          )
          break
          
        case 'ArrowUp':
          event.preventDefault()
          this.highlighted_index = Math.max(this.highlighted_index - 1, -1)
          break
          
        case 'Enter':
          event.preventDefault()
          if (this.highlighted_index >= 0 && this.highlighted_index < this.filtered_drivers.length) {
            this.select_driver(this.filtered_drivers[this.highlighted_index].driver_number)
          } else if (this.filtered_drivers.length > 0) {
            this.select_driver(this.filtered_drivers[0].driver_number)
          }
          break
          
        case 'Escape':
          this.show_dropdown = false
          this.search_query = ''
          this.highlighted_index = -1
          this.$refs.search_input?.blur()
          break
          
        case 'Backspace':
          // Remove last selected driver if input is empty
          if (this.search_query === '' && this.selected_drivers.length > 0) {
            event.preventDefault()
            const last_driver = this.selected_drivers[this.selected_drivers.length - 1]
            this.remove_driver(last_driver)
          }
          break
      }
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar for dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
</style>
