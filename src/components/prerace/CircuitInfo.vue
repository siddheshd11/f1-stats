<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-black rounded-lg">
    <!-- Left Side: Circuit Image -->
     <div class="relative">
      <!-- Circuit Image - Full Display Without Overlay -->
      <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
        <img
          :src="circuit_image_url"
          :alt="`${circuit_name} Circuit Layout`"
          class="w-full h-full object-cover"
          @error="handle_image_error"
        />
        <!-- All overlay divs removed for full image visibility -->
      </div>
      
      <!-- Circuit Info Below Image -->
      <div class="mt-3 px-2">
        <h2 class="text-white text-4xl font-bold">{{ circuit_name }}</h2>
        <p class="text-gray-300 text-lg">{{ location_info }}</p>
      </div>
    </div>

    <!-- Right Side: Tabs Section (Similar to PrevRaceResults) -->
    <div class="space-y-6">
      <CircuitTabs 
        :race_data="race_data"
        :circuit_data="circuit_data"
        :circuit_id="circuit_id"
        :loading="loading"
        :error="error"
      />
    </div>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'
import CircuitTabs from './CircuitTabs.vue'

export default {
  name: 'CircuitInfo',
  
  components: {
    CircuitTabs
  },
  
  data() {
    return {
      race_store: use_race_store(),
      default_image: 'assets/circuits/default_circuit.avif',
      loading: false,
      error: null
    }
  },
  
  computed: {
    circuit_name() {
      return this.race_store.next_race?.Circuit?.circuitName || 'Circuit Name'
    },
    
    circuit_id() {
      return this.race_store.next_race?.Circuit?.circuitId || ''
    },
    
    location_info() {
      const circuit = this.race_store.next_race?.Circuit
      if (circuit) {
        return `${circuit.Location?.locality}, ${circuit.Location?.country}`
      }
      return 'Location TBD'
    },
    
    circuit_image_url() {
      if (this.circuit_id && this.circuit_id !== 'Circuit Name') {
        const image_name = this.circuit_id
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')

        return `assets/circuits/${image_name}.avif`
      }
      return this.default_image
    },
    
    race_data() {
      return this.race_store.next_race || {}
    },
    
    circuit_data() {
      return {
        circuit: this.race_store.next_race?.Circuit || {},
        meeting_key: this.race_store.next_race?.meeting_key || null
      }
    }
  },
  
  methods: {
    handle_image_error(event) {
      console.warn(`Circuit image not found: ${event.target.src}`)
      event.target.src = this.default_image
    }
  }
}
</script>
<style scoped>
/* Mobile Responsive Styles for CircuitInfo */

/* Container adjustments for mobile */
@media (max-width: 1024px) {
  .grid.grid-cols-1.lg\:grid-cols-2 {
    grid-template-columns: 1fr !important;
    gap: 1.5rem !important;
  }
  
  .p-6 {
    padding: 1rem !important;
  }
}

/* FIXED: Image overlay text positioning */
.aspect-w-16.aspect-h-9 {
  position: relative;
  overflow: hidden;
}

/* FIXED: Better gradient overlay */
.absolute.inset-0 {
  background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%);
}

/* FIXED: Improved text container positioning */
.absolute.bottom-0 {
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.9));
  backdrop-filter: blur(4px);
  z-index: 10;
}

/* FIXED: Responsive font sizing to prevent overflow */
@media (max-width: 640px) {
  .absolute.bottom-0 {
    padding: 0.75rem !important;
  }
  
  .absolute.bottom-0 h2 {
    font-size: 1.25rem !important; /* 20px */
    line-height: 1.2 !important;
    margin-bottom: 0.25rem !important;
  }
  
  .absolute.bottom-0 p {
    font-size: 0.875rem !important; /* 14px */
    margin-top: 0.25rem !important;
  }
}

@media (min-width: 641px) and (max-width: 1023px) {
  .absolute.bottom-0 h2 {
    font-size: 1.875rem !important; /* 30px */
  }
  
  .absolute.bottom-0 p {
    font-size: 1rem !important; /* 16px */
  }
}

/* Ensure no text overflow */
.absolute.bottom-0 h2,
.absolute.bottom-0 p {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

/* Tab styling consistency with PrevRaceResults */
.bg-gray-900.rounded-lg .flex button {
  transition: all 0.2s ease-in-out;
}

.bg-gray-900.rounded-lg .flex button svg {
  margin-right: 0.25rem;
}

/* Mobile tab adjustments */
@media (max-width: 640px) {
  .bg-gray-900.rounded-lg .flex {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .bg-gray-900.rounded-lg .flex::-webkit-scrollbar {
    display: none;
  }
  
  .bg-gray-900.rounded-lg .flex button {
    padding: 0.5rem 0.75rem !important;
    font-size: 0.75rem !important;
    white-space: nowrap;
    min-width: fit-content;
  }
  
  .bg-gray-900.rounded-lg .flex button svg {
    width: 0.875rem !important;
    height: 0.875rem !important;
  }
}

/* Custom scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}
</style>
