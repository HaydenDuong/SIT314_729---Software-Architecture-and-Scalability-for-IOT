{
  TableName: "LightingRules",
  PartitionKey: "ruleId",          
  
  // Sample Records:
  {
    "ruleId": "morning_rule",
    "timeSlot": "morning",              // 6:00-12:00
    "location": "living_room",
    "ambientThresholds": {
      "sunny": { "min": 600, "brightness": 0 },      // Lights OFF
      "cloudy": { "min": 400, "brightness": 20 },    // Very dim
      "rainy": { "min": 200, "brightness": 40 }      // Low brightness
    },
    "colorTemperature": 5000,           // Cool white (energizing)
    "isActive": true
  },
  {
    "ruleId": "afternoon_rule", 
    "timeSlot": "afternoon",            // 12:00-18:00
    "location": "living_room",
    "ambientThresholds": {
      "sunny": { "min": 500, "brightness": 30 },
      "cloudy": { "min": 300, "brightness": 50 },
      "rainy": { "min": 150, "brightness": 70 }
    },
    "colorTemperature": 4000,           // Neutral white
    "isActive": true
  },
  {
    "ruleId": "evening_rule",
    "timeSlot": "evening",              // 18:00-22:00
    "location": "living_room", 
    "ambientThresholds": {
      "any": { "min": 200, "brightness": 80 }        // Always on in evening
    },
    "colorTemperature": 3000,           // Warm white (relaxing)
    "isActive": true
  },
  {
    "ruleId": "night_rule",
    "timeSlot": "night",                // 22:00-6:00
    "location": "living_room",
    "ambientThresholds": {
      "any": { "min": 50, "brightness": 100 }        // Full brightness when needed
    },
    "colorTemperature": 2700,           // Very warm (sleep-friendly)
    "isActive": true
  }
}