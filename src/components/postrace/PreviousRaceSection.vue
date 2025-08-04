<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-black rounded-lg">
    <!-- Left: Circuit Map -->
    <div class="rounded-lg overflow-hidden">
      <!-- <h2 class="text-white text-xl font-semibold p-4 border-b border-gray-700">Circuit Layout</h2> -->
      <div class="relative">
        <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
          <img
            :src="circuit_map_url"
            :alt="`${circuit_name} Circuit Layout`"
            class="w-full h-full object-cover"
            @error="handle_image_error"
          />
          <div class="inset-0 bg-gradient-to-t from-black/50 to-transparent mt-10"></div>
          <div class="bottom-4 left-4">
            <h2 class="text-white text-4xl font-bold">{{ circuit_name }}</h2>
            <p class="text-gray-300 text-lg">{{ circuit_location }}</p>
          </div>
        </div>
        
        
      </div>
    </div>

    <!-- Right: Race Results -->
    <div class="space-y-6">
      <PrevRaceResults 
        :race_results="race_results"
        :qualifying_results="qualifying_results"
        :session_key="previous_race_session_key"
        :loading="loading"
        :error="error"
      />
    </div>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'
import { api_service } from '@/services/api.js'
import PrevRaceResults from './PrevRaceResults.vue'

export default {
  name: 'PreviousRaceSection',
  
  components: {
    PrevRaceResults
  },
  
  data() {
    return {
      race_store: use_race_store(),
      race_results: [],
      qualifying_results: [],
      loading: false,
      error: null
    }
  },
  
  computed: {
    previous_race_session_key() {
      // Get session key from race store for stint data
      return this.race_store?.previous_race?.race_session?.session_key || null
    },

    circuit_name() {
      return this.race_store.previous_race?.Circuit?.circuitName || 'Unknown Circuit'
    },

    circuit_id() {
      return this.race_store.previous_race?.Circuit?.circuitId || ''
    },
    
    circuit_location() {
      const location = this.race_store.previous_race?.Circuit?.Location
      if (location) {
        return `${location.locality}, ${location.country}`
      }
      return 'Unknown Location'
    },
    
    circuit_map_url() {
      if (this.circuit_id && this.circuit_id !== 'Unknown Circuit') {
        const image_name = this.circuit_id
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        return `/assets/circuits/${image_name}.avif`
      }
      return '/assets/circuits/default_circuit.avif'
    }
  },
  
  async mounted() {
    await this.load_race_results()
  },

  watch: {
    'race_store.previous_race': {
      handler(new_previous_race) {
        if (new_previous_race && !this.race_results.length) {
          console.log('Previous race data became available:', new_previous_race)
          this.load_race_results()
        }
      },
      immediate: false
    }
  },
  
  methods: {
    async load_race_results() {
      this.loading = true
      this.error = null
      // console.log("Checking prev data ", this.race_store.previous_race);
      if(this.race_store?.previous_race?.season){
        try {
          console.log('Loading latest race and qualifying results...')
          
          // Fetch both race results and qualifying results
          const [race_data, qualifying_data] = await Promise.all([
            api_service.get_race_results_f1api(this.race_store.previous_race?.season, this.race_store.previous_race?.round),
            api_service.get_qualifying_results_f1api(this.race_store.previous_race?.season, this.race_store.previous_race?.round)
          ])
          
          console.log('Race data:', race_data)
          console.log('Qualifying data:', qualifying_data)
          
          this.race_results = race_data?.races.results || []
          this.qualifying_results = qualifying_data?.races.qualyResults || []
          
        } catch (error) {
          console.error('Error loading race results:', error)
          this.error = 'Failed to load race results'
        } finally {
          this.loading = false
        }
      }
    },


    
    handle_image_error(event) {
      console.warn(`Circuit image not found: ${event.target.src}`)
      event.target.src = '/assets/circuits/default_circuit.avif'
    }
  }
}
</script>
