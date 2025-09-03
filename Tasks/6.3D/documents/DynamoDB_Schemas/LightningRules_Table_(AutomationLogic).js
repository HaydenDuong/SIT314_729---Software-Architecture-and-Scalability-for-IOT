{
  TableName: "LightStates",
  PartitionKey: "lightId",         // e.g., "light_001"
  SortKey: "timestamp",            // Latest state tracking
  
  // Sample Record:
  {
    "lightId": "light_001",             // Partition Key
    "timestamp": 1678886400000,         // Sort Key
    "state": "ON",                      // ON/OFF/DIMMED
    "brightness": 80,                   // 0-100 percentage
    "location": "living_room",
    "triggeredBy": "sensor_001",        // Which sensor triggered this
    "triggerReason": "low_light",       // automation reason
    "manualOverride": false,            // Was this manual?
    "energyConsumption": 12.5,          // Watts (for analytics)
    "ttl": 1681478400                   // Keep 30 days of history
  }
}

// Additional Global Secondary Index (GSI):
// GSI: location-timestamp-index for room-based queries