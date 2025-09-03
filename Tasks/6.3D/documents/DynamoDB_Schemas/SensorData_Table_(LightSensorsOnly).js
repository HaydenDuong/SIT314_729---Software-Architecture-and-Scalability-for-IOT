{
  TableName: "SensorData",
  PartitionKey: "deviceId",        
  SortKey: "timestamp",            
  
  // Sample Record:
  {
    "deviceId": "light_sensor_001",     // Partition Key
    "timestamp": 1678886400000,         // Sort Key
    "location": "living_room",
    "ambientLight": 450,                // lux (0-1000)
    "timeOfDay": "afternoon",           // morning/afternoon/evening/night
    "weatherCondition": "cloudy",       // sunny/cloudy/rainy (affects indoor light)
    "seasonalFactor": 0.8,              // 0.6 (winter) to 1.0 (summer)
    "ttl": 1681478400
  }
}