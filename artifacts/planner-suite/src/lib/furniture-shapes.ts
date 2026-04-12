export type FurnitureShapeType = 
  | 'desk' | 'l-desk' | 'standing-desk'
  | 'chair' | 'office-chair'
  | 'sofa' | 'loveseat'
  | 'table' | 'round-table' | 'conference-table'
  | 'bookshelf' | 'shelf'
  | 'cabinet' | 'filing-cabinet'
  | 'plant' | 'lamp'
  | 'monitor' | 'keyboard'
  | 'whiteboard'
  | 'default';

export interface SVGShapeDef {
  paths: string[];
  fills: string[];
  strokes?: string[];
  strokeWidths?: number[];
}

function deskShape(w: number, h: number, color: string): SVGShapeDef {
  const inset = Math.min(w * 0.06, h * 0.06, 4);
  return {
    paths: [
      `M 2 2 L ${w - 2} 2 L ${w - 2} ${h - 2} L 2 ${h - 2} Z`,
      `M ${inset + 4} ${inset + 4} L ${w - inset - 4} ${inset + 4} L ${w - inset - 4} ${h * 0.5} L ${inset + 4} ${h * 0.5} Z`,
      `M ${w * 0.4} ${h * 0.55} L ${w * 0.6} ${h * 0.55} L ${w * 0.6} ${h * 0.72} L ${w * 0.4} ${h * 0.72} Z`,
    ],
    fills: [color, adjustBrightness(color, 15), adjustBrightness(color, -10)],
    strokes: ['rgba(0,0,0,0.15)', 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0.1)'],
    strokeWidths: [0.5, 0.5, 0.3],
  };
}

function chairShape(w: number, h: number, color: string): SVGShapeDef {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.38;
  const ry = h * 0.38;
  const backY = h * 0.15;
  const backH = h * 0.18;
  return {
    paths: [
      `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`,
      `M ${cx - rx * 0.65} ${cy - ry * 0.3} A ${rx * 0.65} ${ry * 0.5} 0 1 1 ${cx + rx * 0.65} ${cy - ry * 0.3} L ${cx + rx * 0.65} ${cy + ry * 0.3} A ${rx * 0.65} ${ry * 0.5} 0 1 1 ${cx - rx * 0.65} ${cy + ry * 0.3} Z`,
      `M ${w * 0.25} ${backY} Q ${cx} ${backY - backH * 0.3} ${w * 0.75} ${backY} L ${w * 0.75} ${backY + backH} Q ${cx} ${backY + backH * 1.3} ${w * 0.25} ${backY + backH} Z`,
    ],
    fills: [adjustBrightness(color, -15), color, adjustBrightness(color, -25)],
    strokes: ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.15)', 'rgba(0,0,0,0.15)'],
    strokeWidths: [0.5, 0.3, 0.5],
  };
}

function sofaShape(w: number, h: number, color: string): SVGShapeDef {
  const armW = w * 0.1;
  const backH = h * 0.22;
  return {
    paths: [
      `M 2 ${backH} L ${w - 2} ${backH} L ${w - 2} ${h - 2} L 2 ${h - 2} Z`,
      `M 2 2 L ${w - 2} 2 L ${w - 2} ${backH + 2} L 2 ${backH + 2} Z`,
      `M 2 ${backH} L ${armW + 2} ${backH} L ${armW + 2} ${h - 2} L 2 ${h - 2} Z`,
      `M ${w - armW - 2} ${backH} L ${w - 2} ${backH} L ${w - 2} ${h - 2} L ${w - armW - 2} ${h - 2} Z`,
      `M ${armW + 4} ${backH + 3} L ${w / 2 - 1} ${backH + 3} L ${w / 2 - 1} ${h - 4} L ${armW + 4} ${h - 4} Z`,
      `M ${w / 2 + 1} ${backH + 3} L ${w - armW - 4} ${backH + 3} L ${w - armW - 4} ${h - 4} L ${w / 2 + 1} ${h - 4} Z`,
    ],
    fills: [
      color,
      adjustBrightness(color, -20),
      adjustBrightness(color, -10),
      adjustBrightness(color, -10),
      adjustBrightness(color, 10),
      adjustBrightness(color, 10),
    ],
    strokes: ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.06)'],
    strokeWidths: [0.5, 0.5, 0.3, 0.3, 0.3, 0.3],
  };
}

function tableShape(w: number, h: number, color: string): SVGShapeDef {
  const legInset = Math.min(w * 0.08, 6);
  const legSize = Math.min(w * 0.06, h * 0.06, 4);
  return {
    paths: [
      `M 1 1 L ${w - 1} 1 L ${w - 1} ${h - 1} L 1 ${h - 1} Z`,
      `M ${legInset} ${legInset} L ${legInset + legSize} ${legInset} L ${legInset + legSize} ${legInset + legSize} L ${legInset} ${legInset + legSize} Z`,
      `M ${w - legInset - legSize} ${legInset} L ${w - legInset} ${legInset} L ${w - legInset} ${legInset + legSize} L ${w - legInset - legSize} ${legInset + legSize} Z`,
      `M ${legInset} ${h - legInset - legSize} L ${legInset + legSize} ${h - legInset - legSize} L ${legInset + legSize} ${h - legInset} L ${legInset} ${h - legInset} Z`,
      `M ${w - legInset - legSize} ${h - legInset - legSize} L ${w - legInset} ${h - legInset - legSize} L ${w - legInset} ${h - legInset} L ${w - legInset - legSize} ${h - legInset} Z`,
    ],
    fills: [color, adjustBrightness(color, -30), adjustBrightness(color, -30), adjustBrightness(color, -30), adjustBrightness(color, -30)],
    strokes: ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)'],
    strokeWidths: [0.5, 0.3, 0.3, 0.3, 0.3],
  };
}

function bookshelfShape(w: number, h: number, color: string): SVGShapeDef {
  const paths: string[] = [];
  const fills: string[] = [];
  const strokes: string[] = [];
  const strokeWidths: number[] = [];

  paths.push(`M 1 1 L ${w - 1} 1 L ${w - 1} ${h - 1} L 1 ${h - 1} Z`);
  fills.push(color);
  strokes.push('rgba(0,0,0,0.15)');
  strokeWidths.push(0.5);

  const shelfCount = Math.max(2, Math.round(h / (w * 0.4)));
  const shelfH = h / (shelfCount + 1);
  for (let i = 1; i <= shelfCount; i++) {
    const sy = shelfH * i;
    paths.push(`M 2 ${sy - 0.5} L ${w - 2} ${sy - 0.5} L ${w - 2} ${sy + 0.5} L 2 ${sy + 0.5} Z`);
    fills.push(adjustBrightness(color, -20));
    strokes.push('rgba(0,0,0,0.1)');
    strokeWidths.push(0.2);
  }

  for (let i = 0; i < shelfCount; i++) {
    const sy = shelfH * i + 2;
    const sh = shelfH - 3;
    const bookCount = Math.max(2, Math.floor(w / 8));
    for (let b = 0; b < bookCount; b++) {
      const bx = 3 + (b * (w - 6)) / bookCount;
      const bw = (w - 6) / bookCount - 1;
      const bh = sh * (0.5 + Math.random() * 0.4);
      paths.push(`M ${bx} ${sy + sh - bh} L ${bx + bw} ${sy + sh - bh} L ${bx + bw} ${sy + sh} L ${bx} ${sy + sh} Z`);
      fills.push(adjustBrightness(color, -5 + Math.floor(Math.random() * 30 - 15)));
      strokes.push('rgba(0,0,0,0.06)');
      strokeWidths.push(0.2);
    }
  }

  return { paths, fills, strokes, strokeWidths };
}

function cabinetShape(w: number, h: number, color: string): SVGShapeDef {
  const doorGap = 1;
  const halfW = w / 2;
  return {
    paths: [
      `M 1 1 L ${w - 1} 1 L ${w - 1} ${h - 1} L 1 ${h - 1} Z`,
      `M 3 3 L ${halfW - doorGap} 3 L ${halfW - doorGap} ${h - 3} L 3 ${h - 3} Z`,
      `M ${halfW + doorGap} 3 L ${w - 3} 3 L ${w - 3} ${h - 3} L ${halfW + doorGap} ${h - 3} Z`,
      `M ${halfW - doorGap - 3} ${h * 0.4} L ${halfW - doorGap - 1} ${h * 0.4} L ${halfW - doorGap - 1} ${h * 0.6} L ${halfW - doorGap - 3} ${h * 0.6} Z`,
      `M ${halfW + doorGap + 1} ${h * 0.4} L ${halfW + doorGap + 3} ${h * 0.4} L ${halfW + doorGap + 3} ${h * 0.6} L ${halfW + doorGap + 1} ${h * 0.6} Z`,
    ],
    fills: [
      color,
      adjustBrightness(color, 8),
      adjustBrightness(color, 8),
      adjustBrightness(color, -30),
      adjustBrightness(color, -30),
    ],
    strokes: ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)'],
    strokeWidths: [0.5, 0.3, 0.3, 0.3, 0.3],
  };
}

function defaultRectShape(w: number, h: number, color: string): SVGShapeDef {
  return {
    paths: [`M 1 1 L ${w - 1} 1 L ${w - 1} ${h - 1} L 1 ${h - 1} Z`],
    fills: [color],
    strokes: ['rgba(0,0,0,0.15)'],
    strokeWidths: [0.5],
  };
}

function lShapeLeft(w: number, h: number, color: string): SVGShapeDef {
  const topW = w;
  const topH = h * 0.5;
  const botW = w * 0.5;
  const botH = h * 0.5;
  return {
    paths: [
      `M 2 2 L ${topW - 2} 2 L ${topW - 2} ${topH} L 2 ${topH} Z`,
      `M 2 ${topH} L ${botW} ${topH} L ${botW} ${h - 2} L 2 ${h - 2} Z`,
      `M ${w * 0.15} ${h * 0.12} L ${w * 0.85} ${h * 0.12} L ${w * 0.85} ${h * 0.38} L ${w * 0.15} ${h * 0.38} Z`,
      `M ${w * 0.08} ${h * 0.55} L ${w * 0.42} ${h * 0.55} L ${w * 0.42} ${h * 0.88} L ${w * 0.08} ${h * 0.88} Z`,
    ],
    fills: [color, color, adjustBrightness(color, 12), adjustBrightness(color, 12)],
    strokes: ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.15)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)'],
    strokeWidths: [0.5, 0.5, 0.4, 0.4],
  };
}

function lShapeRight(w: number, h: number, color: string): SVGShapeDef {
  const topW = w;
  const topH = h * 0.5;
  const botW = w * 0.5;
  const botH = h * 0.5;
  return {
    paths: [
      `M 2 2 L ${topW - 2} 2 L ${topW - 2} ${topH} L 2 ${topH} Z`,
      `M ${w * 0.5} ${topH} L ${w - 2} ${topH} L ${w - 2} ${h - 2} L ${w * 0.5} ${h - 2} Z`,
      `M ${w * 0.15} ${h * 0.12} L ${w * 0.85} ${h * 0.12} L ${w * 0.85} ${h * 0.38} L ${w * 0.15} ${h * 0.38} Z`,
      `M ${w * 0.58} ${h * 0.55} L ${w * 0.92} ${h * 0.55} L ${w * 0.92} ${h * 0.88} L ${w * 0.58} ${h * 0.88} Z`,
    ],
    fills: [color, color, adjustBrightness(color, 12), adjustBrightness(color, 12)],
    strokes: ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.15)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)'],
    strokeWidths: [0.5, 0.5, 0.4, 0.4],
  };
}

export function getFurnitureShapeDef(
  category: string,
  shape: string,
  w: number,
  h: number,
  color: string
): SVGShapeDef {
  const cat = category.toLowerCase();
  const sh = shape.toLowerCase();

  if (sh === 'l-left') return lShapeLeft(w, h, color);
  if (sh === 'l-right') return lShapeRight(w, h, color);

  if (cat.includes('chair') || sh === 'round' || sh === 'circle' || sh === 'office-chair') {
    return chairShape(w, h, color);
  }
  if (cat.includes('sofa') || cat.includes('couch') || cat.includes('loveseat') || cat.includes('lounge')) {
    return sofaShape(w, h, color);
  }
  if (cat.includes('desk')) {
    return deskShape(w, h, color);
  }
  if (cat.includes('table') || cat.includes('conference')) {
    return tableShape(w, h, color);
  }
  if (cat.includes('bookshelf') || cat.includes('shelf') || cat.includes('shelving')) {
    return bookshelfShape(w, h, color);
  }
  if (cat.includes('cabinet') || cat.includes('storage') || cat.includes('filing') || cat.includes('credenza') || cat.includes('wardrobe')) {
    return cabinetShape(w, h, color);
  }

  return defaultRectShape(w, h, color);
}

function adjustBrightness(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getCategoryIcon(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('desk')) return '🖥️';
  if (cat.includes('chair') || cat.includes('seating')) return '🪑';
  if (cat.includes('sofa') || cat.includes('couch') || cat.includes('lounge')) return '🛋️';
  if (cat.includes('table')) return '🍽️';
  if (cat.includes('bookshelf') || cat.includes('shelf')) return '📚';
  if (cat.includes('cabinet') || cat.includes('storage')) return '🗄️';
  if (cat.includes('plant')) return '🌿';
  if (cat.includes('lamp') || cat.includes('light')) return '💡';
  return '📦';
}
