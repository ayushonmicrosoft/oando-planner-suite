import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListPlans, useCreatePlan, useUpdatePlan, getPlan, getListPlansQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Save, FolderOpen, FilePlus, FileIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SaveLoadToolbarProps {
  plannerType: string;
  moduleName: string;
  getCanvasState: () => Record<string, unknown>;
  loadCanvasState: (state: Record<string, unknown>) => void;
  onNew: () => void;
  hasUnsavedChanges: () => boolean;
  currentPlanId: number | null;
  setCurrentPlanId: (id: number | null) => void;
  currentPlanName: string;
  setCurrentPlanName: (name: string) => void;
  roomWidthCm?: number;
  roomDepthCm?: number;
  clearAutoSave?: () => void;
}

export default function SaveLoadToolbar({
  plannerType,
  moduleName,
  getCanvasState,
  loadCanvasState,
  onNew,
  hasUnsavedChanges,
  currentPlanId,
  setCurrentPlanId,
  currentPlanName,
  setCurrentPlanName,
  roomWidthCm = 600,
  roomDepthCm = 400,
  clearAutoSave,
}: SaveLoadToolbarProps) {
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [newConfirmOpen, setNewConfirmOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");

  const listParams = { limit: 100 };
  const { data: plans, refetch } = useListPlans(
    listParams,
    { query: { queryKey: getListPlansQueryKey(listParams), enabled: openDialogOpen } }
  );

  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const filteredPlans = (plans || []).filter(
    (p) => p.plannerType === plannerType
  );

  const handleSave = useCallback(async () => {
    const state = getCanvasState();
    const docString = JSON.stringify(state);
    try {
      if (currentPlanId) {
        await updatePlan.mutateAsync({
          id: currentPlanId,
          data: {
            name: currentPlanName || `${moduleName} Drawing`,
            documentJson: docString,
          },
        });
        clearAutoSave?.();
        toast.success("Drawing saved");
      } else {
        const name = currentPlanName || `${moduleName} Drawing`;
        const result = await createPlan.mutateAsync({
          data: {
            name,
            plannerType: plannerType as any,
            roomWidthCm,
            roomDepthCm,
            documentJson: docString,
          },
        });
        if (result?.id) {
          setCurrentPlanId(result.id);
        }
        setCurrentPlanName(name);
        clearAutoSave?.();
        toast.success("Drawing saved");
      }
    } catch {
      toast.error("Failed to save drawing");
    }
  }, [currentPlanId, currentPlanName, getCanvasState, plannerType, moduleName, roomWidthCm, roomDepthCm, clearAutoSave]);

  const handleSaveAs = useCallback(async () => {
    const state = getCanvasState();
    const name = saveAsName || `${moduleName} Drawing`;
    const docString = JSON.stringify(state);
    try {
      const result = await createPlan.mutateAsync({
        data: {
          name,
          plannerType: plannerType as any,
          roomWidthCm,
          roomDepthCm,
          documentJson: docString,
        },
      });
      if (result?.id) {
        setCurrentPlanId(result.id);
      }
      setCurrentPlanName(name);
      setSaveAsDialogOpen(false);
      setSaveAsName("");
      clearAutoSave?.();
      toast.success(`Saved as "${name}"`);
    } catch {
      toast.error("Failed to save drawing");
    }
  }, [saveAsName, getCanvasState, plannerType, moduleName, roomWidthCm, roomDepthCm, clearAutoSave]);

  const handleOpen = useCallback(async (planSummary: { id: number; name: string }) => {
    try {
      const fullPlan = await getPlan(planSummary.id);
      setCurrentPlanId(fullPlan.id);
      setCurrentPlanName(fullPlan.name);
      if (fullPlan.documentJson) {
        const doc = typeof fullPlan.documentJson === "string"
          ? JSON.parse(fullPlan.documentJson)
          : fullPlan.documentJson;
        loadCanvasState(doc);
      }
      setOpenDialogOpen(false);
      clearAutoSave?.();
      toast.success(`Opened "${fullPlan.name}"`);
    } catch {
      toast.error("Failed to load drawing");
    }
  }, [loadCanvasState, clearAutoSave]);

  const handleNew = useCallback(() => {
    if (hasUnsavedChanges()) {
      setNewConfirmOpen(true);
    } else {
      onNew();
      setCurrentPlanId(null);
      setCurrentPlanName("");
      clearAutoSave?.();
    }
  }, [hasUnsavedChanges, onNew, clearAutoSave]);

  const confirmNew = useCallback(() => {
    onNew();
    setCurrentPlanId(null);
    setCurrentPlanName("");
    setNewConfirmOpen(false);
    clearAutoSave?.();
  }, [onNew, clearAutoSave]);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-white hover:bg-white/10 h-7 px-2">
          <Save className="h-3.5 w-3.5" />
          <span className="text-xs">Save</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSaveAsName(currentPlanName); setSaveAsDialogOpen(true); }} className="text-white hover:bg-white/10 h-7 px-2">
          <FilePlus className="h-3.5 w-3.5" />
          <span className="text-xs">Save As</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { refetch(); setOpenDialogOpen(true); }} className="text-white hover:bg-white/10 h-7 px-2">
          <FolderOpen className="h-3.5 w-3.5" />
          <span className="text-xs">Open</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleNew} className="text-white hover:bg-white/10 h-7 px-2">
          <FileIcon className="h-3.5 w-3.5" />
          <span className="text-xs">New</span>
        </Button>
        {currentPlanName && (
          <span className="text-xs text-gray-400 ml-1 truncate max-w-[120px]">{currentPlanName}</span>
        )}
      </div>

      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Open Drawing</DialogTitle>
            <DialogDescription>Select a saved {moduleName} drawing to open.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            {filteredPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No saved drawings found.</p>
            ) : (
              <div className="space-y-2">
                {filteredPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleOpen(plan)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{plan.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{moduleName}</Badge>
                    </div>
                    {plan.updatedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(plan.updatedAt), { addSuffix: true })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save As</DialogTitle>
            <DialogDescription>Enter a name for your drawing.</DialogDescription>
          </DialogHeader>
          <Input
            value={saveAsName}
            onChange={(e) => setSaveAsName(e.target.value)}
            placeholder="Drawing name"
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveAs(); }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveAsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAs}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={newConfirmOpen} onOpenChange={setNewConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to start a new drawing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNew}>Start New</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
