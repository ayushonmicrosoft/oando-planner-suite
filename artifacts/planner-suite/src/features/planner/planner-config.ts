export interface PlannerConfig {
  canvas: {
    padding: number;
    minWidth: number;
    minHeight: number;
    defaultRoomWidth: number;
    defaultRoomDepth: number;
  };
  logic: {
    minimumWallGapCm: number;
    defaultWallThicknessCm: number;
    snappingGridSizeCm: number;
  };
  ui: {
    sidebarWidthLg: number;
    sidebarWidthXl: number;
    inspectorWidthLg: number;
    inspectorWidthXl: number;
    transitionDurationMs: number;
  };
  export: {
    pdfScale: number;
    pdfPageColor: string;
    pdfHeaderColor: string;
  };
}

export const plannerConfig: PlannerConfig = {
  canvas: {
    padding: 18,
    minWidth: 320,
    minHeight: 220,
    defaultRoomWidth: 960,
    defaultRoomDepth: 640,
  },
  logic: {
    minimumWallGapCm: 180,
    defaultWallThicknessCm: 10,
    snappingGridSizeCm: 10,
  },
  ui: {
    sidebarWidthLg: 312,
    sidebarWidthXl: 324,
    inspectorWidthLg: 300,
    inspectorWidthXl: 320,
    transitionDurationMs: 500,
  },
  export: {
    pdfScale: 2,
    pdfPageColor: "#f8fbff",
    pdfHeaderColor: "#1F3653",
  },
};
