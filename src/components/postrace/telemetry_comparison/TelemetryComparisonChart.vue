<template>
  <div class="p-4 bg-black">
    <!-- Controls (keeping existing controls) -->
    <div class="flex flex-col space-y-4 mb-6">
      <div class="flex items-center justify-between">
        <h4 class="text-white text-lg font-medium">Detailed Telemetry Analysis</h4>
        <div class="flex items-center space-x-4">
          <label class="text-white text-sm">Lap:</label>
          <select 
            v-model="selected_lap" 
            class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
            :disabled="loading_telemetry"
          >
            <option v-for="lap_num in available_laps" :key="lap_num" :value="lap_num">
              Lap {{ lap_num }}
            </option>
          </select>
          
          <label class="text-white text-sm">Metric:</label>
          <select 
            v-model="selected_metric" 
            class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
            :disabled="loading_telemetry"
          >
            <option value="speed">Speed (km/h)</option>
            <option value="throttle">Throttle (%)</option>
            <option value="brake">Brake (%)</option>
            <option value="rpm">RPM</option>
            <option value="n_gear">Gear</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
        <div class="flex items-center space-x-4">
          <span class="text-gray-300 text-sm font-medium">Data Quality:</span>
          <div class="flex items-center space-x-2">
            <input id="quality-fast" v-model="data_quality" type="radio" value="fast" class="text-purple-600">
            <label for="quality-fast" class="text-gray-300 text-sm">Fast</label>
            
            <input id="quality-medium" v-model="data_quality" type="radio" value="medium" class="text-purple-600 ml-3">
            <label for="quality-medium" class="text-gray-300 text-sm">Medium</label>
            
            <input id="quality-high" v-model="data_quality" type="radio" value="high" class="text-purple-600 ml-3">
            <label for="quality-high" class="text-gray-300 text-sm">High</label>
          </div>
        </div>
        
        <button 
          @click="load_telemetry_for_lap"
          :disabled="loading_telemetry || selected_drivers.length !== 2"
          class="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {{ loading_telemetry ? 'Loading...' : 'Load Telemetry' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading_telemetry" class="text-center py-12">
      <div class="text-white text-lg mb-2">Loading Telemetry Data...</div>
      <div class="text-gray-400 text-sm mb-6">
        Quality: {{ data_quality }} | Lap: {{ selected_lap }}
      </div>
      
      <div class="max-w-md mx-auto space-y-4">
        <div v-for="driver_number in selected_drivers" :key="driver_number" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-300">#{{ driver_number }} {{ get_driver_name(driver_number) }}</span>
            <span class="text-purple-400">{{ loading_progress[driver_number] || 0 }}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2">
            <div 
              class="bg-purple-500 h-2 rounded-full transition-all duration-300" 
              :style="{ width: `${loading_progress[driver_number] || 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Display -->
    <div v-else-if="has_telemetry_data" class="space-y-6">
      <!-- Debug Info -->
      <div class="bg-gray-700/30 rounded-lg p-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-400">Chart Status: {{ chart_status }}</span>
          <span class="text-purple-400">{{ get_total_data_points() }} data points</span>
        </div>
      </div>

      <!-- FIXED: Chart Container with guaranteed dimensions -->
      <div class="bg-gray-700/30 rounded-lg p-4">
        <div style="position: relative; height: 400px; width: 100%;">
          <canvas 
            ref="telemetryChart" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          ></canvas>
        </div>
      </div>
      
      <!-- Statistics Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="driver_number in selected_drivers" :key="driver_number" class="bg-gray-700/30 rounded-lg p-4">
          <div class="flex items-center space-x-3 mb-3">
            <img
              :src="get_driver_photo(driver_number)"
              :alt="get_driver_name(driver_number)"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div class="text-white font-bold">#{{ driver_number }} {{ get_driver_name(driver_number) }}</div>
              <div class="text-gray-400 text-sm">{{ get_metric_label() }} - Lap {{ selected_lap }}</div>
            </div>
          </div>
          
          <div v-if="telemetry_summary[driver_number]" class="grid grid-cols-3 gap-3 text-sm">
            <div class="text-center">
              <div class="text-green-400 font-bold text-lg">{{ telemetry_summary[driver_number].max }}</div>
              <div class="text-gray-400">Maximum</div>
            </div>
            <div class="text-center">
              <div class="text-blue-400 font-bold text-lg">{{ telemetry_summary[driver_number].avg }}</div>
              <div class="text-gray-400">Average</div>
            </div>
            <div class="text-center">
              <div class="text-yellow-400 font-bold text-lg">{{ telemetry_summary[driver_number].min }}</div>
              <div class="text-gray-400">Minimum</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <h3 class="text-white text-lg font-medium mb-2">Ready for Telemetry Analysis</h3>
      <p class="text-gray-400 text-sm">Click "Load Telemetry" to start comparing detailed car data</p>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { telemetry_service } from '@/services/telemetry_service.js'
import { api_service } from '@/services/api.js'

export default {
  name: 'TelemetryComparisonChart',
  
  props: {
    selected_drivers: {
      type: Array,
      default: () => []
    },
    session_key: {
      type: String,
      default: null
    },
    available_drivers: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      selected_lap: 1,
      selected_metric: 'speed',
      data_quality: 'medium',
      chart: null,
      telemetry_data: {},
      lap_data: {},
      loading_telemetry: false,
      loading_progress: {},
      available_laps: [],
      error_state: null,
      chart_status: 'Not Created' // ADDED: Debug status
    }
  },
  
  computed: {
    has_telemetry_data() {
      const has_data = Object.keys(this.telemetry_data).length > 0
      console.log('📊 Has telemetry data:', has_data, 'Keys:', Object.keys(this.telemetry_data))
      return has_data
    },
    
    telemetry_summary() {
      const summary = {}
      
      Object.entries(this.telemetry_data).forEach(([driver_number, data]) => {
        const values = data.map(point => point[this.selected_metric]).filter(v => v != null && v > 0)
        
        if (values.length > 0) {
          summary[driver_number] = {
            max: Math.max(...values),
            min: Math.min(...values),
            avg: Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
          }
        }
      })
      
      return summary
    }
  },
  
  watch: {
    // FIXED: Improved watchers with better timing
    selected_drivers: {
      handler(new_drivers, old_drivers) {
        if (new_drivers.length === 2 && JSON.stringify(new_drivers) !== JSON.stringify(old_drivers)) {
          console.log('🔄 Drivers changed, loading lap data')
          this.load_lap_data()
        }
      },
      deep: true
    },
    
    selected_metric: {
      handler() {
        if (this.has_telemetry_data) {
          console.log('📈 Metric changed to:', this.selected_metric)
          this.schedule_chart_update()
        }
      }
    },
    
    // ADDED: Watch telemetry_data changes
    telemetry_data: {
      handler(new_data) {
        console.log('📊 Telemetry data changed:', Object.keys(new_data))
        if (Object.keys(new_data).length > 0) {
          this.schedule_chart_update()
        }
      },
      deep: false
    }
  },
  
  async mounted() {
    console.log('🎯 Component mounted with drivers:', this.selected_drivers)
    if (this.selected_drivers.length === 2 && this.session_key) {
      await this.load_lap_data()
    }
  },
  
  methods: {
    async load_lap_data() {
      if (!this.session_key || this.selected_drivers.length !== 2) return
      
      try {
        for (const driver_number of this.selected_drivers) {
          const laps = await api_service.get_driver_laps(this.session_key, driver_number)
          this.lap_data[driver_number] = laps.filter(lap => lap.lap_duration > 0)
        }
        
        const driver1_laps = new Set(this.lap_data[this.selected_drivers[0]]?.map(l => l.lap_number) || [])
        const driver2_laps = new Set(this.lap_data[this.selected_drivers[1]]?.map(l => l.lap_number) || [])
        
        this.available_laps = Array.from(driver1_laps)
          .filter(lap => driver2_laps.has(lap))
          .sort((a, b) => a - b)
        
        if (this.available_laps.length > 0) {
          this.selected_lap = this.available_laps[0]
        }
        
        console.log('✅ Lap data loaded. Available laps:', this.available_laps)
        
      } catch (error) {
        console.error('❌ Error loading lap data:', error)
      }
    },
    
    async load_telemetry_for_lap() {
      if (!this.session_key || this.selected_drivers.length !== 2 || !this.selected_lap) return
      
      this.loading_telemetry = true
      this.loading_progress = {}
      this.telemetry_data = {}
      this.error_state = null
      this.chart_status = 'Loading Data'
      
      try {
        for (const driver_number of this.selected_drivers) {
          this.loading_progress[driver_number] = 0
          
          const driver_laps = this.lap_data[driver_number] || []
          const lap_info = driver_laps.find(lap => lap.lap_number === this.selected_lap)
          
          if (!lap_info) {
            console.warn(`⚠️ No lap info found for driver ${driver_number}, lap ${this.selected_lap}`)
            continue
          }
          
          console.log(`📊 Loading telemetry for driver ${driver_number}, lap ${this.selected_lap}`)
          
          const lap_telemetry = await telemetry_service.fetch_lap_telemetry(
            this.session_key,
            driver_number,
            lap_info,
            {
              quality: this.data_quality,
              onProgress: (progress) => {
                this.loading_progress[driver_number] = progress
              }
            }
          )
          
          console.log(`✅ Loaded ${lap_telemetry.length} points for driver ${driver_number}`)
          this.telemetry_data[driver_number] = lap_telemetry
          this.loading_progress[driver_number] = 100
        }
        
        console.log('✅ All telemetry data loaded:', Object.keys(this.telemetry_data))
        
        // FIXED: Force reactivity update
        this.telemetry_data = { ...this.telemetry_data }
        
      } catch (error) {
        this.error_state = error.message || 'unknown'
        this.chart_status = `Error: ${error.message}`
        console.error('❌ Error loading telemetry:', error.message)
      } finally {
        this.loading_telemetry = false
      }
    },
    
    // FIXED: Improved chart update scheduling
    schedule_chart_update() {
      console.log('📈 Scheduling chart update...')
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.update_chart()
        })
      })
    },
    
    get_total_data_points() {
      return Object.values(this.telemetry_data).reduce((total, data) => total + data.length, 0)
    },
    
    get_driver_name(driver_number) {
      const driver = this.available_drivers.find(d => d.driver_number === driver_number)
      return driver ? driver.name_acronym || `${driver.first_name} ${driver.last_name}` : `#${driver_number}`
    },
    
    get_driver_photo(driver_number) {
      const driver = this.available_drivers.find(d => d.driver_number === driver_number)
      return driver?.headshot_url || '/imgs/drivers/default_driver.png'
    },
    
    get_metric_label() {
      const labels = {
        speed: 'Speed (km/h)',
        throttle: 'Throttle (%)',
        brake: 'Brake (%)', 
        rpm: 'RPM',
        n_gear: 'Gear'
      }
      return labels[this.selected_metric] || this.selected_metric
    },
    
    update_chart() {
      console.log('🎨 Updating chart...')
      this.destroy_chart()
      this.$nextTick(() => {
        this.create_chart()
      })
    },
    
    create_chart() {
      console.log('🎨 Creating chart with real timestamps...')
      
      if (!this.$refs.telemetryChart) {
        console.error('❌ Canvas ref not available')
        return
      }
      
      if (!this.has_telemetry_data) {
        console.error('❌ No telemetry data available')
        return
      }
      
      try {
        const ctx = this.$refs.telemetryChart.getContext('2d')
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        
        const colors = ['#ef4444', '#3b82f6']
        const datasets = []
        
        Object.entries(this.telemetry_data).forEach(([driver_number, telemetry_points], index) => {
          if (!telemetry_points || telemetry_points.length === 0) return
          
          const driver_name = this.get_driver_name(driver_number)
          
          // FIXED: Use actual timestamps from telemetry data
          const chart_data = telemetry_points.map((point) => ({
            x: new Date(point.date), // Use real timestamp from telemetry data!
            y: point[this.selected_metric] || 0
          })).filter(point => point.y !== null && point.y !== undefined)
          
          if (chart_data.length === 0) return
          
          datasets.push({
            label: `#${driver_number} ${driver_name}`,
            data: chart_data,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            borderWidth: 2,
            pointRadius: 1, // Small points for telemetry data
            fill: false,
            tension: 0.1
          })
          
          console.log(`✅ Dataset created for driver ${driver_number}: ${chart_data.length} points with real timestamps`)
        })
        
        if (datasets.length === 0) {
          console.error('❌ No datasets created')
          return
        }

        const metric_unit = this.get_metric_unit() // ✅ Calculate once
        const metric_label = this.get_metric_label()
        
        // FIXED: Chart.js configuration with proper time scale
        this.chart = new Chart(ctx, {
          type: 'line',
          data: { datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: {
              mode: 'nearest',
              intersect: false
            },
            plugins: {
              legend: { 
                labels: { color: 'white' }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    // FIXED: Use the pre-calculated variable
                    return `${context.dataset.label}: ${context.parsed.y} ${metric_unit}` // ✅ Works!
                  }
                }
              }
            },
            scales: {
              // FIXED: Proper time scale configuration
              x: {
                type: 'time', // This is the key setting!
                time: {
                  unit: 'second', // Time unit for telemetry data
                  stepSize: 10, // Show tick every 10 seconds
                  displayFormats: {
                    second: 'HH:mm:ss', // Format: 14:32:15
                    minute: 'HH:mm',
                    hour: 'HH:mm'
                  },
                  tooltipFormat: 'HH:mm:ss.SSS' // Detailed format for tooltips
                },
                title: { 
                  display: true, 
                  text: 'Time (HH:mm:ss)', 
                  color: 'white' 
                },
                ticks: { 
                  color: 'white',
                  source: 'auto', // Let Chart.js determine tick positions
                  maxTicksLimit: 10 // Limit number of ticks for readability
                },
                grid: { 
                  color: 'rgba(255, 255, 255, 0.1)' 
                }
              },
              y: {
                title: { 
                  display: true, 
                  text: this.get_metric_label(), 
                  color: 'white' 
                },
                ticks: { color: 'white' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        })
        
        this.chart_status = 'Chart Created with Real Timestamps'
        console.log('✅ Telemetry chart created with proper time scale!')
        
      } catch (error) {
        console.error('❌ Error creating chart:', error)
        this.chart_status = `Chart Error: ${error.message}`
      }
    },

    get_metric_unit() {
      const units = {
        speed: 'km/h',
        throttle: '%',
        brake: '%',
        rpm: 'RPM',
        n_gear: ''
      }
      return units[this.selected_metric] || ''
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
          this.chart_status = 'Chart Destroyed'
        }
      }
    }
  },
  
  beforeUnmount() {
    this.destroy_chart()
    telemetry_service.clear_cache()
  }
}
</script>
<style scoped>
/* Keep only the basic mobile responsive styles without bottom box modifications */

@media (max-width: 768px) {
  .p-4.bg-black {
    padding: 0.75rem !important;
  }
}

@media (max-width: 640px) {
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  h4 {
    font-size: 1rem !important;
    text-align: center;
  }
}

/* Remove all the bottom boxes compact styling - keep original */
</style>