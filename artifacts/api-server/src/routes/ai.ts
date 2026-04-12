import { Router, type IRouter } from "express";
import { GetAiAdviceBody, GenerateAutoLayoutBody } from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";
import OpenAI from "openai";

const router: IRouter = Router();

interface AutoLayoutItem {
  catalogId: string;
  name: string;
  category: string;
  x: number;
  y: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  rotation: number;
  color: string;
  shape: string;
}

interface FurnitureDef {
  catalogId: string;
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color: string;
  shape: string;
  seatCount: number;
}

const CATALOG: Record<string, FurnitureDef> = {
  "ws-straight-120": { catalogId: "ws-straight-120", name: "Straight Desk 1200", category: "workstations", widthCm: 120, depthCm: 60, heightCm: 75, color: "#e8dcc8", shape: "rect", seatCount: 1 },
  "ws-straight-140": { catalogId: "ws-straight-140", name: "Straight Desk 1400", category: "workstations", widthCm: 140, depthCm: 60, heightCm: 75, color: "#e8dcc8", shape: "rect", seatCount: 1 },
  "ws-bench-2": { catalogId: "ws-bench-2", name: "Bench Workstation 2-seater", category: "workstations", widthCm: 240, depthCm: 75, heightCm: 75, color: "#c8b99a", shape: "rect", seatCount: 2 },
  "ws-bench-4": { catalogId: "ws-bench-4", name: "Bench Workstation 4-seater", category: "workstations", widthCm: 480, depthCm: 75, heightCm: 75, color: "#c8b99a", shape: "rect", seatCount: 4 },
  "chair-task-std": { catalogId: "chair-task-std", name: "Task Chair Standard", category: "seating", widthCm: 65, depthCm: 65, heightCm: 90, color: "#3a3a3a", shape: "circle", seatCount: 1 },
  "chair-executive": { catalogId: "chair-executive", name: "Executive Chair", category: "seating", widthCm: 70, depthCm: 72, heightCm: 115, color: "#2c2c2c", shape: "circle", seatCount: 1 },
  "chair-visitor-side": { catalogId: "chair-visitor-side", name: "Visitor Chair", category: "seating", widthCm: 55, depthCm: 55, heightCm: 80, color: "#5a5a5a", shape: "circle", seatCount: 1 },
  "chair-conference": { catalogId: "chair-conference", name: "Conference Chair", category: "seating", widthCm: 60, depthCm: 62, heightCm: 90, color: "#3a3a3a", shape: "circle", seatCount: 1 },
  "chair-training": { catalogId: "chair-training", name: "Training Chair", category: "seating", widthCm: 50, depthCm: 52, heightCm: 85, color: "#4a6a8a", shape: "circle", seatCount: 1 },
  "sofa-2-seat": { catalogId: "sofa-2-seat", name: "2-Seater Sofa", category: "soft-seating", widthCm: 165, depthCm: 80, heightCm: 75, color: "#7a8a6a", shape: "rect", seatCount: 2 },
  "sofa-3-seat": { catalogId: "sofa-3-seat", name: "3-Seater Sofa", category: "soft-seating", widthCm: 225, depthCm: 85, heightCm: 78, color: "#7a8a6a", shape: "rect", seatCount: 3 },
  "lounge-chair-single": { catalogId: "lounge-chair-single", name: "Lounge Chair", category: "soft-seating", widthCm: 85, depthCm: 80, heightCm: 80, color: "#8a7a6a", shape: "rect", seatCount: 1 },
  "table-conf-6": { catalogId: "table-conf-6", name: "Conference Table 6-person", category: "tables", widthCm: 200, depthCm: 100, heightCm: 75, color: "#c8b99a", shape: "rect", seatCount: 6 },
  "table-conf-8": { catalogId: "table-conf-8", name: "Conference Table 8-person", category: "tables", widthCm: 240, depthCm: 110, heightCm: 75, color: "#c8b99a", shape: "rect", seatCount: 8 },
  "table-conf-12": { catalogId: "table-conf-12", name: "Conference Table 12-person", category: "tables", widthCm: 360, depthCm: 120, heightCm: 75, color: "#b8a88a", shape: "rect", seatCount: 12 },
  "table-meeting-4": { catalogId: "table-meeting-4", name: "Meeting Table 4-person", category: "tables", widthCm: 140, depthCm: 80, heightCm: 75, color: "#c8b99a", shape: "rect", seatCount: 4 },
  "table-coffee-rect": { catalogId: "table-coffee-rect", name: "Coffee Table Rectangular", category: "tables", widthCm: 120, depthCm: 60, heightCm: 42, color: "#c0a882", shape: "rect", seatCount: 0 },
  "table-training-fold": { catalogId: "table-training-fold", name: "Folding Training Table", category: "tables", widthCm: 160, depthCm: 60, heightCm: 75, color: "#d8d8d8", shape: "rect", seatCount: 2 },
  "storage-pedestal-3d": { catalogId: "storage-pedestal-3d", name: "Pedestal 3-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 75, color: "#b0b8c0", shape: "rect", seatCount: 0 },
  "storage-cabinet-2d": { catalogId: "storage-cabinet-2d", name: "Storage Cabinet 2-Door", category: "storage", widthCm: 90, depthCm: 45, heightCm: 120, color: "#c8ccd0", shape: "rect", seatCount: 0 },
  "storage-cabinet-high": { catalogId: "storage-cabinet-high", name: "High Storage Cabinet", category: "storage", widthCm: 90, depthCm: 45, heightCm: 200, color: "#c8ccd0", shape: "rect", seatCount: 0 },
  "storage-bookcase-open": { catalogId: "storage-bookcase-open", name: "Open Bookcase", category: "storage", widthCm: 90, depthCm: 35, heightCm: 180, color: "#d8cfc0", shape: "rect", seatCount: 0 },
  "acc-reception-desk": { catalogId: "acc-reception-desk", name: "Reception Desk", category: "accessories", widthCm: 180, depthCm: 80, heightCm: 105, color: "#c8b99a", shape: "rect", seatCount: 1 },
  "acc-plant-large": { catalogId: "acc-plant-large", name: "Planter Large", category: "accessories", widthCm: 60, depthCm: 60, heightCm: 100, color: "#4a7a5a", shape: "circle", seatCount: 0 },
  "acc-plant-small": { catalogId: "acc-plant-small", name: "Planter Small", category: "accessories", widthCm: 35, depthCm: 35, heightCm: 60, color: "#4a7a5a", shape: "circle", seatCount: 0 },
  "edu-desk-student": { catalogId: "edu-desk-student", name: "Student Desk", category: "education", widthCm: 90, depthCm: 55, heightCm: 75, color: "#e0d0b0", shape: "rect", seatCount: 1 },
  "edu-whiteboard-120": { catalogId: "edu-whiteboard-120", name: "Mobile Whiteboard 1200", category: "education", widthCm: 120, depthCm: 5, heightCm: 180, color: "#f0f0f0", shape: "rect", seatCount: 0 },
};

const WALL_CLEARANCE = 30;
const DESK_SPACING = 150;
const WALKWAY_WIDTH = 90;
const CHAIR_CLEARANCE = 75;

type RoomType = "open-office" | "conference" | "executive" | "reception" | "breakout" | "training" | "hot-desk";

function generateLayout(roomWidthCm: number, roomDepthCm: number, roomType: RoomType, capacity: number): AutoLayoutItem[] {
  const items: AutoLayoutItem[] = [];
  const place = (def: FurnitureDef, x: number, y: number, rotation = 0) => {
    items.push({ ...def, x, y, rotation });
  };

  switch (roomType) {
    case "open-office":
      generateOpenOffice(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "conference":
      generateConference(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "executive":
      generateExecutive(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "reception":
      generateReception(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "breakout":
      generateBreakout(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "training":
      generateTraining(roomWidthCm, roomDepthCm, capacity, place);
      break;
    case "hot-desk":
      generateHotDesk(roomWidthCm, roomDepthCm, capacity, place);
      break;
  }
  return items;
}

type PlaceFn = (def: FurnitureDef, x: number, y: number, rotation?: number) => void;

function generateOpenOffice(w: number, d: number, capacity: number, place: PlaceFn) {
  const desk = CATALOG["ws-straight-120"];
  const chair = CATALOG["chair-task-std"];
  const pedestal = CATALOG["storage-pedestal-3d"];
  const cabinet = CATALOG["storage-cabinet-2d"];

  const deskW = desk.widthCm;
  const deskD = desk.depthCm;
  const chairD = chair.depthCm;
  const rowSpacing = deskD + chairD + WALKWAY_WIDTH;
  const colSpacing = deskW + pedestal.widthCm + 15 + WALKWAY_WIDTH;

  const usableW = w - 2 * WALL_CLEARANCE;
  const usableD = d - 2 * WALL_CLEARANCE;

  const cols = Math.max(1, Math.floor(usableW / colSpacing));
  const rows = Math.max(1, Math.floor(usableD / rowSpacing));

  let placed = 0;
  for (let row = 0; row < rows && placed < capacity; row++) {
    for (let col = 0; col < cols && placed < capacity; col++) {
      const x = WALL_CLEARANCE + col * colSpacing;
      const y = WALL_CLEARANCE + row * rowSpacing;
      place(desk, x, y);
      place(chair, x + (deskW - chair.widthCm) / 2, y + deskD + 5);
      if (x + deskW + 10 + pedestal.widthCm < w - WALL_CLEARANCE) {
        place(pedestal, x + deskW + 10, y);
      }
      placed++;
    }
  }

  if (w > 400 && placed < capacity + 2) {
    const cabX = w - WALL_CLEARANCE - cabinet.widthCm;
    const cabY = WALL_CLEARANCE;
    const lastDeskRight = WALL_CLEARANCE + (cols - 1) * colSpacing + deskW + pedestal.widthCm + 15;
    if (cabX > lastDeskRight + 20) {
      place(cabinet, cabX, cabY);
    }
  }
  if (w > 600 && d > 400) {
    place(CATALOG["acc-plant-large"], w - WALL_CLEARANCE - 60, d - WALL_CLEARANCE - 60);
  }
}

function generateConference(w: number, d: number, capacity: number, place: PlaceFn) {
  let table: FurnitureDef;
  if (capacity <= 4) table = CATALOG["table-meeting-4"];
  else if (capacity <= 6) table = CATALOG["table-conf-6"];
  else if (capacity <= 8) table = CATALOG["table-conf-8"];
  else table = CATALOG["table-conf-12"];

  const chair = CATALOG["chair-conference"];
  const tableX = (w - table.widthCm) / 2;
  const tableY = (d - table.depthCm) / 2;
  place(table, tableX, tableY);

  const seatsPerLongSide = Math.max(1, Math.floor(capacity / 2));
  const seatsOther = capacity - seatsPerLongSide;
  const chairSpacing = Math.max(chair.widthCm + 10, table.widthCm / seatsPerLongSide);
  const topStartX = tableX + (table.widthCm - (seatsPerLongSide - 1) * chairSpacing) / 2 - chair.widthCm / 2;

  for (let i = 0; i < seatsPerLongSide; i++) {
    const cx = topStartX + i * chairSpacing;
    place(chair, cx, tableY - chair.depthCm - 10);
  }

  const bottomChairSpacing = Math.max(chair.widthCm + 10, table.widthCm / seatsOther);
  const bottomStartX = tableX + (table.widthCm - (seatsOther - 1) * bottomChairSpacing) / 2 - chair.widthCm / 2;
  for (let i = 0; i < seatsOther; i++) {
    const cx = bottomStartX + i * bottomChairSpacing;
    place(chair, cx, tableY + table.depthCm + 10);
  }

  if (w > 400) {
    place(CATALOG["storage-bookcase-open"], w - WALL_CLEARANCE - 90, WALL_CLEARANCE);
  }
  if (d > 400) {
    place(CATALOG["acc-plant-small"], WALL_CLEARANCE, d - WALL_CLEARANCE - 35);
  }
}

function clampPos(x: number, y: number, itemW: number, itemD: number, roomW: number, roomD: number) {
  return {
    x: Math.max(WALL_CLEARANCE, Math.min(x, roomW - itemW - WALL_CLEARANCE)),
    y: Math.max(WALL_CLEARANCE, Math.min(y, roomD - itemD - WALL_CLEARANCE)),
  };
}

function generateExecutive(w: number, d: number, capacity: number, place: PlaceFn) {
  const desk = CATALOG["ws-straight-140"];
  const execChair = CATALOG["chair-executive"];
  const visitorChair = CATALOG["chair-visitor-side"];
  const bookcase = CATALOG["storage-bookcase-open"];

  const deskY = WALL_CLEARANCE + 60;
  place(desk, w / 2 - desk.widthCm / 2, deskY);
  place(execChair, w / 2 - execChair.widthCm / 2, deskY + desk.depthCm + 10);

  const visitorCount = Math.min(capacity - 1, 2);
  const visitorTotalW = visitorCount * visitorChair.widthCm + (visitorCount - 1) * 20;
  const visitorStartX = w / 2 - visitorTotalW / 2;
  const visitorY = deskY - visitorChair.depthCm - 20;
  for (let i = 0; i < visitorCount; i++) {
    const vx = Math.max(WALL_CLEARANCE, visitorStartX + i * (visitorChair.widthCm + 20));
    const vy = Math.max(WALL_CLEARANCE, visitorY);
    place(visitorChair, vx, vy);
  }

  if (capacity > 3 && d > 400) {
    const meetTable = CATALOG["table-meeting-4"];
    const mtY = d - WALL_CLEARANCE - meetTable.depthCm - 60;
    place(meetTable, WALL_CLEARANCE + 30, Math.max(deskY + desk.depthCm + execChair.depthCm + WALKWAY_WIDTH, mtY));
    const remaining = Math.min(capacity - 3, 4);
    const mtActualY = Math.max(deskY + desk.depthCm + execChair.depthCm + WALKWAY_WIDTH, mtY);
    const mtChairSpacing = Math.max(visitorChair.widthCm + 15, meetTable.widthCm / 2);
    for (let i = 0; i < remaining; i++) {
      const topOrBottom = i < 2 ? -1 : 1;
      const col = i % 2;
      const cx = WALL_CLEARANCE + 30 + meetTable.widthCm / 2 - mtChairSpacing / 2 + col * mtChairSpacing;
      const cy = topOrBottom < 0
        ? mtActualY - visitorChair.depthCm - 10
        : mtActualY + meetTable.depthCm + 10;
      const clamped = clampPos(cx, cy, visitorChair.widthCm, visitorChair.depthCm, w, d);
      place(visitorChair, clamped.x, clamped.y);
    }
  }

  const bkX = w - WALL_CLEARANCE - bookcase.widthCm;
  if (bkX > w / 2 + desk.widthCm / 2 + 30) {
    place(bookcase, bkX, WALL_CLEARANCE);
  }

  const pedX = w / 2 + desk.widthCm / 2 + 10;
  if (pedX + CATALOG["storage-pedestal-3d"].widthCm < w - WALL_CLEARANCE) {
    place(CATALOG["storage-pedestal-3d"], pedX, deskY);
  }
  if (w > 500 && capacity <= 3) {
    place(CATALOG["acc-plant-large"], WALL_CLEARANCE, d - WALL_CLEARANCE - 60);
  } else if (w > 500) {
    place(CATALOG["acc-plant-small"], w - WALL_CLEARANCE - 35, d - WALL_CLEARANCE - 35);
  }
}

function generateReception(w: number, d: number, capacity: number, place: PlaceFn) {
  const receptionDesk = CATALOG["acc-reception-desk"];
  place(receptionDesk, (w - receptionDesk.widthCm) / 2, WALL_CLEARANCE + 20);
  place(CATALOG["chair-task-std"], (w - 65) / 2, WALL_CLEARANCE + 20 + receptionDesk.depthCm + 5);

  const sofa = capacity > 4 ? CATALOG["sofa-3-seat"] : CATALOG["sofa-2-seat"];
  const sofaCount = Math.min(Math.ceil(capacity / sofa.seatCount), 2);
  const sofaStartY = d / 2;

  for (let i = 0; i < sofaCount; i++) {
    place(sofa, WALL_CLEARANCE + 20, sofaStartY + i * (sofa.depthCm + WALKWAY_WIDTH));
  }

  place(CATALOG["table-coffee-rect"], WALL_CLEARANCE + 20 + sofa.widthCm + 30, sofaStartY + 10);

  place(CATALOG["acc-plant-large"], w - WALL_CLEARANCE - 60, WALL_CLEARANCE);
  if (d > 300) {
    place(CATALOG["acc-plant-small"], w - WALL_CLEARANCE - 40, d - WALL_CLEARANCE - 35);
  }
}

function generateBreakout(w: number, d: number, capacity: number, place: PlaceFn) {
  const sofa = CATALOG["sofa-2-seat"];
  const lounge = CATALOG["lounge-chair-single"];
  const coffeeTable = CATALOG["table-coffee-rect"];

  const clusters = Math.max(1, Math.ceil(capacity / 4));
  const usableW = w - 2 * WALL_CLEARANCE;
  const clusterSpacing = usableW / clusters;

  for (let i = 0; i < clusters; i++) {
    const cx = WALL_CLEARANCE + i * clusterSpacing + 20;
    const cy = WALL_CLEARANCE + 40;

    place(sofa, cx, cy);
    place(coffeeTable, cx + 20, cy + sofa.depthCm + 15);
    if (cy + sofa.depthCm + 15 + coffeeTable.depthCm + 20 + lounge.depthCm < d - WALL_CLEARANCE) {
      place(lounge, cx + 30, cy + sofa.depthCm + 15 + coffeeTable.depthCm + 20);
    }
  }

  place(CATALOG["acc-plant-large"], w - WALL_CLEARANCE - 60, WALL_CLEARANCE);
  if (d > 400) {
    place(CATALOG["acc-plant-small"], WALL_CLEARANCE, d - WALL_CLEARANCE - 35);
  }
}

function generateTraining(w: number, d: number, capacity: number, place: PlaceFn) {
  const table = CATALOG["table-training-fold"];
  const chair = CATALOG["chair-training"];

  const rowSeats = 2;
  const rows = Math.ceil(capacity / rowSeats);
  const rowSpacing = table.depthCm + chair.depthCm + WALKWAY_WIDTH;
  const colSpacing = table.widthCm + 40;

  const cols = Math.max(1, Math.min(Math.ceil(capacity / rows), Math.floor((w - 2 * WALL_CLEARANCE) / colSpacing)));

  let placed = 0;
  for (let row = 0; row < rows && placed < capacity; row++) {
    for (let col = 0; col < cols && placed < capacity; col++) {
      const x = WALL_CLEARANCE + 40 + col * colSpacing;
      const y = WALL_CLEARANCE + 80 + row * rowSpacing;
      place(table, x, y);

      for (let s = 0; s < rowSeats && placed < capacity; s++) {
        const cx = x + (table.widthCm / (rowSeats + 1)) * (s + 1) - chair.widthCm / 2;
        place(chair, cx, y + table.depthCm + 5);
        placed++;
      }
    }
  }

  place(CATALOG["edu-whiteboard-120"], (w - 120) / 2, WALL_CLEARANCE);
  if (w > 500) {
    place(CATALOG["acc-plant-small"], w - WALL_CLEARANCE - 35, d - WALL_CLEARANCE - 35);
  }
}

function generateHotDesk(w: number, d: number, capacity: number, place: PlaceFn) {
  const desk = CATALOG["ws-straight-120"];
  const chair = CATALOG["chair-task-std"];
  const pedestal = CATALOG["storage-pedestal-3d"];

  const pairW = desk.widthCm;
  const pairD = desk.depthCm * 2 + 10;
  const aisleW = WALKWAY_WIDTH;
  const colSpacing = pairW + aisleW;
  const rowSpacing = pairD + WALKWAY_WIDTH;

  const usableW = w - 2 * WALL_CLEARANCE;
  const usableD = d - 2 * WALL_CLEARANCE;

  const cols = Math.max(1, Math.floor(usableW / colSpacing));
  const rows = Math.max(1, Math.floor(usableD / rowSpacing));

  const chairClearance = chair.depthCm + 10;
  let placed = 0;
  for (let row = 0; row < rows && placed < capacity; row++) {
    for (let col = 0; col < cols && placed < capacity; col++) {
      const x = WALL_CLEARANCE + col * colSpacing;
      const y = WALL_CLEARANCE + chairClearance + row * rowSpacing;

      place(desk, x, y);
      place(chair, x + (desk.widthCm - chair.widthCm) / 2, y - chair.depthCm - 5);
      placed++;

      if (placed < capacity) {
        const desk2Y = y + desk.depthCm + 10;
        const chair2Y = desk2Y + desk.depthCm + 5;
        if (chair2Y + chair.depthCm <= d - WALL_CLEARANCE) {
          place(desk, x, desk2Y, 0);
          place(chair, x + (desk.widthCm - chair.widthCm) / 2, chair2Y);
          placed++;
        }
      }
    }
  }

  if (w > 500) {
    place(CATALOG["storage-cabinet-high"], w - WALL_CLEARANCE - 90, WALL_CLEARANCE);
  }
}

function validateLayout(items: AutoLayoutItem[], roomWidthCm: number, roomDepthCm: number): { valid: boolean; overlaps: string[]; outOfBounds: string[]; warnings: string[] } {
  const overlaps: string[] = [];
  const outOfBounds: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    const right = item.x + item.widthCm;
    const bottom = item.y + item.depthCm;

    if (item.x < 0 || item.y < 0 || right > roomWidthCm || bottom > roomDepthCm) {
      outOfBounds.push(`"${item.name}" extends beyond room boundaries (${Math.round(item.x)},${Math.round(item.y)} to ${Math.round(right)},${Math.round(bottom)})`);
    }

    if (item.x < WALL_CLEARANCE && item.x >= 0) {
      warnings.push(`"${item.name}" is ${Math.round(item.x)}cm from left wall (min ${WALL_CLEARANCE}cm recommended)`);
    }
    if (item.y < WALL_CLEARANCE && item.y >= 0) {
      warnings.push(`"${item.name}" is ${Math.round(item.y)}cm from top wall (min ${WALL_CLEARANCE}cm recommended)`);
    }
  }

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      const overlapX = Math.min(a.x + a.widthCm, b.x + b.widthCm) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.depthCm, b.y + b.depthCm) - Math.max(a.y, b.y);

      if (overlapX > 2 && overlapY > 2) {
        overlaps.push(`"${a.name}" and "${b.name}" overlap by ${Math.round(overlapX)}×${Math.round(overlapY)}cm`);
      }
    }
  }

  const desks = items.filter(i => i.category === "workstations");
  for (let i = 0; i < desks.length; i++) {
    for (let j = i + 1; j < desks.length; j++) {
      const a = desks[i];
      const b = desks[j];
      const dx = Math.abs((a.x + a.widthCm / 2) - (b.x + b.widthCm / 2));
      const dy = Math.abs((a.y + a.depthCm / 2) - (b.y + b.depthCm / 2));
      const edgeDist = Math.min(
        Math.max(0, dx - (a.widthCm + b.widthCm) / 2),
        Math.max(0, dy - (a.depthCm + b.depthCm) / 2)
      );
      const centerDist = Math.sqrt(dx * dx + dy * dy);
      if (centerDist < DESK_SPACING && edgeDist < DESK_SPACING / 2) {
        warnings.push(`Desks "${a.name}" and "${b.name}" are ${Math.round(centerDist)}cm apart (recommended ≥${DESK_SPACING}cm center-to-center)`);
      }
    }
  }

  const chairs = items.filter(i => i.category === "seating");
  for (const ch of chairs) {
    const clearBehind = Math.min(ch.y, roomDepthCm - ch.y - ch.depthCm);
    const nearbyDesk = desks.find(d => {
      const behindY = ch.y + ch.depthCm;
      return behindY >= d.y && behindY <= d.y + d.depthCm + 5 &&
        ch.x + ch.widthCm > d.x && ch.x < d.x + d.widthCm;
    });
    if (!nearbyDesk && clearBehind < CHAIR_CLEARANCE && clearBehind > 0) {
      warnings.push(`"${ch.name}" at (${Math.round(ch.x)},${Math.round(ch.y)}) has only ${Math.round(clearBehind)}cm clearance behind (recommended ≥${CHAIR_CLEARANCE}cm)`);
    }
  }

  const totalArea = items.reduce((sum, it) => sum + it.widthCm * it.depthCm, 0);
  const coverage = (totalArea / (roomWidthCm * roomDepthCm)) * 100;
  if (coverage > 60) {
    warnings.push(`Floor coverage is ${coverage.toFixed(0)}% — may feel overcrowded (aim for under 50%)`);
  }

  return {
    valid: overlaps.length === 0 && outOfBounds.length === 0,
    overlaps,
    outOfBounds,
    warnings,
  };
}

function applyConstraintWarnings(
  constraints: string,
  items: AutoLayoutItem[],
  validation: { warnings: string[] }
) {
  const lower = constraints.toLowerCase();
  if (lower.includes("no storage") || lower.includes("without storage")) {
    const storageItems = items.filter(i => i.category === "storage");
    if (storageItems.length > 0) {
      validation.warnings.push(`Constraint "${constraints}" noted: layout includes ${storageItems.length} storage item(s) that may need manual removal.`);
    }
  }
  if (lower.includes("standing desk") || lower.includes("stand-up")) {
    validation.warnings.push(`Constraint "${constraints}" noted: standing desks are not yet in the catalog; standard desks were used.`);
  }
  if (lower.includes("window") || lower.includes("natural light")) {
    validation.warnings.push(`Constraint noted: consider placing desks near windows for natural light. Manual adjustment recommended.`);
  }
  if (lower.includes("wheelchair") || lower.includes("accessible") || lower.includes("ada")) {
    const hasWalkwayWarning = validation.warnings.some(w => w.includes("cm apart"));
    if (hasWalkwayWarning) {
      validation.warnings.push(`Accessibility constraint noted: some spacing may not meet wheelchair clearance requirements (min 90cm). Review layout carefully.`);
    }
  }
}

function generateSummary(roomType: RoomType, capacity: number, items: AutoLayoutItem[], roomWidthCm: number, roomDepthCm: number, validation: { warnings: string[] }): string {
  const areaSqM = (roomWidthCm * roomDepthCm) / 10000;
  const furnitureCount = items.length;
  const categories = [...new Set(items.map(i => i.category))];
  const hasSpacingWarnings = validation.warnings.some(w => w.includes("cm apart") || w.includes("clearance"));
  const ergNote = hasSpacingWarnings
    ? "Some ergonomic spacing targets were not fully met — see warnings for details."
    : "Ergonomic targets met: desk spacing ≥150cm, walkways ≥90cm, chair clearance ≥75cm.";
  return `Generated ${roomType.replace("-", " ")} layout for ${capacity} people in a ${(roomWidthCm / 100).toFixed(1)}m × ${(roomDepthCm / 100).toFixed(1)}m room (${areaSqM.toFixed(1)} m²). Placed ${furnitureCount} items across ${categories.length} categories: ${categories.join(", ")}. ${ergNote}`;
}

function getOpenAIClient(): OpenAI | null {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!baseURL || !apiKey) return null;
  return new OpenAI({ baseURL, apiKey });
}

function buildAutoLayoutSystemPrompt(): string {
  const catalogEntries = Object.entries(CATALOG).map(([id, item]) =>
    `  - ${id}: "${item.name}" (${item.category}), ${item.widthCm}x${item.depthCm}cm, shape=${item.shape}, seats=${item.seatCount}`
  ).join("\n");

  return `You are an expert office space planner. Generate furniture layouts as JSON arrays.

FURNITURE CATALOG (you MUST only use items from this list):
${catalogEntries}

ERGONOMIC RULES (mandatory):
- Desk-to-desk center spacing: minimum ${DESK_SPACING}cm
- Walkway width between furniture rows: minimum ${WALKWAY_WIDTH}cm
- Chair clearance behind seating: minimum ${CHAIR_CLEARANCE}cm
- Wall clearance from room edges: minimum ${WALL_CLEARANCE}cm
- No furniture may overlap
- All items must be within room boundaries

OUTPUT FORMAT:
Return ONLY a JSON array of objects. Each object must have:
{
  "catalogId": "<id from catalog>",
  "x": <number, left edge position in cm>,
  "y": <number, top edge position in cm>,
  "rotation": <0, 90, 180, or 270 degrees>
}

Do not include any text outside the JSON array. No markdown code fences.`;
}

function buildAutoLayoutUserPrompt(
  roomType: string,
  roomWidthCm: number,
  roomDepthCm: number,
  capacity: number,
  constraints?: string
): string {
  let prompt = `Design a ${roomType.replace("-", " ")} layout for ${capacity} people in a ${roomWidthCm}cm x ${roomDepthCm}cm room.

Room type guidelines:`;

  const typeGuidelines: Record<string, string> = {
    "open-office": "Place individual workstations with task chairs and pedestals in rows. Include storage cabinets and plants for a pleasant environment.",
    "conference": "Center a conference table sized for the capacity. Place conference chairs evenly around the table. Add a bookcase and plant.",
    "executive": "Place a large desk with executive chair. Add visitor chairs facing the desk. For larger capacity, include a small meeting table area.",
    "reception": "Place a reception desk near the entrance (top). Add waiting area sofas and a coffee table. Include decorative plants.",
    "breakout": "Create informal seating clusters with sofas, lounge chairs, and coffee tables. Add plants for ambiance.",
    "training": "Place rows of desks facing a whiteboard/presentation area. Include task chairs at each desk.",
    "hot-desk": "Arrange desks in face-to-face pairs for collaborative hot-desking. Include shared storage.",
  };

  prompt += `\n${typeGuidelines[roomType] || "Create an appropriate furniture arrangement."}`;

  if (constraints) {
    prompt += `\n\nAdditional constraints: ${constraints}`;
  }

  prompt += `\n\nRemember: all coordinates are in cm from top-left corner. Items must stay within 0-${roomWidthCm}cm width and 0-${roomDepthCm}cm depth, with ${WALL_CLEARANCE}cm wall clearance.`;

  return prompt;
}

function parseLLMLayoutResponse(
  responseText: string,
  roomWidthCm: number,
  roomDepthCm: number
): AutoLayoutItem[] | null {
  try {
    let cleaned = responseText.trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    cleaned = jsonMatch[0];

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;

    const items: AutoLayoutItem[] = [];
    for (const entry of parsed) {
      const catalogId = entry.catalogId;
      const def = CATALOG[catalogId];
      if (!def) continue;

      const x = typeof entry.x === "number" ? entry.x : 0;
      const y = typeof entry.y === "number" ? entry.y : 0;
      const rotation = typeof entry.rotation === "number" ? entry.rotation : 0;

      if (x < 0 || y < 0 || x + def.widthCm > roomWidthCm || y + def.depthCm > roomDepthCm) {
        continue;
      }

      items.push({
        catalogId: def.catalogId,
        name: def.name,
        category: def.category,
        widthCm: def.widthCm,
        depthCm: def.depthCm,
        heightCm: def.heightCm,
        color: def.color,
        shape: def.shape,
        x,
        y,
        rotation,
      });
    }

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

async function generateLayoutWithLLM(
  roomWidthCm: number,
  roomDepthCm: number,
  roomType: RoomType,
  capacity: number,
  constraints?: string
): Promise<AutoLayoutItem[] | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildAutoLayoutSystemPrompt() },
        { role: "user", content: buildAutoLayoutUserPrompt(roomType, roomWidthCm, roomDepthCm, capacity, constraints) },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;

    let parsed: AutoLayoutItem[] | null = null;
    try {
      const obj = JSON.parse(content);
      const arr = Array.isArray(obj) ? obj : (obj.layout || obj.items || obj.furniture);
      if (Array.isArray(arr)) {
        parsed = parseLLMLayoutResponse(JSON.stringify(arr), roomWidthCm, roomDepthCm);
      }
    } catch {
      parsed = parseLLMLayoutResponse(content, roomWidthCm, roomDepthCm);
    }

    return parsed;
  } catch (err) {
    console.error("LLM auto-layout generation failed:", err);
    return null;
  }
}

router.post(
  "/ai/auto-layout",
  asyncHandler(async (req, res) => {
    const parsed = GenerateAutoLayoutBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request: " + parsed.error.message, status: 400 });
      return;
    }

    const { roomWidthCm, roomDepthCm, roomType, constraints } = parsed.data;
    const capacity = Math.floor(parsed.data.capacity);

    if (roomWidthCm < 200 || roomDepthCm < 200) {
      res.status(400).json({ error: "Room must be at least 200cm × 200cm", status: 400 });
      return;
    }
    if (capacity < 1 || capacity > 100) {
      res.status(400).json({ error: "Capacity must be between 1 and 100", status: 400 });
      return;
    }

    let layout: AutoLayoutItem[];
    let usedLLM = false;

    const llmLayout = await generateLayoutWithLLM(
      roomWidthCm, roomDepthCm, roomType as RoomType, capacity, constraints
    );
    if (llmLayout && llmLayout.length > 0) {
      const llmValidation = validateLayout(llmLayout, roomWidthCm, roomDepthCm);
      if (llmValidation.valid) {
        layout = llmLayout;
        usedLLM = true;
      } else {
        layout = generateLayout(roomWidthCm, roomDepthCm, roomType as RoomType, capacity);
      }
    } else {
      layout = generateLayout(roomWidthCm, roomDepthCm, roomType as RoomType, capacity);
    }

    const validation = validateLayout(layout, roomWidthCm, roomDepthCm);
    if (constraints) {
      applyConstraintWarnings(constraints, layout, validation);
    }
    if (!usedLLM) {
      validation.warnings.push("Layout generated using rule-based engine (LLM unavailable or produced invalid layout).");
    }
    const summary = generateSummary(roomType as RoomType, capacity, layout, roomWidthCm, roomDepthCm, validation);

    res.json({ layout, validation, summary });
  }),
);

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
