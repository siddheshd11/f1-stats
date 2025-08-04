<template>
  <div class="bg-black rounded-lg overflow-hidden shadow-lg">
    <!-- Header with responsive font sizes -->
    <div class="border-b border-gray-700 p-3 sm:p-4">
      <h2 class="text-white text-lg sm:text-xl lg:text-2xl font-semibold flex items-center">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
          <path fill-rule="evenodd" d="M4 15a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm0-10V3a2 2 0 012-2h1a1 1 0 000 2H6v20h8V3h-1a1 1 0 100-2h1a2 2 0 012 2v2H4z" clip-rule="evenodd"/>
        </svg>
        <span>Lap-by-Lap Comparison</span>
      </h2>
      <p class="text-gray-400 text-xs sm:text-sm mt-1">
        Compare driver performances across laps and sectors
      </p>
    </div>

    <div class="p-3 sm:p-6">
      <!-- Error Display -->
      <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p class="text-red-400 text-xs sm:text-sm">{{ error }}</p>
      </div>

      <!-- Driver Selection -->
      <DriverSelector 
        :available_drivers="available_drivers"
        :selected_drivers="selected_drivers"
        @drivers-changed="handle_driver_selection"
        :loading="loading_drivers"
      />

      <!-- Charts Container with Mobile-Optimized Tabs -->
      <div v-if="selected_drivers.length > 0" class="mt-4 sm:mt-6">
        <div class="bg-gray-800/50 rounded-lg overflow-hidden">
          
          <!-- Mobile-Optimized Tab Navigation -->
          <div class="tab-navigation overflow-x-auto scrollbar-hide border-b border-gray-700">
            <div class="flex min-w-max justify-between">
              <!-- Lap Times Tab -->
              <button
                @click="active_chart_tab = 'lap_times'"
                class="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 min-w-[90px] sm:min-w-auto"
                :class="active_chart_tab === 'lap_times' 
                  ? 'text-red-500 bg-gray-800/50 border-b-2 border-red-500' 
                  : 'text-gray-400 hover:text-gray-300'"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <span class="hidden sm:inline">Lap Times</span>
                <span class="sm:hidden">Lap Times</span>
              </button>
              
              <!-- Sectors Tab -->
              <button
                @click="active_chart_tab = 'sectors'"
                class="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 min-w-[90px] sm:min-w-auto"
                :class="active_chart_tab === 'sectors' 
                  ? 'text-red-500 bg-gray-800/50 border-b-2 border-red-500' 
                  : 'text-gray-400 hover:text-gray-300'"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span class="hidden sm:inline">Sectors</span>
                <span class="sm:hidden">Sectors</span>
              </button>

              <!-- Speed Analysis Tab -->
              <button
                @click="active_chart_tab = 'speed_analysis'"
                class="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 min-w-[90px] sm:min-w-auto"
                :class="active_chart_tab === 'speed_analysis' 
                  ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                  : 'text-gray-400 hover:text-gray-300'"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                <span class="hidden sm:inline">Speed</span>
                <span class="sm:hidden">Speed</span>
              </button>

              <!-- Track Segments Tab -->
              <button
                @click="active_chart_tab = 'segments'"
                class="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 min-w-[90px] sm:min-w-auto"
                :class="active_chart_tab === 'segments' 
                  ? 'text-red-500 bg-gray-800 border-b-2 border-red-500' 
                  : 'text-gray-400 hover:text-gray-300'"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 000 2h8a2 2 0 100 4H3a1 1 0 100 2h8a4 4 0 000-8H3z"/>
                </svg>
                <span class="hidden sm:inline">Segments</span>
                <span class="sm:hidden">Segments</span>
              </button>
            </div>
          </div>

          <!-- Mobile-Responsive Chart Content Container -->
          <div class="charts-container p-2 sm:p-4 bg-gray-800/50" style="min-height: 300px;">
            <div class="chart-wrapper">
              <LapTimesChart 
                v-show="active_chart_tab === 'lap_times'"
                :drivers_lap_data="drivers_lap_data"
                :loading="loading_laps"
              />
              
              <SectorComparisonChart 
                v-show="active_chart_tab === 'sectors'"
                :drivers_lap_data="drivers_lap_data"
                :session_key="session_key"
                :loading="loading_laps"
              />

              <SpeedCorrelationChart 
                v-show="active_chart_tab === 'speed_analysis'"
                :drivers_lap_data="drivers_lap_data"
                :loading="loading_laps"
              />

              <SegmentHeatmapChart 
                v-show="active_chart_tab === 'segments'"
                :drivers_lap_data="drivers_lap_data"
                :loading="loading_laps"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State with Responsive Text -->
      <div v-else-if="!loading_drivers && available_drivers.length > 0" class="text-center py-8 sm:py-12">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <h3 class="text-white text-base sm:text-lg font-medium mb-2">Select Drivers to Compare</h3>
        <p class="text-gray-400 text-xs sm:text-sm px-4">
          Use the search above to select up to 4 drivers for lap-by-lap performance comparison
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'
import { use_race_store } from '@/stores/race_store.js'
import DriverSelector from './lap_comparison/DriverSelector.vue'
import LapTimesChart from './lap_comparison/LapTimesChart.vue'
import SectorComparisonChart from './lap_comparison/SectorComparisonChart.vue'
import SpeedCorrelationChart from './lap_comparison/SpeedCorrelationChart.vue' // NEW
import SegmentHeatmapChart from './lap_comparison/SegmentHeatmapChart.vue' // NEW

export default {
  name: 'LapComparisonSection',
  
  components: {
    DriverSelector,
    LapTimesChart,
    SectorComparisonChart,
    SpeedCorrelationChart,
    SegmentHeatmapChart
  },
  
  data() {
    return {
      race_store: use_race_store(),
      available_drivers: [],
      selected_drivers: [],
      drivers_lap_data: {},
      loading_drivers: false,
      loading_laps: false,
      error: null,
      active_chart_tab: 'lap_times' // New data property for tab state
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

    // Use store loading state
    loading_drivers() {
      return this.race_store.loading_session_drivers
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
    },
    
    selected_drivers: {
      handler(new_selection, old_selection) {
        this.update_drivers_data(new_selection, old_selection)
      }
    }
  },
  
  methods: {
    // Keep all existing methods unchanged
    async load_drivers() {
      if (!this.session_key) {
        this.error = 'Session key not available'
        return
      }
      
      this.loading_drivers = true
      this.error = null
      
      try {
        this.available_drivers = await api_service.get_session_drivers(this.session_key)
        
        if (this.available_drivers.length === 0) {
          this.error = 'No drivers found for this session'
        }
      } catch (error) {
        console.error('Error loading drivers:', error)
        this.error = `Failed to load drivers: ${error.message}`
      } finally {
        this.loading_drivers = false
      }
    },
    
    async update_drivers_data(new_selection, old_selection = []) {
      if (!this.session_key) return
      
      const added_drivers = new_selection.filter(driver => !old_selection.includes(driver))
      const removed_drivers = old_selection.filter(driver => !new_selection.includes(driver))
      
      removed_drivers.forEach(driver_number => {
        delete this.drivers_lap_data[driver_number]
      })
      
      if (added_drivers.length > 0) {
        this.loading_laps = true
        
        try {
          for (const driver_number of added_drivers) {
            console.log(`Loading lap data for driver ${driver_number}`)
            const lap_data = await api_service.get_driver_laps(this.session_key, driver_number)
            
            // Use getter to find driver info instead of local array
            this.drivers_lap_data[driver_number] = {
              driver_info: this.race_store.getDriverByNumber(driver_number), // Use store getter
              laps: lap_data
                .filter(lap => lap.lap_duration && lap.lap_duration > 0)
                .sort((a, b) => a.lap_number - b.lap_number)
                .map(lap => ({
                  lap_number: lap.lap_number,
                  lap_duration: lap.lap_duration,
                  duration_sector_1: lap.duration_sector_1,
                  duration_sector_2: lap.duration_sector_2,
                  duration_sector_3: lap.duration_sector_3,
                  // NEW: Add speed data
                  i1_speed: lap.i1_speed,
                  i2_speed: lap.i2_speed,
                  st_speed: lap.st_speed,
                  // NEW: Add segment data
                  segments_sector_1: lap.segments_sector_1 || [],
                  segments_sector_2: lap.segments_sector_2 || [],
                  segments_sector_3: lap.segments_sector_3 || [],
                }))
            }
          }
          
          this.drivers_lap_data = { ...this.drivers_lap_data }
          
        } catch (error) {
          console.error('Error loading lap data:', error)
          this.error = `Failed to load lap data: ${error.message}`
        } finally {
          this.loading_laps = false
        }
      }
    },
    
    handle_driver_selection(selected_driver_numbers) {
      this.selected_drivers = selected_driver_numbers
    }
  }
}
</script>
<style scoped>
/* Hide scrollbar but allow horizontal scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Responsive font scaling */
:root {
  --font-size-base: clamp(0.75rem, 1vw + 0.5rem, 1.125rem);
}

/* Mobile-specific improvements */
@media (max-width: 768px) {
  .tab-navigation {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  
  .tab-navigation button {
    scroll-snap-align: center;
    touch-action: manipulation;
  }
  
  .charts-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .chart-wrapper {
    min-width: 100%;
    position: relative;
  }
}

/* Enhanced touch targets for mobile */
@media (max-width: 640px) {
  .tab-navigation button {
    min-height: 44px; /* iOS recommended touch target */
    min-width: 80px;
  }
}

/* Responsive text utilities */
.text-responsive {
  font-size: clamp(0.75rem, 1vw + 0.5rem, 1rem);
}

.text-responsive-lg {
  font-size: clamp(1rem, 2vw + 0.75rem, 1.5rem);
}

/* Chart container improvements */
.chart-wrapper {
  width: 100%;
  height: auto;
  min-height: 300px;
}

@media (min-width: 768px) {
  .chart-wrapper {
    min-height: 450px;
  }
}
</style>