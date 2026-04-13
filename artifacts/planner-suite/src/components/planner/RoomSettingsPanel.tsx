import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import type { FormErrors } from './canvas-types';

interface RoomSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  roomWidthCm: number;
  setRoomWidthCm: (v: number) => void;
  roomDepthCm: number;
  setRoomDepthCm: (v: number) => void;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  formErrors: FormErrors;
}

export function RoomSettingsPanel({
  open, onClose,
  roomWidthCm, setRoomWidthCm,
  roomDepthCm, setRoomDepthCm,
  touched, setTouched, formErrors,
}: RoomSettingsPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute top-3 left-3 z-10 w-56 bg-card border rounded-lg shadow-lg">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">Room Settings</h3>
          <button aria-label="Close room settings" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Width (cm)</Label>
            <Input
              type="number"
              className={`h-8 text-sm ${touched.roomWidth && formErrors.roomWidth ? 'border-destructive' : ''}`}
              value={roomWidthCm}
              onChange={e => { setRoomWidthCm(Number(e.target.value)); setTouched(t => ({ ...t, roomWidth: true })); }}
            />
            {touched.roomWidth && formErrors.roomWidth && (
              <p className="text-xs text-destructive">{formErrors.roomWidth}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Depth (cm)</Label>
            <Input
              type="number"
              className={`h-8 text-sm ${touched.roomDepth && formErrors.roomDepth ? 'border-destructive' : ''}`}
              value={roomDepthCm}
              onChange={e => { setRoomDepthCm(Number(e.target.value)); setTouched(t => ({ ...t, roomDepth: true })); }}
            />
            {touched.roomDepth && formErrors.roomDepth && (
              <p className="text-xs text-destructive">{formErrors.roomDepth}</p>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{(roomWidthCm / 100).toFixed(1)}m × {(roomDepthCm / 100).toFixed(1)}m</span>
          <span>{((roomWidthCm * roomDepthCm) / 10000).toFixed(1)} m²</span>
        </div>
      </div>
    </div>
  );
}
