"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Share2, Copy, Check, Trash2, Loader2, Link2, Clock, User, MessageSquare,
  ExternalLink, Plus,
} from "lucide-react";
import { format } from "date-fns";

interface ShareData {
  id: number;
  planId: number;
  shareToken: string;
  clientName: string | null;
  status: string;
  statusNote: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentData {
  id: number;
  shareId: number;
  planId: number;
  x: number;
  y: number;
  message: string;
  authorName: string;
  createdAt: string;
}

function apiBase(): string {
  return typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  changes_requested: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  changes_requested: "Changes Requested",
};

export function ShareDialog({
  open,
  onOpenChange,
  planId,
  planName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: number;
  planName: string;
}) {
  const [shares, setShares] = useState<ShareData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientName, setClientName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchShares = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase()}/plans/${planId}/shares`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
        setComments(data.comments || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [planId]);

  useEffect(() => {
    if (open && planId) fetchShares();
  }, [open, planId, fetchShares]);

  const handleCreateShare = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${apiBase()}/plans/${planId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientName: clientName.trim() || undefined,
          expiresInDays: expiresInDays > 0 ? expiresInDays : undefined,
        }),
      });
      if (res.ok) {
        setClientName("");
        await fetchShares();
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleRevoke = async (shareId: number) => {
    try {
      await fetch(`${apiBase()}/plans/${planId}/shares/${shareId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await fetchShares();
    } catch { /* ignore */ }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const activeShares = shares.filter((s) => s.isActive);
  const revokedShares = shares.filter((s) => !s.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share "{planName}"
          </DialogTitle>
          <DialogDescription>
            Generate shareable links for clients to view, comment, and approve this plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Client name (optional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              max={90}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
              className="w-24"
              title="Expires in days"
            />
            <Button onClick={handleCreateShare} disabled={creating} size="sm">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-1">Share</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="max-h-[340px]">
              {activeShares.length === 0 && revokedShares.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No share links yet. Create one above.
                </p>
              )}

              {activeShares.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Links</p>
                  {activeShares.map((share) => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      comments={comments.filter((c) => c.shareId === share.id)}
                      onCopy={() => copyShareLink(share.shareToken)}
                      onRevoke={() => handleRevoke(share.id)}
                      copied={copiedToken === share.shareToken}
                    />
                  ))}
                </div>
              )}

              {revokedShares.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revoked</p>
                  {revokedShares.map((share) => (
                    <ShareRow
                      key={share.id}
                      share={share}
                      comments={comments.filter((c) => c.shareId === share.id)}
                      onCopy={() => {}}
                      onRevoke={() => {}}
                      copied={false}
                      disabled
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareRow({
  share, comments, onCopy, onRevoke, copied, disabled,
}: {
  share: ShareData;
  comments: CommentData[];
  onCopy: () => void;
  onRevoke: () => void;
  copied: boolean;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-lg p-3 ${disabled ? "opacity-50" : "bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">
            {share.clientName || "Unnamed client"}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] shrink-0 ${STATUS_COLORS[share.status] || ""}`}
          >
            {STATUS_LABELS[share.status] || share.status}
          </Badge>
        </div>
        {!disabled && (
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy} title="Copy link">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <a
              href={`/share/${share.shareToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent"
              title="Open share page"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={onRevoke} title="Revoke">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {share.expiresAt
            ? `Expires ${format(new Date(share.expiresAt), "MMM d, yyyy")}`
            : "No expiry"}
        </span>
        {comments.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            {comments.length} comment{comments.length !== 1 ? "s" : ""}
            <span className="text-[9px]">{expanded ? "▲" : "▼"}</span>
          </button>
        )}
      </div>

      {share.statusNote && (
        <p className="mt-1.5 text-xs text-muted-foreground border-l-2 pl-2 italic">
          "{share.statusNote}"
        </p>
      )}

      {expanded && comments.length > 0 && (
        <div className="mt-2 border-t pt-2 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="text-xs bg-muted/30 rounded-md p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-semibold text-foreground">{c.authorName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(c.createdAt), "MMM d, h:mm a")}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  ({Math.round(c.x)}, {Math.round(c.y)})
                </span>
              </div>
              <p className="text-foreground/80">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
