<template>
  <header class="f1-primary">
    <!-- Main Header Bar -->
    <div class="flex items-center justify-between sm:px-10 px-2 py-3">
      <!-- Left Side: Logo + Title -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 flex items-center justify-center">
          <img
            src="/f1.png" 
            class="h-8 w-auto"
            alt="F1Stats.live Logo"
          />
        </div>
        <div>
          <h1 class="text-white text-xl font-bold">F1Stats.live</h1>
          <p class="text-gray-200 text-xs">Race Analysis</p>
        </div>
      </div>

      <!-- Center: Race Info -->
      <div class="hidden md:flex flex-col items-center text-center">
        <div class="text-white text-xl text-sm font-semibold">
          {{ race_info }}
        </div>
        <div class="text-gray-200 text-xs">
          {{ race_countdown }}
        </div>
      </div>

      <!-- Right Side: Navigation -->
      <nav class="flex space-x-1">
        <router-link
          to="/pre-race"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path === '/pre-race' 
            ? 'f1-secondary text-white shadow-lg' 
            : 'text-gray-300 hover:text-white hover:bg-[#EF233C]'"
        >
          Pre-Race
        </router-link>
        <router-link
          to="/post-race"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
          :class="$route.path === '/post-race' 
            ? 'f1-secondary text-white shadow-lg' 
            : 'text-gray-300 hover:text-white hover:bg-[#EF233C]'"
        >
          Post-Race
        </router-link>
      </nav>
    </div>

    <!-- Mobile Race Info -->
    <div class="md:hidden bg-gray-800 px-4 py-2 border-t border-gray-700">
      <div class="text-center">
        <div class="text-white text-sm font-semibold">{{ race_info }}</div>
        <div class="text-gray-200 text-xs">{{ race_countdown }}</div>
      </div>
    </div>

    <!-- Sub Navigation Bar -->
    <!-- <div class="bg-gray-800 px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex space-x-6">
          <button class="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Dashboard
          </button>
          <button class="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Analytics
          </button>
          <button class="text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Telemetry
          </button>
        </div>
        <div class="flex items-center space-x-3">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-green-400 text-xs font-medium">LIVE DATA</span>
        </div>
      </div>
    </div> -->
  </header>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'

export default {
  name: 'Header',

  props: {
    customTitle: {
      type: String,
      default: 'Live Race Analysis',
      required: false
    }
  },
  
  data() {
    return {
      race_store: use_race_store()
    }
  },
  
  computed: {
    subtitle_text() {
      return this.customTitle || 'Live Race Analysis'
    },
    
    is_post_race_mode() {
      return this.customTitle && this.customTitle.toLowerCase().includes('previous')
    },
    
    race_info() {
      if (this.is_post_race_mode) {
        return this.race_store.previous_race?.raceName || 'Loading previous race info...'
      }
      return this.race_store.next_race?.raceName || 'Loading race info...'
    },
    
    race_countdown() {
      if (this.is_post_race_mode) {
        if (this.race_store.previous_race) {
          const race_date = new Date(this.race_store.previous_race.date)
          return race_date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        }
        return ''
      }
      
      if (this.race_store.next_race) {
        const race_date = new Date(this.race_store.next_race.date)
        const now = new Date()
        const days_until = Math.ceil((race_date - now) / (1000 * 60 * 60 * 24))
        
        if (days_until === 0) return 'Race Day!'
        if (days_until === 1) return 'Tomorrow'
        if (days_until > 0) return `${days_until} days to go`
        return 'Race finished'
      }
      return ''
    }
  },
  
  async mounted() {
    if (!this.race_store.current_year_races.length) {
      await this.race_store.fetch_race_schedule()
      await this.race_store.get_last_race_on_next_race_circuit()
    }
  }
}
</script>


<style scoped>
/* Custom scrollbar for mobile nav if needed */
nav::-webkit-scrollbar {
  display: none;
}

/* Ensure smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active link glow effect */
.bg-red-600 {
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
