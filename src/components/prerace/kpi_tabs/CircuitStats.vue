<template>
  <div class="space-y-4">
    <h3 class="text-white text-lg font-medium">Circuit Statistics</h3>
    
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
        <!-- Main Stats Grid -->
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div 
            v-for="stat in main_statistics"
            :key="stat.label"
            class="bg-gray-800/50 border border-gray-700/50 rounded p-3"
          >
            <p class="text-gray-400 text-xs uppercase tracking-wide">{{ stat.label }}</p>
            <p class="text-white text-lg font-bold mt-1 capitalize">{{ stat.value }}</p>
            <p v-if="stat.note" class="text-gray-500 text-xs mt-1 capitalize">{{ stat.note }}</p>
          </div>
        </div>
        

      </div>
    </transition>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'

export default {
  name: 'CircuitStats',
  
  props: {
    circuit_data: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      race_store: use_race_store(),
      loading: false,
      circuit_info: null,
      f1_api_data: null
    }
  },
  
  computed: {
    circuit_stats_data() {
      return this.race_store.get_circuit_stats_info
    },

    circuit_name() {
      return this.circuit_data?.circuit?.circuitName || ''
    },
    
    circuit_id() {
      return this.circuit_data?.circuit?.circuitId || ''
    },
    
    main_statistics() {
      const stats = [
        { 
          label: 'First Grand Prix', 
          value: this.circuit_stats_data?.first_grand_prix || 'N/A',
          note: ''
        },
        { 
          label: 'Circuit Length', 
          value: this.circuit_stats_data?.length || 'N/A',
          // note: '70 laps'
        },
        { 
          label: 'City', 
          value: this.circuit_stats_data?.city || 'N/A',
          note: this.circuit_stats_data?.country || 'N/A'
        },
        { 
          label: 'Lap Record', 
          value: this.circuit_stats_data?.lap_record_time || 'N/A',
          // note: this.circuit_stats_data?.lap_record_holder + '(' + this.circuit_stats_data?.fastest_lap_year + ')' || 'N/A'
        },
        { 
          label: 'Lap Record Holder', 
          value: this.circuit_stats_data?.lap_record_holder || 'N/A',
          note: this.circuit_stats_data?.fastest_lap_team + '(' + this.circuit_stats_data?.fastest_lap_year + ')' || 'N/A'
        },
        { 
          label: 'Corners', 
          value: this.circuit_stats_data?.corners || 'N/A',
          // note: 'Main straight'
        }
      ]
      return stats
    },
    
    track_details() {
      return {
        turns: this.f1_api_data?.corners || '14',
        drs_zones: this.f1_api_data?.drs_zones || '2',
        direction: this.f1_api_data?.direction || 'Clockwise',
        elevation: this.f1_api_data?.elevation_change || '22m'
      }
    },
    
    performance_stats() {
      return {
        full_throttle: this.f1_api_data?.full_throttle || '50%',
        downforce: this.f1_api_data?.downforce_level || 'High',
        fuel_use: this.f1_api_data?.fuel_use_per_lap || '1.5 kg',
        pit_loss: this.f1_api_data?.pit_stop_time_loss || '20.56s'
      }
    }
  },
  
  async mounted() {
    console.log('CircuitStats mounted with:', this.circuit_name, this.circuit_id)
    
    if (this.circuit_name || this.circuit_id) {
      await this.race_store.fetch_circuit_stats(this.circuit_name, this.circuit_id)
    }
  },
  
  // Watch for changes in circuit data
  watch: {
    circuit_name: {
      handler(new_name) {
        if (new_name) {
          this.race_store.fetch_circuit_stats(new_name, this.circuit_id)
        }
      },
      immediate: false
    }
  },
  
  methods: {
    
    
  }
}
</script>
