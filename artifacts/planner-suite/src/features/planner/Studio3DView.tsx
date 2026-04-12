import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text, RoundedBox, PerspectiveCamera } from "@react-three/drei";
import { usePlannerStore } from "./planner-store";
import type { TLShape } from "tldraw";
import { Loader2, X, Maximize2, RotateCcw } from "lucide-react";
import * as THREE from "three";

const PX_TO_M = 0.005;
const CM_TO_M = 0.01;

const CATEGORY_COLORS: Record<string, string> = {
  workstations: "#5b8fb9",
  seating: "#6db587",
  "soft-seating": "#9b7fd4",
  tables: "#e8935a",
  storage: "#8fad6b",
  education: "#5aa5c9",
  accessories: "#d47b7b",
};

function FurnitureBlock({ shape }: { shape: TLShape }) {
  const props = shape.props as any;
  if (!props?.w || !props?.h) return null;

  const w = props.w * PX_TO_M;
  const d = props.h * PX_TO_M;
  const h = 0.75;
  const x = shape.x * PX_TO_M + w / 2;
  const z = shape.y * PX_TO_M + d / 2;
  const label = props.text || "";

  const colorKey = Object.keys(CATEGORY_COLORS).find((k) =>
    label.toLowerCase().includes(k.slice(0, 4))
  );
  const color = colorKey ? CATEGORY_COLORS[colorKey] : "#7c9bbd";

  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={[x, h / 2, z]} rotation={[0, -(shape.rotation || 0), 0]}>
      <RoundedBox
        ref={meshRef}
        args={[w, h, d]}
        radius={0.02}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {label && (
        <Text
          position={[0, h / 2 + 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(w, d) * 0.25}
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

function Floor({ shapes }: { shapes: TLShape[] }) {
  const bounds = useMemo(() => {
    if (!shapes.length) return { minX: 0, minZ: 0, maxX: 10, maxZ: 10 };
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    shapes.forEach((s) => {
      const p = s.props as any;
      const x1 = s.x * PX_TO_M;
      const z1 = s.y * PX_TO_M;
      const x2 = x1 + (p?.w || 0) * PX_TO_M;
      const z2 = z1 + (p?.h || 0) * PX_TO_M;
      minX = Math.min(minX, x1);
      minZ = Math.min(minZ, z1);
      maxX = Math.max(maxX, x2);
      maxZ = Math.max(maxZ, z2);
    });
    const pad = 2;
    return { minX: minX - pad, minZ: minZ - pad, maxX: maxX + pad, maxZ: maxZ + pad };
  }, [shapes]);

  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const fw = bounds.maxX - bounds.minX;
  const fd = bounds.maxZ - bounds.minZ;

  return (
    <mesh position={[cx, -0.01, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[fw, fd]} />
      <meshStandardMaterial color="#f0f4f8" roughness={0.8} />
    </mesh>
  );
}

function Scene() {
  const editor = usePlannerStore((s) => s.editor);

  const shapes = useMemo(() => {
    if (!editor) return [];
    return [...editor.getCurrentPageShapeIds()]
      .map((id) => editor.getShape(id))
      .filter((s): s is TLShape => !!s && s.type === "geo");
  }, [editor]);

  const center = useMemo(() => {
    if (!shapes.length) return [0, 0, 0] as [number, number, number];
    let cx = 0, cz = 0;
    shapes.forEach((s) => {
      const p = s.props as any;
      cx += (s.x + (p?.w || 0) / 2) * PX_TO_M;
      cz += (s.y + (p?.h || 0) / 2) * PX_TO_M;
    });
    return [cx / shapes.length, 0, cz / shapes.length] as [number, number, number];
  }, [shapes]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[center[0] + 8, 8, center[2] + 8]} fov={50} />
      <OrbitControls target={center} enableDamping dampingFactor={0.1} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1} castShadow shadow-mapSize={2048} />
      <Environment preset="apartment" />
      <Floor shapes={shapes} />
      <Grid infiniteGrid fadeDistance={30} fadeStrength={2} cellSize={0.5} cellThickness={0.5} cellColor="#d0d5dd" sectionSize={2.5} sectionColor="#9ca3af" />
      {shapes.map((s) => <FurnitureBlock key={s.id} shape={s} />)}
    </>
  );
}

export function Studio3DView() {
  const { show3D, toggle3D } = usePlannerStore();
  if (!show3D) return null;

  return (
    <div className="absolute top-12 right-0 bottom-8 z-25 w-[50%] min-w-[400px] border-l bg-white shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
        <span className="text-xs font-bold text-[#1F3653]">3D Preview</span>
        <div className="flex items-center gap-1">
          <button onClick={toggle3D} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#1F3653]/10">
            <X className="h-3.5 w-3.5 text-[#1B2940]/50" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gradient-to-b from-[#e8edf2] to-[#d0d8e2]">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#1F3653]/30" />
          </div>
        }>
          <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <Scene />
          </Canvas>
        </Suspense>
      </div>
      <div className="px-3 py-1.5 border-t bg-white text-[10px] text-[#1B2940]/40 flex items-center gap-4">
        <span>Orbit: drag</span>
        <span>Zoom: scroll</span>
        <span>Pan: right-drag</span>
      </div>
    </div>
  );
}
