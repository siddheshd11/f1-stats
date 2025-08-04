<template>
  <div class="bg-black rounded-lg overflow-hidden shadow-lg">
    <div class="border-b border-gray-700 p-4">
      <h2 class="text-white text-xl font-semibold flex items-center">
        <svg class="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Telemetry Comparison
      </h2>
      <p class="text-gray-400 text-sm mt-1">Compare detailed car telemetry data between drivers (Speed, Throttle, Brake, RPM, Gear)</p>
    </div>

    <!-- MOBILE LAYOUT (visible only on small screens) -->
    <div class="block lg:hidden p-4">
      <div v-if="loading_drivers" class="text-center py-4">
        <div class="text-gray-400 text-sm">Loading drivers...</div>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Mobile Driver Selection - Compact Pills -->
        <div class="space-y-2">
          <h3 class="text-white text-sm font-medium">Select 2 Drivers</h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="driver_number in selected_drivers"
              :key="driver_number"
              class="flex items-center space-x-1 bg-purple-600 text-white px-2 py-1 rounded-full text-xs"
            >
              <img
                :src="get_driver_photo(driver_number)"
                :alt="get_driver_name(driver_number)"
                class="w-3 h-3 rounded-full object-cover"
              />
              <span>#{{ driver_number }}</span>
              <button @click.stop="remove_driver(driver_number)" class="hover:bg-purple-700 rounded-full p-0.5">
                <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Driver Picker - Horizontal Scroll -->
        <div v-if="selected_drivers.length < 2" class="bg-gray-800/50 rounded-lg p-3">
          <h4 class="text-gray-300 text-xs mb-2">Available Drivers</h4>
          <div class="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            <button
              v-for="driver in available_drivers.filter(d => !selected_drivers.includes(d.driver_number))"
              :key="driver.driver_number"
              @click="select_driver(driver.driver_number)"
              class="flex-shrink-0 flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-xs transition-colors"
            >
              <img
                :src="driver.headshot_url || '/imgs/drivers/default_driver.png'"
                :alt="driver.full_name"
                class="w-5 h-5 rounded-full object-cover"
              />
              <div class="text-left">
                <div class="font-bold">#{{ driver.driver_number }}</div>
                <div class="text-gray-300 text-xs">{{ driver.name_acronym }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Mobile Telemetry Chart -->
        <div v-if="selected_drivers.length === 2" class="bg-gray-800/50 rounded-lg overflow-hidden">
          <TelemetryComparisonChart 
            :selected_drivers="selected_drivers"
            :session_key="session_key"
            :available_drivers="available_drivers"
          />
        </div>

        <!-- Mobile Empty States -->
        <div v-else-if="selected_drivers.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 class="text-white text-sm font-medium mb-1">Select Drivers</h3>
          <p class="text-gray-400 text-xs">Choose 2 drivers to compare telemetry</p>
        </div>

        <div v-else-if="selected_drivers.length === 1" class="text-center py-8">
          <svg class="w-12 h-12 mx-auto text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <h3 class="text-white text-sm font-medium mb-1">Select One More</h3>
          <p class="text-gray-400 text-xs">Add one more driver to start comparison</p>
        </div>
      </div>
    </div>

    <!-- DESKTOP LAYOUT (visible only on large screens) - UNCHANGED -->
    <div class="hidden lg:block p-6">
      <!-- Driver Selection for Telemetry -->
      <div class="p-4">
        <div v-if="loading_drivers" class="text-center py-4">
          <div class="text-gray-400 text-sm">Loading drivers...</div>
        </div>
        
        <div v-else class="space-y-4">
          <!-- Search Input for Driver Selection -->
          <div class="relative">
            <div 
              class="flex flex-wrap items-center gap-2 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus-within:border-purple-500 min-h-[44px] cursor-text"
              @click="focus_input"
            >
              <!-- Selected Driver Pills -->
              <div
                v-for="driver_number in selected_drivers"
                :key="driver_number"
                class="flex items-center space-x-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex-shrink-0"
              >
                <img
                  :src="get_driver_photo(driver_number)"
                  :alt="get_driver_name(driver_number)"
                  class="w-4 h-4 rounded-full object-cover"
                  @error="handle_image_error"
                />
                <span class="font-medium">#{{ driver_number }}</span>
                <span class="hidden sm:inline">{{ get_driver_name(driver_number) }}</span>
                <button 
                  @click.stop="remove_driver(driver_number)"
                  class="hover:bg-purple-700 rounded-full p-0.5 transition-colors"
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
                :placeholder="'Select Drivers for Telemetry Comparison - (' + selected_drivers.length + '/2) selected'"
                class="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none min-w-[120px]"
                :disabled="selected_drivers.length >= 2"
              />
              
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            
            <!-- Dropdown -->
            <div 
              v-if="show_dropdown && filtered_drivers.length > 0 && selected_drivers.length < 2"
              class="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg overflow-y-auto"
            >
              <div
                v-for="driver in filtered_drivers"
                :key="driver.driver_number"
                @mousedown="select_driver(driver.driver_number)"
                class="flex items-center space-x-3 p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
              >
                <img
                  :src="driver.headshot_url || '/imgs/drivers/default_driver.png'"
                  :alt="driver.full_name"
                  class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  @error="handle_image_error"
                />
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
        </div>
      </div>

      <!-- Desktop Telemetry Analysis -->
      <div v-if="selected_drivers.length === 0" class="text-center py-2">
        <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h3 class="text-white text-lg font-medium mb-2">Select Drivers for Telemetry Analysis</h3>
        <p class="text-gray-400 text-sm">Choose up to 2 drivers to compare detailed car telemetry data</p>
      </div>

      <div v-else-if="selected_drivers.length === 1" class="text-center">
        <svg class="w-16 h-16 mx-auto text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <h3 class="text-white text-lg font-medium mb-2">Select One More Driver</h3>
        <p class="text-gray-400 text-sm">Add one more driver to start telemetry comparison analysis</p>
      </div>

      <!-- Desktop Telemetry Comparison Chart -->
      <div v-else class="bg-gray-800/50 rounded-lg overflow-hidden">
        <TelemetryComparisonChart 
          :selected_drivers="selected_drivers"
          :session_key="session_key"
          :available_drivers="available_drivers"
        />
      </div>
    </div>
  </div>
</template>


<script>
import { use_race_store } from '@/stores/race_store.js'
import TelemetryComparisonChart from './telemetry_comparison/TelemetryComparisonChart.vue'

export default {
  name: 'TelemetryComparisonSection',
  
  components: {
    TelemetryComparisonChart
  },
  
  data() {
    return {
      race_store: use_race_store(),
      selected_drivers: [],
      search_query: '',
      show_dropdown: false
    }
  },
  
  computed: {
    session_key() {
      const key = this.race_store.previous_race?.race_session?.session_key
      return key ? String(key) : null
    },

    available_drivers() {
      return this.race_store.getSessionDrivers
    },

    loading_drivers() {
      return this.race_store.loading_session_drivers
    },

    filtered_drivers() {
      if (!this.search_query.trim()) {
        return this.available_drivers
          .filter(driver => !this.is_selected(driver.driver_number))
          .slice(0, 8)
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
  
  async mounted() {
    if (this.session_key) {
      await this.race_store.fetchSessionDrivers(this.session_key)
    }
  },
  
  watch: {
    session_key: {
      handler(new_session_key) {
        if (new_session_key) {
          this.race_store.fetchSessionDrivers(new_session_key)
        }
      },
      immediate: false
    }
  },
  
  methods: {
    select_driver(driver_number) {
      if (!this.is_selected(driver_number) && this.selected_drivers.length < 2) {
        this.selected_drivers.push(driver_number)
      }
      
      this.search_query = ''
      this.show_dropdown = false
      
      if (this.selected_drivers.length < 2) {
        this.$nextTick(() => {
          this.$refs.search_input?.focus()
        })
      }
    },
    
    remove_driver(driver_number) {
      this.selected_drivers = this.selected_drivers.filter(num => num !== driver_number)
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
      setTimeout(() => {
        this.show_dropdown = false
      }, 150)
    }
  }
}
</script>


<style scoped>
/* Mobile Responsive Styles for Telemetry Comparison Component */

/* Main container adjustments */
@media (max-width: 768px) {
  .bg-black.rounded-lg.overflow-hidden.shadow-lg {
    margin: 0 -0.5rem; /* Extend to screen edges on mobile */
  }
  
  .p-6 {
    padding: 0.75rem !important; /* Reduce padding on mobile */
  }
}

/* Header and description responsive scaling */
@media (max-width: 640px) {
  h2 {
    font-size: 1.125rem !important; /* 18px instead of 24px */
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  h2 svg {
    width: 1rem !important; /* 16px instead of 20px */
    height: 1rem !important;
    margin-right: 0.375rem !important;
  }
  
  .border-b.border-gray-700.p-4 p {
    font-size: 0.75rem !important; /* 12px */
    text-align: center;
    margin-top: 0.25rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  h2 {
    font-size: 1.25rem !important; /* 20px for tablets */
  }
}

/* Driver selection container adjustments */
@media (max-width: 640px) {
  .p-4 {
    padding: 0.5rem !important;
  }
  
  /* Driver selection input container */
  .flex.flex-wrap.items-center.gap-2.w-full.bg-gray-700 {
    padding: 0.5rem !important;
    min-height: 3rem;
    gap: 0.25rem !important;
  }
  
  /* Selected driver pills */
  .flex.items-center.space-x-2.bg-purple-600 {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.65rem !important;
  }
  
  .flex.items-center.space-x-2.bg-purple-600 img {
    width: 0.875rem !important; /* 14px */
    height: 0.875rem !important;
  }
  
  .flex.items-center.space-x-2.bg-purple-600 span {
    font-size: 0.65rem !important;
  }
  
  /* Search input */
  input[ref="search_input"] {
    font-size: 0.75rem !important;
    min-width: 100px;
  }
  
  /* Search icon */
  .w-4.h-4.text-gray-400 {
    width: 0.875rem !important;
    height: 0.875rem !important;
  }
}

/* Dropdown responsive styling */
@media (max-width: 640px) {
  .absolute.z-50.w-full.mt-1.bg-gray-700 {
    max-height: 200px !important;
    border-radius: 0.5rem;
  }
  
  .absolute.z-50.w-full.mt-1.bg-gray-700 .flex.items-center.space-x-3 {
    padding: 0.5rem !important;
  }
  
  .absolute.z-50.w-full.mt-1.bg-gray-700 img {
    width: 1.5rem !important; /* 24px */
    height: 1.5rem !important;
  }
  
  .absolute.z-50.w-full.mt-1.bg-gray-700 .text-sm {
    font-size: 0.75rem !important;
  }
  
  .absolute.z-50.w-full.mt-1.bg-gray-700 .text-xs {
    font-size: 0.625rem !important;
  }
}

/* Empty state adjustments */
@media (max-width: 640px) {
  .text-center.py-2, .text-center {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  
  .text-center svg {
    width: 3rem !important; /* 48px instead of 64px */
    height: 3rem !important;
    margin-bottom: 0.75rem !important;
  }
  
  .text-center h3 {
    font-size: 1rem !important; /* 16px instead of 18px */
    margin-bottom: 0.5rem !important;
  }
  
  .text-center p {
    font-size: 0.75rem !important; /* 12px */
    padding: 0 1rem;
  }
}

/* Telemetry chart container */
@media (max-width: 640px) {
  .bg-gray-800\/50.rounded-lg.overflow-hidden {
    margin: 0 -0.25rem; /* Extend slightly for better mobile view */
  }
}

/* Fluid font sizing using clamp for smooth scaling */
h2 {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  line-height: 1.3;
}

p {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

.text-xs {
  font-size: clamp(0.625rem, 1.2vw, 0.75rem);
}

.text-sm {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

/* Enhanced scrollbar styling for dropdown */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

/* Touch-friendly close buttons in driver pills */
@media (max-width: 640px) {
  button.hover\:bg-purple-700 {
    padding: 0.25rem !important;
    min-width: 1.5rem;
    min-height: 1.5rem;
  }
  
  button.hover\:bg-purple-700 svg {
    width: 0.75rem !important;
    height: 0.75rem !important;
  }
}

/* Smooth transitions */
.flex.items-center.space-x-2.bg-purple-600 {
  transition: all 0.2s ease-in-out;
}

button.hover\:bg-purple-700 {
  transition: background-color 0.15s ease-in-out;
}

/* Loading text sizing */
.text-center.py-4 .text-sm {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}
/* Hide scrollbar for horizontal driver list */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Mobile responsive font sizes */
@media (max-width: 640px) {
  h2 {
    font-size: 1.125rem !important;
  }
  
  h3 {
    font-size: 0.875rem !important;
  }
  
  p {
    font-size: 0.75rem !important;
  }
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

/* Touch-friendly sizing */
@media (max-width: 640px) {
  button {
    min-height: 36px;
    min-width: 36px;
  }
}
</style>
