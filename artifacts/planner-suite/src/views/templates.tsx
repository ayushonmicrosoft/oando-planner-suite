"use client";

import { useState } from 'react';
import { useListTemplates, useUseTemplate, getListPlansQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Loader2, Box, Ruler, LayoutTemplate, ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PlanThumbnail } from '@/components/plan-thumbnail';

const ALL_CATEGORIES = [
  "Open Office", "Executive Suite", "Meeting Room", "Hot Desk Hub",
  "Reception Area", "Training Room", "Breakout Space", "Education Lab",
  "Hybrid Workspace", "Server Room",
];

const categoryColors: Record<string, string> = {
  "Open Office": "bg-blue-500/[0.08] text-blue-700 border-blue-500/20",
  "Executive Suite": "bg-amber-500/[0.08] text-amber-700 border-amber-500/20",
  "Meeting Room": "bg-emerald-500/[0.08] text-emerald-700 border-emerald-500/20",
  "Hot Desk Hub": "bg-cyan-500/[0.08] text-cyan-700 border-cyan-500/20",
  "Reception Area": "bg-purple-500/[0.08] text-purple-700 border-purple-500/20",
  "Training Room": "bg-rose-500/[0.08] text-rose-700 border-rose-500/20",
  "Breakout Space": "bg-orange-500/[0.08] text-orange-700 border-orange-500/20",
  "Education Lab": "bg-indigo-500/[0.08] text-indigo-700 border-indigo-500/20",
  "Hybrid Workspace": "bg-teal-500/[0.08] text-teal-700 border-teal-500/20",
  "Server Room": "bg-gray-500/[0.08] text-gray-700 border-gray-500/20",
};

function parseLayoutItems(layoutJson: string) {
  try {
    const data = JSON.parse(layoutJson);
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export default function Templates() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: templates, isLoading } = useListTemplates(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const useTemplateMutation = useUseTemplate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);

  const handleUseTemplate = (templateId: string, templateName: string) => {
    setUsingTemplateId(templateId);
    useTemplateMutation.mutate(
      { id: templateId, data: { name: `${templateName} Plan` } },
      {
        onSuccess: (plan) => {
          toast({ title: "Plan created from template", description: `"${plan.name}" is ready to customize.` });
          queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
          router.push(`/planner/canvas?id=${plan.id}`);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create plan from template." });
          setUsingTemplateId(null);
        },
      }
    );
  };

  const totalTemplates = (templates || []).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-1">Data</p>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {totalTemplates > 0
              ? `${totalTemplates} professional pre-made layout${totalTemplates !== 1 ? 's' : ''}`
              : 'Start from a professional pre-made office layout'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shadow-sm" onClick={() => router.push('/planner/canvas')}>
            New Canvas
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'}`}
          onClick={() => setSelectedCategory(null)}
        >
          All Templates
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'}`}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/[0.06] flex items-center justify-center mb-5">
              <LayoutTemplate className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-lg font-semibold">No templates found</p>
            <p className="text-sm text-muted-foreground mt-1.5">Try selecting a different category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates?.map((template) => {
            const layoutItems = parseLayoutItems(template.layoutJson);
            const isUsing = usingTemplateId === template.id;
            const catColor = categoryColors[template.category] || categoryColors["Open Office"];

            return (
              <Card key={template.id} className="flex flex-col group hover:shadow-md transition-all duration-200 border-border/60 hover:border-border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-snug">{template.name}</CardTitle>
                    <Badge variant="outline" className={`${catColor} text-[10px] font-medium shrink-0`}>
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="rounded-lg border overflow-hidden bg-muted/10">
                    <PlanThumbnail
                      roomWidthCm={template.roomWidthCm}
                      roomDepthCm={template.roomDepthCm}
                      items={layoutItems}
                      width={340}
                      height={180}
                      className="w-full"
                    />
                  </div>
                  <CardDescription className="text-xs line-clamp-2 leading-relaxed">
                    {template.description}
                  </CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="bg-muted/30 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                      <Ruler className="w-3 h-3 text-muted-foreground opacity-60" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {(template.roomWidthCm / 100).toFixed(1)}m × {(template.roomDepthCm / 100).toFixed(1)}m
                      </span>
                    </div>
                    <div className="bg-muted/30 rounded-md px-2.5 py-1.5 flex items-center gap-1.5">
                      <Box className="w-3 h-3 text-muted-foreground opacity-60" />
                      <span className="text-xs font-mono text-muted-foreground">{template.furnitureCount} items</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-3 px-4">
                  <Separator className="mb-3" />
                  <Button
                    className="w-full text-xs gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUseTemplate(template.id, template.name)}
                    disabled={isUsing}
                  >
                    {isUsing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Use This Template
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
