/**
 * mockIncidents.js
 * 
 * Simulated incident logs for the organizer dashboard.
 * Each entry represents a real-time event that stadium operations
 * staff would need to respond to. The AI summarizer will prioritize
 * these and generate staffing recommendations.
 */

export const mockIncidents = [
  {
    id: "INC-001",
    timestamp: "2026-07-14T19:12:00Z",
    severity: "high",
    type: "medical",
    zone: "Lower Bowl Seating - Section 114",
    description: "Fan collapsed in section 114, row 22. Bystanders report possible heat exhaustion. First aid team dispatched from East station.",
    status: "in-progress",
    assignedTeam: "Medical Unit Alpha",
  },
  {
    id: "INC-002",
    timestamp: "2026-07-14T19:25:00Z",
    severity: "critical",
    type: "crowd-control",
    description: "Gate A (North) approaching maximum capacity. Crowd pushing against barriers. Risk of crush incident if inflow is not redirected.",
    zone: "Gate A (North)",
    status: "open",
    assignedTeam: null,
  },
  {
    id: "INC-003",
    timestamp: "2026-07-14T19:30:00Z",
    severity: "medium",
    type: "facility",
    description: "Water fountain malfunction in North Concourse near Restrooms N1. Water pooling on floor creating slip hazard.",
    zone: "North Concourse",
    status: "open",
    assignedTeam: null,
  },
  {
    id: "INC-004",
    timestamp: "2026-07-14T19:45:00Z",
    severity: "low",
    type: "security",
    description: "Unauthorized vendor selling merchandise outside Gate D. Local police notified. No immediate safety risk.",
    zone: "Gate D (West) - External",
    status: "monitoring",
    assignedTeam: "Security Patrol Bravo",
  },
  {
    id: "INC-005",
    timestamp: "2026-07-14T19:50:00Z",
    severity: "high",
    type: "security",
    description: "Altercation between two groups of fans in South Concourse near Food Court South. Security en route. Potential escalation risk.",
    zone: "South Concourse",
    status: "in-progress",
    assignedTeam: "Security Unit Charlie",
  },
];

/**
 * Returns a formatted string of incident data for use in AI prompts.
 */
export function getIncidentContext() {
  return mockIncidents
    .map(inc =>
      `[${inc.id}] ${inc.timestamp} | Severity: ${inc.severity.toUpperCase()} | Type: ${inc.type} | Zone: ${inc.zone} | Status: ${inc.status} | Team: ${inc.assignedTeam || "UNASSIGNED"}\nDescription: ${inc.description}`
    )
    .join("\n\n");
}
