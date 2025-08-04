<template>
  <div class="space-y-3">
    <div class="hidden sm:flex items-center justify-between border-b border-gray-700 pb-2">
      <h3 class="text-white text-base font-medium">Weekend Schedule</h3>
      <div class="text-xs text-gray-400">
        <span>{{ user_timezone_label }}</span>
        <span class="mx-1">•</span>
        <span>{{ race_timezone_label }}</span>
      </div>
    </div>
    
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
    
      <div v-else-if="error" class="text-center py-4">
        <div class="text-red-400 text-sm">{{ error }}</div>
      </div>
      
      <div v-else class="space-y-2">
        <div 
          v-for="session in weekend_sessions"
          :key="session.name"
          class="bg-gray-800/50 border border-gray-700/50 rounded p-2.5 flex items-center justify-between hover:bg-gray-800 transition-colors"
        >
          <!-- Left: Session Info -->
          <div class="flex items-center space-x-2.5">
            <div 
              class="w-2 h-2 rounded-full flex-shrink-0"
              :class="get_session_color(session.name)"
            ></div>
            <div class="min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ session.name }}</p>
              <p class="text-gray-400 text-xs">{{ session.duration }}</p>
            </div>
          </div>

          <!-- Right: Time Info -->
          <div class="text-right flex-shrink-0 ml-3">
            <div class="flex space-x-3 text-sm">
              <div>
                <p class="text-white font-medium">{{ session.time_local }}</p>
                <p class="text-gray-500 text-xs">Local</p>
              </div>
              <div>
                <p class="text-gray-300 font-medium">{{ session.time_race }}</p>
                <p class="text-gray-500 text-xs">Race</p>
              </div>
            </div>
            <p class="text-gray-400 text-xs mt-1">{{ session.date }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { api_service } from '@/services/api.js'

export default {
  name: 'RaceSchedule',
  
  data() {
    return {
      next_race_data: null,
      loading: false,
      error: null,
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      race_timezone: null
    }
  },
  
  computed: {
    user_timezone_label() {
      return this.format_timezone_label(this.user_timezone, 'Local')
    },
    
    race_timezone_label() {
      return this.format_timezone_label(this.race_timezone, 'Race')
    },

    user_timezone_short() {
      return this.get_timezone_short(this.user_timezone)
    },
    
    race_timezone_short() {
      return this.get_timezone_short(this.race_timezone)
    },
    
    weekend_sessions() {
      if (!this.next_race_data?.race?.[0]?.schedule) {
        return []
      }
      
      const schedule = this.next_race_data.race[0].schedule
      const sessions = []
      
      // Define session mapping with proper names and durations
      const session_mapping = {
        fp1: { name: 'Practice 1', duration: '90m' },
        fp2: { name: 'Practice 2', duration: '90m' },
        fp3: { name: 'Practice 3', duration: '60m' },
        sprintQualy: { name: 'Sprint Qualifying', duration: '30m' },
        sprintRace: { name: 'Sprint', duration: '30m' },
        qualy: { name: 'Qualifying', duration: '60m' },
        race: { name: 'Race', duration: '2h' }
      }
      
      // Process each session in the schedule
      Object.keys(session_mapping).forEach(key => {
        const session_data = schedule[key]
        if (session_data && session_data.date && session_data.time) {
          try {
            // Create UTC datetime from the API data
            const utc_datetime = new Date(`${session_data.date}T${session_data.time}`)
            
            if (!isNaN(utc_datetime.getTime())) {
              sessions.push({
                name: session_mapping[key].name,
                duration: session_mapping[key].duration,
                date: this.format_session_date(utc_datetime),
                time_local: this.format_time_in_timezone(utc_datetime, this.user_timezone),
                time_race: this.format_time_in_timezone(utc_datetime, this.race_timezone),
                raw_datetime: utc_datetime,
                session_key: key
              })
            }
          } catch (error) {
            console.error(`Error processing session ${key}:`, error)
          }
        }
      })
      
      // Sort sessions by datetime
      return sessions.sort((a, b) => a.raw_datetime - b.raw_datetime)
    }
  },
  
  async mounted() {
    await this.fetch_next_race_data()
  },
  
  methods: {
    format_timezone_label(timezone_name) {
      if (!timezone_name) return 'UTC';

      try {
        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone_name,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        const parts = dtf.formatToParts(new Date());
        const localHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
        const localMinute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        const localSecond = parseInt(parts.find(p => p.type === 'second')?.value || '0', 10);

        const local = new Date();
        local.setUTCHours(localHour, localMinute, localSecond, 0);

        const now = new Date();
        const offsetMs = local.getTime() - now.getTime();
        const offsetMinutes = Math.round(offsetMs / 60000);

        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absOffset = Math.abs(offsetMinutes);
        const hours = Math.floor(absOffset / 60);
        const minutes = absOffset % 60;

        const offset = `GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

        const city = timezone_name.split('/').pop().replace(/_/g, ' ');

        return `${offset} ${city}`;
      } catch (error) {
        return 'UTC';
      }
    },


    async fetch_next_race_data() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Fetching next race data from f1api.dev...')
        this.next_race_data = await api_service.get_next_race_f1api()
        
        if (this.next_race_data?.race?.[0]) {
          this.set_race_timezone(this.next_race_data.race[0])
        }
        
        console.log('Next race data loaded:', this.next_race_data)
        
      } catch (error) {
        console.error('Error fetching next race data:', error)
        this.error = 'Failed to load race schedule'
      } finally {
        this.loading = false
      }
    },
    
    set_race_timezone(race_data) {
      // Circuit timezone mapping
      const circuit_timezones = {
        'hungaroring': 'Europe/Budapest',
        'silverstone': 'Europe/London',
        'monza': 'Europe/Rome',
        'spa-francorchamps': 'Europe/Brussels',
        'monaco': 'Europe/Monaco',
        'interlagos': 'America/Sao_Paulo',
        'suzuka': 'Asia/Tokyo',
        'marina_bay': 'Asia/Singapore',
        'yas_marina': 'Asia/Dubai',
        'albert_park': 'Australia/Melbourne',
        'bahrain': 'Asia/Bahrain',
        'jeddah': 'Asia/Riyadh',
        'imola': 'Europe/Rome',
        'miami': 'America/New_York',
        'catalunya': 'Europe/Madrid',
        'baku': 'Asia/Baku',
        'montreal': 'America/Toronto',
        'red_bull_ring': 'Europe/Vienna',
        'zandvoort': 'Europe/Amsterdam',
        'austin': 'America/Chicago',
        'mexico_city': 'America/Mexico_City',
        'las_vegas': 'America/Los_Angeles'
      }
      
      const circuit_id = race_data.circuit?.circuitId?.toLowerCase() || ''
      const country = race_data.circuit?.country || ''
      
      this.race_timezone = circuit_timezones[circuit_id] || 
                          this.get_timezone_by_country(country) || 
                          'UTC'
      
      console.log(`Set race timezone to: ${this.race_timezone} for circuit: ${circuit_id}`)
    },
    
    get_timezone_by_country(country) {
      const country_timezones = {
        'Hungary': 'Europe/Budapest',
        'UK': 'Europe/London',
        'United Kingdom': 'Europe/London',
        'Italy': 'Europe/Rome',
        'Belgium': 'Europe/Brussels',
        'Monaco': 'Europe/Monaco',
        'Brazil': 'America/Sao_Paulo',
        'Japan': 'Asia/Tokyo',
        'Singapore': 'Asia/Singapore',
        'UAE': 'Asia/Dubai',
        'Australia': 'Australia/Melbourne',
        'Bahrain': 'Asia/Bahrain',
        'Saudi Arabia': 'Asia/Riyadh',
        'USA': 'America/New_York',
        'Spain': 'Europe/Madrid',
        'Azerbaijan': 'Asia/Baku',
        'Canada': 'America/Toronto',
        'Austria': 'Europe/Vienna',
        'Netherlands': 'Europe/Amsterdam',
        'Mexico': 'America/Mexico_City'
      }
      return country_timezones[country]
    },
    
    format_time_in_timezone(utc_datetime, timezone) {
      if (!timezone) timezone = 'UTC'
      
      try {
        return utc_datetime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timezone
        })
      } catch (error) {
        console.error(`Error formatting time in timezone ${timezone}:`, error)
        return 'Invalid'
      }
    },
    
    format_session_date(datetime) {
      try {
        return datetime.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: this.user_timezone
        })
      } catch (error) {
        return 'Invalid Date'
      }
    },
    
    get_timezone_short(timezone) {
      if (!timezone) return 'UTC'
      
      try {
        // Get the abbreviated timezone name
        const now = new Date()
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          timeZoneName: 'short'
        })
        
        const parts = formatter.formatToParts(now)
        const timeZonePart = parts.find(part => part.type === 'timeZoneName')
        
        return timeZonePart ? timeZonePart.value : timezone.split('/')[1] || 'UTC'
      } catch (error) {
        return timezone.split('/')[1] || 'UTC'
      }
    },
    
    get_session_color(session_name) {
      const colors = {
        'Practice 1': 'bg-blue-400',
        'Practice 2': 'bg-blue-400',
        'Practice 3': 'bg-green-400',
        'Qualifying': 'bg-yellow-400',
        'Sprint Qualifying': 'bg-orange-400',
        'Sprint': 'bg-purple-400',
        'Race': 'bg-red-400'
      }
      return colors[session_name] || 'bg-gray-400'
    }
  }
}
</script>
