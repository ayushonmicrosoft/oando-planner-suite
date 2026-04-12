import { db } from "./index";
import { catalogItemsTable } from "./schema/catalog";

const AFC_CDN = "https://www.afcindia.in";

interface SeedProduct {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  color: string | null;
  description: string;
  imageUrl: string;
  shape: string;
  seatCount: number | null;
}

const products: SeedProduct[] = [
  // ─── WORKSTATIONS ─── Height Adjustable Series (Adaptable)
  { id: "afc-ws-adapt-01", name: "Adaptable Pro 1200", category: "workstations", subCategory: "Height Adjustable Series", widthCm: 120, depthCm: 60, heightCm: 125, color: "#1F3653", description: "Electric height-adjustable desk with dual motor, memory preset panel. Adjustable from 65cm to 125cm.", imageUrl: `${AFC_CDN}/images/products/workstations/adaptable-pro-1200.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-adapt-02", name: "Adaptable Pro 1500", category: "workstations", subCategory: "Height Adjustable Series", widthCm: 150, depthCm: 75, heightCm: 125, color: "#1F3653", description: "Large electric sit-stand desk with anti-collision sensor and cable management tray.", imageUrl: `${AFC_CDN}/images/products/workstations/adaptable-pro-1500.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-adapt-03", name: "Adaptable Lite 1000", category: "workstations", subCategory: "Height Adjustable Series", widthCm: 100, depthCm: 60, heightCm: 120, color: "#1F3653", description: "Compact height-adjustable desk with manual crank mechanism, ideal for small offices.", imageUrl: `${AFC_CDN}/images/products/workstations/adaptable-lite-1000.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-adapt-04", name: "Adaptable Corner L", category: "workstations", subCategory: "Height Adjustable Series", widthCm: 160, depthCm: 120, heightCm: 125, color: "#1F3653", description: "L-shaped height-adjustable corner workstation with three-leg frame for maximum stability.", imageUrl: `${AFC_CDN}/images/products/workstations/adaptable-corner-l.jpg`, shape: "rect", seatCount: 1 },

  // ─── WORKSTATIONS ─── Desking Series
  { id: "afc-ws-dp1-01", name: "DeskPro 1 Linear 1200", category: "workstations", subCategory: "Desking Series - DeskPro 1", widthCm: 120, depthCm: 60, heightCm: 75, color: "#1F3653", description: "Entry-level linear workstation with modesty panel and cable port. Powder-coated steel frame.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro1-linear-1200.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-dp1-02", name: "DeskPro 1 Linear 1500", category: "workstations", subCategory: "Desking Series - DeskPro 1", widthCm: 150, depthCm: 60, heightCm: 75, color: "#1F3653", description: "Standard linear workstation with wire management and modesty panel.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro1-linear-1500.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-dp2-01", name: "DeskPro 2 Cluster of 2", category: "workstations", subCategory: "Desking Series - DeskPro 2", widthCm: 240, depthCm: 120, heightCm: 75, color: "#1F3653", description: "Face-to-face 2-person workstation cluster with shared center beam and privacy screens.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro2-cluster-2.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-ws-dp2-02", name: "DeskPro 2 Cluster of 4", category: "workstations", subCategory: "Desking Series - DeskPro 2", widthCm: 240, depthCm: 240, heightCm: 75, color: "#1F3653", description: "4-person bench workstation with shared legs and optional desktop screens.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro2-cluster-4.jpg`, shape: "rect", seatCount: 4 },
  { id: "afc-ws-dp3-01", name: "DeskPro 3 L-Shape", category: "workstations", subCategory: "Desking Series - DeskPro 3", widthCm: 160, depthCm: 120, heightCm: 75, color: "#1F3653", description: "L-shaped executive workstation with return unit and integrated cable management.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro3-l-shape.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-dp3-02", name: "DeskPro 3 Manager", category: "workstations", subCategory: "Desking Series - DeskPro 3", widthCm: 180, depthCm: 80, heightCm: 75, color: "#1F3653", description: "Manager desk with full modesty panel, bow-front top, and premium laminate finish.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro3-manager.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-dp4-01", name: "DeskPro 4 Cluster of 6", category: "workstations", subCategory: "Desking Series - DeskPro 4", widthCm: 360, depthCm: 240, heightCm: 75, color: "#1F3653", description: "6-seater bench system with shared central beam, under-desk pedestals, and screen dividers.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro4-cluster-6.jpg`, shape: "rect", seatCount: 6 },
  { id: "afc-ws-dp4-02", name: "DeskPro 4 Cluster of 8", category: "workstations", subCategory: "Desking Series - DeskPro 4", widthCm: 480, depthCm: 240, heightCm: 75, color: "#1F3653", description: "8-seater open-plan bench workstation with optional privacy screens and power modules.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro4-cluster-8.jpg`, shape: "rect", seatCount: 8 },
  { id: "afc-ws-dp5-01", name: "DeskPro 5 120° Cluster 3", category: "workstations", subCategory: "Desking Series - DeskPro 5", widthCm: 300, depthCm: 260, heightCm: 75, color: "#1F3653", description: "120-degree 3-person radial cluster with shared central post and cable routing.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro5-120-cluster-3.jpg`, shape: "rect", seatCount: 3 },
  { id: "afc-ws-dp5-02", name: "DeskPro 5 120° Cluster 6", category: "workstations", subCategory: "Desking Series - DeskPro 5", widthCm: 420, depthCm: 420, heightCm: 75, color: "#1F3653", description: "6-person 120-degree radial workstation with shared cable spine and optional screens.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro5-120-cluster-6.jpg`, shape: "rect", seatCount: 6 },
  { id: "afc-ws-dp6-01", name: "DeskPro 6 Executive Suite", category: "workstations", subCategory: "Desking Series - DeskPro 6", widthCm: 200, depthCm: 100, heightCm: 75, color: "#1F3653", description: "Premium executive desk with leather inlay, bow-front design, and integrated power.", imageUrl: `${AFC_CDN}/images/products/workstations/deskpro6-executive.jpg`, shape: "rect", seatCount: 1 },

  // ─── WORKSTATIONS ─── Panel Series
  { id: "afc-ws-panel-01", name: "Panel Workstation Linear", category: "workstations", subCategory: "Panel Series", widthCm: 120, depthCm: 60, heightCm: 110, color: "#1F3653", description: "Panel-based linear workstation with fabric-covered screens for acoustic privacy.", imageUrl: `${AFC_CDN}/images/products/workstations/panel-linear.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-panel-02", name: "Panel Workstation L-Shape", category: "workstations", subCategory: "Panel Series", widthCm: 150, depthCm: 150, heightCm: 110, color: "#1F3653", description: "L-shaped panel workstation with overhead storage bin and task lighting.", imageUrl: `${AFC_CDN}/images/products/workstations/panel-l-shape.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-ws-panel-03", name: "Panel Cluster of 4", category: "workstations", subCategory: "Panel Series", widthCm: 260, depthCm: 260, heightCm: 110, color: "#1F3653", description: "4-person panel cluster with full-height screens, overhead bins, and power provision.", imageUrl: `${AFC_CDN}/images/products/workstations/panel-cluster-4.jpg`, shape: "rect", seatCount: 4 },

  // ─── TABLES ─── Cabin Tables
  { id: "afc-tbl-cabin-01", name: "NexTable Cabin 1600", category: "tables", subCategory: "Cabin Tables", widthCm: 160, depthCm: 80, heightCm: 75, color: "#e85d04", description: "Executive cabin table with wire management box, modesty panel, and premium veneer top.", imageUrl: `${AFC_CDN}/images/products/tables/nextable-cabin-1600.jpg`, shape: "rect", seatCount: null },
  { id: "afc-tbl-cabin-02", name: "NexTable Cabin 1800", category: "tables", subCategory: "Cabin Tables", widthCm: 180, depthCm: 90, heightCm: 75, color: "#e85d04", description: "Large executive cabin table with premium edge banding and integrated power grommet.", imageUrl: `${AFC_CDN}/images/products/tables/nextable-cabin-1800.jpg`, shape: "rect", seatCount: null },
  { id: "afc-tbl-cabin-03", name: "Impulse Cabin Table", category: "tables", subCategory: "Cabin Tables", widthCm: 150, depthCm: 75, heightCm: 75, color: "#e85d04", description: "Modern cabin table with chromed steel legs and scratch-resistant laminate top.", imageUrl: `${AFC_CDN}/images/products/tables/impulse-cabin.jpg`, shape: "rect", seatCount: null },

  // ─── TABLES ─── Meeting Tables
  { id: "afc-tbl-meet-01", name: "NexTable Meeting 2400", category: "tables", subCategory: "Meeting Tables", widthCm: 240, depthCm: 120, heightCm: 75, color: "#e85d04", description: "8-seater rectangular meeting table with integrated power & data box and cable tray.", imageUrl: `${AFC_CDN}/images/products/tables/nextable-meeting-2400.jpg`, shape: "rect", seatCount: 8 },
  { id: "afc-tbl-meet-02", name: "NexTable Meeting Round 1200", category: "tables", subCategory: "Meeting Tables", widthCm: 120, depthCm: 120, heightCm: 75, color: "#e85d04", description: "Round meeting table for 4 persons with sturdy disc base and scratch-resistant top.", imageUrl: `${AFC_CDN}/images/products/tables/nextable-meeting-round-1200.jpg`, shape: "round", seatCount: 4 },
  { id: "afc-tbl-meet-03", name: "NexTable Boardroom 3600", category: "tables", subCategory: "Meeting Tables", widthCm: 360, depthCm: 150, heightCm: 75, color: "#e85d04", description: "Premium 12-seater boardroom table with boat-shaped top and integrated AV connectivity.", imageUrl: `${AFC_CDN}/images/products/tables/nextable-boardroom-3600.jpg`, shape: "rect", seatCount: 12 },
  { id: "afc-tbl-meet-04", name: "Impulse Meeting 1800", category: "tables", subCategory: "Meeting Tables", widthCm: 180, depthCm: 90, heightCm: 75, color: "#e85d04", description: "6-seater meeting table with chrome legs and rounded corners for safety.", imageUrl: `${AFC_CDN}/images/products/tables/impulse-meeting-1800.jpg`, shape: "rect", seatCount: 6 },

  // ─── TABLES ─── Cafe Tables
  { id: "afc-tbl-cafe-01", name: "Cafe Round 600", category: "tables", subCategory: "Cafe Tables", widthCm: 60, depthCm: 60, heightCm: 75, color: "#e85d04", description: "Compact round cafe table with disc base, ideal for break areas and cafeterias.", imageUrl: `${AFC_CDN}/images/products/tables/cafe-round-600.jpg`, shape: "round", seatCount: 2 },
  { id: "afc-tbl-cafe-02", name: "Cafe Round 800", category: "tables", subCategory: "Cafe Tables", widthCm: 80, depthCm: 80, heightCm: 75, color: "#e85d04", description: "Medium round cafe table with powder-coated steel base and HPL top.", imageUrl: `${AFC_CDN}/images/products/tables/cafe-round-800.jpg`, shape: "round", seatCount: 4 },
  { id: "afc-tbl-cafe-03", name: "Cafe Square 700", category: "tables", subCategory: "Cafe Tables", widthCm: 70, depthCm: 70, heightCm: 75, color: "#e85d04", description: "Square cafe table with clean geometric design and durable laminate surface.", imageUrl: `${AFC_CDN}/images/products/tables/cafe-square-700.jpg`, shape: "rect", seatCount: 4 },
  { id: "afc-tbl-cafe-04", name: "Cafe High Round 600", category: "tables", subCategory: "Cafe Tables", widthCm: 60, depthCm: 60, heightCm: 105, color: "#e85d04", description: "High cafe table (bar height) with footrest ring and weighted base.", imageUrl: `${AFC_CDN}/images/products/tables/cafe-high-round-600.jpg`, shape: "round", seatCount: 2 },

  // ─── TABLES ─── Training Tables
  { id: "afc-tbl-train-01", name: "Uniflip Training 1400", category: "tables", subCategory: "Training Tables", widthCm: 140, depthCm: 60, heightCm: 75, color: "#e85d04", description: "Flip-top training table with locking mechanism and nesting capability for easy storage.", imageUrl: `${AFC_CDN}/images/products/tables/uniflip-training-1400.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-tbl-train-02", name: "Uniflip Training 1600", category: "tables", subCategory: "Training Tables", widthCm: 160, depthCm: 60, heightCm: 75, color: "#e85d04", description: "Large flip-top nesting training table with modesty panel and cable port.", imageUrl: `${AFC_CDN}/images/products/tables/uniflip-training-1600.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-tbl-train-03", name: "Impulse Training Trapezoid", category: "tables", subCategory: "Training Tables", widthCm: 150, depthCm: 60, heightCm: 75, color: "#e85d04", description: "Trapezoid training table that can be arranged in circular, U-shape, or classroom configurations.", imageUrl: `${AFC_CDN}/images/products/tables/impulse-training-trapezoid.jpg`, shape: "rect", seatCount: 2 },

  // ─── STORAGE ─── Prelam Storage
  { id: "afc-stor-prelam-01", name: "Prelam Low Cabinet", category: "storage", subCategory: "Prelam Storage", widthCm: 80, depthCm: 40, heightCm: 75, color: "#588157", description: "2-shelf low storage cabinet in prelam finish with lockable doors.", imageUrl: `${AFC_CDN}/images/products/storage/prelam-low-cabinet.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-prelam-02", name: "Prelam Medium Cabinet", category: "storage", subCategory: "Prelam Storage", widthCm: 80, depthCm: 40, heightCm: 120, color: "#588157", description: "4-shelf medium height cabinet with swing doors and adjustable shelves.", imageUrl: `${AFC_CDN}/images/products/storage/prelam-medium-cabinet.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-prelam-03", name: "Prelam Full Height Cabinet", category: "storage", subCategory: "Prelam Storage", widthCm: 80, depthCm: 45, heightCm: 200, color: "#588157", description: "Full-height wardrobe unit with hanging rail, shelves, and lockable doors.", imageUrl: `${AFC_CDN}/images/products/storage/prelam-full-height.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-prelam-04", name: "Prelam Credenza 1200", category: "storage", subCategory: "Prelam Storage", widthCm: 120, depthCm: 45, heightCm: 75, color: "#588157", description: "Storage credenza that doubles as a printer stand with two compartments and sliding doors.", imageUrl: `${AFC_CDN}/images/products/storage/prelam-credenza-1200.jpg`, shape: "rect", seatCount: null },

  // ─── STORAGE ─── Metal Storage
  { id: "afc-stor-metal-01", name: "Metal Filing Cabinet 4D", category: "storage", subCategory: "Metal Storage", widthCm: 47, depthCm: 62, heightCm: 132, color: "#588157", description: "4-drawer vertical filing cabinet in CRC steel with anti-tilt mechanism and central locking.", imageUrl: `${AFC_CDN}/images/products/storage/metal-filing-4d.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-metal-02", name: "Metal Cupboard Full", category: "storage", subCategory: "Metal Storage", widthCm: 91, depthCm: 46, heightCm: 198, color: "#588157", description: "Full-height steel cupboard with 4 adjustable shelves, key lock, and powder-coated finish.", imageUrl: `${AFC_CDN}/images/products/storage/metal-cupboard-full.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-metal-03", name: "Metal Lateral Filing 2D", category: "storage", subCategory: "Metal Storage", widthCm: 90, depthCm: 45, heightCm: 72, color: "#588157", description: "2-drawer lateral filing cabinet for A4/foolscap suspension files with full-extension drawers.", imageUrl: `${AFC_CDN}/images/products/storage/metal-lateral-2d.jpg`, shape: "rect", seatCount: null },

  // ─── STORAGE ─── Compactor Storage
  { id: "afc-stor-compact-01", name: "Mobile Compactor 6-Bay", category: "storage", subCategory: "Compactor Storage", widthCm: 540, depthCm: 60, heightCm: 220, color: "#588157", description: "6-bay mobile compactor system on floor tracks with mechanical handle operation, maximizing filing density.", imageUrl: `${AFC_CDN}/images/products/storage/compactor-6-bay.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-compact-02", name: "Mobile Compactor 10-Bay", category: "storage", subCategory: "Compactor Storage", widthCm: 900, depthCm: 60, heightCm: 220, color: "#588157", description: "10-bay heavy-duty mobile compactor with anti-tilt locks and optional electric drive.", imageUrl: `${AFC_CDN}/images/products/storage/compactor-10-bay.jpg`, shape: "rect", seatCount: null },

  // ─── STORAGE ─── Lockers
  { id: "afc-stor-lock-01", name: "Personal Locker 6-Door", category: "storage", subCategory: "Lockers", widthCm: 91, depthCm: 46, heightCm: 198, color: "#588157", description: "6-compartment personal locker with individual cam locks and ventilation slots.", imageUrl: `${AFC_CDN}/images/products/storage/locker-6-door.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-lock-02", name: "Personal Locker 9-Door", category: "storage", subCategory: "Lockers", widthCm: 91, depthCm: 46, heightCm: 198, color: "#588157", description: "9-compartment locker for hot-desking environments with number plates and master key override.", imageUrl: `${AFC_CDN}/images/products/storage/locker-9-door.jpg`, shape: "rect", seatCount: null },
  { id: "afc-stor-lock-03", name: "Pedestal Mobile 3D", category: "storage", subCategory: "Lockers", widthCm: 40, depthCm: 50, heightCm: 60, color: "#588157", description: "3-drawer mobile pedestal on castors with top-lock and cushion-top option.", imageUrl: `${AFC_CDN}/images/products/storage/pedestal-mobile-3d.jpg`, shape: "rect", seatCount: null },

  // ─── SEATING ─── Mesh Chairs (Myel)
  { id: "afc-seat-mesh-01", name: "Myel High Back", category: "seating", subCategory: "Mesh Chairs", widthCm: 65, depthCm: 65, heightCm: 120, color: "#2d6a4f", description: "Ergonomic high-back mesh chair with adjustable lumbar, 3D armrests, and synchro-tilt mechanism.", imageUrl: `${AFC_CDN}/images/products/seating/myel-high-back.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-mesh-02", name: "Myel Mid Back", category: "seating", subCategory: "Mesh Chairs", widthCm: 60, depthCm: 60, heightCm: 105, color: "#2d6a4f", description: "Mid-back mesh task chair with breathable mesh back, foam seat, and adjustable arms.", imageUrl: `${AFC_CDN}/images/products/seating/myel-mid-back.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-mesh-03", name: "Myel Executive", category: "seating", subCategory: "Mesh Chairs", widthCm: 70, depthCm: 70, heightCm: 130, color: "#2d6a4f", description: "Premium executive mesh chair with headrest, seat slide, and polished aluminum base.", imageUrl: `${AFC_CDN}/images/products/seating/myel-executive.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-mesh-04", name: "Myel Visitor", category: "seating", subCategory: "Mesh Chairs", widthCm: 55, depthCm: 55, heightCm: 95, color: "#2d6a4f", description: "Cantilever visitor chair with mesh back and chrome sled base.", imageUrl: `${AFC_CDN}/images/products/seating/myel-visitor.jpg`, shape: "round", seatCount: 1 },

  // ─── SEATING ─── Leather Chairs
  { id: "afc-seat-leath-01", name: "Leather Executive HB", category: "seating", subCategory: "Leather Chairs", widthCm: 70, depthCm: 70, heightCm: 130, color: "#2d6a4f", description: "High-back executive chair in genuine leather with tilt-lock, gas lift, and wooden armrests.", imageUrl: `${AFC_CDN}/images/products/seating/leather-executive-hb.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-leath-02", name: "Leather Executive MB", category: "seating", subCategory: "Leather Chairs", widthCm: 65, depthCm: 65, heightCm: 110, color: "#2d6a4f", description: "Mid-back leather conference chair with chrome base and soft-close tilt.", imageUrl: `${AFC_CDN}/images/products/seating/leather-executive-mb.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-leath-03", name: "Leather Visitor Cantilever", category: "seating", subCategory: "Leather Chairs", widthCm: 60, depthCm: 55, heightCm: 95, color: "#2d6a4f", description: "Leather visitor chair with chrome cantilever frame and padded armrests.", imageUrl: `${AFC_CDN}/images/products/seating/leather-visitor-cantilever.jpg`, shape: "round", seatCount: 1 },

  // ─── SEATING ─── Training Chairs
  { id: "afc-seat-train-01", name: "Training Chair Stackable", category: "seating", subCategory: "Training Chairs", widthCm: 50, depthCm: 50, heightCm: 82, color: "#2d6a4f", description: "Stackable training chair with polypropylene shell and chrome 4-leg base.", imageUrl: `${AFC_CDN}/images/products/seating/training-stackable.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-train-02", name: "Training Chair with Tablet", category: "seating", subCategory: "Training Chairs", widthCm: 55, depthCm: 55, heightCm: 82, color: "#2d6a4f", description: "Training chair with foldable writing tablet arm and storage basket under seat.", imageUrl: `${AFC_CDN}/images/products/seating/training-tablet.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-train-03", name: "Training Chair on Castors", category: "seating", subCategory: "Training Chairs", widthCm: 55, depthCm: 55, heightCm: 85, color: "#2d6a4f", description: "Mobile training chair with 5-star nylon base and dual castors for easy movement.", imageUrl: `${AFC_CDN}/images/products/seating/training-castors.jpg`, shape: "round", seatCount: 1 },

  // ─── SEATING ─── Cafe Chairs
  { id: "afc-seat-cafe-01", name: "Cafe Chair Polypropylene", category: "seating", subCategory: "Cafe Chairs", widthCm: 45, depthCm: 45, heightCm: 80, color: "#2d6a4f", description: "Lightweight cafe chair in UV-stabilized polypropylene, stackable up to 8 high.", imageUrl: `${AFC_CDN}/images/products/seating/cafe-polypropylene.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-cafe-02", name: "Cafe Chair Wooden", category: "seating", subCategory: "Cafe Chairs", widthCm: 45, depthCm: 48, heightCm: 82, color: "#2d6a4f", description: "Solid beechwood cafe chair with curved backrest and natural lacquer finish.", imageUrl: `${AFC_CDN}/images/products/seating/cafe-wooden.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-seat-cafe-03", name: "Cafe Stool High", category: "seating", subCategory: "Cafe Chairs", widthCm: 40, depthCm: 40, heightCm: 75, color: "#2d6a4f", description: "Bar-height cafe stool with footrest ring and powder-coated metal frame.", imageUrl: `${AFC_CDN}/images/products/seating/cafe-stool-high.jpg`, shape: "round", seatCount: 1 },

  // ─── SOFT SEATING ─── Lounge
  { id: "afc-soft-lounge-01", name: "Nuvora Lounge Single", category: "soft-seating", subCategory: "Lounge", widthCm: 80, depthCm: 80, heightCm: 75, color: "#7b2cbf", description: "Single-seater lounge chair with deep foam cushion, fabric upholstery, and wooden legs.", imageUrl: `${AFC_CDN}/images/products/soft-seating/nuvora-lounge-single.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-soft-lounge-02", name: "Nuvora Lounge Double", category: "soft-seating", subCategory: "Lounge", widthCm: 140, depthCm: 80, heightCm: 75, color: "#7b2cbf", description: "Two-seater lounge with high-resilience foam and premium fabric in contemporary design.", imageUrl: `${AFC_CDN}/images/products/soft-seating/nuvora-lounge-double.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-soft-lounge-03", name: "Nuvora Lounge Triple", category: "soft-seating", subCategory: "Lounge", widthCm: 200, depthCm: 80, heightCm: 75, color: "#7b2cbf", description: "Three-seater lounge sofa for reception and breakout areas, with removable cushions.", imageUrl: `${AFC_CDN}/images/products/soft-seating/nuvora-lounge-triple.jpg`, shape: "rect", seatCount: 3 },

  // ─── SOFT SEATING ─── Sofa
  { id: "afc-soft-sofa-01", name: "Office Sofa 2-Seater", category: "soft-seating", subCategory: "Sofa", widthCm: 150, depthCm: 75, heightCm: 80, color: "#7b2cbf", description: "Professional 2-seater office sofa with leatherette upholstery and chrome legs.", imageUrl: `${AFC_CDN}/images/products/soft-seating/office-sofa-2-seater.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-soft-sofa-02", name: "Office Sofa 3-Seater", category: "soft-seating", subCategory: "Sofa", widthCm: 210, depthCm: 75, heightCm: 80, color: "#7b2cbf", description: "3-seater office reception sofa in PU leather with padded armrests.", imageUrl: `${AFC_CDN}/images/products/soft-seating/office-sofa-3-seater.jpg`, shape: "rect", seatCount: 3 },

  // ─── SOFT SEATING ─── Collaborative
  { id: "afc-soft-collab-01", name: "Collaborative Pod 4-Seat", category: "soft-seating", subCategory: "Collaborative", widthCm: 200, depthCm: 200, heightCm: 130, color: "#7b2cbf", description: "4-person collaborative pod with high acoustic panels and integrated power.", imageUrl: `${AFC_CDN}/images/products/soft-seating/collaborative-pod-4.jpg`, shape: "rect", seatCount: 4 },
  { id: "afc-soft-collab-02", name: "Collaborative Booth 2-Seat", category: "soft-seating", subCategory: "Collaborative", widthCm: 140, depthCm: 120, heightCm: 130, color: "#7b2cbf", description: "2-person booth with high-back panels for informal meetings and focused work.", imageUrl: `${AFC_CDN}/images/products/soft-seating/collaborative-booth-2.jpg`, shape: "rect", seatCount: 2 },

  // ─── SOFT SEATING ─── Pouffe
  { id: "afc-soft-pouffe-01", name: "Pouffe Round 500", category: "soft-seating", subCategory: "Pouffe", widthCm: 50, depthCm: 50, heightCm: 42, color: "#7b2cbf", description: "Round pouffe ottoman for informal seating, fabric upholstered with moulded foam.", imageUrl: `${AFC_CDN}/images/products/soft-seating/pouffe-round-500.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-soft-pouffe-02", name: "Pouffe Square 450", category: "soft-seating", subCategory: "Pouffe", widthCm: 45, depthCm: 45, heightCm: 42, color: "#7b2cbf", description: "Square pouffe seat for breakout areas, available in multiple fabric colours.", imageUrl: `${AFC_CDN}/images/products/soft-seating/pouffe-square-450.jpg`, shape: "rect", seatCount: 1 },

  // ─── SOFT SEATING ─── Occasional Tables
  { id: "afc-soft-occ-01", name: "Nuvora Side Table Round", category: "soft-seating", subCategory: "Occasional Tables", widthCm: 45, depthCm: 45, heightCm: 50, color: "#7b2cbf", description: "Round occasional side table with walnut veneer top and steel rod base.", imageUrl: `${AFC_CDN}/images/products/soft-seating/nuvora-side-round.jpg`, shape: "round", seatCount: null },
  { id: "afc-soft-occ-02", name: "Nuvora Coffee Table 1200", category: "soft-seating", subCategory: "Occasional Tables", widthCm: 120, depthCm: 60, heightCm: 45, color: "#7b2cbf", description: "Rectangular coffee table with laminate top and powder-coated steel frame.", imageUrl: `${AFC_CDN}/images/products/soft-seating/nuvora-coffee-1200.jpg`, shape: "rect", seatCount: null },

  // ─── EDUCATIONAL ───
  { id: "afc-edu-desk-01", name: "Student Desk Single", category: "education", subCategory: "Educational Furniture", widthCm: 60, depthCm: 45, heightCm: 75, color: "#0077b6", description: "Single student desk with tilting top, pencil groove, and bag hook.", imageUrl: `${AFC_CDN}/images/products/education/student-desk-single.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-edu-desk-02", name: "Student Desk Double", category: "education", subCategory: "Educational Furniture", widthCm: 120, depthCm: 50, heightCm: 75, color: "#0077b6", description: "Two-seater student desk with shared book shelf and rounded safety edges.", imageUrl: `${AFC_CDN}/images/products/education/student-desk-double.jpg`, shape: "rect", seatCount: 2 },
  { id: "afc-edu-chair-01", name: "Student Chair Stackable", category: "education", subCategory: "Educational Furniture", widthCm: 40, depthCm: 40, heightCm: 75, color: "#0077b6", description: "Durable polypropylene student chair stackable up to 10 high with steel frame.", imageUrl: `${AFC_CDN}/images/products/education/student-chair-stackable.jpg`, shape: "round", seatCount: 1 },
  { id: "afc-edu-teacher-01", name: "Teacher Desk 1200", category: "education", subCategory: "Educational Furniture", widthCm: 120, depthCm: 60, heightCm: 75, color: "#0077b6", description: "Teacher desk with lockable drawer and full modesty panel.", imageUrl: `${AFC_CDN}/images/products/education/teacher-desk-1200.jpg`, shape: "rect", seatCount: 1 },
  { id: "afc-edu-lab-01", name: "Lab Table 1500", category: "education", subCategory: "Educational Furniture", widthCm: 150, depthCm: 75, heightCm: 85, color: "#0077b6", description: "Laboratory table with chemical-resistant top and under-shelf for equipment.", imageUrl: `${AFC_CDN}/images/products/education/lab-table-1500.jpg`, shape: "rect", seatCount: 2 },

  // ─── ACCESSORIES ───
  { id: "afc-acc-monitor-01", name: "Monitor Arm Single", category: "accessories", subCategory: "Desk Accessories", widthCm: 15, depthCm: 15, heightCm: 45, color: "#bc4749", description: "Gas-spring single monitor arm supporting up to 32\" screen, clamp/grommet mount.", imageUrl: `${AFC_CDN}/images/products/accessories/monitor-arm-single.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-monitor-02", name: "Monitor Arm Dual", category: "accessories", subCategory: "Desk Accessories", widthCm: 20, depthCm: 15, heightCm: 45, color: "#bc4749", description: "Dual gas-spring monitor arm for two screens up to 27\" each, with USB pass-through.", imageUrl: `${AFC_CDN}/images/products/accessories/monitor-arm-dual.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-cable-01", name: "Cable Management Tray", category: "accessories", subCategory: "Desk Accessories", widthCm: 60, depthCm: 12, heightCm: 10, color: "#bc4749", description: "Under-desk cable management tray in powder-coated steel with easy clamp installation.", imageUrl: `${AFC_CDN}/images/products/accessories/cable-tray.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-power-01", name: "Desktop Power Module", category: "accessories", subCategory: "Power & Data", widthCm: 25, depthCm: 12, heightCm: 8, color: "#bc4749", description: "Flip-top desktop power module with 2x power sockets, 1x USB-A, 1x USB-C, and 1x RJ45.", imageUrl: `${AFC_CDN}/images/products/accessories/power-module-desktop.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-power-02", name: "In-Table Power Box", category: "accessories", subCategory: "Power & Data", widthCm: 20, depthCm: 20, heightCm: 6, color: "#bc4749", description: "Flush-mount in-table power and data box with motorized lid, 4x sockets and 2x USB.", imageUrl: `${AFC_CDN}/images/products/accessories/power-box-in-table.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-screen-01", name: "Desktop Privacy Screen 1200", category: "accessories", subCategory: "Screens & Dividers", widthCm: 120, depthCm: 2, heightCm: 40, color: "#bc4749", description: "Fabric-covered desktop privacy screen with clamp brackets, 1200mm wide.", imageUrl: `${AFC_CDN}/images/products/accessories/privacy-screen-1200.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-screen-02", name: "Freestanding Screen 1500", category: "accessories", subCategory: "Screens & Dividers", widthCm: 150, depthCm: 4, heightCm: 160, color: "#bc4749", description: "Freestanding acoustic screen panel with steel feet, available in multiple fabric colours.", imageUrl: `${AFC_CDN}/images/products/accessories/freestanding-screen-1500.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-white-01", name: "Whiteboard Mobile 1200x900", category: "accessories", subCategory: "Presentation", widthCm: 120, depthCm: 30, heightCm: 180, color: "#bc4749", description: "Double-sided mobile whiteboard with magnetic surface and lockable castors.", imageUrl: `${AFC_CDN}/images/products/accessories/whiteboard-mobile-1200.jpg`, shape: "rect", seatCount: null },
  { id: "afc-acc-coat-01", name: "Coat Stand Steel", category: "accessories", subCategory: "Office Essentials", widthCm: 38, depthCm: 38, heightCm: 175, color: "#bc4749", description: "Modern steel coat stand with 8 hooks and weighted base for stability.", imageUrl: `${AFC_CDN}/images/products/accessories/coat-stand-steel.jpg`, shape: "round", seatCount: null },
  { id: "afc-acc-planter-01", name: "Office Planter Box", category: "accessories", subCategory: "Office Essentials", widthCm: 40, depthCm: 40, heightCm: 80, color: "#bc4749", description: "Rectangular office planter in powder-coated steel with drainage tray, ideal for biophilic design.", imageUrl: `${AFC_CDN}/images/products/accessories/planter-box.jpg`, shape: "rect", seatCount: null },
];

async function seed() {
  console.log(`Seeding ${products.length} AFC India catalog items...`);

  const { sql } = await import("drizzle-orm");
  await db.delete(catalogItemsTable);

  const batchSize = 20;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await db.insert(catalogItemsTable).values(
      batch.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        widthCm: p.widthCm,
        depthCm: p.depthCm,
        heightCm: p.heightCm,
        color: p.color,
        description: p.description,
        imageUrl: p.imageUrl,
        shape: p.shape,
        seatCount: p.seatCount,
        price: null,
      }))
    );
    console.log(`  Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
  }

  console.log(`Done. ${products.length} products seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
