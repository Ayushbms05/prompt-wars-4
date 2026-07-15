/**
 * stadiumMap.js
 * 
 * Fixed stadium layout data for a FIFA World Cup 2026 venue.
 * This JSON is injected into every navigation prompt so the Gemini model
 * can give accurate, context-aware directions within the stadium.
 * 
 * Structure:
 *  - zones: named areas with type, coordinates (grid-based), and capacity
 *  - paths: connections between zones with estimated walk times
 *  - facilities: points-of-interest fans typically ask about
 */

export const stadiumMap = {
  name: "MetLife Stadium",
  city: "East Rutherford, New Jersey",
  totalCapacity: 82500,

  zones: [
    { id: "gate-a", name: "Gate A (North)", type: "entrance", gridPosition: { row: 0, col: 2 }, capacity: 5000 },
    { id: "gate-b", name: "Gate B (East)", type: "entrance", gridPosition: { row: 2, col: 4 }, capacity: 5000 },
    { id: "gate-c", name: "Gate C (South)", type: "entrance", gridPosition: { row: 4, col: 2 }, capacity: 5000 },
    { id: "gate-d", name: "Gate D (West)", type: "entrance", gridPosition: { row: 2, col: 0 }, capacity: 5000 },
    { id: "north-concourse", name: "North Concourse", type: "concourse", gridPosition: { row: 1, col: 2 }, capacity: 8000 },
    { id: "east-concourse", name: "East Concourse", type: "concourse", gridPosition: { row: 2, col: 3 }, capacity: 8000 },
    { id: "south-concourse", name: "South Concourse", type: "concourse", gridPosition: { row: 3, col: 2 }, capacity: 8000 },
    { id: "west-concourse", name: "West Concourse", type: "concourse", gridPosition: { row: 2, col: 1 }, capacity: 8000 },
    { id: "lower-bowl", name: "Lower Bowl Seating", type: "seating", gridPosition: { row: 2, col: 2 }, capacity: 30000 },
    { id: "upper-deck", name: "Upper Deck Seating", type: "seating", gridPosition: { row: 2, col: 2 }, capacity: 25000 },
    { id: "vip-lounge", name: "VIP Lounge (Level 3)", type: "premium", gridPosition: { row: 1, col: 3 }, capacity: 2000 },
    { id: "media-center", name: "Media Center", type: "operations", gridPosition: { row: 3, col: 3 }, capacity: 500 },
    { id: "field-level", name: "Field Level", type: "restricted", gridPosition: { row: 2, col: 2 }, capacity: 500 },
  ],

  facilities: [
    { id: "restroom-n1", name: "Restrooms N1", type: "restroom", nearZone: "north-concourse", floor: 1 },
    { id: "restroom-n2", name: "Restrooms N2", type: "restroom", nearZone: "north-concourse", floor: 2 },
    { id: "restroom-e1", name: "Restrooms E1", type: "restroom", nearZone: "east-concourse", floor: 1 },
    { id: "restroom-s1", name: "Restrooms S1", type: "restroom", nearZone: "south-concourse", floor: 1 },
    { id: "restroom-w1", name: "Restrooms W1", type: "restroom", nearZone: "west-concourse", floor: 1 },
    { id: "food-court-north", name: "Food Court North", type: "food", nearZone: "north-concourse", floor: 1, options: ["burgers", "tacos", "pizza", "drinks"] },
    { id: "food-court-south", name: "Food Court South", type: "food", nearZone: "south-concourse", floor: 1, options: ["sushi", "salads", "BBQ", "drinks"] },
    { id: "food-kiosk-east", name: "Snack Kiosk East", type: "food", nearZone: "east-concourse", floor: 1, options: ["hot dogs", "nachos", "drinks"] },
    { id: "food-kiosk-west", name: "Snack Kiosk West", type: "food", nearZone: "west-concourse", floor: 1, options: ["pretzels", "ice cream", "drinks"] },
    { id: "merch-store-north", name: "Official Merchandise Store (North)", type: "merchandise", nearZone: "north-concourse", floor: 1 },
    { id: "merch-kiosk-south", name: "Merchandise Kiosk (South)", type: "merchandise", nearZone: "south-concourse", floor: 1 },
    { id: "first-aid-east", name: "First Aid Station (East)", type: "medical", nearZone: "east-concourse", floor: 1 },
    { id: "first-aid-west", name: "First Aid Station (West)", type: "medical", nearZone: "west-concourse", floor: 1 },
    { id: "info-desk-north", name: "Information Desk (North)", type: "info", nearZone: "north-concourse", floor: 1 },
    { id: "info-desk-south", name: "Information Desk (South)", type: "info", nearZone: "south-concourse", floor: 1 },
    { id: "atm-north", name: "ATM (North Concourse)", type: "atm", nearZone: "north-concourse", floor: 1 },
    { id: "atm-south", name: "ATM (South Concourse)", type: "atm", nearZone: "south-concourse", floor: 1 },
    { id: "family-zone", name: "Family Zone & Kids Area", type: "family", nearZone: "west-concourse", floor: 1 },
    { id: "prayer-room", name: "Multi-Faith Prayer Room", type: "prayer", nearZone: "east-concourse", floor: 2 },
    { id: "accessibility-center", name: "Accessibility Services Center", type: "accessibility", nearZone: "north-concourse", floor: 1 },
  ],

  paths: [
    { from: "gate-a", to: "north-concourse", walkMinutes: 2, accessible: true },
    { from: "gate-b", to: "east-concourse", walkMinutes: 2, accessible: true },
    { from: "gate-c", to: "south-concourse", walkMinutes: 2, accessible: true },
    { from: "gate-d", to: "west-concourse", walkMinutes: 2, accessible: true },
    { from: "north-concourse", to: "east-concourse", walkMinutes: 5, accessible: true },
    { from: "north-concourse", to: "west-concourse", walkMinutes: 5, accessible: true },
    { from: "south-concourse", to: "east-concourse", walkMinutes: 5, accessible: true },
    { from: "south-concourse", to: "west-concourse", walkMinutes: 5, accessible: true },
    { from: "north-concourse", to: "south-concourse", walkMinutes: 10, accessible: true },
    { from: "east-concourse", to: "west-concourse", walkMinutes: 10, accessible: true },
    { from: "north-concourse", to: "lower-bowl", walkMinutes: 3, accessible: true },
    { from: "east-concourse", to: "lower-bowl", walkMinutes: 3, accessible: true },
    { from: "south-concourse", to: "lower-bowl", walkMinutes: 3, accessible: true },
    { from: "west-concourse", to: "lower-bowl", walkMinutes: 3, accessible: true },
    { from: "north-concourse", to: "upper-deck", walkMinutes: 5, accessible: false, note: "Stairs or elevator required" },
    { from: "east-concourse", to: "upper-deck", walkMinutes: 5, accessible: false, note: "Stairs or elevator required" },
    { from: "south-concourse", to: "upper-deck", walkMinutes: 5, accessible: false, note: "Stairs or elevator required" },
    { from: "west-concourse", to: "upper-deck", walkMinutes: 5, accessible: false, note: "Stairs or elevator required" },
    { from: "east-concourse", to: "vip-lounge", walkMinutes: 4, accessible: true, note: "VIP pass required" },
    { from: "south-concourse", to: "media-center", walkMinutes: 3, accessible: true, note: "Media credentials required" },
  ],
};

/**
 * Returns a compact string representation of the stadium map
 * suitable for inclusion in AI prompts.
 */
export function getStadiumMapContext() {
  return JSON.stringify(stadiumMap, null, 2);
}
