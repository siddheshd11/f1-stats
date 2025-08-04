import axios from 'axios'

const OPENF1_BASE_URL = 'https://api.openf1.org/v1'

export const telemetry_service = {
  telemetry_cache: new Map(),
  
  async fetch_lap_telemetry(session_key, driver_number, lap_info, options = {}) {
    const { quality = 'normal', onProgress } = options
    const cache_key = `${session_key}_${driver_number}_${lap_info.lap_number}_${quality}`
    
    if (this.telemetry_cache.has(cache_key)) {
      console.log(`✅ Using cached telemetry for driver ${driver_number}, lap ${lap_info.lap_number}`)
      return this.telemetry_cache.get(cache_key)
    }
    
    try {
      // FIXED: Calculate lap time boundaries properly
      const lap_start = new Date(lap_info.date_start)
      const lap_end = new Date(lap_start.getTime() + (lap_info.lap_duration * 1000))
      
      // Add small buffer for accuracy (2 seconds before/after)
      const buffer_start = new Date(lap_start.getTime() - 2000)
      const buffer_end = new Date(lap_end.getTime() + 2000)
      
      console.log(`🔄 Fetching telemetry for driver ${driver_number}, lap ${lap_info.lap_number}`)
      console.log(`⏱️ Lap boundaries: ${buffer_start.toISOString()} to ${buffer_end.toISOString()}`)
      
      // FIXED: Use correct API parameter format with comparison operators
      const params = {
        session_key: session_key,
        driver_number: driver_number,
        'date>': buffer_start.toISOString(), // This becomes date%3E= in URL
        'date<': buffer_end.toISOString()     // This becomes date%3C= in URL
      }
      
      const response = await axios.get(`${OPENF1_BASE_URL}/car_data`, {
        params: params,
        timeout: 45000,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        }
      })
      
      let processed_data = response.data
      
      // Apply quality-based sampling
      if (quality === 'fast') {
        processed_data = this.sample_data(processed_data, 3)
      } else if (quality === 'medium') {
        processed_data = this.sample_data(processed_data, 2)
      }
      
      // Filter to exact lap boundaries (remove buffer data)
      const filtered_data = this.filter_to_exact_lap_boundaries(processed_data, lap_info)
      
      this.telemetry_cache.set(cache_key, filtered_data)
      console.log(`✅ Loaded ${filtered_data.length} telemetry points (${quality} quality)`)
      
      return filtered_data
      
    } catch (error) {
      console.error(`❌ Error fetching telemetry:`, error)
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('timeout')
      } else if (error.response?.status === 413) {
        throw new Error('too_large')
      } else if (error.response?.status >= 500) {
        throw new Error('server_error')
      } else if (!navigator.onLine) {
        throw new Error('offline')
      } else {
        throw new Error('unknown')
      }
    }
  },
  
  // FIXED: Filter to exact lap boundaries using lap_info
  filter_to_exact_lap_boundaries(telemetry_data, lap_info) {
    const lap_start = new Date(lap_info.date_start)
    const lap_end = new Date(lap_start.getTime() + (lap_info.lap_duration * 1000))
    
    const filtered = telemetry_data.filter(point => {
      const point_time = new Date(point.date)
      return point_time >= lap_start && point_time <= lap_end
    })
    
    console.log(`🎯 Filtered to exact lap boundaries: ${telemetry_data.length} → ${filtered.length} points`)
    return filtered
  },
  
  sample_data(data_points, sample_rate) {
    if (sample_rate <= 1) return data_points
    
    const sampled = []
    for (let i = 0; i < data_points.length; i += sample_rate) {
      sampled.push(data_points[i])
    }
    
    console.log(`📉 Sampled data: ${data_points.length} → ${sampled.length} points (rate: 1/${sample_rate})`)
    return sampled
  },
  
  clear_cache() {
    this.telemetry_cache.clear()
    console.log('🗑️ Telemetry cache cleared')
  }
}
