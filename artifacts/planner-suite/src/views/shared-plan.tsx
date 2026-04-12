"use client";

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, XCircle, MessageSquare, Send, Loader2, MapPin, Eye, Box,
  AlertTriangle, Clock, User,
} from "lucide-react";

interface ShareInfo {
  id: number;
  status: string;
  statusNote: string | null;
  clientName: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface PlanInfo {
  id: number;
  name: string;
  plannerType: string;
  roomWidthCm: number;
  roomDepthCm: number;
  documentJson: string;
}

interface Comment {
  id: number;
  x: number;
  y: number;
  message: string;
  authorName: string;
  createdAt: string;
}

function apiBase(): string {
  return typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";
}

const STATUS_STYLES: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  pending: {
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    label: "Pending Review",
  },
  approved: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    label: "Approved",
  },
  changes_requested: {
    bg: "bg-red-50 border-red-200",
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    label: "Changes Requested",
  },
};

export default function SharedPlanView({ token }: { token: string }) {
  const [share, setShare] = useState<ShareInfo | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"2d" | "3d">("2d");
  const [authorName, setAuthorName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [savedName, setSavedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase()}/share/${token}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "This share link is not found or has expired.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setShare(data.share);
      setPlan(data.plan);
      setComments(data.comments);
    } catch {
      setError("Failed to load the shared plan.");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem("share_author_name");
    if (stored) {
      setAuthorName(stored);
      setSavedName(stored);
    }
  }, [fetchData]);

  const items = useMemo(() => {
    if (!plan?.documentJson) return [];
    try {
      const doc = JSON.parse(plan.documentJson);
      return Array.isArray(doc?.items) ? doc.items : [];
    } catch {
      return [];
    }
  }, [plan]);

  useEffect(() => {
    if (!plan || !canvasRef.current || view !== "2d") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const roomW = plan.roomWidthCm;
    const roomD = plan.roomDepthCm;
    const padding = 40;
    const scale = Math.min((w - padding * 2) / roomW, (h - padding * 2) / roomD);
    const offX = (w - roomW * scale) / 2;
    const offY = (h - roomD * scale) / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(offX, offY, roomW * scale, roomD * scale);
    ctx.setLineDash([]);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${roomW}cm`, offX + (roomW * scale) / 2, offY - 8);
    ctx.save();
    ctx.translate(offX - 8, offY + (roomD * scale) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${roomD}cm`, 0, 0);
    ctx.restore();

    const COLORS: Record<string, string> = {
      workstations: "#5b8fb9",
      seating: "#6db587",
      "soft-seating": "#9b7fd4",
      tables: "#e8935a",
      storage: "#8fad6b",
      education: "#5aa5c9",
      accessories: "#d47b7b",
    };

    for (const item of items) {
      const ix = offX + (item.x ?? 0) * scale;
      const iy = offY + (item.y ?? 0) * scale;
      const iw = (item.widthCm ?? item.w ?? 60) * scale;
      const ih = (item.depthCm ?? item.h ?? 60) * scale;

      const catKey = Object.keys(COLORS).find((k) =>
        (item.category || item.name || "").toLowerCase().includes(k.slice(0, 4))
      );
      const color = catKey ? COLORS[catKey] : "#7c9bbd";

      ctx.fillStyle = color + "33";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.fillRect(ix, iy, iw, ih);
      ctx.strokeRect(ix, iy, iw, ih);

      if (item.name) {
        ctx.fillStyle = "#1e293b";
        ctx.font = `${Math.max(9, Math.min(12, iw * 0.2))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = item.name.length > 15 ? item.name.slice(0, 12) + "…" : item.name;
        ctx.fillText(label, ix + iw / 2, iy + ih / 2);
      }
    }
  }, [plan, items, view]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    setClickPos({ x, y });
    setSelectedComment(null);
  };

  const handleSubmitComment = async () => {
    if (!clickPos || !commentMessage.trim() || !authorName.trim()) return;
    setSubmitting(true);
    try {
      localStorage.setItem("share_author_name", authorName.trim());
      setSavedName(authorName.trim());
      const res = await fetch(`${apiBase()}/share/${token}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: clickPos.x,
          y: clickPos.y,
          message: commentMessage.trim(),
          authorName: authorName.trim(),
        }),
      });
      if (res.ok) {
        setCommentMessage("");
        setClickPos(null);
        await fetchData();
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleApproval = async (status: "approved" | "changes_requested") => {
    setApproving(true);
    try {
      const res = await fetch(`${apiBase()}/share/${token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note: approvalNote.trim() || undefined,
        }),
      });
      if (res.ok) {
        setApprovalNote("");
        setShowApprovalForm(false);
        await fetchData();
      }
    } catch { /* ignore */ }
    setApproving(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !plan || !share) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">Link Not Available</h1>
          <p className="text-sm text-slate-500">{error || "This share link is not found or has expired."}</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_STYLES[share.status] || STATUS_STYLES.pending;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-v2-white.webp" alt="One&Only" className="h-6 w-auto invert opacity-70" />
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-sm font-bold text-slate-800">{plan.name}</h1>
              <p className="text-[11px] text-slate-400">
                {plan.roomWidthCm}cm × {plan.roomDepthCm}cm
                {share.clientName && ` · Shared with ${share.clientName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${statusInfo.bg} gap-1`}>
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant={view === "2d" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("2d")}
              >
                <Eye className="h-4 w-4 mr-1" /> 2D Layout
              </Button>
              <Button
                variant={view === "3d" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("3d")}
              >
                <Box className="h-4 w-4 mr-1" /> 3D View
              </Button>
              {view === "2d" && (
                <p className="text-xs text-slate-400 ml-2">
                  Click on the plan to add a comment pin
                </p>
              )}
            </div>

            <div className="relative border rounded-xl overflow-hidden bg-white shadow-sm">
              {view === "2d" ? (
                <div ref={containerRef} className="relative">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                  {comments.map((c) => (
                    <CommentPin
                      key={c.id}
                      comment={c}
                      canvasWidth={800}
                      canvasHeight={600}
                      containerRef={containerRef}
                      isSelected={selectedComment?.id === c.id}
                      onClick={() => setSelectedComment(selectedComment?.id === c.id ? null : c)}
                    />
                  ))}
                  {clickPos && (
                    <CommentPin
                      comment={{ id: -1, x: clickPos.x, y: clickPos.y, message: "", authorName: "", createdAt: "" }}
                      canvasWidth={800}
                      canvasHeight={600}
                      containerRef={containerRef}
                      isSelected
                      isNew
                      onClick={() => {}}
                    />
                  )}
                </div>
              ) : (
                <Shared3DView plan={plan} items={items} />
              )}
            </div>

            {clickPos && view === "2d" && (
              <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Add Comment at ({clickPos.x}, {clickPos.y})
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-40"
                  />
                  <Input
                    placeholder="Type your comment..."
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                  />
                  <Button onClick={handleSubmitComment} disabled={submitting || !commentMessage.trim() || !authorName.trim()}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" onClick={() => setClickPos(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className={`border rounded-xl p-4 ${statusInfo.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                {statusInfo.icon}
                <span className="text-sm font-bold">{statusInfo.label}</span>
              </div>
              {share.statusNote && (
                <p className="text-xs text-slate-600 mb-3 italic">"{share.statusNote}"</p>
              )}

              {!showApprovalForm ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => { setShowApprovalForm(true); }}
                    disabled={approving}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => { setShowApprovalForm(true); }}
                    disabled={approving}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Request Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Add a note (optional)"
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApproval("approved")}
                      disabled={approving}
                    >
                      {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleApproval("changes_requested")}
                      disabled={approving}
                    >
                      {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Changes"}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowApprovalForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="border rounded-xl bg-white shadow-sm">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No comments yet. Click on the 2D layout to add one.
                  </p>
                ) : (
                  <div className="divide-y">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                          selectedComment?.id === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                        onClick={() => setSelectedComment(selectedComment?.id === c.id ? null : c)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">{c.authorName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{c.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">📍 ({c.x}, {c.y})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentPin({
  comment, canvasWidth, canvasHeight, containerRef, isSelected, isNew, onClick,
}: {
  comment: Comment;
  canvasWidth: number;
  canvasHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  isNew?: boolean;
  onClick: () => void;
}) {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPos({
        left: (comment.x / canvasWidth) * rect.width,
        top: (comment.y / canvasHeight) * rect.height,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [comment.x, comment.y, canvasWidth, canvasHeight, containerRef]);

  return (
    <button
      className={`absolute -translate-x-1/2 -translate-y-full z-10 transition-transform ${
        isSelected ? "scale-125" : "hover:scale-110"
      }`}
      style={{ left: pos.left, top: pos.top }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={isNew ? "New comment" : `${comment.authorName}: ${comment.message}`}
    >
      <div className={`relative ${isNew ? "text-primary" : isSelected ? "text-red-500" : "text-blue-500"}`}>
        <MapPin className="h-6 w-6 drop-shadow-md" fill="currentColor" />
        {!isNew && (
          <span className="absolute -top-1 -right-1 bg-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center shadow border text-slate-600">
            {comment.id}
          </span>
        )}
      </div>
    </button>
  );
}

const CM_TO_M = 0.01;
const CATEGORY_COLORS: Record<string, string> = {
  workstations: "#5b8fb9",
  seating: "#6db587",
  "soft-seating": "#9b7fd4",
  tables: "#e8935a",
  storage: "#8fad6b",
  desks: "#5b8fb9",
  chairs: "#6db587",
  cabinets: "#8fad6b",
  shelving: "#8fad6b",
};

function SharedFurnitureBlock({ item }: { item: any }) {
  const w = ((item.widthCm ?? item.w ?? 60) * CM_TO_M);
  const d = ((item.depthCm ?? item.h ?? 60) * CM_TO_M);
  const h = ((item.heightCm ?? 75) * CM_TO_M);
  const x = ((item.x ?? 0) * CM_TO_M) + w / 2;
  const z = ((item.y ?? 0) * CM_TO_M) + d / 2;
  const rotation = (item.rotation || 0) * (Math.PI / 180);
  const label = item.name || "";

  const catKey = Object.keys(CATEGORY_COLORS).find((k) =>
    (item.category || label || "").toLowerCase().includes(k.slice(0, 4))
  );
  const color = catKey ? CATEGORY_COLORS[catKey] : "#7c9bbd";

  return (
    <group position={[x, h / 2, z]} rotation={[0, -rotation, 0]}>
      <RoundedBox args={[w, h, d]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {label && (
        <Text
          position={[0, h / 2 + 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(w, d) * 0.22}
          color="#1F3653"
          anchorX="center"
          anchorY="middle"
          maxWidth={w * 0.9}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SharedRoomScene({ plan, items }: { plan: PlanInfo; items: any[] }) {
  const roomW = plan.roomWidthCm * CM_TO_M;
  const roomD = plan.roomDepthCm * CM_TO_M;
  const wallHeight = 2.8;
  const wallThickness = 0.08;
  const cx = roomW / 2;
  const cz = roomD / 2;

  return (
    <>
      <PerspectiveCamera makeDefault position={[cx + roomW * 0.6, wallHeight * 0.8, cz + roomD * 0.6]} fov={50} />
      <OrbitControls target={[cx, 0.5, cz]} enableDamping dampingFactor={0.1} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow shadow-mapSize={2048} />
      <Environment preset="apartment" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, cz]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color="#f0f0eb" roughness={0.7} />
      </mesh>

      <mesh position={[cx, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[roomW + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.9} />
      </mesh>
      <mesh position={[cx, wallHeight / 2, roomD]} castShadow receiveShadow>
        <boxGeometry args={[roomW + wallThickness * 2, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.9} />
      </mesh>
      <mesh position={[0, wallHeight / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, roomD]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.9} />
      </mesh>
      <mesh position={[roomW, wallHeight / 2, cz]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, roomD]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.9} />
      </mesh>

      {items.map((item: any, i: number) => (
        <SharedFurnitureBlock key={item.instanceId || item.id || i} item={item} />
      ))}
    </>
  );
}

function Shared3DView({ plan, items }: { plan: PlanInfo; items: any[] }) {
  return (
    <div className="h-[500px]">
      <Suspense fallback={
        <div className="flex h-full items-center justify-center bg-slate-100">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      }>
        <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <SharedRoomScene plan={plan} items={items} />
        </Canvas>
      </Suspense>
      <div className="px-3 py-1.5 border-t bg-white text-[10px] text-slate-400 flex items-center gap-4">
        <span>Orbit: drag</span>
        <span>Zoom: scroll</span>
        <span>Pan: right-drag</span>
      </div>
    </div>
  );
}
