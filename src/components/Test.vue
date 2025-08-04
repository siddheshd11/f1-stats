<template>
  <div class="dashboard">
    <div v-if="race_store.loading">Loading races...</div>
    <div v-else-if="race_store.error">Error: {{ race_store.error }}</div>
    <div v-else>
      <h2>Next Race: {{ next_race_name }}</h2>
      <p>Date: {{ next_race_date }}</p>
      <p>Circuit: {{ next_race_circuit }}</p>
      
      <div v-if="last_circuit_race">
        <h3>Last Race on This Circuit:</h3>
        <p>{{ last_circuit_race.meeting_name }} ({{ last_circuit_race.year }})</p>
        <p>Date: {{ last_circuit_race.date_start }}</p>
        <p>Meeting Key: {{ last_circuit_race.meeting_key }}</p>
      </div>
      
      <h2>Previous Race: {{ previous_race_name }}</h2>
      <p>Date: {{ previous_race_date }}</p>
      <p>Circuit: {{ previous_race_circuit }}</p>
      
      <p>Weekend Status: {{ weekend_status }}</p>
      
      <button @click="load_meeting_keys" :disabled="loading_keys">
        {{ loading_keys ? 'Loading...' : 'Load Meeting Keys' }}
      </button>
      
      <div v-if="meeting_keys">
        <h3>Meeting Keys:</h3>
        <p>Last Race Meeting Key: {{ meeting_keys.last_race_on_next_circuit.meeting_key }}</p>
        <p>Previous Race Meeting Key: {{ meeting_keys.previous_race_meeting_key }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { use_race_store } from '@/stores/race_store.js'

export default {
  name: 'Test',
  
  data() {
    return {
      race_store: use_race_store(),
      last_circuit_race: null,
      meeting_keys: null,
      loading_keys: false
    }
  },
  
  computed: {
    next_race_name() {
      return this.race_store.next_race?.raceName || 'No upcoming race'
    },
    
    next_race_date() {
      return this.race_store.next_race?.date || 'TBD'
    },
    
    next_race_circuit() {
      return this.race_store.next_race?.Circuit?.circuitName || 'TBD'
    },
    
    previous_race_name() {
      return this.race_store.previous_race?.raceName || 'No previous race'
    },
    
    previous_race_date() {
      return this.race_store.previous_race?.date || 'TBD'
    },
    
    previous_race_circuit() {
      return this.race_store.previous_race?.Circuit?.circuitName || 'TBD'
    },
    
    weekend_status() {
      return this.race_store.get_race_weekend_status
    }
  },
  
  async mounted() {
    try {
      await this.race_store.fetch_race_schedule(2025)
      
    } catch (error) {
      console.error('Failed to load race data:', error)
    }
  },
  
  methods: {
    async load_meeting_keys() {
      this.loading_keys = true
      try {
        this.meeting_keys = await this.race_store.get_meeting_keys_for_current_races()
        console.log('Meeting keys loaded:', this.meeting_keys)
      } catch (error) {
        console.error('Failed to load meeting keys:', error)
      } finally {
        this.loading_keys = false
      }
    }
  }
}
</script>
