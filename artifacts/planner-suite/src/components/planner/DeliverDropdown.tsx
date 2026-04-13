"use client";

import { useState, useRef } from "react";
import {
  Package, FileText, FileSpreadsheet, Link2, Presentation,
  Download, Check, Copy, Loader2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareDialog } from "@/components/share-dialog";
import type Konva from "konva";

function apiBase(): string {
  return typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";
}

interface DeliverDropdownProps {
  planId: number | null;
  planName: string;
  items: Array<{
    name: string;
    category?: string;
    widthCm: number;
    depthCm: number;
    heightCm?: number;
    x: number;
    y: number;
    instanceId: string;
  }>;
  roomWidthCm: number;
  roomDepthCm: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  onExportPng: () => void;
  onStartPresentation: () => void;
}

export function DeliverDropdown({
  planId, planName, items, roomWidthCm, roomDepthCm,
  stageRef, onExportPng, onStartPresentation,
}: DeliverDropdownProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExportPdf = async () => {
    setExporting("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(planName, 10, 8);
      doc.setFontSize(8);
      doc.text(`${roomWidthCm}cm × ${roomDepthCm}cm | ${new Date().toLocaleDateString()}`, 287, 8, { align: "right" });

      const stage = stageRef.current;
      if (stage) {
        const oldScale = { x: stage.scaleX(), y: stage.scaleY() };
        const oldPos = { x: stage.x(), y: stage.y() };
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        const uri = stage.toDataURL({ pixelRatio: 2 });
        stage.scale(oldScale);
        stage.position(oldPos);

        const imgW = 277;
        const imgH = 180;
        doc.addImage(uri, "PNG", 10, 16, imgW, imgH);
      }

      doc.addPage();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("Bill of Quantities", 10, 8);
      doc.setFontSize(8);
      doc.text(planName, 287, 8, { align: "right" });

      doc.setTextColor(0, 0, 0);
      const headers = ["#", "Item Name", "Category", "Width (cm)", "Depth (cm)", "Height (cm)", "Qty"];
      const colWidths = [10, 80, 50, 30, 30, 30, 20];
      let y = 20;

      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 4, 250, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      let x = 10;
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y);
        x += colWidths[i];
      });
      y += 8;

      const grouped = groupItems(items);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      grouped.forEach((row, idx) => {
        if (y > 190) {
          doc.addPage();
          y = 20;
        }
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(10, y - 4, 250, 7, "F");
        }
        x = 10;
        const vals = [
          String(idx + 1), row.name, row.category,
          String(row.widthCm), String(row.depthCm), String(row.heightCm),
          String(row.qty),
        ];
        vals.forEach((v, i) => {
          doc.text(v, x + 2, y);
          x += colWidths[i];
        });
        y += 7;
      });

      doc.addPage();
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 297, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("Summary & Notes", 10, 8);
      doc.setFontSize(8);
      doc.text(planName, 287, 8, { align: "right" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      y = 22;
      doc.text(`Room Dimensions: ${roomWidthCm}cm × ${roomDepthCm}cm (${(roomWidthCm * roomDepthCm / 10000).toFixed(1)} m²)`, 10, y);
      y += 8;
      doc.text(`Total Items: ${items.length}`, 10, y);
      y += 8;
      const usedArea = items.reduce((s, i) => s + i.widthCm * i.depthCm, 0);
      const totalArea = roomWidthCm * roomDepthCm;
      doc.text(`Space Utilization: ${Math.round((usedArea / totalArea) * 100)}%`, 10, y);
      y += 12;

      const categories = [...new Set(items.map(i => i.category || "Other"))];
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Category Breakdown:", 10, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      categories.forEach(cat => {
        const count = items.filter(i => (i.category || "Other") === cat).length;
        doc.text(`• ${cat}: ${count} item${count !== 1 ? "s" : ""}`, 14, y);
        y += 6;
      });

      doc.save(`${planName.replace(/[^a-z0-9]/gi, "_")}_report.pdf`);
    } catch (e) {
      console.error("PDF export failed:", e);
    }
    setExporting(null);
  };

  const handleExportCsv = () => {
    setExporting("csv");
    try {
      const grouped = groupItems(items);
      const rows = [
        ["Item Name", "Category", "Width (cm)", "Depth (cm)", "Height (cm)", "Quantity"].join(","),
        ...grouped.map(r =>
          [
            `"${r.name}"`, `"${r.category}"`,
            r.widthCm, r.depthCm, r.heightCm, r.qty,
          ].join(",")
        ),
      ];
      const csv = rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${planName.replace(/[^a-z0-9]/gi, "_")}_boq.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CSV export failed:", e);
    }
    setExporting(null);
  };

  const handleCopyClientLink = async () => {
    if (!planId) return;
    setExporting("link");
    try {
      const res = await fetch(`${apiBase()}/plans/${planId}/shares`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const activeShares = (data.shares || []).filter((s: any) => s.isActive);
        if (activeShares.length > 0) {
          const url = `${window.location.origin}/share/${activeShares[0].shareToken}`;
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setShareDialogOpen(true);
        }
      }
    } catch {
      setShareDialogOpen(true);
    }
    setExporting(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]">
            <Package className="w-3 h-3" />
            <span className="hidden lg:inline">Deliver</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={handleExportPdf} disabled={!!exporting}>
            {exporting === "pdf" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            PDF Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCsv} disabled={!!exporting}>
            {exporting === "csv" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
            Spreadsheet (CSV)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyClientLink} disabled={!planId || !!exporting}>
            {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : exporting === "link" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
            {copied ? "Link Copied!" : "Client Link"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onStartPresentation} disabled={items.length === 0}>
            <Presentation className="w-4 h-4 mr-2" />
            Presentation Mode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportPng}>
            <Download className="w-4 h-4 mr-2" />
            Export PNG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {planId && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          planId={planId}
          planName={planName}
        />
      )}
    </>
  );
}

interface GroupedItem {
  name: string;
  category: string;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  qty: number;
}

function groupItems(items: Array<{ name: string; category?: string; widthCm: number; depthCm: number; heightCm?: number }>): GroupedItem[] {
  const map = new Map<string, GroupedItem>();
  for (const item of items) {
    const key = `${item.name}|${item.category || "Other"}|${item.widthCm}|${item.depthCm}|${item.heightCm ?? 75}`;
    const existing = map.get(key);
    if (existing) {
      existing.qty++;
    } else {
      map.set(key, {
        name: item.name,
        category: item.category || "Other",
        widthCm: item.widthCm,
        depthCm: item.depthCm,
        heightCm: item.heightCm ?? 75,
        qty: 1,
      });
    }
  }
  return Array.from(map.values());
}
