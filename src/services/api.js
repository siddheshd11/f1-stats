import axios from 'axios'

const OPENF1_BASE_URL = 'https://api.openf1.org/v1'
const ERGAST_BASE_URL = 'https://api.jolpi.ca/ergast/f1'
const F1_API_BASE_URL = 'https://f1api.dev/api'

export const api_service = {

  async get_session_drivers(session_key) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/drivers`, {
        params: {
          session_key: session_key
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching session drivers:', error)
      throw error
    }
  },

  async get_driver_laps(session_key, driver_number) {
    try {
      console.log(`🔄 Fetching laps for driver ${driver_number} in session ${session_key}`)
      const response = await axios.get(`${OPENF1_BASE_URL}/laps`, {
        params: {
          session_key: session_key,
          driver_number: driver_number
        }
      })
      console.log(`✅ Driver ${driver_number} laps:`, response.data.length, 'laps found')
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching laps for driver ${driver_number}:`, error)
      throw error
    }
  },

  // Get sector data for a specific driver and lap
  async get_lap_sectors(session_key, driver_number, lap_number) {
    try {
      console.log(`🔄 Fetching sectors for driver ${driver_number}, lap ${lap_number}`)
      const response = await axios.get(`${OPENF1_BASE_URL}/laps`, {
        params: {
          session_key: session_key,
          driver_number: driver_number,
          lap_number: lap_number
        }
      })
      console.log(`✅ Sectors found:`, response.data.length, 'records')
      return response.data
    } catch (error) {
      console.error(`❌ Error fetching sectors:`, error)
      throw error
    }
  },

  async get_latest_race_results() {
    try {
      const response = await axios.get(`${F1_API_BASE_URL}/current/last/race`)
      return response.data
    } catch (error) {
      console.error('Error fetching latest race results from f1api.dev:', error)
      throw error
    }
  },

  async get_next_race_f1api() {
    try {
      const response = await axios.get('https://f1api.dev/api/current/next')
      return response.data
    } catch (error) {
      console.error('Error fetching next race from f1api.dev:', error)
      throw error
    }
  },

  // Get latest qualifying results from f1api.dev
  async get_latest_qualifying_results() {
    try {
      const response = await axios.get(`${F1_API_BASE_URL}/current/last/qualy`)
      return response.data
    } catch (error) {
      console.error('Error fetching latest qualifying results from f1api.dev:', error)
      throw error
    }
  },

  async get_weather_data(session_key) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/weather`, {
        params: {
          session_key: session_key
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching weather data from OpenF1:', error)
      throw error
    }
  },

  async get_weather_forecast(lat, lon) {
    try {
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code',
          forecast_days: 5,
          timezone: 'auto'
        }
      })
      
      return this.format_open_meteo_data(response.data)
    } catch (error) {
      console.error('Error fetching weather forecast from Open-Meteo:', error)
      throw error
    }
  },

  // Format Open-Meteo data to match our expected structure
  format_open_meteo_data(data) {
    const formatted_list = []
    
    if (!data.hourly) return { list: formatted_list }
    
    const times = data.hourly.time
    const temps = data.hourly.temperature_2m
    const humidity = data.hourly.relative_humidity_2m
    const precipitation = data.hourly.precipitation_probability
    const weather_codes = data.hourly.weather_code
    
    for (let i = 0; i < times.length; i++) {
      formatted_list.push({
        dt: Math.floor(new Date(times[i]).getTime() / 1000),
        main: {
          temp: temps[i] || 20,
          humidity: humidity[i] || 60
        },
        weather: [{
          main: this.weather_code_to_condition(weather_codes[i])
        }],
        pop: (precipitation[i] || 0) / 100 // Convert percentage to decimal
      })
    }
    
    return {
      list: formatted_list
    }
  },

  // Convert Open-Meteo weather codes to our weather conditions
  weather_code_to_condition(code) {
    const weather_map = {
      0: 'Clear',      // Clear sky
      1: 'Clear',      // Mainly clear
      2: 'Clouds',     // Partly cloudy
      3: 'Clouds',     // Overcast
      45: 'Mist',      // Fog
      48: 'Mist',      // Depositing rime fog
      51: 'Drizzle',   // Light drizzle
      53: 'Drizzle',   // Moderate drizzle
      55: 'Drizzle',   // Dense drizzle
      56: 'Drizzle',   // Light freezing drizzle
      57: 'Drizzle',   // Dense freezing drizzle
      61: 'Rain',      // Slight rain
      63: 'Rain',      // Moderate rain
      65: 'Rain',      // Heavy rain
      66: 'Rain',      // Light freezing rain
      67: 'Rain',      // Heavy freezing rain
      71: 'Snow',      // Slight snow fall
      73: 'Snow',      // Moderate snow fall
      75: 'Snow',      // Heavy snow fall
      77: 'Snow',      // Snow grains
      80: 'Rain',      // Slight rain showers
      81: 'Rain',      // Moderate rain showers
      82: 'Rain',      // Violent rain showers
      85: 'Snow',      // Slight snow showers
      86: 'Snow',      // Heavy snow showers
      95: 'Thunderstorm', // Thunderstorm
      96: 'Thunderstorm', // Thunderstorm with slight hail
      99: 'Thunderstorm'  // Thunderstorm with heavy hail
    }
    
    return weather_map[code] || 'Clear'
  },

  async get_race_control_data(session_key) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/race_control`, {
        params: {
          session_key: session_key
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching race control data from OpenF1:', error)
      throw error
    }
  },

  async get_stint_data(session_key) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/stints`, {
        params: {
          session_key: session_key
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching stint data from OpenF1:', error)
      throw error
    }
  },

  async get_race_results_f1api(year, round) {
    try {
      const response = await axios.get(`${F1_API_BASE_URL}/${year}/${round}/race`)
      return response.data
    } catch (error) {
      console.error('Error fetching race results from f1api.dev:', error)
      throw error
    }
  },

  // Get qualifying results from f1api.dev
  async get_qualifying_results_f1api(year, round) {
    try {
      const response = await axios.get(`${F1_API_BASE_URL}/${year}/${round}/qualy`)
      return response.data
    } catch (error) {
      console.error('Error fetching qualifying results from f1api.dev:', error)
      throw error
    }
  },

  // Get drivers data from local JSON
  async get_drivers_data() {
    try {
      const response = await axios.get('/data/drivers.json')
      return response.data
    } catch (error) {
      console.error('Error fetching drivers data:', error)
      throw error
    }
  },

  async get_race_schedule(year = new Date().getFullYear()) {
    try {
      const response = await axios.get(`${ERGAST_BASE_URL}/${year}/races.json`)
      return response.data.MRData.RaceTable.Races
    } catch (error) {
      console.error('Error fetching race schedule from Ergast:', error)
      throw error
    }
  },

  // Get race results from Ergast
  async get_race_results(year, round) {
    try {
      const response = await axios.get(`${ERGAST_BASE_URL}/${year}/${round}/results.json`)
      return response.data.MRData.RaceTable.Races[0]
    } catch (error) {
      console.error('Error fetching race results:', error)
      throw error
    }
  },

  async get_circuit_stats(search_query) {
    try {
      const response = await axios.get(`${F1_API_BASE_URL}/circuits/search?q=${search_query}`)
      console.log("Circuit Stats: ", response.data);
      return response.data
    } catch (error) {
      console.error('Error fetching circuit stats from f1api.dev:', error)
      throw error
    }
  },

  async get_meeting(year, race){
    
    const { data: meetings } = await axios.get(`${OPENF1_BASE_URL}/meetings`, {
      params: { year },
    });

    if (!Array.isArray(meetings) || meetings.length === 0) {
      throw new Error(`No meetings found for season ${year}`);
    }

    const targetRace = race.meeting_name;
    const meeting = meetings.find((m) =>
      m.meeting_name.toLowerCase().includes(targetRace) ||
      m.circuit_short_name.toLowerCase().includes(race.Circuit?.circuitId) ||
      m.location.toLowerCase().includes(race.Circuit?.circuitName)
    );

    if (meeting) {
      return meeting;
    }
  },

  async get_latest_meeting() {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/meetings`, {
        params: {
          meeting_key: 'latest'
        }
      })
      return response.data[0] // Returns single meeting object
    } catch (error) {
      console.error('Error fetching latest meeting from OpenF1:', error)
      throw error
    }
  },

  async get_meetings_schedule(year = new Date().getFullYear()) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/meetings`, {
        params: {
          year: year
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching meetings schedule:', error)
      throw error
    }
  },

  // Get sessions for a specific meeting
  async get_meeting_sessions(meeting_key) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/sessions`, {
        params: {
          meeting_key: meeting_key
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching meeting sessions:', error)
      throw error
    }
  },

  // Get race session specifically
  async get_race_sessions(year = new Date().getFullYear()) {
    try {
      const response = await axios.get(`${OPENF1_BASE_URL}/sessions`, {
        params: {
          year: year,
          session_name: 'Race'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching race sessions:', error)
      throw error
    }
  }
}
