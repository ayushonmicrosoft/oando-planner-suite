"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { usePreviewQuote, useCreateQuote, getPreviewQuoteQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Save, Loader2, FileText } from "lucide-react";
import { jsPDF } from "jspdf";

interface BoquItem {
  catalogId: string;
  name: string;
  category: string;
  quantity: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  unitPrice: number;
  totalPrice: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function generatePdf(
  items: BoquItem[],
  subtotal: number,
  gst: number,
  total: number,
  clientDetails: { clientName: string; clientCompany: string; clientEmail: string; projectName: string },
  planName: string,
  quoteId?: number,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("One&Only", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Office Furniture Solutions", margin, 26);
  doc.setFontSize(9);
  doc.text("www.oneandonly.in", margin, 33);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth - margin, 18, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 26, { align: "right" });
  if (quoteId) {
    doc.text(`Quote #: Q-${String(quoteId).padStart(4, "0")}`, pageWidth - margin, 33, { align: "right" });
  }

  y = 50;
  doc.setTextColor(0, 0, 0);

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 30, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Client Details", margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Company: ${clientDetails.clientCompany}`, margin + 4, y + 14);
  doc.text(`Contact: ${clientDetails.clientName}`, margin + 4, y + 20);
  doc.text(`Email: ${clientDetails.clientEmail}`, margin + 4, y + 26);
  doc.text(`Project: ${clientDetails.projectName}`, pageWidth / 2, y + 14);
  doc.text(`Plan: ${planName}`, pageWidth / 2, y + 20);
  y += 38;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill of Quantities", margin, y);
  y += 6;

  const colX = [margin, margin + 8, margin + 68, margin + 92, margin + 110, margin + 138, margin + 162];
  const colHeaders = ["#", "Item", "Category", "Qty", "Dimensions (W×D×H)", "Unit Price", "Total"];

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  colHeaders.forEach((h, i) => {
    doc.text(h, colX[i], y + 5.5);
  });
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  items.forEach((item, idx) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
    }

    const dims = `${Math.round(item.widthCm)}×${Math.round(item.depthCm)}×${Math.round(item.heightCm)} cm`;
    doc.text(String(idx + 1), colX[0], y + 5);
    doc.text(item.name.substring(0, 30), colX[1], y + 5);
    doc.text(item.category.substring(0, 12), colX[2], y + 5);
    doc.text(String(item.quantity), colX[3], y + 5);
    doc.text(dims, colX[4], y + 5);
    doc.text(formatCurrency(item.unitPrice), colX[5], y + 5);
    doc.text(formatCurrency(item.totalPrice), colX[6], y + 5);
    y += 7;
  });

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const totalsX = pageWidth - margin - 60;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", totalsX, y);
  doc.text(formatCurrency(subtotal), pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text("GST (18%):", totalsX, y);
  doc.text(formatCurrency(gst), pageWidth - margin, y, { align: "right" });
  y += 2;
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total:", totalsX, y);
  doc.text(formatCurrency(total), pageWidth - margin, y, { align: "right" });

  y += 16;
  if (y < 260) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text("This quotation is valid for 30 days from the date of issue.", margin, y);
    doc.text("Prices are inclusive of delivery and installation within city limits.", margin, y + 5);
    doc.text("Terms: 50% advance, 50% on delivery.", margin, y + 10);
  }

  const fileName = `Quote_${clientDetails.clientCompany.replace(/\s+/g, "_")}_${dateStr.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

export default function QuoteBuilder() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const planId = Number(params.id);

  const { data: preview, isLoading, isError } = usePreviewQuote(planId, {
    query: {
      queryKey: getPreviewQuoteQueryKey(planId),
      enabled: planId > 0,
    },
  });

  const createQuote = useCreateQuote();

  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);

  const items: BoquItem[] = useMemo(() => {
    if (!preview?.items) return [];
    return preview.items as BoquItem[];
  }, [preview]);

  const subtotal = preview?.subtotal ?? 0;
  const gst = preview?.gst ?? 0;
  const total = preview?.total ?? 0;

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, BoquItem[]> = {};
    for (const item of items) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [items]);

  const handleSave = () => {
    if (!clientName.trim() || !clientCompany.trim() || !projectName.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in client name, company, and project name.",
        variant: "destructive",
      });
      return;
    }

    createQuote.mutate(
      {
        id: planId,
        data: {
          clientName: clientName.trim(),
          clientCompany: clientCompany.trim(),
          clientEmail: clientEmail.trim(),
          projectName: projectName.trim(),
        },
      },
      {
        onSuccess: (data) => {
          setSavedQuoteId(data.id);
          toast({
            title: "Quote saved",
            description: `Quote #Q-${String(data.id).padStart(4, "0")} has been saved successfully.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save quote. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleExportPdf = () => {
    generatePdf(
      items,
      subtotal,
      gst,
      total,
      { clientName, clientCompany, clientEmail, projectName },
      preview?.planName ?? "Untitled Plan",
      savedQuoteId ?? undefined,
    );
    toast({ title: "PDF exported", description: "Your quote PDF has been downloaded." });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
        <h2 className="text-xl font-semibold">Plan not found</h2>
        <p className="text-muted-foreground">We could not load the plan data for this quote.</p>
        <Button variant="outline" onClick={() => router.push("/plans")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/plans")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quote Builder</h1>
            <p className="text-muted-foreground text-sm">
              Plan: <span className="font-medium text-foreground">{preview.planName}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPdf} disabled={items.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
          <Button onClick={handleSave} disabled={createQuote.isPending || items.length === 0}>
            {createQuote.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Quote
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-800 text-white rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">One&Only</CardTitle>
              <p className="text-sm text-slate-300 mt-1">Office Furniture Solutions</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-lg">QUOTATION</p>
              <p className="text-slate-300">
                {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              {savedQuoteId && (
                <p className="text-slate-300">Quote #: Q-{String(savedQuoteId).padStart(4, "0")}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Client Details</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="clientCompany">Company Name *</Label>
                  <Input
                    id="clientCompany"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">Contact Person *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="john@acme.com"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Project Details</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="HQ Office Redesign"
                  />
                </div>
                <div>
                  <Label>Plan Reference</Label>
                  <Input value={preview.planName} disabled />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Bill of Quantities</h3>
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No items found in this plan.</p>
                <p className="text-sm mt-1">Add furniture to your plan first, then generate a quote.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="px-3 py-2.5 text-left font-medium">#</th>
                      <th className="px-3 py-2.5 text-left font-medium">Item</th>
                      <th className="px-3 py-2.5 text-left font-medium">Category</th>
                      <th className="px-3 py-2.5 text-center font-medium">Qty</th>
                      <th className="px-3 py-2.5 text-left font-medium">Dimensions (W×D×H)</th>
                      <th className="px-3 py-2.5 text-right font-medium">Unit Price</th>
                      <th className="px-3 py-2.5 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
                    <tbody key={category}>
                      <tr className="bg-muted/30">
                        <td colSpan={7} className="px-3 py-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {category}
                        </td>
                      </tr>
                      {categoryItems.map((item, idx) => {
                        const globalIdx = items.indexOf(item);
                        return (
                          <tr key={`${item.catalogId}-${idx}`} className="border-t hover:bg-muted/20 transition-colors">
                            <td className="px-3 py-2 text-muted-foreground">{globalIdx + 1}</td>
                            <td className="px-3 py-2 font-medium">{item.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.category}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.quantity}</td>
                            <td className="px-3 py-2 font-mono text-xs">
                              {Math.round(item.widthCm)}×{Math.round(item.depthCm)}×{Math.round(item.heightCm)} cm
                            </td>
                            <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-mono font-medium">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  ))}
                </table>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="w-72 space-y-2 border rounded-lg p-4 bg-muted/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-mono">{formatCurrency(gst)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
