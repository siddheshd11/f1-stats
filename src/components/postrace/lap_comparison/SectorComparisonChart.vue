<template>
  <!-- Keep your exact template as is -->
  <div class="bg-black rounded-lg p-4">
    <h3 class="text-white font-medium mb-4 flex items-center">
      <svg class="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>
      Sector Times Comparison
    </h3>
    
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
    
      <div v-else-if="!has_valid_data" class="text-center py-8">
        <div class="text-gray-400 text-sm">No sector data available</div>
      </div>
      
      <div v-else class="space-y-4">
        <!-- Lap Selector -->
        <div class="flex items-center space-x-4">
          <label class="text-white text-sm font-medium">Select Lap:</label>
          <CustomDropdown v-model="selected_lap" :items="available_laps" @change="on_lap_change" class=' md:w-24 w-full'/>
          <!-- <select 
            v-model="selected_lap" 
            @change="on_lap_change"
            class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none max-h-40 overflow-y-auto"
            
          >
            <option v-for="lap_num in available_laps" :key="lap_num" :value="lap_num">
              Lap {{ lap_num }}
            </option>
          </select> -->
        </div>
        
        <!-- Chart Container -->
        <div class="relative bg-transparent rounded-lg p-4">
          <canvas 
            ref="sectorCanvas" 
            class="w-full" style="max-height: 400px;"
          ></canvas>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Mobile Responsive Styles for Sector Comparison Chart */

/* Container adjustments for mobile */
@media (max-width: 768px) {
  .bg-black.rounded-lg.p-4 {
    padding: 0.75rem; /* Reduce padding on mobile */
  }
}

/* Header responsive font sizing */
@media (max-width: 640px) {
  h3 {
    font-size: 1rem !important; /* 16px instead of default */
    margin-bottom: 0.75rem !important;
  }
  
  /* Smaller icons on mobile */
  h3 svg {
    width: 1rem !important; /* 16px */
    height: 1rem !important;
    margin-right: 0.375rem !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  h3 {
    font-size: 1.125rem !important; /* 18px for tablets */
  }
}

/* Loading and empty state adjustments */
@media (max-width: 768px) {
  .text-center.py-8 {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .text-sm {
    font-size: 0.75rem !important; /* 12px on mobile */
  }
  
  .text-gray-400 {
    font-size: 0.875rem !important; /* 14px on mobile */
  }
}

/* Lap Selector responsive styling */
@media (max-width: 640px) {
  /* Stack label and select vertically on very small screens */
  .flex.items-center.space-x-4 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .flex.items-center.space-x-4 > label {
    font-size: 0.875rem !important; /* 14px */
    margin-bottom: 0.25rem;
  }
  
  .flex.items-center.space-x-4 > select {
    width: 100%;
    font-size: 0.875rem !important; /* 14px */
    padding: 0.5rem 0.75rem !important;
  }
}

@media (min-width: 641px) {
  .flex.items-center.space-x-4 > select {
    min-width: 120px; /* Ensure minimum width on larger screens */
  }
}

/* Chart container responsive adjustments */
@media (max-width: 768px) {
  .relative.bg-transparent.rounded-lg.p-4 {
    padding: 0.75rem !important;
  }
}

/* Canvas responsive height */
@media (max-width: 640px) {
  canvas {
    max-height: 240px !important;
    height: 240px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  canvas {
    max-height: 320px !important;
    height: 320px !important;
  }
}

/* Ensure canvas stays responsive */
canvas {
  width: 100% !important;
  display: block;
}

/* Fluid font sizing using clamp for smooth scaling */
h3 {
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1.3;
}

label {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

select {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: all 0.2s ease;
}

.text-gray-400 {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

/* Enhanced select styling for better mobile interaction */
select {
  border-radius: 0.375rem;
  transition: border-color 0.2s ease;
  min-height: 44px; /* Better touch target on mobile */
}

select:focus {
  border-color: #3b82f6 !important;
  outline: none;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Space adjustments */
.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .space-y-4 > * + * {
    margin-top: 0.75rem;
  }
}
</style>


<script>
import Chart from 'chart.js/auto'
import { api_service } from '@/services/api.js'
import CustomDropdown from '@/components/common/CustomDropdown.vue'

export default {
  name: 'SectorComparisonChart',
  components:{CustomDropdown},
  
  props: {
    drivers_lap_data: {
      type: Object,
      default: () => ({})
    },
    session_key: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      selected_lap: 1,
      sector_data: null,
      loading_sector_data: false,
      chart: null
    }
  },
  
  computed: {
    has_valid_data() {
      return Object.keys(this.drivers_lap_data).length > 0 && this.available_laps.length > 0
    },
    
    available_laps() {
      const all_laps = new Set()
      
      Object.values(this.drivers_lap_data).forEach(driver_data => {
        if (driver_data?.laps) {
          driver_data.laps.forEach(lap => {
            if (lap?.lap_number) {
              all_laps.add(lap.lap_number)
            }
          })
        }
      })
      
      return Array.from(all_laps).sort((a, b) => a - b)
    }
  },
  
  watch: {
    drivers_lap_data: {
      handler() {
        this.update_available_laps()
        this.on_lap_change()
      },
      deep: false
    },
    
    sector_data: {
      handler() {
        this.recreate_chart()
      },
      deep: false
    }
  },
  
  mounted() {
    this.update_available_laps()
    this.on_lap_change()
  },
  
  beforeUnmount() {
    this.destroy_chart()
  },
  
  methods: {
    update_available_laps() {
      if (this.available_laps.length > 0 && !this.available_laps.includes(this.selected_lap)) {
        this.selected_lap = this.available_laps[0]
      }
    },
    
    async on_lap_change() {
      console.log(`🔄 Lap changed to ${this.selected_lap}`)
      await this.fetch_sector_data()
    },
    
    async fetch_sector_data() {
      if (!this.session_key || !this.selected_lap || Object.keys(this.drivers_lap_data).length === 0) {
        console.log('⚠️ Missing requirements for sector data fetch')
        return
      }
      
      this.loading_sector_data = true
      
      try {
        console.log(`🔄 Fetching sector data for lap ${this.selected_lap}`)
        
        const driver_numbers = Object.keys(this.drivers_lap_data)
        const sector_promises = driver_numbers.map(driver_number => 
          api_service.get_lap_sectors(this.session_key, driver_number, this.selected_lap)
        )
        
        const sector_results = await Promise.all(sector_promises)
        
        // Process sector data
        const processed_data = {}
        sector_results.forEach((result, index) => {
          const driver_number = driver_numbers[index]
          if (result && result.length > 0) {
            const lap_data = result[0]
            if (lap_data.duration_sector_1 > 0 && lap_data.duration_sector_2 > 0 && lap_data.duration_sector_3 > 0) {
              processed_data[driver_number] = {
                driver_number: parseInt(driver_number),
                lap_number: lap_data.lap_number,
                duration_sector_1: lap_data.duration_sector_1,
                duration_sector_2: lap_data.duration_sector_2,
                duration_sector_3: lap_data.duration_sector_3
              }
            }
          }
        })
        
        this.sector_data = processed_data
        console.log(`✅ Sector data loaded for lap ${this.selected_lap}:`, Object.keys(processed_data).length, 'drivers')
        
      } catch (error) {
        console.error('❌ Error fetching sector data:', error)
        this.sector_data = null
      } finally {
        this.loading_sector_data = false
      }
    },
    
    recreate_chart() {
      console.log('🔄 Recreating chart...')
      
      // Step 1: Always destroy existing chart first
      this.destroy_chart()
      
      // Step 2: Wait for DOM to be ready, then create new chart
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.create_chart()
        })
      })
    },
    
    create_chart() {
      if (!this.$refs.sectorCanvas) {
        console.log('⚠️ Canvas not available, skipping chart creation')
        return
      }
      
      if (!this.sector_data || Object.keys(this.sector_data).length === 0) {
        console.log('⚠️ No sector data available, skipping chart creation')
        return
      }
      
      try {
        const ctx = this.$refs.sectorCanvas.getContext('2d')
        if (!ctx) {
          console.log('⚠️ Cannot get canvas context')
          return
        }
        
        // Clear canvas first
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        
        // Prepare chart data
        const driver_labels = []
        const sector_1_data = []
        const sector_2_data = []
        const sector_3_data = []
        
        Object.entries(this.drivers_lap_data).forEach(([driver_number, driver_data]) => {
          const sector_info = this.sector_data[driver_number]
          
          if (sector_info) {
            driver_labels.push(`#${driver_number} ${driver_data.driver_info?.name_acronym || 'Unknown'}`)
            sector_1_data.push(sector_info.duration_sector_1)
            sector_2_data.push(sector_info.duration_sector_2)
            sector_3_data.push(sector_info.duration_sector_3)
          }
        })
        
        if (driver_labels.length === 0) {
          console.log('⚠️ No valid drivers for chart')
          return
        }
        
        // Create brand new chart
        this.chart = new Chart(ctx, {
          type: 'bar',

          data: {
            labels: driver_labels,
            datasets: [
              {
                label: 'Sector 1',
                data: sector_1_data,
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 1
              },
              {
                label: 'Sector 2',
                data: sector_2_data,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
              },
              {
                label: 'Sector 3',
                data: sector_3_data,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: true, // Disable animations for faster rendering
            plugins: {
              legend: {
                labels: { color: 'white' }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}s`
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Driver', color: 'white' },
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              },
              y: {
                title: { display: true, text: 'Sector Time (seconds)', color: 'white' },
                ticks: {
                  color: 'white',
                  callback: function(value) {
                    return `${value.toFixed(1)}s`
                  }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                stacked: true
              }
            }
          }
        })
        
        console.log('✅ New sector chart created successfully')
        
      } catch (error) {
        console.error('❌ Error creating new chart:', error)
      }
    },
    
    destroy_chart() {
      if (this.chart) {
        try {
          this.chart.destroy()
          console.log('🗑️ Chart destroyed')
        } catch (error) {
          console.error('❌ Error destroying chart:', error)
        } finally {
          this.chart = null
        }
      }
    }
  }
}
</script>
