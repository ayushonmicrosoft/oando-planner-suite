import type { PlacedItem } from '@/hooks/use-canvas-planner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MousePointer2, Lock, Unlock, Box,
  Layers, ChevronUp, ChevronDown,
} from 'lucide-react';

interface InspectorPanelProps {
  inspectorTab: 'items' | 'properties';
  setInspectorTab: (v: 'items' | 'properties') => void;
  items: PlacedItem[];
  sortedItems: PlacedItem[];
  selectedItemIds: Set<string>;
  setSelectedItemIds: (v: Set<string>) => void;
  selectedItem: PlacedItem | undefined;
  updateItem: (id: string, changes: Partial<PlacedItem>) => void;
  toggleLock: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

export function InspectorPanel({
  inspectorTab, setInspectorTab,
  items, sortedItems,
  selectedItemIds, setSelectedItemIds,
  selectedItem,
  updateItem, toggleLock, bringToFront, sendToBack,
}: InspectorPanelProps) {
  return (
    <div className="w-52 lg:w-60 border-l bg-card/95 backdrop-blur-sm shrink-0 hidden md:flex flex-col shadow-sm">
      <div className="border-b flex">
        <button
          className={`flex-1 px-3 py-2 text-[11px] font-semibold transition-colors ${inspectorTab === 'items' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setInspectorTab('items')}
        >
          <Layers className="w-3 h-3 inline mr-1" />
          Items ({items.length})
        </button>
        <button
          className={`flex-1 px-3 py-2 text-[11px] font-semibold transition-colors ${inspectorTab === 'properties' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setInspectorTab('properties')}
        >
          Properties
        </button>
      </div>

      <ScrollArea className="flex-1">
        {inspectorTab === 'items' ? (
          <div className="p-2 space-y-0.5">
            {items.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8 px-4">
                <Box className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>Empty room</p>
                <p className="text-[10px] mt-1">Click items in the catalog to add them</p>
              </div>
            ) : (
              sortedItems.map(item => (
                <div
                  key={item.instanceId}
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-xs ${
                    selectedItemIds.has(item.instanceId)
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => setSelectedItemIds(new Set([item.instanceId]))}
                >
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{
                      backgroundColor: item.color,
                      borderRadius: item.shape === 'round' ? '50%' : '2px',
                    }}
                  />
                  <span className="flex-1 truncate font-medium">{item.name}</span>
                  {item.locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {selectedItem ? (
              <>
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.08em] mb-2">Selected Item</h4>
                  <div className="text-sm font-medium">{selectedItem.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedItem.category}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">X (cm)</Label>
                    <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.x)} onChange={e => updateItem(selectedItem.instanceId, { x: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Y (cm)</Label>
                    <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.y)} onChange={e => updateItem(selectedItem.instanceId, { y: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Width (cm)</Label>
                    <Input type="number" className="h-7 text-xs" value={selectedItem.widthCm} onChange={e => updateItem(selectedItem.instanceId, { widthCm: Math.max(5, Number(e.target.value)) })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Depth (cm)</Label>
                    <Input type="number" className="h-7 text-xs" value={selectedItem.depthCm} onChange={e => updateItem(selectedItem.instanceId, { depthCm: Math.max(5, Number(e.target.value)) })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Rotation</Label>
                  <Input type="number" className="h-7 text-xs" value={Math.round(selectedItem.rotation)} onChange={e => updateItem(selectedItem.instanceId, { rotation: Number(e.target.value) % 360 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Color</Label>
                  <div className="flex gap-2 items-center">
                    <input type="color" aria-label="Item color" value={selectedItem.color} onChange={e => updateItem(selectedItem.instanceId, { color: e.target.value })} className="w-8 h-7 rounded border cursor-pointer" />
                    <Input className="h-7 text-xs flex-1" value={selectedItem.color} onChange={e => updateItem(selectedItem.instanceId, { color: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Opacity</Label>
                  <input type="range" aria-label="Item opacity" min={0.1} max={1} step={0.1} value={selectedItem.opacity} onChange={e => updateItem(selectedItem.instanceId, { opacity: Number(e.target.value) })} className="w-full" />
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => toggleLock(selectedItem.instanceId)}>
                    {selectedItem.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {selectedItem.locked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => bringToFront(selectedItem.instanceId)}>
                    <ChevronUp className="w-3 h-3" /> Front
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => sendToBack(selectedItem.instanceId)}>
                    <ChevronDown className="w-3 h-3" /> Back
                  </Button>
                </div>
                {selectedItem.price && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex justify-between"><span>Price</span><span className="font-medium">${selectedItem.price.toFixed(2)}</span></div>
                    {selectedItem.seatCount && <div className="flex justify-between"><span>Seats</span><span className="font-medium">{selectedItem.seatCount}</span></div>}
                    <div className="flex justify-between"><span>Height</span><span className="font-medium">{selectedItem.heightCm}cm</span></div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-8">
                <MousePointer2 className="w-6 h-6 mx-auto mb-2 opacity-20" />
                <p>Select an item to view properties</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {items.length > 0 && (
        <div className="border-t p-2 space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Total items</span>
            <span className="font-medium text-foreground">{items.length}</span>
          </div>
          {items.some(i => i.price) && (
            <div className="flex justify-between text-muted-foreground">
              <span>Est. cost</span>
              <span className="font-medium text-foreground">
                ${items.reduce((sum, i) => sum + (i.price || 0), 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
