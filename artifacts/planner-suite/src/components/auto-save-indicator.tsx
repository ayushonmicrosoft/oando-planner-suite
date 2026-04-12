"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  showRecovery: boolean;
  onAcceptRecovery: () => void;
  onDismissRecovery: () => void;
}

export default function AutoSaveIndicator({
  lastSaved,
  showRecovery,
  onAcceptRecovery,
  onDismissRecovery,
}: AutoSaveIndicatorProps) {
  return (
    <>
      {lastSaved && (
        <span className="text-[10px] text-gray-500 whitespace-nowrap">
          Auto-saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}

      <AlertDialog open={showRecovery}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recover Auto-Saved Work</AlertDialogTitle>
            <AlertDialogDescription>
              We found an auto-saved version of your work. Would you like to restore it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDismissRecovery}>Discard</AlertDialogCancel>
            <AlertDialogAction onClick={onAcceptRecovery}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
