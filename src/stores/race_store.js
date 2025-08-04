import { defineStore } from 'pinia'
import { api_service } from '../services/api.js'

export const use_race_store = defineStore('race', {
  state: () => ({
    current_year_races: [],
    next_race: null,
    previous_race: null,
    last_race_held: null,
    loading: false,
    error: null,
    circuit_stats: {},
    raw_circuit_data: null,
    session_drivers: [],
    current_session_key: null,
    loading_session_drivers: false
  }),

  getters: {
    get_next_race_info: (state) => state.next_race,
    get_previous_race_info: (state) => state.previous_race,
    get_last_race_held: (state) => state.last_race_held,
    get_circuit_stats_info: (state) => state.circuit_stats,
    get_raw_circuit_data: (state) => state.raw_circuit_data,
    getSessionDrivers: (state) => {
      return state.session_drivers
    },
    
    // Getter to check if drivers are loaded for current session
    hasSessionDrivers: (state) => {
      return state.session_drivers.length > 0
    },
    
    // Getter to find specific driver by number
    getDriverByNumber: (state) => {
      return (driver_number) => {
        return state.session_drivers.find(driver => driver.driver_number === driver_number)
      }
    },
    
    get_race_weekend_status() {
      const now = new Date()
      const next_race = this.next_race
      
      if (!next_race) return 'off_season'
      
      const race_date = new Date(next_race.date + 'T' + next_race.time)
      const days_until_race = Math.ceil((race_date - now) / (1000 * 60 * 60 * 24))
      
      if (days_until_race < 0) return 'race_finished'
      if (days_until_race <= 3) return 'race_weekend'
      if (days_until_race <= 7) return 'race_week'
      
      return 'normal'
    }
  },

  actions: {
    // Action to fetch session drivers
    async fetchSessionDrivers(session_key) {
      if (!session_key) return

      const session_key_str = String(session_key)
      
      // If we already have drivers for this session, don't fetch again
      if (this.current_session_key === session_key_str && this.session_drivers.length > 0) {
        console.log(`✅ Using cached drivers for session ${session_key_str}`)
        return
      }

      this.loading_session_drivers = true

      try {
        console.log(`🔄 Fetching drivers for session ${session_key_str}`)
        const drivers = await api_service.get_session_drivers(session_key_str)
        
        // Store the data in state
        this.session_drivers = drivers
        this.current_session_key = session_key_str
        
        console.log(`✅ Loaded ${drivers.length} drivers for session ${session_key_str}`)

      } catch (error) {
        console.error('❌ Error fetching session drivers:', error)
        this.session_drivers = []
        throw error
      } finally {
        this.loading_session_drivers = false
      }
    },
    
    // Action to clear drivers cache
    clearSessionDrivers() {
      this.session_drivers = []
      this.current_session_key = null
    },

    get_fallback_data() {
      // Hungaroring specific fallback data based on search results
      const hungaroring_data = {
        first_grand_prix: 'N/A',
        length: 'N/A',
        race_distance: 'N/A',
        lap_record_time: 'N/A',
        lap_record_holder: 'N/A',
        top_speed: 'N/A',
        pole_position: 'N/A',
        corners: 'N/A',
        drs_zones: 'N/A',
        direction: 'N/A',
        elevation_change: 'N/A',
        full_throttle: 'N/A',
        downforce_level: 'N/A',
        fuel_use_per_lap: 'N/A',
        pit_stop_time_loss: 'N/A'
      }
      
      return hungaroring_data
    },

    map_f1api_data(circuit_data) {
      // Handle if circuit_data is an array, take the first result
      // console.log(circuit_data.circuits[0]);
      const data = circuit_data.circuits[0] || []
      // console.log("data - ", data);
      
      if (data == []) return this.get_fallback_data()
      
      return {
        first_grand_prix: data.firstParticipationYear || 'N/A',
        city: data.city || 'N/A',
        country: data.country || 'N/A',
        length: (data.circuitLength/1000) + ' km' || 'N/A',
        // race_distance: data.race_distance || 'N/A',
        lap_record_time: data.lapRecord || 'N/A',
        lap_record_holder: data.fastestLapDriverId || 'N/A',
        fastest_lap_year: data.fastestLapYear || 'N/A',
        fastest_lap_team: data.fastestLapTeamId || 'N/A',
        // top_speed: data.top_speed || 'N/A',
        // pole_position: data.pole_position_side || 'N/A',
        corners: data.numberOfCorners || 'N/A',
        // drs_zones: data.drs_zones || 'N/A',
        // direction: data.direction || 'N/A',
        // elevation_change: data.elevation || 'N/A',
        // full_throttle: data.full_throttle_percentage || 'N/A',
        // downforce_level: data.downforce_level || 'N/A',
        // fuel_use_per_lap: data.fuel_consumption || 'N/A',
        // pit_stop_time_loss: data.pit_stop_time_loss || 'N/A'
      }
    },

    async fetch_circuit_stats(circuit_name, circuit_id = '') {
      this.loading = true
      try {
        // Get proper search query
        // const search_query = this.get_search_query(circuit_name, circuit_id)
        // console.log('Searching for circuit with query:', search_query)
        
        // Get raw data from API
        this.raw_circuit_data = await api_service.get_circuit_stats(circuit_name)
        console.log('Raw circuit data:', this.raw_circuit_data)
        
        // Map and store the processed data
        this.circuit_stats = this.map_f1api_data(this.raw_circuit_data)
        console.log('Mapped circuit stats:', this.circuit_stats)
        
      } catch (error) {
        console.error('Error fetching circuit stats:', error)
        this.circuit_stats = this.get_fallback_data()
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetch_race_schedule(year = new Date().getFullYear()) {
      this.loading = true
      this.error = null
      
      try {
        console.log('Fetching races for year:', year)
        const races = await api_service.get_race_schedule(year)
        console.log('Races fetched:', races)
        
        this.current_year_races = races
        this.determine_next_and_previous_race()
      } catch (error) {
        console.error('Store error:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async determine_next_and_previous_race() {
      const now = new Date()
      const today_start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      let next_race = null
      let previous_race = null
      
      for (let i = 0; i < this.current_year_races.length; i++) {
        const race = this.current_year_races[i]
        const race_date = new Date(race.date)
        const race_date_only = new Date(race_date.getFullYear(), race_date.getMonth(), race_date.getDate())
        
        if (race_date_only >= today_start && !next_race) {
          next_race = race
          previous_race = i > 0 ? this.current_year_races[i - 1] : null
          break
        }
      }
      
      // If no future race found, we're at end of season
      if (!next_race && this.current_year_races.length > 0) {
        previous_race = this.current_year_races[this.current_year_races.length - 1]
      }
      
      this.next_race = next_race
      this.previous_race = previous_race
      const prev_meeting_key = await api_service.get_meeting(now.getFullYear(), previous_race)
      this.previous_race.race_session = await this.get_race_session_for_meeting(prev_meeting_key.meeting_key)
      this.previous_race.meeting_key = prev_meeting_key
      
      console.log('Next race:', next_race)
      console.log('Previous race:', previous_race)
    },

    async get_last_race_on_next_race_circuit() {
      console.log("Checking last race held");
      if (!this.next_race) {
        console.warn('No next race available')
        return null
      }

      const circuit_id = this.next_race.Circuit.circuitId
      const current_year = new Date().getFullYear()
      
      // Search through previous years using OpenF1 meetings API
      for (let year = current_year - 1; year >= current_year - 10; year--) {
        try {
          console.log(`Searching for ${circuit_id} in year ${year}`)
          const meetings = await api_service.get_meetings_schedule(year)

          // Use findIndex to get both the meeting and its index
          const meeting_index = meetings.findIndex(meeting => {
            const circuit_id = this.next_race.Circuit.circuitId.toLowerCase()
            const race_base_name = this.next_race.raceName.split(' ')[0].toLowerCase()

            return (
              (typeof meeting.circuit_short_name === 'string' && meeting.circuit_short_name.toLowerCase().includes(circuit_id)) ||
              (typeof meeting.circuit_key === 'string' && meeting.circuit_key.toLowerCase().includes(circuit_id)) ||
              (typeof meeting.meeting_name === 'string' && meeting.meeting_name.toLowerCase().includes(race_base_name))
            )
          })
          // console.log(meeting_index);
          if (meeting_index !== -1) {
            const circuit_meeting = {
              ...meetings[meeting_index],
              round: meeting_index,
              race_session: await this.get_race_session_for_meeting(meetings[meeting_index]?.meeting_key)
            }

            console.log(`Found last race on ${circuit_id} in ${year}:`, circuit_meeting)

            this.last_race_held = circuit_meeting
            console.log("Last race held here - ", this.last_race_held);

            return "Found last race"
          }
        } catch (error) {
          console.warn(`Error fetching meetings for year ${year}:`, error)
        }
      }
      
      return null
    },

    

    async get_race_session_for_meeting(meeting_key) {
      try {
        const sessions = await api_service.get_meeting_sessions(meeting_key)
        return sessions.find(session => session.session_name === 'Race') || null
      } catch (error) {
        console.warn(`Failed to fetch race session for meeting ${meeting_key}`)
        return null
      }
    },

    // Enhanced function to get meeting keys for current next/previous races
    async get_meeting_keys_for_current_races() {
      const result = {
        // next_race_meeting_key: null,
        previous_race_meeting_key: null,
        previous_race_info: null,
        last_race_on_next_circuit: null
      }

      
      // Get latest meeting from OpenF1 (this is the previous/most recent race)
      try {
        const latest_meeting = await api_service.get_latest_meeting()
        console.log('Latest meeting from OpenF1:', latest_meeting)
        
        result.previous_race_meeting_key = latest_meeting.meeting_key
        result.previous_race_info = {
          meeting_name: latest_meeting.meeting_name,
          circuit_name: latest_meeting.circuit_short_name,
          date_start: latest_meeting.date_start,
          location: latest_meeting.location,
          country_name: latest_meeting.country_name
        }
      } catch (error) {
        console.warn('Failed to fetch latest meeting:', error)
      }
      

      // Find current year meeting key for next race using race schedule
      const current_meetings = await api_service.get_meetings_schedule()
      const next_race_meeting = current_meetings.find(meeting => {
        const meeting_date = new Date(meeting.date_start).toISOString().split('T')[0]
        const race_date = this.next_race.date
        return meeting_date === race_date
      })
      
      
      
      // Get last race on next race's circuit
      result.last_race_on_next_circuit = await this.get_last_race_on_next_race_circuit()
      // console.log(result);
      return result
    },


    async get_circuit_history(circuit_id, years_back = 5) {
      const current_year = new Date().getFullYear()
      const historical_data = []
      
      for (let year = current_year - years_back; year < current_year; year++) {
        try {
          const year_races = await api_service.get_race_schedule(year)
          const circuit_race = year_races.find(race => race.Circuit.circuitId === circuit_id)
          
          if (circuit_race) {
            // Get race results for this circuit
            const race_results = await api_service.get_race_results(year, circuit_race.round)
            historical_data.push({
              race: circuit_race,
              results: race_results
            })
          }
        } catch (error) {
          console.warn(`Failed to fetch ${year} data for circuit ${circuit_id}`)
        }
      }
      
      return historical_data
    }
  }
})
