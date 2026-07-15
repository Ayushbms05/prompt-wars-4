/**
 * mockOccupancy.js
 * 
 * Simulated zone-occupancy data representing real-time crowd density
 * at various stadium locations. Values are percentages (0-100).
 * 
 * The crowd-alert generator feeds this data to Gemini so it can
 * produce plain-language congestion warnings and alternate routes.
 */

export const mockOccupancy = [
  { zoneId: "gate-a", zoneName: "Gate A (North)", occupancyPercent: 92, currentCount: 4600, capacity: 5000, trend: "rising" },
  { zoneId: "gate-b", zoneName: "Gate B (East)", occupancyPercent: 45, currentCount: 2250, capacity: 5000, trend: "stable" },
  { zoneId: "gate-c", zoneName: "Gate C (South)", occupancyPercent: 78, currentCount: 3900, capacity: 5000, trend: "rising" },
  { zoneId: "gate-d", zoneName: "Gate D (West)", occupancyPercent: 30, currentCount: 1500, capacity: 5000, trend: "falling" },
  { zoneId: "north-concourse", zoneName: "North Concourse", occupancyPercent: 88, currentCount: 7040, capacity: 8000, trend: "rising" },
  { zoneId: "east-concourse", zoneName: "East Concourse", occupancyPercent: 42, currentCount: 3360, capacity: 8000, trend: "stable" },
  { zoneId: "south-concourse", zoneName: "South Concourse", occupancyPercent: 65, currentCount: 5200, capacity: 8000, trend: "rising" },
  { zoneId: "west-concourse", zoneName: "West Concourse", occupancyPercent: 25, currentCount: 2000, capacity: 8000, trend: "falling" },
  { zoneId: "lower-bowl", zoneName: "Lower Bowl Seating", occupancyPercent: 95, currentCount: 28500, capacity: 30000, trend: "stable" },
  { zoneId: "upper-deck", zoneName: "Upper Deck Seating", occupancyPercent: 70, currentCount: 17500, capacity: 25000, trend: "rising" },
  { zoneId: "food-court-north", zoneName: "Food Court North", occupancyPercent: 85, currentCount: 850, capacity: 1000, trend: "rising" },
  { zoneId: "food-court-south", zoneName: "Food Court South", occupancyPercent: 40, currentCount: 400, capacity: 1000, trend: "stable" },
];

/**
 * Returns a formatted string of occupancy data for use in AI prompts.
 */
export function getOccupancyContext() {
  return mockOccupancy
    .map(z => `${z.zoneName}: ${z.occupancyPercent}% (${z.currentCount}/${z.capacity}, trend: ${z.trend})`)
    .join("\n");
}
