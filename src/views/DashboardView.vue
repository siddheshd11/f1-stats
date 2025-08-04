<template>
  <!-- Optionally show loading placeholder -->
  <transition name="fade" appear enter-active-class="transition-opacity duration-500"
    leave-active-class="transition-opacity duration-500"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="checking" class="flex flex-col items-center justify-center min-h-screen bg-black">
      <svg class='size-15' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
        <path fill="none" stroke="#D80032" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z">
          <animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate>
        </path>
      </svg>
      <span class="text-red-500">Loading...</span>
    </div>
    <router-view v-else />
  </transition>

</template>


<script>
import { use_race_store } from '@/stores/race_store.js'


export default {
  name: 'DashboardView',
  data() {
    return {
      race_store: use_race_store(),
      checking: true
    }
  },
  computed: {
    show_pre_race() {
      const next = this.race_store.next_race
      if (!next) return false
      const race_datetime = next.date && next.time
        ? new Date(`${next.date}T${next.time}`)
        : new Date(next.date)
      const now = new Date()
      const diff_days = Math.ceil((race_datetime - now) / (1000 * 60 * 60 * 24))
      return diff_days >= 0 && diff_days <= 3
    }
  },
  async mounted() {
    // Ensure race schedule is loaded
    if (!this.race_store.current_year_races.length) {

      await this.race_store.fetch_race_schedule(new Date().getFullYear())
      await this.race_store.get_last_race_on_next_race_circuit()
    }
    // Decide and redirect
    if (this.show_pre_race) {
      if (this.$route.name !== 'PreRace') {
        this.$router.replace({ name: 'PreRace' })
      }
    } else {
      if (this.$route.name !== 'PostRace') {
        this.$router.replace({ name: 'PostRace' })
      }
    }
    this.checking = false
  }
}
</script>
