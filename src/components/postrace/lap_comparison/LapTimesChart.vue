<template>
  <!-- Keep your exact template as is -->
  <div class="bg-black rounded-lg p-4">
    <h3 class="text-white font-medium mb-4 flex items-center">
      <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
      </svg>
      Lap Times Comparison
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
        <div class="text-gray-400 text-sm">No lap data available</div>
      </div>
      
      <div v-else class="relative bg-transparent">
        <canvas ref="lapTimesCanvas" class="w-full" style="max-height: 400px;"></canvas>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Mobile Responsive Styles */

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

/* Loading and empty state text sizing */
@media (max-width: 768px) {
  .text-center.py-8 {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .text-sm {
    font-size: 0.75rem !important; /* 12px on mobile */
  }
}

/* Canvas responsive height */
@media (max-width: 640px) {
  canvas {
    max-height: 220px !important;
    height: 220px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  canvas {
    max-height: 300px !important;
    height: 300px !important;
  }
}

/* Ensure canvas stays responsive */
canvas {
  width: 100% !important;
  display: block;
}

/* Fluid font sizing using clamp for better scaling */
h3 {
  font-size: clamp(0.875rem, 2vw, 1.5rem);
  line-height: 1.3;
}

.text-sm {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

.text-gray-400 {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}
</style>


<script>
import { shallowRef, nextTick } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'LapTimesChart',
  
  props: {
    drivers_lap_data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  setup() {
    // Use shallowRef to prevent deep reactivity on Chart.js instance
    const chart = shallowRef(null)
    
    return {
      chart
    }
  },
  
  computed: {
    has_valid_data() {
      return Object.keys(this.drivers_lap_data).length > 0 &&
             Object.values(this.drivers_lap_data).some(driver => 
               driver.laps && driver.laps.length > 0
             )
    },
    
    chart_data() {
      if (!this.has_valid_data) return null
      
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']
      const datasets = []
      
      // Get all unique lap numbers
      const all_lap_numbers = new Set()
      Object.values(this.drivers_lap_data).forEach(driver_data => {
        driver_data.laps.forEach(lap => {
          if (lap.lap_number && lap.lap_duration > 0) {
            all_lap_numbers.add(lap.lap_number)
          }
        })
      })
      
      const lap_numbers = Array.from(all_lap_numbers).sort((a, b) => a - b)
      
      // Create dataset for each driver
      Object.entries(this.drivers_lap_data).forEach(([driver_number, driver_data], index) => {
        const lap_times = lap_numbers.map(lap_num => {
          const lap = driver_data.laps.find(l => l.lap_number === lap_num)
          return (lap && lap.lap_duration > 0) ? lap.lap_duration : null
        })
        
        if (lap_times.some(time => time !== null)) {
          datasets.push({
            label: `#${driver_number} ${driver_data.driver_info?.name_acronym || 'Unknown'}`,
            data: lap_times,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: false,
            tension: 0.1,
            spanGaps: false
          })
        }
      })
      
      return {
        labels: lap_numbers,
        datasets: datasets
      }
    }
  },
  
  watch: {
    chart_data: {
      handler() {
        if (!this.loading) {
          nextTick(() => {
            this.update_chart()
          })
        }
      },
      deep: false // Shallow watching to prevent infinite loops
    },
    
    loading(is_loading) {
      if (!is_loading && this.has_valid_data) {
        nextTick(() => {
          this.init_chart()
        })
      }
    }
  },
  
  mounted() {
    if (!this.loading && this.has_valid_data) {
      nextTick(() => {
        this.init_chart()
      })
    }
  },
  
  beforeUnmount() {
    this.destroy_chart()
  },
  
  methods: {
    init_chart() {
      if (!this.$refs.lapTimesCanvas || !this.chart_data) return
      
      this.destroy_chart()
      
      try {
        const ctx = this.$refs.lapTimesCanvas.getContext('2d')
        
        this.chart = shallowRef(new Chart(ctx, {
          type: 'line',
          data: structuredClone(this.chart_data), // Deep clone to prevent mutations
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: true, // Disable animations to prevent recursion
            plugins: {
              legend: {
                labels: {
                  color: 'white',
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const seconds = context.parsed.y
                    if (seconds === null) return `${context.dataset.label}: No time`
                    const minutes = Math.floor(seconds / 60)
                    const remainingSeconds = (seconds % 60).toFixed(3)
                    return `${context.dataset.label}: ${minutes}:${remainingSeconds.padStart(6, '0')}`
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Lap Number',
                  color: 'white'
                },
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              },
              y: {
                title: {
                  display: true,
                  text: 'Lap Time (seconds)',
                  color: 'white'
                },
                ticks: {
                  color: 'white',
                  callback: function(value) {
                    if (value === null) return 'N/A'
                    const minutes = Math.floor(value / 60)
                    const seconds = (value % 60).toFixed(1)
                    return `${minutes}:${seconds.padStart(4, '0')}`
                  }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        }))
        
        console.log('✅ Chart initialized successfully')
        
      } catch (error) {
        console.error('❌ Error initializing chart:', error)
      }
    },
    
    update_chart() {
      if (!this.chart || !this.chart_data) return
      
      try {
        // Update data without triggering reactivity
        this.chart.data = structuredClone(this.chart_data)
        this.chart.update('none') // Use 'none' mode to prevent animation recursion
        console.log('✅ Chart updated')
      } catch (error) {
        console.error('❌ Error updating chart:', error)
        this.init_chart() // Fallback to re-initialization
      }
    },
    
    destroy_chart() {
      if (this.chart) {
        try {
          this.chart.destroy()
          this.chart = shallowRef(null)
        } catch (error) {
          console.error('❌ Error destroying chart:', error)
        }
      }
    }
  }
}
</script>
