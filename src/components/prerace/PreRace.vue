<template>
  <div class="min-h-screen bg-gray-900">
    <SEOMeta
      :title="`${next_race_name} - Pre-Race Analysis | F1 Analytics`"
      :description="`Comprehensive pre-race analysis for ${next_race_name}. Circuit layout, weather forecast, driver form, qualifying predictions, and race schedule information.`"
      :keywords="`${next_race_name}, ${circuit_name}, F1 pre-race, qualifying predictions, circuit analysis, race forecast, F1 ${current_year}`"
      :structured_data="prerace_structured_data"
      type="article"
    />
    <!-- Header Component -->
    <Header :customTitle="'Next Race Grand Prix'"/>
    
    <!-- Main Content with Mobile Tab Navigation -->
    <div class="pb-16 md:pb-0">
      <!-- Desktop View - All sections visible -->
      <div class="hidden md:block container mx-auto px-4 py-6 space-y-6">
        <CircuitInfo />
        <LastRaceResults />
        <RaceControlTimeline />
        <WeatherAnalysis />
      </div>

      <!-- Mobile View - Tab-based navigation -->
      <div class="md:hidden">
        <!-- Mobile Content -->
        <div class="container mx-auto px-4 py-6">
          <CircuitInfo v-if="active_mobile_tab === 'circuit'" />
          <LastRaceResults v-if="active_mobile_tab === 'results'" />
          <RaceControlTimeline v-if="active_mobile_tab === 'control'" />
          <WeatherAnalysis v-if="active_mobile_tab === 'weather'" />
        </div>

        <!-- Bottom Tab Navigation for Mobile -->
        <div class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
          <div class="grid grid-cols-4">
            <!-- Circuit Tab -->
            <button
              @click="active_mobile_tab = 'circuit'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'circuit' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>

              <span class="text-xs font-medium">Overview</span>
            </button>

            <!-- Results Tab -->
            <button
              @click="active_mobile_tab = 'results'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'results' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
              </svg>

              <span class="text-xs font-medium">Results</span>
            </button>

            <!-- Control Tab -->
            <button
              @click="active_mobile_tab = 'control'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'control' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>

              <span class="text-xs font-medium">Race Control</span>
            </button>

            <!-- Weather Tab -->
            <button
              @click="active_mobile_tab = 'weather'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'weather' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>

              <span class="text-xs font-medium">Weather</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Header from '@/components/common/Header.vue'
import CircuitInfo from '@/components/prerace/CircuitInfo.vue'
import LastRaceResults from '@/components/prerace/LastRaceResults.vue'
import RaceControlTimeline from '@/components/prerace/RaceControlTimeline.vue'
import WeatherAnalysis from '@/components/prerace/WeatherAnalysis.vue'
import Footer from '@/components/common/Footer.vue'
import SEOMeta from '@/components/common/SEOMeta.vue'
import { use_race_store } from '@/stores/race_store.js'

export default {
  name: 'PreRace',
  
  components: {
    Header,
    CircuitInfo,
    LastRaceResults,
    RaceControlTimeline,
    WeatherAnalysis,
    Footer,
    SEOMeta
  },
  
  data() {
    return {
      active_mobile_tab: 'circuit',
      race_store: use_race_store()
    }
  },

  computed:{
    next_race_name() {
      return this.race_store.next_race?.raceName || 'Next Formula 1 Race'
    },
    
    circuit_name() {
      return this.race_store.next_race?.Circuit?.circuitName || 'F1 Circuit'
    },
    
    current_year() {
      return new Date().getFullYear()
    },
    
    prerace_structured_data() {
      const race = this.race_store.next_race
      if (!race) return {}
      
      return {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        'name': race.raceName,
        'description': `Formula 1 ${race.raceName} pre-race analysis and insights`,
        'startDate': race.date + 'T' + race.time,
        'location': {
          '@type': 'Place',
          'name': race.Circuit?.circuitName,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': race.Circuit?.Location?.locality,
            'addressCountry': race.Circuit?.Location?.country
          }
        },
        'organizer': {
          '@type': 'Organization',
          'name': 'Formula 1'
        }
      }
    }
  }

}
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease-in-out;
}

.border-t-2 {
  border-top-width: 2px;
  border-top-style: solid;
}
</style>
