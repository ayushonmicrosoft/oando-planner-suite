import { useState } from 'react';
import { useListTemplates, useUseTemplate, getListPlansQueryKey } from '@workspace/api-client-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { Loader2, Box, Ruler, LayoutTemplate } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { PlanThumbnail } from '@/components/plan-thumbnail';

const ALL_CATEGORIES = [
  "Open Office", "Executive Suite", "Meeting Room", "Hot Desk Hub",
  "Reception Area", "Training Room", "Breakout Space", "Education Lab",
  "Hybrid Workspace", "Server Room",
];

function parseLayoutItems(layoutJson: string) {
  try {
    const data = JSON.parse(layoutJson);
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export default function Templates() {
  const [, setLocation] = useLocation();
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
          setLocation(`/planner/canvas?id=${plan.id}`);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create plan from template." });
          setUsingTemplateId(null);
        },
      }
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-2">Start from a professional pre-made office layout.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
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
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <LayoutTemplate className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Try selecting a different category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => {
            const layoutItems = parseLayoutItems(template.layoutJson);
            const isUsing = usingTemplateId === template.id;

            return (
              <Card key={template.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="rounded-md border overflow-hidden bg-muted/20">
                    <PlanThumbnail
                      roomWidthCm={template.roomWidthCm}
                      roomDepthCm={template.roomDepthCm}
                      items={layoutItems}
                      width={340}
                      height={180}
                      className="w-full"
                    />
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {template.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" />
                      {(template.roomWidthCm / 100).toFixed(1)}m × {(template.roomDepthCm / 100).toFixed(1)}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Box className="w-3.5 h-3.5" />
                      {template.furnitureCount} items
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleUseTemplate(template.id, template.name)}
                    disabled={isUsing}
                  >
                    {isUsing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Use This Template"
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
