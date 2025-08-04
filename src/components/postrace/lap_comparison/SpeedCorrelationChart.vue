<template>
  <!-- Keep your exact template as is -->
  <div class="flex flex-col bg-black rounded-lg p-4">
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
    
      <div v-else-if="!has_valid_data" class="flex-1 flex items-center justify-center">
        <div class="text-gray-400 text-sm">No speed data available</div>
      </div>
      
      <div v-else class="h-full flex flex-col space-y-4">
        <!-- Controls -->
        <div class="flex items-center justify-between flex-shrink-0">
          <h4 class="text-white font-medium">Speed vs Lap Time Correlation</h4>
          <div class="flex items-center space-x-4">
            <label class="text-white text-sm">Speed Type:</label>
            <select 
              v-model="speed_type" 
              @change="recreate_chart"
              class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option value="max">Max Speed</option>
              <option value="i1">Speed Trap 1</option>
              <option value="i2">Speed Trap 2</option>
              <option value="st">Finish Line Speed</option>
            </select>
          </div>
        </div>
        
        <!-- Chart Container -->
        <div class="flex-1 relative bg-transparent">
          <canvas ref="speedChart" class="w-full" style="max-height: 400px;"></canvas>
        </div>
        
        <!-- Insights -->
        <div class="bg-gray-700/30 rounded p-3 text-sm flex-shrink-0">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-gray-400">Correlation: </span>
              <span class="text-white font-medium">{{ correlation_coefficient }}</span>
            </div>
            <div>
              <span class="text-gray-400">Optimal Speed Zone: </span>
              <span class="text-green-400 font-medium">{{ optimal_speed_range }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Mobile Responsive Styles for Speed Correlation Chart */

/* Container adjustments for mobile */
@media (max-width: 768px) {
  .flex.flex-col.bg-black.rounded-lg.p-4 {
    padding: 0.75rem; /* Reduce padding on mobile */
    min-height: 400px;
  }
}

/* Loading and empty states */
@media (max-width: 768px) {
  .flex-1.flex.items-center.justify-center {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
  
  .text-sm {
    font-size: 0.75rem !important; /* 12px on mobile */
  }
}

/* Header and controls responsive styling */
@media (max-width: 640px) {
  .flex.items-center.justify-between.flex-shrink-0 {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  h4 {
    font-size: 1rem !important; /* 16px on mobile */
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .flex.items-center.space-x-4 {
    justify-content: space-between;
    gap: 0.5rem;
  }
  
  .flex.items-center.space-x-4 > label {
    font-size: 0.75rem !important; /* 12px */
    white-space: nowrap;
  }
  
  .flex.items-center.space-x-4 > select {
    flex: 1;
    font-size: 0.75rem !important;
    padding: 0.5rem 0.75rem !important;
    min-width: 120px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  h4 {
    font-size: 1.125rem !important; /* 18px for tablets */
  }
  
  .flex.items-center.space-x-4 > select {
    font-size: 0.875rem;
    min-width: 140px;
  }
}

/* Chart container responsive height */
@media (max-width: 640px) {
  .flex-1.relative canvas {
    max-height: 240px !important;
    height: 240px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .flex-1.relative canvas {
    max-height: 320px !important;
    height: 320px !important;
  }
}

/* Ensure canvas stays responsive */
canvas {
  width: 100% !important;
  display: block;
}

/* Insights section mobile optimization */
@media (max-width: 640px) {
  .bg-gray-700\/30.rounded.p-3.text-sm {
    padding: 0.5rem !important;
    font-size: 0.75rem !important;
  }
  
  .grid.grid-cols-2 {
    grid-template-columns: 1fr !important;
    gap: 0.5rem !important;
  }
  
  .grid.grid-cols-2 > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .bg-gray-700\/30.rounded.p-3.text-sm {
    font-size: 0.8rem;
  }
  
  .grid.grid-cols-2 {
    gap: 0.75rem;
  }
}

/* Select dropdown enhancements */
select {
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  background-color: #374151;
  border: 1px solid #4b5563;
  color: white;
  cursor: pointer;
}

select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Better touch targets on mobile */
@media (max-width: 640px) {
  select {
    min-height: 44px; /* iOS recommended touch target */
    padding: 0.5rem !important;
  }
}

/* Fluid font sizing using clamp for smooth scaling */
h4 {
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1.3;
}

label {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

.text-gray-400 {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

/* Space adjustments for mobile */
.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .space-y-4 > * + * {
    margin-top: 0.75rem;
  }
}

/* Insights text styling improvements */
.bg-gray-700\/30 span.text-white {
  font-weight: 600;
}

.bg-gray-700\/30 span.text-green-400 {
  color: #22c55e;
  font-weight: 600;
}

/* Loading animation enhancement */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>


<script>
import Chart from 'chart.js/auto'

export default {
  name: 'SpeedCorrelationChart',
  
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
  
  data() {
    return {
      chart: null,
      speed_type: 'max'
    }
  },
  
  computed: {
    has_valid_data() {
      return Object.keys(this.drivers_lap_data).length > 0 &&
             Object.values(this.drivers_lap_data).some(driver => 
               driver.laps && driver.laps.some(lap => 
                 lap.i1_speed > 0 || lap.i2_speed > 0 || lap.st_speed > 0
               )
             )
    },
    
    speed_correlation_data() {
      if (!this.has_valid_data) return []
      
      const data_points = []
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']
      
      Object.entries(this.drivers_lap_data).forEach(([driver_number, driver_data], index) => {
        driver_data.laps.forEach(lap => {
          if (lap.lap_duration <= 0) return
          
          let speed = 0
          switch (this.speed_type) {
            case 'max':
              speed = Math.max(lap.i1_speed || 0, lap.i2_speed || 0, lap.st_speed || 0)
              break
            case 'i1':
              speed = lap.i1_speed
              break
            case 'i2':
              speed = lap.i2_speed
              break
            case 'st':
              speed = lap.st_speed
              break
          }
          
          if (speed > 0) {
            data_points.push({
              x: speed,
              y: lap.lap_duration,
              driver_number: driver_number,
              driver_name: driver_data.driver_info?.name_acronym || `#${driver_number}`,
              lap_number: lap.lap_number,
              color: colors[index % colors.length],
              is_pit_lap: lap.is_pit_out_lap
            })
          }
        })
      })
      
      return data_points
    },
    
    correlation_coefficient() {
      const points = this.speed_correlation_data.filter(p => !p.is_pit_lap)
      if (points.length < 2) return 'N/A'
      
      const n = points.length
      const sum_x = points.reduce((sum, p) => sum + p.x, 0)
      const sum_y = points.reduce((sum, p) => sum + p.y, 0)
      const sum_xy = points.reduce((sum, p) => sum + (p.x * p.y), 0)
      const sum_x2 = points.reduce((sum, p) => sum + (p.x * p.x), 0)
      const sum_y2 = points.reduce((sum, p) => sum + (p.y * p.y), 0)
      
      const numerator = (n * sum_xy) - (sum_x * sum_y)
      const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))
      
      if (denominator === 0) return 'N/A'
      
      const correlation = numerator / denominator
      return correlation.toFixed(3)
    },
    
    optimal_speed_range() {
      const points = this.speed_correlation_data.filter(p => !p.is_pit_lap)
      if (points.length === 0) return 'N/A'
      
      // Find fastest laps (bottom 25% of lap times)
      const sorted_by_time = [...points].sort((a, b) => a.y - b.y)
      const fastest_25_percent = sorted_by_time.slice(0, Math.ceil(sorted_by_time.length * 0.25))
      
      const speeds = fastest_25_percent.map(p => p.x)
      const min_speed = Math.min(...speeds)
      const max_speed = Math.max(...speeds)
      
      return `${min_speed}-${max_speed} km/h`
    }
  },
  
  watch: {
    drivers_lap_data: {
      handler() {
        this.recreate_chart()
      },
      deep: false
    }
  },
  
  mounted() {
    if (!this.loading) {
      this.recreate_chart()
    }
  },
  
  beforeUnmount() {
    this.destroy_chart()
  },
  
  methods: {
    recreate_chart() {
      this.destroy_chart()
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.create_chart()
        })
      })
    },
    
    create_chart() {
      if (!this.$refs.speedChart || !this.has_valid_data) return
      
      try {
        const ctx = this.$refs.speedChart.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        
        // Group data by driver
        const datasets = []
        const drivers_map = {}
        
        this.speed_correlation_data.forEach(point => {
          if (!drivers_map[point.driver_number]) {
            drivers_map[point.driver_number] = {
              label: point.driver_name,
              data: [],
              backgroundColor: point.color + '80',
              borderColor: point.color,
              borderWidth: 2,
              pointRadius: point.is_pit_lap ? 8 : 5,
              pointStyle: point.is_pit_lap ? 'triangle' : 'circle'
            }
          }
          drivers_map[point.driver_number].data.push(point)
        })
        
        Object.values(drivers_map).forEach(driver_dataset => {
          datasets.push(driver_dataset)
        })
        
        this.chart = new Chart(ctx, {
          type: 'scatter',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
              legend: {
                labels: { color: 'white' },
                onClick: (e, legendItem) => {
                  const index = legendItem.datasetIndex
                  const ci = this.chart
                  if (ci.isDatasetVisible(index)) {
                    ci.hide(index)
                    legendItem.hidden = true
                  } else {
                    ci.show(index)
                    legendItem.hidden = false
                  }
                }
              },
              tooltip: {
                callbacks: {
                  title: function(context) {
                    const point = context[0].raw
                    return `${point.driver_name} - Lap ${point.lap_number}`
                  },
                  label: function(context) {
                    const point = context.raw
                    const minutes = Math.floor(point.y / 60)
                    const seconds = (point.y % 60).toFixed(3)
                    return [
                      `Speed: ${point.x} km/h`,
                      `Lap Time: ${minutes}:${seconds.padStart(6, '0')}`,
                      point.is_pit_lap ? 'Pit Out Lap' : 'Racing Lap'
                    ]
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: 'Speed (km/h)', color: 'white' },
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              },
              y: {
                title: { display: true, text: 'Lap Time (seconds)', color: 'white' },
                ticks: {
                  color: 'white',
                  callback: function(value) {
                    const minutes = Math.floor(value / 60)
                    const seconds = (value % 60).toFixed(1)
                    return `${minutes}:${seconds.padStart(4, '0')}`
                  }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        })
        
        console.log('✅ Speed correlation chart created')
        
      } catch (error) {
        console.error('❌ Error creating speed correlation chart:', error)
      }
    },
    
    destroy_chart() {
      if (this.chart) {
        try {
          this.chart.destroy()
          this.chart = null
        } catch (error) {
          console.error('❌ Error destroying chart:', error)
        }
      }
    }
  }
}
</script>
