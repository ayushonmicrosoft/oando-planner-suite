import { db, catalogItemsTable, plansTable, templatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const FURNITURE_CATALOG = [
  { id: "ws-straight-120", name: "Straight Desk 1200", category: "workstations", widthCm: 120, depthCm: 60, heightCm: 75, color: "#e8dcc8", description: "Standard straight desk for individual workstations", shape: "rect", seatCount: 1, price: 8500 },
  { id: "ws-straight-140", name: "Straight Desk 1400", category: "workstations", widthCm: 140, depthCm: 60, heightCm: 75, color: "#e8dcc8", description: "Wider straight desk for power users", shape: "rect", seatCount: 1, price: 9800 },
  { id: "ws-straight-160", name: "Straight Desk 1600", category: "workstations", widthCm: 160, depthCm: 70, heightCm: 75, color: "#e8dcc8", description: "Large format straight desk", shape: "rect", seatCount: 1, price: 11500 },
  { id: "ws-l-shape-left", name: "L-Shape Desk Left", category: "workstations", widthCm: 160, depthCm: 120, heightCm: 75, color: "#ddd0ba", description: "L-shaped workstation with left return", shape: "l-left", seatCount: 1, price: 14500 },
  { id: "ws-l-shape-right", name: "L-Shape Desk Right", category: "workstations", widthCm: 160, depthCm: 120, heightCm: 75, color: "#ddd0ba", description: "L-shaped workstation with right return", shape: "l-right", seatCount: 1, price: 14500 },
  { id: "ws-bench-2", name: "Bench Workstation 2-seater", category: "workstations", widthCm: 240, depthCm: 75, heightCm: 75, color: "#c8b99a", description: "Linear bench for 2 people", shape: "rect", seatCount: 2, price: 18000 },
  { id: "ws-bench-4", name: "Bench Workstation 4-seater", category: "workstations", widthCm: 480, depthCm: 75, heightCm: 75, color: "#c8b99a", description: "Long bench for 4 people", shape: "rect", seatCount: 4, price: 32000 },
  { id: "ws-sit-stand-120", name: "Sit-Stand Desk 1200", category: "workstations", widthCm: 120, depthCm: 60, heightCm: 75, color: "#b8cce0", description: "Height-adjustable sit-stand desk", shape: "rect", seatCount: 1, price: 22000 },
  { id: "ws-pod-4", name: "4-Pod Workstation Cluster", category: "workstations", widthCm: 240, depthCm: 240, heightCm: 75, color: "#c8b99a", description: "4-person pod cluster with privacy screens", shape: "rect", seatCount: 4, price: 48000 },
  { id: "chair-task-std", name: "Task Chair Standard", category: "seating", widthCm: 65, depthCm: 65, heightCm: 90, color: "#3a3a3a", description: "Ergonomic task chair with adjustable lumbar", shape: "circle", seatCount: 1, price: 12000 },
  { id: "chair-task-premium", name: "Task Chair Premium", category: "seating", widthCm: 70, depthCm: 70, heightCm: 95, color: "#1a1a1a", description: "High-back premium ergonomic task chair", shape: "circle", seatCount: 1, price: 22000 },
  { id: "chair-executive", name: "Executive Chair", category: "seating", widthCm: 70, depthCm: 72, heightCm: 115, color: "#2c2c2c", description: "Executive high-back leather chair", shape: "circle", seatCount: 1, price: 35000 },
  { id: "chair-visitor-side", name: "Visitor Chair", category: "seating", widthCm: 55, depthCm: 55, heightCm: 80, color: "#5a5a5a", description: "Stackable visitor side chair", shape: "circle", seatCount: 1, price: 4500 },
  { id: "chair-conference", name: "Conference Chair", category: "seating", widthCm: 60, depthCm: 62, heightCm: 90, color: "#3a3a3a", description: "Castor conference chair", shape: "circle", seatCount: 1, price: 8500 },
  { id: "chair-training", name: "Training Chair", category: "seating", widthCm: 50, depthCm: 52, heightCm: 85, color: "#4a6a8a", description: "Stackable training room chair", shape: "circle", seatCount: 1, price: 3800 },
  { id: "stool-bar", name: "Bar Stool", category: "seating", widthCm: 45, depthCm: 45, heightCm: 75, color: "#3a3a3a", description: "Counter-height bar stool", shape: "circle", seatCount: 1, price: 5500 },
  { id: "sofa-2-seat", name: "2-Seater Sofa", category: "soft-seating", widthCm: 165, depthCm: 80, heightCm: 75, color: "#7a8a6a", description: "2-seater reception/breakout sofa", shape: "rect", seatCount: 2, price: 28000 },
  { id: "sofa-3-seat", name: "3-Seater Sofa", category: "soft-seating", widthCm: 225, depthCm: 85, heightCm: 78, color: "#7a8a6a", description: "3-seater lounge sofa", shape: "rect", seatCount: 3, price: 38000 },
  { id: "lounge-chair-single", name: "Lounge Chair", category: "soft-seating", widthCm: 85, depthCm: 80, heightCm: 80, color: "#8a7a6a", description: "Single lounge/armchair", shape: "rect", seatCount: 1, price: 14000 },
  { id: "pod-chair-privacy", name: "Privacy Pod Chair", category: "soft-seating", widthCm: 100, depthCm: 100, heightCm: 130, color: "#5a6a7a", description: "High-back privacy pod chair with screen", shape: "circle", seatCount: 1, price: 42000 },
  { id: "ottoman-round", name: "Round Ottoman", category: "soft-seating", widthCm: 55, depthCm: 55, heightCm: 42, color: "#8a6a5a", description: "Circular ottoman for breakout areas", shape: "circle", seatCount: 1, price: 6500 },
  { id: "table-conf-6", name: "Conference Table 6-person", category: "tables", widthCm: 200, depthCm: 100, heightCm: 75, color: "#c8b99a", description: "6-person conference table", shape: "rect", seatCount: 6, price: 28000 },
  { id: "table-conf-8", name: "Conference Table 8-person", category: "tables", widthCm: 240, depthCm: 110, heightCm: 75, color: "#c8b99a", description: "8-person conference table", shape: "rect", seatCount: 8, price: 38000 },
  { id: "table-conf-12", name: "Conference Table 12-person", category: "tables", widthCm: 360, depthCm: 120, heightCm: 75, color: "#b8a88a", description: "12-person boardroom table", shape: "rect", seatCount: 12, price: 58000 },
  { id: "table-meeting-4", name: "Meeting Table 4-person", category: "tables", widthCm: 140, depthCm: 80, heightCm: 75, color: "#c8b99a", description: "Small meeting room table", shape: "rect", seatCount: 4, price: 16000 },
  { id: "table-standing-round", name: "Standing Table Round", category: "tables", widthCm: 80, depthCm: 80, heightCm: 105, color: "#d8c8a8", description: "Bar height round stand-up meeting table", shape: "circle", seatCount: 4, price: 12000 },
  { id: "table-coffee-rect", name: "Coffee Table Rectangular", category: "tables", widthCm: 120, depthCm: 60, heightCm: 42, color: "#c0a882", description: "Low rectangular coffee table", shape: "rect", seatCount: null, price: 8500 },
  { id: "table-side-round", name: "Side Table Round", category: "tables", widthCm: 50, depthCm: 50, heightCm: 55, color: "#c0a882", description: "Circular side table", shape: "circle", seatCount: null, price: 3500 },
  { id: "table-training-fold", name: "Folding Training Table", category: "tables", widthCm: 160, depthCm: 60, heightCm: 75, color: "#d8d8d8", description: "Folding and stacking training table", shape: "rect", seatCount: 2, price: 7500 },
  { id: "storage-pedestal-2d", name: "Pedestal 2-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 60, color: "#b0b8c0", description: "2-drawer mobile pedestal", shape: "rect", seatCount: null, price: 5500 },
  { id: "storage-pedestal-3d", name: "Pedestal 3-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 75, color: "#b0b8c0", description: "3-drawer lockable pedestal", shape: "rect", seatCount: null, price: 6800 },
  { id: "storage-cabinet-2d", name: "Storage Cabinet 2-Door", category: "storage", widthCm: 90, depthCm: 45, heightCm: 120, color: "#c8ccd0", description: "2-door filing cabinet", shape: "rect", seatCount: null, price: 9500 },
  { id: "storage-cabinet-high", name: "High Storage Cabinet", category: "storage", widthCm: 90, depthCm: 45, heightCm: 200, color: "#c8ccd0", description: "Full-height storage cabinet", shape: "rect", seatCount: null, price: 14000 },
  { id: "storage-bookcase-open", name: "Open Bookcase", category: "storage", widthCm: 90, depthCm: 35, heightCm: 180, color: "#d8cfc0", description: "Open-shelf bookcase", shape: "rect", seatCount: null, price: 8500 },
  { id: "storage-lateral-file-2", name: "Lateral Filing 2-Drawer", category: "storage", widthCm: 90, depthCm: 50, heightCm: 72, color: "#b0b8c0", description: "2-drawer lateral filing unit", shape: "rect", seatCount: null, price: 12000 },
  { id: "storage-locker-bank", name: "Locker Bank 6-Bay", category: "storage", widthCm: 90, depthCm: 45, heightCm: 180, color: "#c0c8d0", description: "6-compartment personal locker bank", shape: "rect", seatCount: null, price: 22000 },
  { id: "edu-desk-student", name: "Student Desk", category: "education", widthCm: 90, depthCm: 55, heightCm: 75, color: "#e0d0b0", description: "Individual student writing desk", shape: "rect", seatCount: 1, price: 4500 },
  { id: "edu-table-2", name: "Training Table 2-seat", category: "education", widthCm: 120, depthCm: 60, heightCm: 75, color: "#e0d0b0", description: "2-person training room table", shape: "rect", seatCount: 2, price: 7500 },
  { id: "edu-table-trapezoid", name: "Trapezoidal Activity Table", category: "education", widthCm: 130, depthCm: 70, heightCm: 75, color: "#d8c8a8", description: "Trapezoidal table for flexible grouping", shape: "rect", seatCount: 3, price: 9000 },
  { id: "edu-whiteboard-120", name: "Mobile Whiteboard 1200", category: "education", widthCm: 120, depthCm: 5, heightCm: 180, color: "#f0f0f0", description: "Mobile double-sided whiteboard", shape: "rect", seatCount: null, price: 8500 },
  { id: "edu-lectern", name: "Lectern/Podium", category: "education", widthCm: 60, depthCm: 40, heightCm: 110, color: "#b0a888", description: "Presentation lectern", shape: "rect", seatCount: null, price: 6000 },
  { id: "acc-partition-straight", name: "Privacy Screen 1200", category: "accessories", widthCm: 120, depthCm: 5, heightCm: 40, color: "#9ab8d0", description: "Desk-top privacy screen", shape: "rect", seatCount: null, price: 3500 },
  { id: "acc-monitor-arm", name: "Monitor Arm Dual", category: "accessories", widthCm: 70, depthCm: 30, heightCm: 50, color: "#3a3a3a", description: "Dual monitor arm with gas spring", shape: "rect", seatCount: null, price: 5500 },
  { id: "acc-plant-large", name: "Planter Large", category: "accessories", widthCm: 60, depthCm: 60, heightCm: 100, color: "#4a7a5a", description: "Large indoor planter for office greenery", shape: "circle", seatCount: null, price: 3500 },
  { id: "acc-plant-small", name: "Planter Small", category: "accessories", widthCm: 35, depthCm: 35, heightCm: 60, color: "#4a7a5a", description: "Small indoor planter", shape: "circle", seatCount: null, price: 1800 },
  { id: "acc-reception-desk", name: "Reception Desk", category: "accessories", widthCm: 180, depthCm: 80, heightCm: 105, color: "#c8b99a", description: "Reception counter with high panel", shape: "rect", seatCount: 1, price: 42000 },
  { id: "acc-partition-full", name: "Full-Height Partition 100cm", category: "accessories", widthCm: 100, depthCm: 10, heightCm: 200, color: "#d0d8e0", description: "Full-height office partition panel", shape: "rect", seatCount: null, price: 8500 },
];

const SAMPLE_PLANS = [
  {
    name: "Open Office 6-Person",
    plannerType: "canvas",
    roomWidthCm: 800,
    roomDepthCm: 600,
    documentJson: JSON.stringify({
      roomWidthCm: 800,
      roomDepthCm: 600,
      items: [
        { id: "i1", catalogId: "ws-bench-4", name: "Bench Workstation 4-seater", widthCm: 480, depthCm: 75, x: 80, y: 80, rotation: 0, color: "#c8b99a" },
        { id: "i2", catalogId: "ws-bench-2", name: "Bench Workstation 2-seater", widthCm: 240, depthCm: 75, x: 80, y: 230, rotation: 0, color: "#c8b99a" },
        { id: "i3", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 85, y: 155, rotation: 0, color: "#3a3a3a" },
        { id: "i4", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 205, y: 155, rotation: 0, color: "#3a3a3a" },
        { id: "i5", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 680, y: 80, rotation: 0, color: "#c8ccd0" },
      ]
    }),
  },
  {
    name: "Executive Meeting Room",
    plannerType: "blueprint",
    roomWidthCm: 600,
    roomDepthCm: 450,
    documentJson: JSON.stringify({
      roomWidthCm: 600,
      roomDepthCm: 450,
      categories: ["tables", "seating"],
      items: [
        { id: "j1", catalogId: "table-conf-8", name: "Conference Table 8-person", widthCm: 240, depthCm: 110, x: 180, y: 170, rotation: 0, color: "#c8b99a" },
        { id: "j2", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 195, y: 90, rotation: 0, color: "#3a3a3a" },
        { id: "j3", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 315, y: 90, rotation: 0, color: "#3a3a3a" },
        { id: "j4", catalogId: "storage-bookcase-open", name: "Bookcase", widthCm: 90, depthCm: 35, x: 480, y: 50, rotation: 0, color: "#d8cfc0" },
      ]
    }),
  },
];

const TEMPLATES = [
  {
    id: "tpl-open-office",
    name: "Open Office 12-Person",
    description: "Modern open-plan office with three rows of bench desks, task chairs, and perimeter storage. Suitable for collaborative teams with shared resources.",
    category: "Open Office",
    roomWidthCm: 1200,
    roomDepthCm: 800,
    furnitureCount: 18,
    layoutJson: JSON.stringify({
      items: [
        { id: "t1", catalogId: "ws-bench-4", name: "Bench Workstation 4-seater", widthCm: 480, depthCm: 75, x: 60, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "t2", catalogId: "ws-bench-4", name: "Bench Workstation 4-seater", widthCm: 480, depthCm: 75, x: 60, y: 250, rotation: 0, color: "#c8b99a" },
        { id: "t3", catalogId: "ws-bench-4", name: "Bench Workstation 4-seater", widthCm: 480, depthCm: 75, x: 60, y: 440, rotation: 0, color: "#c8b99a" },
        { id: "t4", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t5", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 200, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t6", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 320, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t7", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 440, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t8", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t9", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 200, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t10", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 320, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t11", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 440, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t12", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t13", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 200, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t14", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 320, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t15", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 440, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t16", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 1060, y: 60, rotation: 0, color: "#c8ccd0" },
        { id: "t17", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 1060, y: 300, rotation: 0, color: "#c8ccd0" },
        { id: "t18", catalogId: "acc-plant-large", name: "Planter Large", widthCm: 60, depthCm: 60, x: 1080, y: 680, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
  {
    id: "tpl-executive-suite",
    name: "Executive Suite",
    description: "Private executive office with L-shaped desk, premium chair, meeting area for 4, bookcase, and guest seating. Perfect for C-level offices.",
    category: "Executive Suite",
    roomWidthCm: 700,
    roomDepthCm: 500,
    furnitureCount: 9,
    layoutJson: JSON.stringify({
      items: [
        { id: "e1", catalogId: "ws-l-shape-right", name: "L-Shape Desk Right", widthCm: 160, depthCm: 120, x: 60, y: 60, rotation: 0, color: "#ddd0ba" },
        { id: "e2", catalogId: "chair-executive", name: "Executive Chair", widthCm: 70, depthCm: 72, x: 180, y: 190, rotation: 0, color: "#2c2c2c" },
        { id: "e3", catalogId: "table-meeting-4", name: "Meeting Table 4-person", widthCm: 140, depthCm: 80, x: 420, y: 280, rotation: 0, color: "#c8b99a" },
        { id: "e4", catalogId: "chair-visitor-side", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 430, y: 210, rotation: 0, color: "#5a5a5a" },
        { id: "e5", catalogId: "chair-visitor-side", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 510, y: 210, rotation: 0, color: "#5a5a5a" },
        { id: "e6", catalogId: "chair-visitor-side", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 430, y: 370, rotation: 0, color: "#5a5a5a" },
        { id: "e7", catalogId: "chair-visitor-side", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 510, y: 370, rotation: 0, color: "#5a5a5a" },
        { id: "e8", catalogId: "storage-bookcase-open", name: "Open Bookcase", widthCm: 90, depthCm: 35, x: 60, y: 420, rotation: 0, color: "#d8cfc0" },
        { id: "e9", catalogId: "storage-pedestal-3d", name: "Pedestal 3-Drawer", widthCm: 40, depthCm: 56, x: 230, y: 60, rotation: 0, color: "#b0b8c0" },
      ]
    }),
  },
  {
    id: "tpl-meeting-room",
    name: "Board Meeting Room",
    description: "Formal boardroom with 12-person conference table, executive chairs all around, credenza storage, and presentation area.",
    category: "Meeting Room",
    roomWidthCm: 800,
    roomDepthCm: 600,
    furnitureCount: 15,
    layoutJson: JSON.stringify({
      items: [
        { id: "m1", catalogId: "table-conf-12", name: "Conference Table 12-person", widthCm: 360, depthCm: 120, x: 220, y: 240, rotation: 0, color: "#b8a88a" },
        { id: "m2", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 230, y: 170, rotation: 0, color: "#3a3a3a" },
        { id: "m3", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 320, y: 170, rotation: 0, color: "#3a3a3a" },
        { id: "m4", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 410, y: 170, rotation: 0, color: "#3a3a3a" },
        { id: "m5", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 500, y: 170, rotation: 0, color: "#3a3a3a" },
        { id: "m6", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 230, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "m7", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 320, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "m8", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 410, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "m9", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 500, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "m10", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 160, y: 260, rotation: 270, color: "#3a3a3a" },
        { id: "m11", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 580, y: 260, rotation: 90, color: "#3a3a3a" },
        { id: "m12", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 160, y: 320, rotation: 270, color: "#3a3a3a" },
        { id: "m13", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 680, y: 50, rotation: 0, color: "#c8ccd0" },
        { id: "m14", catalogId: "edu-whiteboard-120", name: "Whiteboard", widthCm: 120, depthCm: 5, x: 50, y: 50, rotation: 0, color: "#f0f0f0" },
        { id: "m15", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 700, y: 500, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
  {
    id: "tpl-hot-desk",
    name: "Hot Desk Hub",
    description: "Flexible hot-desking environment with sit-stand desks, locker storage, and casual collaboration zones. Ideal for hybrid workplaces.",
    category: "Hot Desk Hub",
    roomWidthCm: 1000,
    roomDepthCm: 700,
    furnitureCount: 14,
    layoutJson: JSON.stringify({
      items: [
        { id: "h1", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 60, y: 60, rotation: 0, color: "#b8cce0" },
        { id: "h2", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 220, y: 60, rotation: 0, color: "#b8cce0" },
        { id: "h3", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 380, y: 60, rotation: 0, color: "#b8cce0" },
        { id: "h4", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 60, y: 300, rotation: 0, color: "#b8cce0" },
        { id: "h5", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 220, y: 300, rotation: 0, color: "#b8cce0" },
        { id: "h6", catalogId: "ws-sit-stand-120", name: "Sit-Stand Desk", widthCm: 120, depthCm: 60, x: 380, y: 300, rotation: 0, color: "#b8cce0" },
        { id: "h7", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 130, rotation: 0, color: "#3a3a3a" },
        { id: "h8", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 240, y: 130, rotation: 0, color: "#3a3a3a" },
        { id: "h9", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 400, y: 130, rotation: 0, color: "#3a3a3a" },
        { id: "h10", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "h11", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 240, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "h12", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 400, y: 370, rotation: 0, color: "#3a3a3a" },
        { id: "h13", catalogId: "storage-locker-bank", name: "Locker Bank", widthCm: 90, depthCm: 45, x: 860, y: 60, rotation: 0, color: "#c0c8d0" },
        { id: "h14", catalogId: "table-standing-round", name: "Standing Table", widthCm: 80, depthCm: 80, x: 700, y: 500, rotation: 0, color: "#d8c8a8" },
      ]
    }),
  },
  {
    id: "tpl-reception",
    name: "Corporate Reception",
    description: "Professional reception area with curved desk, waiting lounge with sofas, coffee table, and decorative planters for a welcoming first impression.",
    category: "Reception Area",
    roomWidthCm: 800,
    roomDepthCm: 500,
    furnitureCount: 10,
    layoutJson: JSON.stringify({
      items: [
        { id: "r1", catalogId: "acc-reception-desk", name: "Reception Desk", widthCm: 180, depthCm: 80, x: 310, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "r2", catalogId: "chair-task-premium", name: "Task Chair Premium", widthCm: 70, depthCm: 70, x: 365, y: 150, rotation: 0, color: "#1a1a1a" },
        { id: "r3", catalogId: "sofa-3-seat", name: "3-Seater Sofa", widthCm: 225, depthCm: 85, x: 60, y: 300, rotation: 0, color: "#7a8a6a" },
        { id: "r4", catalogId: "sofa-2-seat", name: "2-Seater Sofa", widthCm: 165, depthCm: 80, x: 380, y: 300, rotation: 0, color: "#7a8a6a" },
        { id: "r5", catalogId: "table-coffee-rect", name: "Coffee Table", widthCm: 120, depthCm: 60, x: 180, y: 400, rotation: 0, color: "#c0a882" },
        { id: "r6", catalogId: "table-side-round", name: "Side Table", widthCm: 50, depthCm: 50, x: 560, y: 400, rotation: 0, color: "#c0a882" },
        { id: "r7", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 60, y: 60, rotation: 0, color: "#4a7a5a" },
        { id: "r8", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 680, y: 60, rotation: 0, color: "#4a7a5a" },
        { id: "r9", catalogId: "lounge-chair-single", name: "Lounge Chair", widthCm: 85, depthCm: 80, x: 620, y: 300, rotation: 0, color: "#8a7a6a" },
        { id: "r10", catalogId: "acc-plant-small", name: "Planter Small", widthCm: 35, depthCm: 35, x: 730, y: 420, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
  {
    id: "tpl-training-room",
    name: "Training Room 16-Person",
    description: "Classroom-style training room with rows of training tables, stacking chairs, lectern, whiteboard, and instructor area.",
    category: "Training Room",
    roomWidthCm: 900,
    roomDepthCm: 700,
    furnitureCount: 13,
    layoutJson: JSON.stringify({
      items: [
        { id: "tr1", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 100, y: 150, rotation: 0, color: "#d8d8d8" },
        { id: "tr2", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 340, y: 150, rotation: 0, color: "#d8d8d8" },
        { id: "tr3", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 580, y: 150, rotation: 0, color: "#d8d8d8" },
        { id: "tr4", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 100, y: 300, rotation: 0, color: "#d8d8d8" },
        { id: "tr5", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 340, y: 300, rotation: 0, color: "#d8d8d8" },
        { id: "tr6", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 580, y: 300, rotation: 0, color: "#d8d8d8" },
        { id: "tr7", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 100, y: 450, rotation: 0, color: "#d8d8d8" },
        { id: "tr8", catalogId: "table-training-fold", name: "Training Table", widthCm: 160, depthCm: 60, x: 340, y: 450, rotation: 0, color: "#d8d8d8" },
        { id: "tr9", catalogId: "edu-lectern", name: "Lectern", widthCm: 60, depthCm: 40, x: 420, y: 40, rotation: 0, color: "#b0a888" },
        { id: "tr10", catalogId: "edu-whiteboard-120", name: "Whiteboard", widthCm: 120, depthCm: 5, x: 200, y: 40, rotation: 0, color: "#f0f0f0" },
        { id: "tr11", catalogId: "edu-whiteboard-120", name: "Whiteboard", widthCm: 120, depthCm: 5, x: 550, y: 40, rotation: 0, color: "#f0f0f0" },
        { id: "tr12", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 780, y: 600, rotation: 0, color: "#c8ccd0" },
        { id: "tr13", catalogId: "acc-plant-small", name: "Planter", widthCm: 35, depthCm: 35, x: 50, y: 630, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
  {
    id: "tpl-breakout",
    name: "Breakout Lounge",
    description: "Relaxed breakout area with mixed seating: sofas, lounge chairs, privacy pods, coffee tables, and greenery. Great for informal meetings and recharging.",
    category: "Breakout Space",
    roomWidthCm: 700,
    roomDepthCm: 500,
    furnitureCount: 11,
    layoutJson: JSON.stringify({
      items: [
        { id: "b1", catalogId: "sofa-3-seat", name: "3-Seater Sofa", widthCm: 225, depthCm: 85, x: 60, y: 60, rotation: 0, color: "#7a8a6a" },
        { id: "b2", catalogId: "sofa-2-seat", name: "2-Seater Sofa", widthCm: 165, depthCm: 80, x: 60, y: 280, rotation: 0, color: "#7a8a6a" },
        { id: "b3", catalogId: "lounge-chair-single", name: "Lounge Chair", widthCm: 85, depthCm: 80, x: 350, y: 60, rotation: 0, color: "#8a7a6a" },
        { id: "b4", catalogId: "lounge-chair-single", name: "Lounge Chair", widthCm: 85, depthCm: 80, x: 350, y: 200, rotation: 0, color: "#8a7a6a" },
        { id: "b5", catalogId: "pod-chair-privacy", name: "Privacy Pod", widthCm: 100, depthCm: 100, x: 540, y: 60, rotation: 0, color: "#5a6a7a" },
        { id: "b6", catalogId: "table-coffee-rect", name: "Coffee Table", widthCm: 120, depthCm: 60, x: 100, y: 170, rotation: 0, color: "#c0a882" },
        { id: "b7", catalogId: "table-side-round", name: "Side Table", widthCm: 50, depthCm: 50, x: 450, y: 140, rotation: 0, color: "#c0a882" },
        { id: "b8", catalogId: "ottoman-round", name: "Ottoman", widthCm: 55, depthCm: 55, x: 300, y: 350, rotation: 0, color: "#8a6a5a" },
        { id: "b9", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 600, y: 390, rotation: 0, color: "#4a7a5a" },
        { id: "b10", catalogId: "acc-plant-small", name: "Planter Small", widthCm: 35, depthCm: 35, x: 500, y: 420, rotation: 0, color: "#4a7a5a" },
        { id: "b11", catalogId: "stool-bar", name: "Bar Stool", widthCm: 45, depthCm: 45, x: 540, y: 250, rotation: 0, color: "#3a3a3a" },
      ]
    }),
  },
  {
    id: "tpl-education-lab",
    name: "Education Computer Lab",
    description: "Computer lab layout with individual student desks in rows, instructor podium, whiteboard, and storage. Designed for 12 students.",
    category: "Education Lab",
    roomWidthCm: 900,
    roomDepthCm: 600,
    furnitureCount: 16,
    layoutJson: JSON.stringify({
      items: [
        { id: "ed1", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 80, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed2", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 210, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed3", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 340, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed4", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 470, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed5", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 600, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed6", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 730, y: 140, rotation: 0, color: "#e0d0b0" },
        { id: "ed7", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 80, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed8", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 210, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed9", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 340, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed10", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 470, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed11", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 600, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed12", catalogId: "edu-desk-student", name: "Student Desk", widthCm: 90, depthCm: 55, x: 730, y: 300, rotation: 0, color: "#e0d0b0" },
        { id: "ed13", catalogId: "edu-lectern", name: "Lectern", widthCm: 60, depthCm: 40, x: 400, y: 30, rotation: 0, color: "#b0a888" },
        { id: "ed14", catalogId: "edu-whiteboard-120", name: "Whiteboard", widthCm: 120, depthCm: 5, x: 200, y: 30, rotation: 0, color: "#f0f0f0" },
        { id: "ed15", catalogId: "storage-cabinet-2d", name: "Storage Cabinet", widthCm: 90, depthCm: 45, x: 780, y: 510, rotation: 0, color: "#c8ccd0" },
        { id: "ed16", catalogId: "chair-training", name: "Training Chair", widthCm: 50, depthCm: 52, x: 100, y: 460, rotation: 0, color: "#4a6a8a" },
      ]
    }),
  },
  {
    id: "tpl-hybrid-workspace",
    name: "Hybrid Workspace",
    description: "Balanced hybrid layout combining individual workstations, a collaboration pod, and quiet focus zones with privacy screens and mixed furniture.",
    category: "Hybrid Workspace",
    roomWidthCm: 1000,
    roomDepthCm: 600,
    furnitureCount: 14,
    layoutJson: JSON.stringify({
      items: [
        { id: "hy1", catalogId: "ws-straight-140", name: "Desk 1400", widthCm: 140, depthCm: 60, x: 60, y: 60, rotation: 0, color: "#e8dcc8" },
        { id: "hy2", catalogId: "ws-straight-140", name: "Desk 1400", widthCm: 140, depthCm: 60, x: 60, y: 200, rotation: 0, color: "#e8dcc8" },
        { id: "hy3", catalogId: "ws-straight-140", name: "Desk 1400", widthCm: 140, depthCm: 60, x: 60, y: 340, rotation: 0, color: "#e8dcc8" },
        { id: "hy4", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 130, rotation: 0, color: "#3a3a3a" },
        { id: "hy5", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 270, rotation: 0, color: "#3a3a3a" },
        { id: "hy6", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 80, y: 410, rotation: 0, color: "#3a3a3a" },
        { id: "hy7", catalogId: "acc-partition-full", name: "Partition", widthCm: 100, depthCm: 10, x: 260, y: 60, rotation: 0, color: "#d0d8e0" },
        { id: "hy8", catalogId: "ws-pod-4", name: "4-Pod Cluster", widthCm: 240, depthCm: 240, x: 400, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "hy9", catalogId: "pod-chair-privacy", name: "Privacy Pod", widthCm: 100, depthCm: 100, x: 400, y: 400, rotation: 0, color: "#5a6a7a" },
        { id: "hy10", catalogId: "pod-chair-privacy", name: "Privacy Pod", widthCm: 100, depthCm: 100, x: 550, y: 400, rotation: 0, color: "#5a6a7a" },
        { id: "hy11", catalogId: "table-standing-round", name: "Standing Table", widthCm: 80, depthCm: 80, x: 750, y: 200, rotation: 0, color: "#d8c8a8" },
        { id: "hy12", catalogId: "storage-locker-bank", name: "Lockers", widthCm: 90, depthCm: 45, x: 880, y: 60, rotation: 0, color: "#c0c8d0" },
        { id: "hy13", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 880, y: 500, rotation: 0, color: "#4a7a5a" },
        { id: "hy14", catalogId: "sofa-2-seat", name: "Sofa", widthCm: 165, depthCm: 80, x: 700, y: 400, rotation: 0, color: "#7a8a6a" },
      ]
    }),
  },
  {
    id: "tpl-server-room",
    name: "Server Room / IT Closet",
    description: "Compact server room layout with equipment racks arranged in rows, cooling clearance, workstation for monitoring, and cable management.",
    category: "Server Room",
    roomWidthCm: 500,
    roomDepthCm: 400,
    furnitureCount: 8,
    layoutJson: JSON.stringify({
      items: [
        { id: "sr1", catalogId: "storage-cabinet-high", name: "Server Rack A", widthCm: 90, depthCm: 45, x: 50, y: 50, rotation: 0, color: "#2a2a2a" },
        { id: "sr2", catalogId: "storage-cabinet-high", name: "Server Rack B", widthCm: 90, depthCm: 45, x: 180, y: 50, rotation: 0, color: "#2a2a2a" },
        { id: "sr3", catalogId: "storage-cabinet-high", name: "Server Rack C", widthCm: 90, depthCm: 45, x: 310, y: 50, rotation: 0, color: "#2a2a2a" },
        { id: "sr4", catalogId: "storage-cabinet-high", name: "Server Rack D", widthCm: 90, depthCm: 45, x: 50, y: 220, rotation: 0, color: "#2a2a2a" },
        { id: "sr5", catalogId: "storage-cabinet-high", name: "Server Rack E", widthCm: 90, depthCm: 45, x: 180, y: 220, rotation: 0, color: "#2a2a2a" },
        { id: "sr6", catalogId: "ws-straight-120", name: "Monitor Desk", widthCm: 120, depthCm: 60, x: 340, y: 300, rotation: 0, color: "#e8dcc8" },
        { id: "sr7", catalogId: "chair-task-std", name: "Task Chair", widthCm: 65, depthCm: 65, x: 370, y: 210, rotation: 0, color: "#3a3a3a" },
        { id: "sr8", catalogId: "storage-pedestal-2d", name: "Tool Drawer", widthCm: 40, depthCm: 56, x: 420, y: 140, rotation: 0, color: "#b0b8c0" },
      ]
    }),
  },
  {
    id: "tpl-huddle-4",
    name: "4-Person Huddle Room",
    description: "Compact meeting space for quick stand-ups or small video calls with a 4-person table, chairs, and a wall-mounted display area.",
    category: "Meeting Room",
    roomWidthCm: 400,
    roomDepthCm: 350,
    furnitureCount: 7,
    layoutJson: JSON.stringify({
      items: [
        { id: "hu1", catalogId: "table-meeting-4", name: "Meeting Table", widthCm: 140, depthCm: 80, x: 130, y: 130, rotation: 0, color: "#c8b99a" },
        { id: "hu2", catalogId: "chair-conference", name: "Chair", widthCm: 60, depthCm: 62, x: 140, y: 60, rotation: 0, color: "#3a3a3a" },
        { id: "hu3", catalogId: "chair-conference", name: "Chair", widthCm: 60, depthCm: 62, x: 220, y: 60, rotation: 0, color: "#3a3a3a" },
        { id: "hu4", catalogId: "chair-conference", name: "Chair", widthCm: 60, depthCm: 62, x: 140, y: 220, rotation: 0, color: "#3a3a3a" },
        { id: "hu5", catalogId: "chair-conference", name: "Chair", widthCm: 60, depthCm: 62, x: 220, y: 220, rotation: 0, color: "#3a3a3a" },
        { id: "hu6", catalogId: "edu-whiteboard-120", name: "Whiteboard", widthCm: 120, depthCm: 5, x: 50, y: 300, rotation: 0, color: "#f0f0f0" },
        { id: "hu7", catalogId: "acc-plant-small", name: "Planter", widthCm: 35, depthCm: 35, x: 340, y: 40, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
  {
    id: "tpl-coworking-flex",
    name: "Coworking Flex Space",
    description: "Multi-zone coworking environment with bench desks, standing tables, breakout sofas, bar stools, and lockers for day-pass workers.",
    category: "Open Office",
    roomWidthCm: 1200,
    roomDepthCm: 800,
    furnitureCount: 16,
    layoutJson: JSON.stringify({
      items: [
        { id: "cw1", catalogId: "ws-bench-4", name: "Bench 4-seater", widthCm: 480, depthCm: 75, x: 60, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "cw2", catalogId: "ws-bench-2", name: "Bench 2-seater", widthCm: 240, depthCm: 75, x: 60, y: 250, rotation: 0, color: "#c8b99a" },
        { id: "cw3", catalogId: "ws-bench-2", name: "Bench 2-seater", widthCm: 240, depthCm: 75, x: 360, y: 250, rotation: 0, color: "#c8b99a" },
        { id: "cw4", catalogId: "table-standing-round", name: "Standing Table", widthCm: 80, depthCm: 80, x: 700, y: 60, rotation: 0, color: "#d8c8a8" },
        { id: "cw5", catalogId: "table-standing-round", name: "Standing Table", widthCm: 80, depthCm: 80, x: 840, y: 60, rotation: 0, color: "#d8c8a8" },
        { id: "cw6", catalogId: "stool-bar", name: "Bar Stool", widthCm: 45, depthCm: 45, x: 710, y: 160, rotation: 0, color: "#3a3a3a" },
        { id: "cw7", catalogId: "stool-bar", name: "Bar Stool", widthCm: 45, depthCm: 45, x: 770, y: 160, rotation: 0, color: "#3a3a3a" },
        { id: "cw8", catalogId: "stool-bar", name: "Bar Stool", widthCm: 45, depthCm: 45, x: 850, y: 160, rotation: 0, color: "#3a3a3a" },
        { id: "cw9", catalogId: "stool-bar", name: "Bar Stool", widthCm: 45, depthCm: 45, x: 910, y: 160, rotation: 0, color: "#3a3a3a" },
        { id: "cw10", catalogId: "sofa-3-seat", name: "Sofa", widthCm: 225, depthCm: 85, x: 60, y: 500, rotation: 0, color: "#7a8a6a" },
        { id: "cw11", catalogId: "lounge-chair-single", name: "Lounge Chair", widthCm: 85, depthCm: 80, x: 340, y: 500, rotation: 0, color: "#8a7a6a" },
        { id: "cw12", catalogId: "table-coffee-rect", name: "Coffee Table", widthCm: 120, depthCm: 60, x: 100, y: 620, rotation: 0, color: "#c0a882" },
        { id: "cw13", catalogId: "storage-locker-bank", name: "Lockers", widthCm: 90, depthCm: 45, x: 1070, y: 60, rotation: 0, color: "#c0c8d0" },
        { id: "cw14", catalogId: "storage-locker-bank", name: "Lockers", widthCm: 90, depthCm: 45, x: 1070, y: 280, rotation: 0, color: "#c0c8d0" },
        { id: "cw15", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 1080, y: 700, rotation: 0, color: "#4a7a5a" },
        { id: "cw16", catalogId: "acc-plant-large", name: "Planter", widthCm: 60, depthCm: 60, x: 600, y: 700, rotation: 0, color: "#4a7a5a" },
      ]
    }),
  },
];

export async function seedDatabase() {
  try {
    const existing = await db.select({ id: catalogItemsTable.id }).from(catalogItemsTable).limit(1);
    if (existing.length > 0) {
      logger.info("Database already seeded, skipping catalog/plans");
    } else {
      logger.info("Seeding catalog...");
      await db.insert(catalogItemsTable).values(
        FURNITURE_CATALOG.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          widthCm: item.widthCm,
          depthCm: item.depthCm,
          heightCm: item.heightCm,
          color: item.color ?? null,
          description: item.description ?? null,
          imageUrl: null,
          shape: item.shape ?? null,
          seatCount: item.seatCount ?? null,
          price: item.price ?? null,
        }))
      );

      logger.info("Seeding sample plans...");
      for (const plan of SAMPLE_PLANS) {
        await db.insert(plansTable).values({
          name: plan.name,
          plannerType: plan.plannerType,
          roomWidthCm: plan.roomWidthCm,
          roomDepthCm: plan.roomDepthCm,
          documentJson: plan.documentJson,
        });
      }
    }

    const existingTemplates = await db.select({ id: templatesTable.id }).from(templatesTable).limit(1);
    if (existingTemplates.length > 0) {
      logger.info("Templates already seeded, skipping");
    } else {
      logger.info("Seeding templates...");
      for (const tpl of TEMPLATES) {
        await db.insert(templatesTable).values({
          id: tpl.id,
          name: tpl.name,
          description: tpl.description,
          category: tpl.category,
          roomWidthCm: tpl.roomWidthCm,
          roomDepthCm: tpl.roomDepthCm,
          layoutJson: tpl.layoutJson,
          furnitureCount: tpl.furnitureCount,
          thumbnailSvg: null,
        });
      }
      logger.info("Templates seeding complete");
    }

    logger.info("Seeding complete");
  } catch (err) {
    logger.error({ err }, "Error seeding database");
  }
}
