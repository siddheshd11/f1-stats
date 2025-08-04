<template>
  <div class="h-full flex flex-col space-y-4 bg-black">
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
        <div class="text-gray-400 text-sm">No segment data available</div>
      </div>
      
      <div v-else class="flex flex-col space-y-4 p-4 rounded-lg">
        <!-- Controls (shared between both layouts) -->
        <div class="flex items-center justify-between flex-shrink-0">
          <h4 class="text-white font-medium">Track Segment Performance - Side by Side Comparison</h4>
          <div class="flex items-center space-x-4">
            <label class="text-white text-sm">Sector:</label>
            <select 
              v-model="selected_sector" 
              class="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1 text-sm"
            >
              <option v-for="sector in [1, 2, 3]" :key="sector" :value="sector">
                Sector {{ sector }}
              </option>
            </select>
          </div>
        </div>

        <!-- Mobile Layout: Compact tabbed view (visible only on mobile) -->
        <div class="block lg:hidden">
          <!-- Quick Overview -->
          <div class="bg-gray-700/30 rounded-lg p-3 mb-3">
            <h5 class="text-white text-sm font-medium mb-2">Sector {{ selected_sector }} Overview</h5>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div v-for="driver_number in available_drivers.slice(0, 4)" :key="driver_number" class="text-center">
                <div class="text-gray-300 font-medium">#{{ driver_number }}</div>
                <div class="text-purple-400 font-bold">{{ get_driver_segment_counts(driver_number).fast }}</div>
                <div class="text-gray-400">Purple</div>
              </div>
            </div>
          </div>

          <!-- Driver Tabs for Detailed View -->
          <div class="bg-gray-800/50 rounded-lg">
            <!-- Driver Tab Navigation -->
            <div class="flex overflow-x-auto scrollbar-hide border-b border-gray-700">
              <button
                v-for="driver_number in available_drivers"
                :key="driver_number"
                @click="active_mobile_driver = driver_number"
                class="flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors border-b-2"
                :class="active_mobile_driver === driver_number 
                  ? 'text-red-500 border-red-500 bg-gray-800/50' 
                  : 'text-gray-400 border-transparent hover:text-gray-300'"
              >
                <div class="flex items-center space-x-1">
                  <img
                    :src="get_driver_photo(driver_number)"
                    :alt="get_driver_name(driver_number)"
                    class="w-4 h-4 rounded-full"
                    @error="handle_image_error"
                  />
                  <span>#{{ driver_number }}</span>
                </div>
              </button>
            </div>

            <!-- Selected Driver Details -->
            <div class="p-3">
              <div v-if="active_mobile_driver" class="space-y-3">
                <!-- Driver Header -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <img
                      :src="get_driver_photo(active_mobile_driver)"
                      :alt="get_driver_name(active_mobile_driver)"
                      class="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div class="text-white font-bold text-sm">#{{ active_mobile_driver }}</div>
                      <div class="text-gray-300 text-xs">{{ get_driver_name(active_mobile_driver) }}</div>
                    </div>
                  </div>
                  
                  <!-- Quick Stats -->
                  <div class="grid grid-cols-4 gap-1 text-xs text-center">
                    <div>
                      <div class="text-purple-400 font-bold">{{ get_driver_segment_counts(active_mobile_driver).fast }}</div>
                      <div class="text-gray-500">P</div>
                    </div>
                    <div>
                      <div class="text-green-400 font-bold">{{ get_driver_segment_counts(active_mobile_driver).average }}</div>
                      <div class="text-gray-500">G</div>
                    </div>
                    <div>
                      <div class="text-yellow-400 font-bold">{{ get_driver_segment_counts(active_mobile_driver).slow }}</div>
                      <div class="text-gray-500">Y</div>
                    </div>
                    <div>
                      <div class="text-blue-400 font-bold">{{ get_driver_segment_counts(active_mobile_driver).pit }}</div>
                      <div class="text-gray-500">Pit</div>
                    </div>
                  </div>
                </div>

                <!-- Compact Heatmap -->
                <div class="bg-gray-700/30 rounded p-2">
                  <h6 class="text-gray-300 text-xs font-medium mb-2">Lap Segments</h6>
                  <div class="space-y-1 max-h-32 overflow-y-auto">
                    <div 
                      v-for="lap in get_driver_lap_segments(active_mobile_driver).slice(0, 8)" 
                      :key="lap.lap_number" 
                      class="flex items-center space-x-1 text-xs"
                    >
                      <span class="text-gray-400 w-6">L{{ lap.lap_number }}</span>
                      <span class="text-blue-400 w-12 text-right font-mono">{{ format_sector_time(lap.sector_duration) }}</span>
                      <div class="flex space-x-0.5">
                        <div
                          v-for="(segment, index) in lap.segments.slice(0, 6)"
                          :key="index"
                          class="w-3 h-3 rounded text-center text-xs"
                          :class="get_segment_color_class(segment)"
                          style="font-size: 0.5rem; line-height: 0.75rem;"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="get_driver_lap_segments(active_mobile_driver).length > 8" class="text-xs text-gray-400 text-center mt-1">
                    ... and {{ get_driver_lap_segments(active_mobile_driver).length - 8 }} more laps
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout: Original full layout (visible only on lg screens and above) -->
        <div class="hidden lg:block">
          <!-- Side-by-Side Driver Comparison -->
          <div class="flex-1 bg-transparent rounded-lg p-4 overflow-y-auto max-h-[300px]">
            <div class="grid gap-6" :style="{ gridTemplateColumns: `repeat(${available_drivers.length}, minmax(200px, 1fr))` }">
              <div 
                v-for="driver_number in available_drivers" 
                :key="driver_number" 
                class="space-y-3"
              >
                <!-- Driver Header -->
                <div class="flex items-center space-x-3 pb-3 border-b border-gray-600">
                  <img
                    :src="get_driver_photo(driver_number)"
                    :alt="get_driver_name(driver_number)"
                    class="w-8 h-8 rounded-full object-cover"
                    @error="handle_image_error"
                  />
                  <div>
                    <div class="text-white font-bold text-sm">#{{ driver_number }}</div>
                    <div class="text-gray-300 text-xs">{{ get_driver_name(driver_number) }}</div>
                  </div>
                </div>

                <!-- Performance Summary -->
                <div class="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <h6 class="text-gray-300 text-xs font-medium uppercase tracking-wide">Sector {{ selected_sector }} Summary</h6>
                  <div class="grid grid-cols-4 gap-2 text-xs">
                    <div class="text-center">
                      <div class="text-purple-400 font-bold text-lg">{{ get_driver_segment_counts(driver_number).fast }}</div>
                      <div class="text-gray-400">Purple</div>
                    </div>
                    <div class="text-center">
                      <div class="text-green-400 font-bold text-lg">{{ get_driver_segment_counts(driver_number).average }}</div>
                      <div class="text-gray-400">Green</div>
                    </div>
                    <div class="text-center">
                      <div class="text-yellow-400 font-bold text-lg">{{ get_driver_segment_counts(driver_number).slow }}</div>
                      <div class="text-gray-400">Yellow</div>
                    </div>
                    <div class="text-center">
                      <div class="text-blue-400 font-bold text-lg">{{ get_driver_segment_counts(driver_number).pit }}</div>
                      <div class="text-gray-400">Pit</div>
                    </div>
                  </div>
                  <div class="text-center pt-2 border-t border-gray-700">
                    <span class="text-gray-400 text-xs">Total: {{ get_driver_segment_counts(driver_number).total }} segments</span>
                  </div>
                </div>

                <!-- Segment Heatmap Grid with Sector Duration -->
                <div class="space-y-2">
                  <h6 class="text-gray-300 text-xs font-medium">Lap-by-Lap Segments</h6>
                  <div class="space-y-1">
                    <div 
                      v-for="lap in get_driver_lap_segments(driver_number)" 
                      :key="lap.lap_number" 
                      class="flex items-center space-x-2"
                    >
                      <span class="text-gray-400 text-xs w-8 flex-shrink-0">L{{ lap.lap_number }}</span>
                      
                      <!-- Sector Duration Display -->
                      <div class="text-blue-400 text-xs w-16 flex-shrink-0 text-right font-mono">
                        {{ format_sector_time(lap.sector_duration) }}
                      </div>
                      
                      <div class="flex space-x-1 flex-wrap">
                        <div
                          v-for="(segment, index) in lap.segments"
                          :key="index"
                          class="w-5 h-5 rounded border border-gray-600 flex items-center justify-center text-xs font-bold"
                          :class="get_segment_color_class(segment)"
                          :title="`Segment ${index + 1}: ${segment} (${get_segment_meaning(segment)})`"
                        >
                          {{ index + 1 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Overall Summary Table -->
          <div class="flex-shrink-0 bg-gray-700/30 rounded-lg p-4">
            <h5 class="text-white font-medium mb-3">Overall Performance Summary - Sector {{ selected_sector }}</h5>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-600">
                    <th class="text-left text-gray-300 py-2">Driver</th>
                    <th class="text-center text-purple-400 py-2">Purple</th>
                    <th class="text-center text-green-400 py-2">Green</th>
                    <th class="text-center text-yellow-400 py-2">Yellow</th>
                    <th class="text-center text-blue-400 py-2">Pit</th>
                    <th class="text-center text-gray-300 py-2">Total</th>
                    <th class="text-center text-purple-400 py-2">Purple %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="driver_number in available_drivers" 
                    :key="driver_number"
                    class="border-b border-gray-700/50"
                  >
                    <td class="py-2">
                      <div class="flex items-center space-x-2">
                        <img
                          :src="get_driver_photo(driver_number)"
                          :alt="get_driver_name(driver_number)"
                          class="w-6 h-6 rounded-full object-cover"
                        />
                        <span class="text-white font-medium">#{{ driver_number }} {{ get_driver_name(driver_number) }}</span>
                      </div>
                    </td>
                    <td class="text-center text-purple-400 font-bold">{{ get_driver_segment_counts(driver_number).fast }}</td>
                    <td class="text-center text-green-400 font-bold">{{ get_driver_segment_counts(driver_number).average }}</td>
                    <td class="text-center text-yellow-400 font-bold">{{ get_driver_segment_counts(driver_number).slow }}</td>
                    <td class="text-center text-blue-400 font-bold">{{ get_driver_segment_counts(driver_number).pit }}</td>
                    <td class="text-center text-gray-300 font-bold">{{ get_driver_segment_counts(driver_number).total }}</td>
                    <td class="text-center text-purple-400 font-bold">{{ get_driver_purple_percentage(driver_number) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Compact Legend (shared between both layouts) -->
        <div class="flex items-center justify-center space-x-3 lg:space-x-6 flex-shrink-0 text-xs lg:text-sm">
          <div class="flex items-center space-x-1 lg:space-x-2">
            <div class="w-2 h-2 lg:w-4 lg:h-4 bg-purple-500 rounded"></div>
            <span class="text-gray-300">Purple</span>
          </div>
          <div class="flex items-center space-x-1 lg:space-x-2">
            <div class="w-2 h-2 lg:w-4 lg:h-4 bg-green-500 rounded"></div>
            <span class="text-gray-300">Green</span>
          </div>
          <div class="flex items-center space-x-1 lg:space-x-2">
            <div class="w-2 h-2 lg:w-4 lg:h-4 bg-yellow-500 rounded"></div>
            <span class="text-gray-300">Yellow</span>
          </div>
          <div class="flex items-center space-x-1 lg:space-x-2">
            <div class="w-2 h-2 lg:w-4 lg:h-4 bg-blue-500 rounded"></div>
            <span class="text-gray-300">Pit</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>


<style scoped>
/* Mobile Responsive Styles for Track Segment Performance */

/* Container adjustments for mobile */
@media (max-width: 768px) {
  .h-full.flex.flex-col.space-y-4.bg-black {
    padding: 0.5rem;
  }
  
  .flex.flex-col.space-y-4.p-4.rounded-lg {
    padding: 0.75rem !important;
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
    font-size: 1rem !important;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .flex.items-center.space-x-4 {
    justify-content: space-between;
    gap: 0.5rem;
  }
  
  .flex.items-center.space-x-4 > label {
    font-size: 0.75rem !important;
    white-space: nowrap;
  }
  
  .flex.items-center.space-x-4 > select {
    flex: 1;
    font-size: 0.75rem !important;
    padding: 0.5rem 0.75rem !important;
    min-width: 100px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  h4 {
    font-size: 1.125rem !important;
  }
}

/* Driver grid responsive columns */
@media (max-width: 640px) {
  .grid.gap-6 {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
  
  .max-h-\[300px\] {
    max-height: 350px !important;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .grid.gap-6 {
    grid-template-columns: repeat(2, minmax(180px, 1fr)) !important;
    gap: 1rem !important;
  }
}

@media (min-width: 1025px) {
  .grid.gap-6 {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
    gap: 1.5rem !important;
  }
}

/* Driver header adjustments */
@media (max-width: 640px) {
  .flex.items-center.space-x-3.pb-3 img {
    width: 1.5rem !important;
    height: 1.5rem !important;
  }
  
  .flex.items-center.space-x-3.pb-3 .text-sm {
    font-size: 0.75rem !important;
  }
  
  .flex.items-center.space-x-3.pb-3 .text-xs {
    font-size: 0.65rem !important;
  }
}

/* Performance summary responsive grid */
@media (max-width: 640px) {
  .bg-gray-800\/50.rounded-lg.p-3 {
    padding: 0.5rem !important;
  }
  
  .grid.grid-cols-4.gap-2 {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.5rem !important;
  }
  
  .grid.grid-cols-4.gap-2 .text-lg {
    font-size: 1rem !important;
  }
  
  .grid.grid-cols-4.gap-2 .text-xs {
    font-size: 0.625rem !important;
  }
}

/* Segment heatmap grid adjustments */
@media (max-width: 640px) {
  .flex.items-center.space-x-2 {
    gap: 0.25rem !important;
  }
  
  .text-xs.w-8 {
    width: 1.5rem !important;
    font-size: 0.625rem !important;
  }
  
  .text-blue-400.text-xs.w-16 {
    width: 3rem !important;
    font-size: 0.625rem !important;
  }
  
  .w-5.h-5 {
    width: 1rem !important;
    height: 1rem !important;
    font-size: 0.5rem !important;
  }
}

/* Summary table mobile optimization */
@media (max-width: 640px) {
  .bg-gray-700\/30.rounded-lg.p-4 {
    padding: 0.75rem !important;
  }
  
  .overflow-x-auto table {
    display: block;
    white-space: nowrap;
  }
  
  .overflow-x-auto thead {
    display: none;
  }
  
  .overflow-x-auto tbody tr {
    display: block;
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
  }
  
  .overflow-x-auto tbody tr td {
    display: block;
    text-align: left !important;
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  }
  
  .overflow-x-auto tbody tr td:last-child {
    border-bottom: none;
  }
  
  .overflow-x-auto tbody tr td:before {
    content: attr(data-label) ": ";
    font-weight: 600;
    color: #9ca3af;
    display: inline-block;
    width: 100px;
  }
}

/* Add data labels for mobile table */
.overflow-x-auto tbody tr td:nth-child(1):before { content: "Driver: "; }
.overflow-x-auto tbody tr td:nth-child(2):before { content: "Purple: "; }
.overflow-x-auto tbody tr td:nth-child(3):before { content: "Green: "; }
.overflow-x-auto tbody tr td:nth-child(4):before { content: "Yellow: "; }
.overflow-x-auto tbody tr td:nth-child(5):before { content: "Pit: "; }
.overflow-x-auto tbody tr td:nth-child(6):before { content: "Total: "; }
.overflow-x-auto tbody tr td:nth-child(7):before { content: "Purple %: "; }

/* Legend responsive layout */
@media (max-width: 640px) {
  .flex.items-center.justify-center.space-x-6 {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .flex.items-center.space-x-2 {
    flex: 0 0 auto;
    font-size: 0.75rem;
  }
  
  .flex.items-center.space-x-2 .w-4.h-4 {
    width: 0.75rem !important;
    height: 0.75rem !important;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .flex.items-center.justify-center.space-x-6 {
    gap: 1rem;
  }
}

/* Fluid font sizing using clamp */
h4 {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.3;
}

h5 {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}

h6 {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

label {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

.text-xs {
  font-size: clamp(0.625rem, 1.2vw, 0.75rem);
}

.text-sm {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}

/* Hide scrollbar for mobile tabs */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth transitions */
.transition-colors {
  transition: all 0.2s ease;
}

/* Compact segment colors */
.w-3.h-3 {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Scrollbar hiding for smooth scrolling */
.overflow-x-auto, .overflow-y-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-x-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

/* Enhanced select styling */
select {
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  min-height: 44px; /* Better touch target */
}

select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Loading state adjustments */
.flex-1.flex.items-center.justify-center {
  min-height: 200px;
}

@media (max-width: 640px) {
  .flex-1.flex.items-center.justify-center {
    min-height: 150px;
  }
  
  .flex-1.flex.items-center.justify-center .text-sm {
    font-size: 0.75rem;
  }
}
</style>


<script>
export default {
  name: 'SegmentHeatmapChart',
  
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
      selected_sector: 1,
      // F1 Segment value mapping based on OpenF1 API documentation
      segment_mapping: {
        0: { meaning: 'not available', color: 'gray', category: 'unknown' },
        2048: { meaning: 'yellow sector', color: 'yellow', category: 'slow' },
        2049: { meaning: 'green sector', color: 'green', category: 'average' },
        2050: { meaning: 'unknown', color: 'gray', category: 'unknown' },
        2051: { meaning: 'purple sector', color: 'purple', category: 'fast' },
        2052: { meaning: 'unknown', color: 'gray', category: 'unknown' },
        2064: { meaning: 'pitlane', color: 'blue', category: 'pit' },
        2068: { meaning: 'unknown', color: 'gray', category: 'unknown' }
      },
      active_mobile_driver: null,
    }
  },
  
  computed: {
    default_active_driver() {
      return this.available_drivers.length > 0 ? this.available_drivers[0] : null
    },
    has_valid_data() {
      return Object.keys(this.drivers_lap_data).length > 0 &&
             Object.values(this.drivers_lap_data).some(driver => 
               driver.laps && driver.laps.some(lap => 
                 lap[`segments_sector_${this.selected_sector}`]?.length > 0
               )
             )
    },
    
    available_drivers() {
      return Object.keys(this.drivers_lap_data)
    }
  },

  watch: {
    available_drivers: {
      handler(new_drivers) {
        if (new_drivers.length > 0 && !this.active_mobile_driver) {
          this.active_mobile_driver = new_drivers[0]
        }
      },
      immediate: true
    }
  },
  
  methods: {
    get_driver_name(driver_number) {
      const driver = this.drivers_lap_data[driver_number]?.driver_info
      return driver ? driver.name_acronym || `${driver.first_name} ${driver.last_name}` : `#${driver_number}`
    },
    
    get_driver_photo(driver_number) {
      const driver = this.drivers_lap_data[driver_number]?.driver_info
      return driver?.headshot_url || 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    handle_image_error(event) {
      event.target.src = 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback.png'
    },
    
    get_driver_lap_segments(driver_number) {
      const driver_data = this.drivers_lap_data[driver_number]
      if (!driver_data?.laps) return []
      
      return driver_data.laps
        .filter(lap => lap[`segments_sector_${this.selected_sector}`]?.length > 0)
        .map(lap => ({
          lap_number: lap.lap_number,
          segments: lap[`segments_sector_${this.selected_sector}`] || [],
          sector_duration: lap[`duration_sector_${this.selected_sector}`] || 0
        }))
    },
    
    format_sector_time(duration) {
      if (!duration || duration <= 0) return '--'
      return `${duration.toFixed(3)}s`
    },
    
    // FIXED: Direct mapping based on segment values
    get_segment_meaning(segment_value) {
      const mapping = this.segment_mapping[segment_value]
      return mapping ? mapping.meaning : 'unknown'
    },
    
    // FIXED: Direct color mapping based on segment values
    get_segment_color_class(segment_value) {
      const mapping = this.segment_mapping[segment_value]
      if (!mapping) return 'bg-gray-600 text-gray-300'
      
      switch (mapping.color) {
        case 'purple':
          return 'bg-purple-500 text-white'
        case 'green':
          return 'bg-green-500 text-white'
        case 'yellow':
          return 'bg-yellow-500 text-black'
        case 'blue':
          return 'bg-blue-500 text-white'
        default:
          return 'bg-gray-600 text-gray-300'
      }
    },
    
    // FIXED: Simple counting based on segment value mapping
    get_driver_segment_counts(driver_number) {
      let fast = 0, average = 0, slow = 0, pit = 0, total = 0
      
      const lap_segments = this.get_driver_lap_segments(driver_number)
      
      lap_segments.forEach(lap => {
        lap.segments.forEach(segment => {
          if (segment > 0) {
            total++
            const mapping = this.segment_mapping[segment]
            if (mapping) {
              switch (mapping.category) {
                case 'fast':    // 2051 - purple sector
                  fast++
                  break
                case 'average': // 2049 - green sector  
                  average++
                  break
                case 'slow':    // 2048 - yellow sector
                  slow++
                  break
                case 'pit':     // 2064 - pitlane
                  pit++
                  break
              }
            }
          }
        })
      })
      
      console.log(`🏎️ Driver ${driver_number} (${this.get_driver_name(driver_number)}) - Sector ${this.selected_sector}:`, { 
        fast, average, slow, pit, total 
      })
      
      return { fast, average, slow, pit, total }
    },
    
    get_driver_purple_percentage(driver_number) {
      const counts = this.get_driver_segment_counts(driver_number)
      if (counts.total === 0) return 0
      return Math.round((counts.fast / counts.total) * 100)
    }
  }
}
</script>
