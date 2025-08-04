<template>
  <div class="min-h-screen bg-gray-900">
    <SEOMeta
      :title="`${last_race_name} Results & Analysis | F1 Analytics`"
      :description="`Complete ${last_race_name} race results, telemetry analysis, driver performance, team standings, and post-race insights. ${race_winner} victory details.`"
      :keywords="`${last_race_name}, F1 results, ${race_winner}, race analysis, telemetry data, driver standings, team results, F1 ${current_year}`"
      :structured_data="postrace_structured_data"
      type="article"
    />
    
    <!-- Header Component -->
    <Header :customTitle="'Post Race Analysis'"/>
    
    <!-- Main Content with Mobile Tab Navigation -->
    <div class="pb-16 md:pb-0">
      <!-- Desktop View - All sections visible -->
      <div class="hidden md:block container mx-auto px-4 py-6 space-y-6">
        <PreviousRaceSection />
        <!-- <PrevRaceResults /> -->
        <LapComparisonSection />
        <TelemetryComparisonSection />
      </div>

      <!-- Mobile View - Tab-based navigation -->
      <div class="md:hidden">
        <!-- Mobile Content -->
        <div class="container mx-auto px-4 py-6">
          <PreviousRaceSection v-if="active_mobile_tab === 'overview'" />
          <!-- <PreviousRaceSection v-if="active_mobile_tab === 'results'" /> -->
          <LapComparisonSection v-if="active_mobile_tab === 'laps'" />
          <TelemetryComparisonSection v-if="active_mobile_tab === 'telemetry'" />
        </div>

        <!-- Bottom Tab Navigation for Mobile -->
        <div class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
          <div class="grid grid-cols-3">
            <!-- Overview Tab -->
            <button
              @click="active_mobile_tab = 'overview'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'overview' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>

              <span class="text-xs font-medium">Overview</span>
            </button>

            <!-- Lap Analysis Tab -->
            <button
              @click="active_mobile_tab = 'laps'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'laps' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>

              <span class="text-xs font-medium">Laps</span>
            </button>

            <!-- Telemetry Tab -->
            <button
              @click="active_mobile_tab = 'telemetry'"
              class="flex flex-col items-center py-3 px-2 transition-all duration-200"
              :class="active_mobile_tab === 'telemetry' 
                ? 'text-red-500 bg-gray-800/50 border-t-2 border-red-500' 
                : 'text-gray-400 hover:text-gray-300'"
            >
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>

              <span class="text-xs font-medium">Telemetry</span>
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
import PreviousRaceSection from '@/components/postrace/PreviousRaceSection.vue'
import PrevRaceResults from '@/components/postrace/PrevRaceResults.vue'
import LapComparisonSection from '@/components/postrace/LapComparisonSection.vue'
import TelemetryComparisonSection from '@/components/postrace/TelemetryComparisonSection.vue'
import Footer from '@/components/common/Footer.vue'
import SEOMeta from '@/components/common/SEOMeta.vue'
import { use_race_store } from '@/stores/race_store.js'

export default {
  name: 'PostRace',
  
  components: {
    Header,
    PreviousRaceSection,
    PrevRaceResults,
    LapComparisonSection,
    TelemetryComparisonSection,
    Footer,
    SEOMeta
  },
  
  data() {
    return {
      active_mobile_tab: 'overview',
      race_store: use_race_store()
    }
  },

  computed: {
    last_race_name() {
      return this.race_store.previous_race?.raceName || 'Latest Formula 1 Race'
    },
    
    race_winner() {
      const winner = this.race_store.race_results?.[0]
      return winner ? `${winner.Driver?.givenName} ${winner.Driver?.familyName}` : 'F1 Champion'
    },
    
    current_year() {
      return new Date().getFullYear()
    },
    
    postrace_structured_data() {
      const race = this.race_store.previous_race
      const winner = this.race_store.race_results?.[0]
      
      if (!race) return {}
      
      return {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        'name': race.raceName,
        'description': `Formula 1 ${race.raceName} race results and analysis`,
        'startDate': race.date + 'T' + race.time,
        'endDate': race.date + 'T' + race.time,
        'location': {
          '@type': 'Place',
          'name': race.Circuit?.circuitName,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': race.Circuit?.Location?.locality,
            'addressCountry': race.Circuit?.Location?.country
          }
        },
        'winner': winner ? {
          '@type': 'Person',
          'name': `${winner.Driver?.givenName} ${winner.Driver?.familyName}`,
          'nationality': winner.Driver?.nationality
        } : undefined,
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
