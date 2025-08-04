// services/telemetry_lap_mapper.js
export class TelemetryLapMapper {
  
  // Map telemetry data points to specific laps using timestamps
  static map_telemetry_to_laps(telemetry_data, lap_data) {
    const laps_with_telemetry = {}
    
    // Create lap time ranges
    const lap_ranges = lap_data.map(lap => ({
      lap_number: lap.lap_number,
      start_time: new Date(lap.date_start),
      end_time: this.calculate_lap_end_time(lap)
    }))
    
    console.log(`🎯 Mapping ${telemetry_data.length} telemetry points to ${lap_ranges.length} laps`)
    
    // Group telemetry points by lap
    telemetry_data.forEach(point => {
      const point_time = new Date(point.date)
      
      // Find which lap this telemetry point belongs to
      const matching_lap = lap_ranges.find(lap => 
        point_time >= lap.start_time && point_time < lap.end_time
      )
      
      if (matching_lap) {
        if (!laps_with_telemetry[matching_lap.lap_number]) {
          laps_with_telemetry[matching_lap.lap_number] = []
        }
        laps_with_telemetry[matching_lap.lap_number].push(point)
      }
    })
    
    return laps_with_telemetry
  }
  
  static calculate_lap_end_time(lap) {
    const start_time = new Date(lap.date_start)
    // Add lap duration in seconds to get end time
    return new Date(start_time.getTime() + (lap.lap_duration * 1000))
  }
  
  // Downsample telemetry data for visualization
  static downsample_telemetry(telemetry_points, target_points = 500) {
    if (telemetry_points.length <= target_points) return telemetry_points
    
    const step = Math.floor(telemetry_points.length / target_points)
    const downsampled = []
    
    for (let i = 0; i < telemetry_points.length; i += step) {
      downsampled.push(telemetry_points[i])
    }
    
    console.log(`📉 Downsampled ${telemetry_points.length} points to ${downsampled.length}`)
    return downsampled
  }
}
