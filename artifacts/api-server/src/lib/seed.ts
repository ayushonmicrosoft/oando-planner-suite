import { db, catalogItemsTable, plansTable, templatesTable, seriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const SERIES_DATA = [
  {
    id: "series-economy",
    name: "Economy Series",
    tier: "economy" as const,
    description: "Cost-effective office solutions with reliable performance. X-Bench workstations, Toro chairs, Hush soft seating, and Prelam storage.",
    imageUrl: "https://oando.co.in/images/catalog/oando-workstations--x-bench/image-1.jpg",
  },
  {
    id: "series-medium",
    name: "Medium Series",
    tier: "medium" as const,
    description: "Balanced design and ergonomics for the modern workspace. DeskPro workstations, Fluid X chairs, Almira soft seating, and Prelam storage.",
    imageUrl: "https://oando.co.in/images/catalog/oando-workstations--deskpro/image-1.jpg",
  },
  {
    id: "series-premium",
    name: "Premium Series",
    tier: "premium" as const,
    description: "Top-tier ergonomic furniture for executive and premium offices. Adaptable workstations, Omnia chairs, Almira soft seating, and Prelam storage.",
    imageUrl: "https://oando.co.in/images/catalog/oando-workstations--adaptable/image-1.jpg",
  },
];

const FURNITURE_CATALOG = [
  // --- ECONOMY SERIES ---
  { id: "ws-xbench-120", name: "X-Bench 1200", category: "workstations", widthCm: 120, depthCm: 60, heightCm: 75, color: "#d4c4a8", description: "X-Bench linear workstation 1200mm. Economy-tier bench desking for open plan offices.", shape: "rect", seatCount: 1, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--x-bench/image-1.jpg", seriesId: "series-economy" },
  { id: "ws-xbench-140", name: "X-Bench 1400", category: "workstations", widthCm: 140, depthCm: 60, heightCm: 75, color: "#d4c4a8", description: "X-Bench linear workstation 1400mm. Wider economy bench desk for individual use.", shape: "rect", seatCount: 1, price: 9800, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--x-bench/image-1.jpg", seriesId: "series-economy" },
  { id: "ws-xbench-2s", name: "X-Bench 2-Seater", category: "workstations", widthCm: 240, depthCm: 75, heightCm: 75, color: "#d4c4a8", description: "X-Bench 2-seater back-to-back bench workstation.", shape: "rect", seatCount: 2, price: 16000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--x-bench/image-1.jpg", seriesId: "series-economy" },
  { id: "ws-xbench-4s", name: "X-Bench 4-Seater", category: "workstations", widthCm: 480, depthCm: 75, heightCm: 75, color: "#d4c4a8", description: "X-Bench 4-seater linear bench workstation for open-plan offices.", shape: "rect", seatCount: 4, price: 28000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--x-bench/image-1.jpg", seriesId: "series-economy" },
  { id: "chair-toro", name: "Toro Task Chair", category: "seating", widthCm: 65, depthCm: 65, heightCm: 90, color: "#3a3a3a", description: "Toro ergonomic task chair with adjustable lumbar support. Economy-tier seating.", shape: "circle", seatCount: 1, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-seating--toro/image-1.jpg", seriesId: "series-economy" },
  { id: "sofa-hush-2", name: "Hush 2-Seater", category: "soft-seating", widthCm: 160, depthCm: 78, heightCm: 75, color: "#7a8a6a", description: "Hush 2-seater soft seating for breakout and reception areas.", shape: "rect", seatCount: 2, price: 22000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--hush/image-1.jpg", seriesId: "series-economy" },
  { id: "sofa-hush-3", name: "Hush 3-Seater", category: "soft-seating", widthCm: 220, depthCm: 80, heightCm: 78, color: "#7a8a6a", description: "Hush 3-seater lounge sofa for reception and collaboration areas.", shape: "rect", seatCount: 3, price: 32000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--hush/image-1.jpg", seriesId: "series-economy" },

  // --- MEDIUM SERIES ---
  { id: "ws-deskpro-120", name: "DeskPro 1200", category: "workstations", widthCm: 120, depthCm: 60, heightCm: 75, color: "#c8b99a", description: "DeskPro straight desk 1200mm. Medium-tier individual workstation.", shape: "rect", seatCount: 1, price: 12000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--deskpro/image-1.jpg", seriesId: "series-medium" },
  { id: "ws-deskpro-140", name: "DeskPro 1400", category: "workstations", widthCm: 140, depthCm: 60, heightCm: 75, color: "#c8b99a", description: "DeskPro straight desk 1400mm. Wider medium-tier workstation.", shape: "rect", seatCount: 1, price: 14000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--deskpro/image-1.jpg", seriesId: "series-medium" },
  { id: "ws-deskpro-l", name: "DeskPro L-Shape", category: "workstations", widthCm: 160, depthCm: 120, heightCm: 75, color: "#c8b99a", description: "DeskPro L-shaped workstation with return. Medium-tier corner desk.", shape: "l-right", seatCount: 1, price: 18500, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--deskpro/image-1.jpg", seriesId: "series-medium" },
  { id: "ws-deskpro-4s", name: "DeskPro 4-Seater Bench", category: "workstations", widthCm: 480, depthCm: 75, heightCm: 75, color: "#c8b99a", description: "DeskPro 4-seater bench desking system for collaborative teams.", shape: "rect", seatCount: 4, price: 42000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--deskpro/image-1.jpg", seriesId: "series-medium" },
  { id: "chair-fluidx", name: "Fluid X Task Chair", category: "seating", widthCm: 68, depthCm: 68, heightCm: 95, color: "#2c2c2c", description: "Fluid X high-performance ergonomic task chair with synchro-tilt mechanism.", shape: "circle", seatCount: 1, price: 16000, imageUrl: "https://oando.co.in/images/catalog/oando-seating--fluid-x/image-1.jpg", seriesId: "series-medium" },
  { id: "sofa-almira-2", name: "Almira 2-Seater", category: "soft-seating", widthCm: 165, depthCm: 82, heightCm: 76, color: "#6a7a8a", description: "Almira 2-seater modular sofa for modern collaborative spaces.", shape: "rect", seatCount: 2, price: 32000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--almira/image-1.jpg", seriesId: "series-medium" },
  { id: "sofa-almira-3", name: "Almira 3-Seater", category: "soft-seating", widthCm: 230, depthCm: 85, heightCm: 78, color: "#6a7a8a", description: "Almira 3-seater modular sofa for reception and lounge areas.", shape: "rect", seatCount: 3, price: 42000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--almira/image-1.jpg", seriesId: "series-medium" },

  // --- PREMIUM SERIES ---
  { id: "ws-adaptable-140", name: "Adaptable 1400", category: "workstations", widthCm: 140, depthCm: 70, heightCm: 75, color: "#b8a88a", description: "Adaptable height-adjustable desk 1400mm. Premium sit-stand workstation.", shape: "rect", seatCount: 1, price: 28000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--adaptable/image-1.jpg", seriesId: "series-premium" },
  { id: "ws-adaptable-160", name: "Adaptable 1600", category: "workstations", widthCm: 160, depthCm: 70, heightCm: 75, color: "#b8a88a", description: "Adaptable height-adjustable desk 1600mm. Large premium sit-stand workstation.", shape: "rect", seatCount: 1, price: 32000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--adaptable/image-1.jpg", seriesId: "series-premium" },
  { id: "ws-adaptable-l", name: "Adaptable L-Shape", category: "workstations", widthCm: 180, depthCm: 140, heightCm: 75, color: "#b8a88a", description: "Adaptable L-shaped height-adjustable executive desk.", shape: "l-right", seatCount: 1, price: 42000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--adaptable/image-1.jpg", seriesId: "series-premium" },
  { id: "ws-adaptable-4s", name: "Adaptable 4-Seater Bench", category: "workstations", widthCm: 480, depthCm: 80, heightCm: 75, color: "#b8a88a", description: "Adaptable 4-seater height-adjustable bench for premium open-plan.", shape: "rect", seatCount: 4, price: 95000, imageUrl: "https://oando.co.in/images/catalog/oando-workstations--adaptable/image-1.jpg", seriesId: "series-premium" },
  { id: "chair-omnia", name: "Omnia Executive Chair", category: "seating", widthCm: 72, depthCm: 72, heightCm: 115, color: "#1a1a1a", description: "Omnia premium executive chair with full adjustability and headrest.", shape: "circle", seatCount: 1, price: 35000, imageUrl: "https://oando.co.in/images/catalog/oando-seating--omnia/image-1.jpg", seriesId: "series-premium" },
  { id: "sofa-almira-prem-2", name: "Almira Premium 2-Seater", category: "soft-seating", widthCm: 170, depthCm: 85, heightCm: 78, color: "#5a6a7a", description: "Almira premium 2-seater with upgraded upholstery for executive lounges.", shape: "rect", seatCount: 2, price: 45000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--almira/image-1.jpg", seriesId: "series-premium" },
  { id: "sofa-almira-prem-3", name: "Almira Premium 3-Seater", category: "soft-seating", widthCm: 240, depthCm: 88, heightCm: 80, color: "#5a6a7a", description: "Almira premium 3-seater executive lounge sofa.", shape: "rect", seatCount: 3, price: 58000, imageUrl: "https://oando.co.in/images/catalog/oando-soft-seating--almira/image-1.jpg", seriesId: "series-premium" },

  // --- PRELAM STORAGE (Economy & Medium tiers) ---
  { id: "storage-prelam-ped2", name: "Prelam Pedestal 2-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 60, color: "#c8b99a", description: "Prelam 2-drawer mobile pedestal with central locking.", shape: "rect", seatCount: null, price: 4500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--prelam/image-1.jpg", seriesId: "series-economy" },
  { id: "storage-prelam-ped3", name: "Prelam Pedestal 3-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 75, color: "#c8b99a", description: "Prelam 3-drawer lockable mobile pedestal.", shape: "rect", seatCount: null, price: 5500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--prelam/image-1.jpg", seriesId: "series-economy" },
  { id: "storage-prelam-cab", name: "Prelam Storage Cabinet", category: "storage", widthCm: 90, depthCm: 45, heightCm: 120, color: "#c8b99a", description: "Prelam 2-door storage cabinet with adjustable shelves.", shape: "rect", seatCount: null, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--prelam/image-1.jpg", seriesId: "series-medium" },
  { id: "storage-prelam-high", name: "Prelam Tall Cabinet", category: "storage", widthCm: 90, depthCm: 45, heightCm: 200, color: "#c8b99a", description: "Prelam full-height storage cabinet with multiple shelves.", shape: "rect", seatCount: null, price: 12000, imageUrl: "https://oando.co.in/images/catalog/oando-storage--prelam/image-1.jpg", seriesId: "series-medium" },
  { id: "storage-prelam-bookcase", name: "Prelam Open Bookcase", category: "storage", widthCm: 90, depthCm: 35, heightCm: 180, color: "#c8b99a", description: "Prelam open-shelf bookcase for offices and libraries.", shape: "rect", seatCount: null, price: 7500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--prelam/image-1.jpg", seriesId: "series-premium" },

  // --- METAL STORAGE (standalone add-on, all tiers) ---
  { id: "storage-metal-ped2", name: "Metal Pedestal 2-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 60, color: "#b0b8c0", description: "Steel 2-drawer mobile pedestal. Heavy-duty construction.", shape: "rect", seatCount: null, price: 6500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--metal/image-1.jpg", seriesId: null },
  { id: "storage-metal-ped3", name: "Metal Pedestal 3-Drawer", category: "storage", widthCm: 40, depthCm: 56, heightCm: 75, color: "#b0b8c0", description: "Steel 3-drawer lockable pedestal with anti-tilt mechanism.", shape: "rect", seatCount: null, price: 7800, imageUrl: "https://oando.co.in/images/catalog/oando-storage--metal/image-1.jpg", seriesId: null },
  { id: "storage-metal-lateral", name: "Metal Lateral Filing 2-Drawer", category: "storage", widthCm: 90, depthCm: 50, heightCm: 72, color: "#b0b8c0", description: "Metal 2-drawer lateral filing unit for A4/foolscap.", shape: "rect", seatCount: null, price: 12000, imageUrl: "https://oando.co.in/images/catalog/oando-storage--metal/image-1.jpg", seriesId: null },
  { id: "storage-metal-locker", name: "Metal Locker Bank 6-Bay", category: "storage", widthCm: 90, depthCm: 45, heightCm: 180, color: "#b0b8c0", description: "6-compartment personal steel locker bank for hot-desking environments.", shape: "rect", seatCount: null, price: 22000, imageUrl: "https://oando.co.in/images/catalog/oando-storage--metal/image-1.jpg", seriesId: null },
  { id: "storage-metal-cupboard", name: "Metal Storage Cupboard", category: "storage", widthCm: 90, depthCm: 45, heightCm: 185, color: "#b0b8c0", description: "Full-height steel storage cupboard with 4 adjustable shelves.", shape: "rect", seatCount: null, price: 14500, imageUrl: "https://oando.co.in/images/catalog/oando-storage--metal/image-1.jpg", seriesId: null },

  // --- TABLES (standalone, not tier-specific) ---
  { id: "table-cabin-4", name: "Cabin Table 4-Person", category: "tables", widthCm: 140, depthCm: 80, heightCm: 75, color: "#c8b99a", description: "4-person cabin table for private offices and small meeting rooms.", shape: "rect", seatCount: 4, price: 16000, imageUrl: "https://oando.co.in/images/catalog/oando-tables--cabin/image-1.jpg", seriesId: null },
  { id: "table-cabin-6", name: "Cabin Table 6-Person", category: "tables", widthCm: 180, depthCm: 90, heightCm: 75, color: "#c8b99a", description: "6-person cabin table for manager cabins and discussions.", shape: "rect", seatCount: 6, price: 22000, imageUrl: "https://oando.co.in/images/catalog/oando-tables--cabin/image-1.jpg", seriesId: null },
  { id: "table-meeting-8", name: "Meeting Table 8-Person", category: "tables", widthCm: 240, depthCm: 110, heightCm: 75, color: "#b8a88a", description: "8-person conference/meeting table with wire management.", shape: "rect", seatCount: 8, price: 38000, imageUrl: "https://oando.co.in/images/catalog/oando-tables--meeting/image-1.jpg", seriesId: null },
  { id: "table-meeting-12", name: "Meeting Table 12-Person", category: "tables", widthCm: 360, depthCm: 120, heightCm: 75, color: "#b8a88a", description: "12-person boardroom table with integrated cable management.", shape: "rect", seatCount: 12, price: 58000, imageUrl: "https://oando.co.in/images/catalog/oando-tables--meeting/image-1.jpg", seriesId: null },
  { id: "table-cafe-round", name: "Cafe Table Round", category: "tables", widthCm: 80, depthCm: 80, heightCm: 75, color: "#d8c8a8", description: "Round cafe table for cafeteria and breakout areas.", shape: "circle", seatCount: 4, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-tables--cafe/image-1.jpg", seriesId: null },
  { id: "table-cafe-square", name: "Cafe Table Square", category: "tables", widthCm: 80, depthCm: 80, heightCm: 75, color: "#d8c8a8", description: "Square cafe table for dining and informal meetings.", shape: "rect", seatCount: 4, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-tables--cafe/image-1.jpg", seriesId: null },
  { id: "table-coffee-rect", name: "Coffee Table Rectangular", category: "tables", widthCm: 120, depthCm: 60, heightCm: 42, color: "#c0a882", description: "Low rectangular coffee table for lounge and reception areas.", shape: "rect", seatCount: null, price: 9500, imageUrl: "https://oando.co.in/images/catalog/oando-tables--cafe/image-1.jpg", seriesId: null },

  // --- VISITOR/CONFERENCE CHAIRS (standalone) ---
  { id: "chair-visitor", name: "Visitor Chair", category: "seating", widthCm: 55, depthCm: 55, heightCm: 80, color: "#5a5a5a", description: "Stackable visitor side chair for meeting rooms and waiting areas.", shape: "circle", seatCount: 1, price: 4500, imageUrl: "https://oando.co.in/images/catalog/oando-seating--visitor/image-1.jpg", seriesId: null },
  { id: "chair-conference", name: "Conference Chair", category: "seating", widthCm: 60, depthCm: 62, heightCm: 90, color: "#3a3a3a", description: "Castor-based conference chair with armrests.", shape: "circle", seatCount: 1, price: 8500, imageUrl: "https://oando.co.in/images/catalog/oando-seating--conference/image-1.jpg", seriesId: null },
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
        { id: "i1", catalogId: "ws-xbench-4s", name: "X-Bench 4-Seater", widthCm: 480, depthCm: 75, x: 80, y: 80, rotation: 0, color: "#d4c4a8" },
        { id: "i2", catalogId: "ws-xbench-2s", name: "X-Bench 2-Seater", widthCm: 240, depthCm: 75, x: 80, y: 230, rotation: 0, color: "#d4c4a8" },
        { id: "i3", catalogId: "chair-toro", name: "Toro Task Chair", widthCm: 65, depthCm: 65, x: 85, y: 155, rotation: 0, color: "#3a3a3a" },
        { id: "i4", catalogId: "chair-toro", name: "Toro Task Chair", widthCm: 65, depthCm: 65, x: 205, y: 155, rotation: 0, color: "#3a3a3a" },
        { id: "i5", catalogId: "storage-prelam-cab", name: "Prelam Storage Cabinet", widthCm: 90, depthCm: 45, x: 680, y: 80, rotation: 0, color: "#c8b99a" },
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
        { id: "j1", catalogId: "table-meeting-8", name: "Meeting Table 8-Person", widthCm: 240, depthCm: 110, x: 180, y: 170, rotation: 0, color: "#b8a88a" },
        { id: "j2", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 195, y: 90, rotation: 0, color: "#3a3a3a" },
        { id: "j3", catalogId: "chair-conference", name: "Conference Chair", widthCm: 60, depthCm: 62, x: 315, y: 90, rotation: 0, color: "#3a3a3a" },
        { id: "j4", catalogId: "storage-prelam-bookcase", name: "Prelam Open Bookcase", widthCm: 90, depthCm: 35, x: 480, y: 50, rotation: 0, color: "#c8b99a" },
      ]
    }),
  },
];

const TEMPLATES = [
  {
    id: "tpl-economy-open",
    name: "Economy Open Office 12-Person",
    description: "Open-plan office using Economy series X-Bench workstations, Toro chairs, and Prelam storage. Cost-effective layout for collaborative teams.",
    category: "Open Office",
    roomWidthCm: 1200,
    roomDepthCm: 800,
    furnitureCount: 16,
    layoutJson: JSON.stringify({
      items: [
        { id: "t1", catalogId: "ws-xbench-4s", name: "X-Bench 4-Seater", widthCm: 480, depthCm: 75, x: 60, y: 60, rotation: 0, color: "#d4c4a8" },
        { id: "t2", catalogId: "ws-xbench-4s", name: "X-Bench 4-Seater", widthCm: 480, depthCm: 75, x: 60, y: 250, rotation: 0, color: "#d4c4a8" },
        { id: "t3", catalogId: "ws-xbench-4s", name: "X-Bench 4-Seater", widthCm: 480, depthCm: 75, x: 60, y: 440, rotation: 0, color: "#d4c4a8" },
        { id: "t4", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 80, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t5", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 200, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t6", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 320, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t7", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 440, y: 140, rotation: 0, color: "#3a3a3a" },
        { id: "t8", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 80, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t9", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 200, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t10", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 320, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t11", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 440, y: 330, rotation: 0, color: "#3a3a3a" },
        { id: "t12", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 80, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t13", catalogId: "chair-toro", name: "Toro Chair", widthCm: 65, depthCm: 65, x: 200, y: 520, rotation: 0, color: "#3a3a3a" },
        { id: "t14", catalogId: "storage-prelam-cab", name: "Prelam Storage Cabinet", widthCm: 90, depthCm: 45, x: 1060, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "t15", catalogId: "storage-prelam-cab", name: "Prelam Storage Cabinet", widthCm: 90, depthCm: 45, x: 1060, y: 300, rotation: 0, color: "#c8b99a" },
        { id: "t16", catalogId: "sofa-hush-2", name: "Hush 2-Seater", widthCm: 160, depthCm: 78, x: 700, y: 600, rotation: 0, color: "#7a8a6a" },
      ]
    }),
  },
  {
    id: "tpl-premium-exec",
    name: "Premium Executive Suite",
    description: "Private executive office with Adaptable sit-stand L-desk, Omnia chair, meeting area for 4, and Prelam bookcase.",
    category: "Executive Suite",
    roomWidthCm: 700,
    roomDepthCm: 500,
    furnitureCount: 9,
    layoutJson: JSON.stringify({
      items: [
        { id: "e1", catalogId: "ws-adaptable-l", name: "Adaptable L-Shape", widthCm: 180, depthCm: 140, x: 60, y: 60, rotation: 0, color: "#b8a88a" },
        { id: "e2", catalogId: "chair-omnia", name: "Omnia Executive Chair", widthCm: 72, depthCm: 72, x: 180, y: 210, rotation: 0, color: "#1a1a1a" },
        { id: "e3", catalogId: "table-cabin-4", name: "Cabin Table 4-Person", widthCm: 140, depthCm: 80, x: 420, y: 280, rotation: 0, color: "#c8b99a" },
        { id: "e4", catalogId: "chair-visitor", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 430, y: 210, rotation: 0, color: "#5a5a5a" },
        { id: "e5", catalogId: "chair-visitor", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 510, y: 210, rotation: 0, color: "#5a5a5a" },
        { id: "e6", catalogId: "chair-visitor", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 430, y: 370, rotation: 0, color: "#5a5a5a" },
        { id: "e7", catalogId: "chair-visitor", name: "Visitor Chair", widthCm: 55, depthCm: 55, x: 510, y: 370, rotation: 0, color: "#5a5a5a" },
        { id: "e8", catalogId: "storage-prelam-bookcase", name: "Prelam Open Bookcase", widthCm: 90, depthCm: 35, x: 60, y: 420, rotation: 0, color: "#c8b99a" },
        { id: "e9", catalogId: "storage-prelam-ped3", name: "Prelam Pedestal 3-Drawer", widthCm: 40, depthCm: 56, x: 250, y: 60, rotation: 0, color: "#c8b99a" },
      ]
    }),
  },
  {
    id: "tpl-meeting-room",
    name: "Board Meeting Room",
    description: "Formal boardroom with 12-person meeting table, conference chairs, and storage. Suitable for presentations and board meetings.",
    category: "Meeting Room",
    roomWidthCm: 800,
    roomDepthCm: 600,
    furnitureCount: 14,
    layoutJson: JSON.stringify({
      items: [
        { id: "m1", catalogId: "table-meeting-12", name: "Meeting Table 12-Person", widthCm: 360, depthCm: 120, x: 220, y: 240, rotation: 0, color: "#b8a88a" },
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
        { id: "m13", catalogId: "storage-prelam-cab", name: "Prelam Storage", widthCm: 90, depthCm: 45, x: 680, y: 50, rotation: 0, color: "#c8b99a" },
        { id: "m14", catalogId: "sofa-almira-2", name: "Almira 2-Seater", widthCm: 165, depthCm: 82, x: 60, y: 500, rotation: 0, color: "#6a7a8a" },
      ]
    }),
  },
  {
    id: "tpl-medium-hybrid",
    name: "Medium Hybrid Workspace",
    description: "Balanced hybrid layout using DeskPro workstations, Fluid X chairs, and Almira seating. Individual desks and collaboration zones.",
    category: "Hybrid Workspace",
    roomWidthCm: 1000,
    roomDepthCm: 600,
    furnitureCount: 12,
    layoutJson: JSON.stringify({
      items: [
        { id: "hy1", catalogId: "ws-deskpro-140", name: "DeskPro 1400", widthCm: 140, depthCm: 60, x: 60, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "hy2", catalogId: "ws-deskpro-140", name: "DeskPro 1400", widthCm: 140, depthCm: 60, x: 60, y: 200, rotation: 0, color: "#c8b99a" },
        { id: "hy3", catalogId: "ws-deskpro-140", name: "DeskPro 1400", widthCm: 140, depthCm: 60, x: 60, y: 340, rotation: 0, color: "#c8b99a" },
        { id: "hy4", catalogId: "chair-fluidx", name: "Fluid X Chair", widthCm: 68, depthCm: 68, x: 80, y: 130, rotation: 0, color: "#2c2c2c" },
        { id: "hy5", catalogId: "chair-fluidx", name: "Fluid X Chair", widthCm: 68, depthCm: 68, x: 80, y: 270, rotation: 0, color: "#2c2c2c" },
        { id: "hy6", catalogId: "chair-fluidx", name: "Fluid X Chair", widthCm: 68, depthCm: 68, x: 80, y: 410, rotation: 0, color: "#2c2c2c" },
        { id: "hy7", catalogId: "ws-deskpro-4s", name: "DeskPro 4-Seater Bench", widthCm: 480, depthCm: 75, x: 400, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "hy8", catalogId: "sofa-almira-3", name: "Almira 3-Seater", widthCm: 230, depthCm: 85, x: 400, y: 400, rotation: 0, color: "#6a7a8a" },
        { id: "hy9", catalogId: "table-coffee-rect", name: "Coffee Table", widthCm: 120, depthCm: 60, x: 440, y: 500, rotation: 0, color: "#c0a882" },
        { id: "hy10", catalogId: "storage-prelam-cab", name: "Prelam Storage Cabinet", widthCm: 90, depthCm: 45, x: 880, y: 60, rotation: 0, color: "#c8b99a" },
        { id: "hy11", catalogId: "storage-metal-locker", name: "Metal Locker Bank", widthCm: 90, depthCm: 45, x: 880, y: 200, rotation: 0, color: "#b0b8c0" },
        { id: "hy12", catalogId: "table-cafe-round", name: "Cafe Table", widthCm: 80, depthCm: 80, x: 700, y: 300, rotation: 0, color: "#d8c8a8" },
      ]
    }),
  },
];

export async function seedDatabase() {
  try {
    const existingSeries = await db.select({ id: seriesTable.id }).from(seriesTable).limit(1);
    if (existingSeries.length === 0) {
      logger.info("Seeding series...");
      for (const series of SERIES_DATA) {
        await db.insert(seriesTable).values(series);
      }
    }

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
          imageUrl: item.imageUrl ?? null,
          shape: item.shape ?? null,
          seatCount: item.seatCount ?? null,
          price: item.price ?? null,
          seriesId: item.seriesId ?? null,
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
