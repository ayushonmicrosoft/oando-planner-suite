import { Router, type IRouter } from "express";
import { GetAiAdviceBody } from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

interface SpatialItem {
  x: number;
  y: number;
  widthCm: number;
  depthCm: number;
  rotation: number;
  name: string;
}

interface CategorizedAdvice {
  advice: string;
  suggestions: string[];
  issues: string[];
  positives: string[];
}

router.post(
  "/ai/advisor",
  asyncHandler(async (req, res) => {
    const parsed = GetAiAdviceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request: " + parsed.error.message, status: 400 });
      return;
    }

    const { roomWidthCm, roomDepthCm, query, categories, itemCount } = parsed.data;
    const items: SpatialItem[] = (req.body.items as SpatialItem[]) || [];
    const areaSqM = (roomWidthCm * roomDepthCm) / 10000;

    const advice = generateAdvice(query, roomWidthCm, roomDepthCm, areaSqM, categories ?? [], itemCount ?? 0);
    const oldSuggestions = generateSuggestions(query, areaSqM, categories ?? [], itemCount ?? 0);

    if (items.length > 0) {
      const spatial = runSpatialAnalysis(items, roomWidthCm, roomDepthCm);
      const mergedSuggestions = [...spatial.suggestions, ...oldSuggestions];
      const uniqueSuggestions = [...new Set(mergedSuggestions)].slice(0, 8);
      res.json({
        advice,
        suggestions: uniqueSuggestions,
        issues: spatial.issues,
        positives: spatial.positives,
      } satisfies CategorizedAdvice);
    } else {
      const categorized = categorizeSuggestions(advice, oldSuggestions, areaSqM, itemCount ?? 0);
      res.json(categorized);
    }
  }),
);

function runSpatialAnalysis(
  items: SpatialItem[],
  roomWidthCm: number,
  roomDepthCm: number,
): { issues: string[]; suggestions: string[]; positives: string[] } {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const positives: string[] = [];

  for (const item of items) {
    if (item.x < 30) {
      issues.push(`"${item.name}" is only ${Math.round(item.x)}cm from the left wall (minimum 30cm recommended)`);
    }
    if (item.y < 30) {
      issues.push(`"${item.name}" is only ${Math.round(item.y)}cm from the top wall (minimum 30cm recommended)`);
    }
    const rightEdge = item.x + item.widthCm;
    const bottomEdge = item.y + item.depthCm;
    if (roomWidthCm - rightEdge < 30 && roomWidthCm - rightEdge >= 0) {
      issues.push(`"${item.name}" is only ${Math.round(roomWidthCm - rightEdge)}cm from the right wall (minimum 30cm recommended)`);
    }
    if (roomDepthCm - bottomEdge < 30 && roomDepthCm - bottomEdge >= 0) {
      issues.push(`"${item.name}" is only ${Math.round(roomDepthCm - bottomEdge)}cm from the bottom wall (minimum 30cm recommended)`);
    }
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.widthCm, b.x + b.widthCm));
      const dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.depthCm, b.y + b.depthCm));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dx === 0 && dy === 0) {
        const overlapX = Math.min(a.x + a.widthCm, b.x + b.widthCm) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.depthCm, b.y + b.depthCm) - Math.max(a.y, b.y);
        if (overlapX > 5 && overlapY > 5) {
          issues.push(`"${a.name}" and "${b.name}" are overlapping`);
        }
      } else if (dist < 90) {
        issues.push(`Clearance between "${a.name}" and "${b.name}" is only ${Math.round(dist)}cm (minimum 90cm for aisle)`);
      }
    }
  }

  const totalFurnitureArea = items.reduce((sum, item) => sum + (item.widthCm * item.depthCm), 0);
  const roomArea = roomWidthCm * roomDepthCm;
  const coveragePercent = (totalFurnitureArea / roomArea) * 100;

  const gridSize = 200;
  const cols = Math.ceil(roomWidthCm / gridSize);
  const rows = Math.ceil(roomDepthCm / gridSize);
  const emptyZones: string[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const zoneX = c * gridSize;
      const zoneY = r * gridSize;
      const zoneW = Math.min(gridSize, roomWidthCm - zoneX);
      const zoneH = Math.min(gridSize, roomDepthCm - zoneY);
      const zoneArea = zoneW * zoneH;

      if (zoneArea < 40000) continue;

      const hasItem = items.some((item) => {
        return (
          item.x < zoneX + zoneW &&
          item.x + item.widthCm > zoneX &&
          item.y < zoneY + zoneH &&
          item.y + item.depthCm > zoneY
        );
      });

      if (!hasItem) {
        emptyZones.push(`${Math.round(zoneX / 100)}m,${Math.round(zoneY / 100)}m`);
      }
    }
  }

  if (emptyZones.length > 0 && emptyZones.length <= 4) {
    suggestions.push(`Large empty zones detected near coordinates: ${emptyZones.join("; ")} — consider adding furniture or defining activity zones`);
  } else if (emptyZones.length > 4) {
    suggestions.push(`${emptyZones.length} large empty zones detected — the room appears under-furnished. Consider adding more workstations or zones`);
  }

  if (coveragePercent > 60) {
    issues.push(`Floor coverage is ${coveragePercent.toFixed(0)}% — room may be overcrowded. Aim for under 50% for comfortable circulation`);
  } else if (coveragePercent > 40) {
    suggestions.push(`Floor coverage is ${coveragePercent.toFixed(0)}% — approaching comfortable limit. Ensure clear aisles are maintained`);
  }

  if (issues.length === 0) {
    positives.push("No clearance violations detected between items");
  }
  if (!items.some((i) => i.x < 30 || i.y < 30)) {
    positives.push("All items maintain proper wall clearance (≥30cm)");
  }
  if (coveragePercent >= 15 && coveragePercent <= 40) {
    positives.push(`Good floor coverage at ${coveragePercent.toFixed(0)}% — well-balanced furniture density`);
  }
  if (items.length >= 3) {
    positives.push(`Layout has ${items.length} items providing functional coverage`);
  }

  if (issues.length > 6) {
    issues.splice(6);
    issues.push("...and more issues detected. Consider reviewing item placement");
  }

  return { issues, suggestions, positives };
}

function categorizeSuggestions(
  advice: string,
  suggestions: string[],
  areaSqM: number,
  itemCount: number,
): CategorizedAdvice {
  const issues: string[] = [];
  const positives: string[] = [];

  if (itemCount > Math.floor(areaSqM / 3)) {
    issues.push("Room may be over-furnished — check emergency exit clearances");
  }
  if (itemCount === 0) {
    issues.push("Room is empty — add furniture to begin planning");
  }

  if (itemCount > 0 && itemCount <= Math.floor(areaSqM / 3)) {
    positives.push("Furniture density is within comfortable limits");
  }
  if (areaSqM >= 10) {
    positives.push(`Room size (${areaSqM.toFixed(1)} m²) provides adequate working space`);
  }

  return { advice, suggestions, issues, positives };
}

function generateAdvice(
  query: string,
  widthCm: number,
  depthCm: number,
  areaSqM: number,
  categories: string[],
  itemCount: number,
): string {
  const lq = query.toLowerCase();

  if (lq.includes("how many") || lq.includes("fit") || lq.includes("capacity")) {
    const workstations = Math.floor(areaSqM / 6);
    const dense = Math.floor(areaSqM / 4.5);
    return `For a ${widthCm}cm × ${depthCm}cm room (${areaSqM.toFixed(1)} sqm), you can comfortably fit approximately ${workstations} standard workstations at 6 sqm per person. For a denser open-plan layout you could reach ${dense}, but 6 sqm per workstation is recommended for comfort, noise management, and building code compliance. Consider also reserving 15–20% of floor area for circulation and shared amenities.`;
  }

  if (lq.includes("meeting") || lq.includes("conference")) {
    const seats = Math.floor(areaSqM / 2.5);
    const execSeats = Math.floor(areaSqM / 3.5);
    return `A ${areaSqM.toFixed(1)} sqm meeting room can seat approximately ${seats} people at standard 2.5 sqm per person. For executive conference setups, allow 3–4 sqm per person for premium comfort (about ${execSeats} seats). Position the main table centrally with at least 90cm clearance to walls for chair movement. Include a credenza or AV console on one short wall.`;
  }

  if (lq.includes("storage") || lq.includes("cabinet") || lq.includes("filing")) {
    return `For a room of this size (${areaSqM.toFixed(1)} sqm), place storage units against perimeter walls to maximize usable floor area. Use pedestal units under desks for personal storage. For shared filing, lateral filing cabinets offer the best capacity-to-footprint ratio. Keep frequently accessed items at 75–150cm height. Consider a locker bank near the entrance for hot-desking environments.`;
  }

  if (lq.includes("aisle") || lq.includes("walkway") || lq.includes("circulation")) {
    return `Primary aisles (main corridors) require a minimum clearance of 120cm for two-way traffic. Secondary aisles between workstations should be at least 90cm. Emergency egress routes must be 120cm unobstructed at all times. For wheelchair accessibility, maintain 150cm turning circles at corridor intersections and doorways. Position main aisles to connect entry/exit points directly.`;
  }

  if (lq.includes("density") || lq.includes("open plan") || lq.includes("collaborative")) {
    return `Open-plan collaborative layouts work best with distinct zones: focus areas (quiet individual workstations, ~60% of space), collaborative areas (grouped benching, writable surfaces, ~30%), and breakout zones (soft seating, informal meeting pods, ~10%). Use acoustic screens between zones. Position collaborative areas near natural light. Maintain 90cm aisles between workstation groups.`;
  }

  if (lq.includes("ergonomic") || lq.includes("flow") || lq.includes("review") || lq.includes("layout")) {
    if (itemCount > 0) {
      const estCoverage = Math.min(((itemCount * 3) / areaSqM) * 100, 95);
      const densityRating = estCoverage > 70 ? "high" : estCoverage > 40 ? "moderate" : "low";
      return `Your current layout has ${itemCount} items in ${areaSqM.toFixed(1)} sqm, giving approximately ${estCoverage.toFixed(0)}% coverage (${densityRating} density). ${
        estCoverage > 70
          ? "Consider removing a few items to improve circulation. Maintain at least 30% clear floor area for comfortable movement and emergency egress."
          : estCoverage > 40
            ? "Good balance of furniture and open space. Ensure main walkways are at least 90cm wide and workstations are positioned to minimize glare from windows."
            : "You have significant room to add more furniture. Consider adding storage along walls, a soft seating zone, or additional workstations."
      }`;
    }
    return `For a ${widthCm}cm × ${depthCm}cm workspace (${areaSqM.toFixed(1)} sqm), start by placing large anchor pieces first: workstations and conference tables define traffic flow. Then add storage along walls to maximize floor area. Position seating with 90cm minimum clearance. Place screens or plants to create visual separation between functional zones.`;
  }

  if (lq.includes("executive") || lq.includes("private") || lq.includes("office")) {
    return `For an executive office of ${areaSqM.toFixed(1)} sqm, position the main desk facing the door (power position) with a credenza behind it. Include a small meeting area (2–4 chairs around a side table) separate from the desk zone. Allow at least 100cm clearance around the desk for chair movement. A bookcase or display unit on one wall adds both storage and presence.`;
  }

  if (lq.includes("breakout") || lq.includes("lounge") || lq.includes("relax")) {
    return `In a ${areaSqM.toFixed(1)} sqm breakout area, create 2–3 intimate seating clusters using sofas and lounge chairs. Include a mix of high and low tables for flexibility. Position the area near natural light but away from high-traffic corridors. Add planters for visual separation from work areas. Keep power outlets accessible near seating for device charging.`;
  }

  if (itemCount > 0) {
    const coverage = Math.min(((itemCount * 3) / areaSqM) * 100, 95);
    return `Your current layout uses approximately ${coverage.toFixed(0)}% of the room's usable area with ${itemCount} items. ${
      coverage > 70
        ? "Consider removing items to improve circulation. Maintain at least 30% clear floor area."
        : "You have room to add more furniture. Consider storage, soft seating, or additional workstations."
    }`;
  }

  return `For a ${widthCm}cm × ${depthCm}cm workspace (${areaSqM.toFixed(1)} sqm), start by placing large anchor pieces (workstations, tables) first to define circulation paths. Add storage along perimeter walls. Finish with seating and accessories. Maintain 90cm minimum clearance around all work positions and 120cm for primary aisles.`;
}

function generateSuggestions(
  query: string,
  areaSqM: number,
  categories: string[],
  itemCount: number,
): string[] {
  const suggestions: string[] = [];
  const lq = query.toLowerCase();

  suggestions.push("Allow 90–120cm circulation clearance between furniture groups");
  suggestions.push("Position workstations perpendicular to windows to minimize screen glare");

  if (areaSqM > 30) {
    suggestions.push("Create distinct activity zones for focus, collaboration, and breakout areas");
  }

  if (areaSqM > 50) {
    suggestions.push("Consider acoustic panels or high-back pods to manage noise in the open plan");
  }

  if (!categories.includes("storage")) {
    suggestions.push("Add perimeter storage to maximize usable floor area and reduce desk clutter");
  }

  if (!categories.includes("soft-seating")) {
    suggestions.push("Include a soft seating zone for informal discussions and employee wellbeing");
  }

  if (itemCount > 0 && itemCount < Math.floor(areaSqM / 8)) {
    suggestions.push("Room appears under-furnished — consider adding more workstations or collaborative furniture");
  }

  if (itemCount > Math.floor(areaSqM / 3)) {
    suggestions.push("Room may be over-furnished — check that all emergency exits have 120cm clear access");
  }

  if (lq.includes("ergonomic") || lq.includes("review") || lq.includes("layout")) {
    suggestions.push("Ensure monitor distance is 50–70cm from user eyes at each workstation");
    suggestions.push("Provide adjustable chairs with lumbar support at every workstation");
  }

  suggestions.push("Ensure all emergency exits have unobstructed 120cm access at all times");

  return suggestions.slice(0, 6);
}

export default router;
