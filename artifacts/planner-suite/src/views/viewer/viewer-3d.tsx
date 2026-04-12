"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Html, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useGetPlan, useListPlans, getGetPlanQueryKey, getListPlansQueryKey } from '@workspace/api-client-react';
import { Loader2, ArrowLeft, Layers, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_ROOM_WIDTH = 500;
const DEMO_ROOM_DEPTH = 500;
const DEMO_ITEMS = [
  { instanceId: '1', name: 'Executive Desk', widthCm: 180, depthCm: 80, heightCm: 75, x: 200, y: 100, rotation: 0, color: '#4a3b32', shape: 'rect', category: 'Desks' },
  { instanceId: '2', name: 'Ergo Chair', widthCm: 60, depthCm: 60, heightCm: 110, x: 260, y: 110, rotation: 90, color: '#222222', shape: 'round', category: 'Chairs' },
  { instanceId: '3', name: 'Bookshelf', widthCm: 120, depthCm: 40, heightCm: 200, x: 50, y: 400, rotation: 0, color: '#f0f0f0', shape: 'rect', category: 'Shelving' },
  { instanceId: '4', name: 'L-Desk', widthCm: 160, depthCm: 120, heightCm: 75, x: 50, y: 50, rotation: 0, color: '#8B6914', shape: 'l-left', category: 'Desks' },
];

function createWoodTexture(baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const c = parseInt(baseColor.replace('#', ''), 16);
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 60; i++) {
    const y = Math.random() * 256;
    const lineWidth = 0.5 + Math.random() * 2;
    const variation = Math.floor(Math.random() * 20 - 10);
    ctx.strokeStyle = `rgba(${Math.max(0, r + variation)},${Math.max(0, g + variation)},${Math.max(0, b + variation)},0.3)`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < 256; x += 10) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 3);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createFabricTexture(baseColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 128);

  const c = parseInt(baseColor.replace('#', ''), 16);
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;

  for (let x = 0; x < 128; x += 2) {
    for (let y = 0; y < 128; y += 2) {
      const v = Math.random() * 12 - 6;
      ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + v))},${Math.max(0, Math.min(255, g + v))},${Math.max(0, Math.min(255, b + v))},1)`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function DeskModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const woodTex = useMemo(() => createWoodTexture(color), [color]);
  const topThickness = 0.04;
  const legW = 0.04;
  const legInset = 0.05;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h - topThickness / 2, 0]}>
        <boxGeometry args={[w, topThickness, d]} />
        <meshStandardMaterial map={woodTex} roughness={0.4} metalness={0.05} />
      </mesh>
      {[
        [-(w / 2 - legInset), 0, -(d / 2 - legInset)],
        [(w / 2 - legInset), 0, -(d / 2 - legInset)],
        [-(w / 2 - legInset), 0, (d / 2 - legInset)],
        [(w / 2 - legInset), 0, (d / 2 - legInset)],
      ].map((pos, i) => (
        <mesh key={i} castShadow position={[pos[0], (h - topThickness) / 2, pos[2]]}>
          <boxGeometry args={[legW, h - topThickness, legW]} />
          <meshStandardMaterial color="#555" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function ChairModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const fabricTex = useMemo(() => createFabricTexture(color), [color]);
  const seatH = h * 0.42;
  const seatThickness = 0.06;
  const backH = h - seatH;
  const legR = 0.015;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, seatH, 0]}>
        <cylinderGeometry args={[w * 0.45, w * 0.45, seatThickness, 24]} />
        <meshStandardMaterial map={fabricTex} roughness={0.85} metalness={0} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, seatH + backH / 2, -(d * 0.35)]}>
        <boxGeometry args={[w * 0.75, backH, 0.04]} />
        <meshStandardMaterial map={fabricTex} roughness={0.85} metalness={0} />
      </mesh>
      <mesh castShadow position={[0, seatH * 0.5, 0]}>
        <cylinderGeometry args={[legR * 2, legR * 3, seatH, 8]} />
        <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
      </mesh>
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i / 5) * Math.PI * 2;
        const r = w * 0.35;
        return (
          <mesh key={i} castShadow position={[Math.cos(angle) * r, 0.02, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#222" roughness={0.3} metalness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

function BookshelfModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const woodTex = useMemo(() => createWoodTexture(color), [color]);
  const shelfCount = Math.max(3, Math.round(h / 0.4));
  const thickness = 0.02;

  return (
    <group>
      {[-w / 2, w / 2].map((x, i) => (
        <mesh key={`side-${i}`} castShadow receiveShadow position={[x, h / 2, 0]}>
          <boxGeometry args={[thickness, h, d]} />
          <meshStandardMaterial map={woodTex} roughness={0.6} metalness={0.05} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, h, 0]}>
        <boxGeometry args={[w, thickness, d]} />
        <meshStandardMaterial map={woodTex} roughness={0.6} metalness={0.05} />
      </mesh>
      {Array.from({ length: shelfCount }).map((_, i) => {
        const y = ((i + 1) / (shelfCount + 1)) * h;
        return (
          <mesh key={`shelf-${i}`} castShadow receiveShadow position={[0, y, 0]}>
            <boxGeometry args={[w - thickness * 2, thickness, d]} />
            <meshStandardMaterial map={woodTex} roughness={0.6} metalness={0.05} />
          </mesh>
        );
      })}
      <mesh receiveShadow position={[0, h / 2, -d / 2 + 0.005]}>
        <boxGeometry args={[w - thickness * 2, h, 0.01]} />
        <meshStandardMaterial map={woodTex} roughness={0.7} metalness={0} side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}

function CabinetModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const woodTex = useMemo(() => createWoodTexture(color), [color]);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={woodTex} roughness={0.5} metalness={0.05} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <mesh key={i} castShadow position={[side * w * 0.18, h * 0.5, d / 2 + 0.01]}>
          <boxGeometry args={[0.02, h * 0.15, 0.015]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SofaModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const fabricTex = useMemo(() => createFabricTexture(color), [color]);
  const seatH = h * 0.4;
  const backH = h - seatH;
  const armW = w * 0.1;

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, seatH / 2, d * 0.05]}>
        <boxGeometry args={[w - armW * 2, seatH, d * 0.8]} />
        <meshStandardMaterial map={fabricTex} roughness={0.9} metalness={0} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, seatH + backH / 2, -(d * 0.35)]}>
        <boxGeometry args={[w, backH, d * 0.2]} />
        <meshStandardMaterial map={fabricTex} roughness={0.9} metalness={0} />
      </mesh>
      {[-1, 1].map((side, i) => (
        <mesh key={i} castShadow receiveShadow position={[side * (w / 2 - armW / 2), seatH * 0.65, d * 0.05]}>
          <boxGeometry args={[armW, seatH * 1.3, d * 0.8]} />
          <meshStandardMaterial map={fabricTex} roughness={0.9} metalness={0} />
        </mesh>
      ))}
    </group>
  );
}

function FurnitureItem({ item }: { item: any }) {
  const w = (item.widthCm || 60) / 100;
  const d = (item.depthCm || 60) / 100;
  const h = (item.heightCm || 75) / 100;
  const ix = item.x / 100;
  const iy = item.y / 100;
  const rotRad = (item.rotation || 0) * (Math.PI / 180);
  const color = item.color || '#3b82f6';
  const category = (item.category || '').toLowerCase();
  const isRound = item.shape === 'round' || item.shape === 'circle';
  const isLShape = item.shape === 'l-left' || item.shape === 'l-right';

  const renderModel = () => {
    if (isLShape) {
      return (
        <group position={[-w / 2, 0, -d / 2]}>
          <mesh castShadow receiveShadow position={[w / 2, h / 2, d * 0.25 / 2]}>
            <boxGeometry args={[w, h, d * 0.5]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
          </mesh>
          <mesh castShadow receiveShadow position={[
            item.shape === 'l-left' ? w * 0.25 / 2 : w * 0.75 + w * 0.25 / 2,
            h / 2,
            d * 0.5 + d * 0.25
          ]}>
            <boxGeometry args={[w * 0.5, h, d * 0.5]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
          </mesh>
        </group>
      );
    }

    if (category.includes('chair') || isRound) {
      return <ChairModel w={w} d={d} h={h} color={color} />;
    }
    if (category.includes('sofa') || category.includes('couch') || category.includes('lounge')) {
      return <SofaModel w={w} d={d} h={h} color={color} />;
    }
    if (category.includes('bookshelf') || category.includes('shelf') || category.includes('shelving')) {
      return <BookshelfModel w={w} d={d} h={h} color={color} />;
    }
    if (category.includes('cabinet') || category.includes('storage') || category.includes('filing')) {
      return <CabinetModel w={w} d={d} h={h} color={color} />;
    }
    if (category.includes('desk') || category.includes('table')) {
      return <DeskModel w={w} d={d} h={h} color={color} />;
    }

    return (
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
      </mesh>
    );
  };

  return (
    <group position={[ix + w / 2, 0, iy + d / 2]} rotation={[0, -rotRad, 0]}>
      {renderModel()}
      <Html position={[0, h + 0.25, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#1a1a1a',
          padding: '3px 8px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 500,
          border: '1px solid rgba(0,0,0,0.06)',
          textAlign: 'center',
          lineHeight: '1.4',
        }}>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: '9px', color: '#6b7280' }}>{item.widthCm}×{item.depthCm}×{item.heightCm}cm</div>
        </div>
      </Html>
    </group>
  );
}

function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const plankW = 64;
  const plankH = 512;
  for (let px = 0; px < 512; px += plankW) {
    const baseR = 210 + Math.random() * 20;
    const baseG = 190 + Math.random() * 15;
    const baseB = 165 + Math.random() * 10;
    ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
    ctx.fillRect(px, 0, plankW - 1, plankH);

    for (let i = 0; i < 30; i++) {
      const y = Math.random() * plankH;
      const v = Math.random() * 8 - 4;
      ctx.strokeStyle = `rgba(${baseR + v},${baseG + v},${baseB + v},0.25)`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + plankW - 1, y + Math.random() * 4 - 2);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, 0, plankW - 1, plankH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function RoomScene({ roomWidthCm, roomDepthCm, items }: { roomWidthCm: number, roomDepthCm: number, items: any[] }) {
  const width = roomWidthCm / 100;
  const depth = roomDepthCm / 100;
  const wallHeight = 3;
  const wallThickness = 0.1;
  const cx = width / 2;
  const cy = depth / 2;

  const floorTexture = useMemo(() => {
    const tex = createFloorTexture();
    tex.repeat.set(width / 2, depth / 2);
    return tex;
  }, [width, depth]);

  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.7, metalness: 0.02 }),
    [floorTexture]
  );

  const wallMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f5f2ed';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 256; i += 2) {
      for (let j = 0; j < 256; j += 2) {
        const v = 240 + Math.random() * 8;
        ctx.fillStyle = `rgb(${v},${v - 2},${v - 4})`;
        ctx.fillRect(i, j, 2, 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 });
  }, []);

  const baseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8e4df', roughness: 0.9 }),
    []
  );

  const baseH = 0.08;

  return (
    <group position={[-cx, 0, -cy]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, cy]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} />
      </mesh>

      <mesh position={[cx, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + wallThickness * 2, wallHeight, wallThickness]} />
        <primitive object={wallMaterial} />
      </mesh>
      <mesh position={[cx, wallHeight / 2, depth]} castShadow receiveShadow>
        <boxGeometry args={[width + wallThickness * 2, wallHeight, wallThickness]} />
        <primitive object={wallMaterial} />
      </mesh>
      <mesh position={[0, wallHeight / 2, cy]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <primitive object={wallMaterial} />
      </mesh>
      <mesh position={[width, wallHeight / 2, cy]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, depth]} />
        <primitive object={wallMaterial} />
      </mesh>

      <mesh position={[cx, baseH / 2, 0 + wallThickness / 2 + 0.01]} receiveShadow>
        <boxGeometry args={[width, baseH, 0.02]} />
        <primitive object={baseMaterial} />
      </mesh>
      <mesh position={[cx, baseH / 2, depth - wallThickness / 2 - 0.01]} receiveShadow>
        <boxGeometry args={[width, baseH, 0.02]} />
        <primitive object={baseMaterial} />
      </mesh>
      <mesh position={[0 + wallThickness / 2 + 0.01, baseH / 2, cy]} receiveShadow>
        <boxGeometry args={[0.02, baseH, depth]} />
        <primitive object={baseMaterial} />
      </mesh>
      <mesh position={[width - wallThickness / 2 - 0.01, baseH / 2, cy]} receiveShadow>
        <boxGeometry args={[0.02, baseH, depth]} />
        <primitive object={baseMaterial} />
      </mesh>

      {items.map(item => (
        <FurnitureItem key={item.instanceId || item.id || Math.random().toString()} item={item} />
      ))}
    </group>
  );
}

export default function Viewer3D() {
  const location = usePathname();
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const planId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useListPlans(undefined, { query: { queryKey: getListPlansQueryKey(), enabled: !planId } });
  const effectivePlanId = planId || (plans && plans.length > 0 ? plans[0].id : null);

  const { data: plan, isLoading, isError: planError, refetch: refetchPlan } = useGetPlan(effectivePlanId || 0, { query: { queryKey: getGetPlanQueryKey(effectivePlanId || 0), enabled: !!effectivePlanId } });

  const [mode, setMode] = useState<'orbit' | 'walk'>('orbit');

  const parsedDoc = useMemo(() => {
    if (!plan || !plan.documentJson) return null;
    try {
      return JSON.parse(plan.documentJson);
    } catch (e) {
      return null;
    }
  }, [plan]);

  const items = parsedDoc?.items || DEMO_ITEMS;
  const roomW = plan?.roomWidthCm || parsedDoc?.roomWidthCm || DEMO_ROOM_WIDTH;
  const roomD = plan?.roomDepthCm || parsedDoc?.roomDepthCm || DEMO_ROOM_DEPTH;

  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglError(true);
    } catch (e) {
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10">
        <Layers className="w-16 h-16 text-muted-foreground opacity-30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">3D Viewer Unavailable</h2>
        <p className="text-muted-foreground max-w-md">Your browser or device does not support WebGL, which is required for the 3D rendering engine.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  const hasError = planError || plansError;

  if (hasError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10">
        <AlertCircle className="w-12 h-12 text-destructive opacity-60 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load plan</h2>
        <p className="text-muted-foreground max-w-md mb-4">There was a problem loading the plan data. Please try again.</p>
        <Button variant="outline" className="gap-2" onClick={() => { refetchPlan(); refetchPlans(); }}>
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card z-10 relative shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="font-semibold text-sm leading-tight">3D Viewer</h1>
            <p className="text-xs text-muted-foreground">{plan ? plan.name : 'Demo Scene'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={mode === 'orbit' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setMode('orbit')}
            className="gap-2"
          >
            <Layers className="w-4 h-4" /> Orbit
          </Button>
          <Button 
            variant={mode === 'walk' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setMode('walk')}
            className="gap-2"
          >
            <Camera className="w-4 h-4" /> Walk
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        {(isLoading || plansLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}>
          <color attach="background" args={['#e8e4df']} />
          <fog attach="fog" args={['#e8e4df', 15, 35]} />
          <Sky sunPosition={[15, 25, 10]} turbidity={0.3} rayleigh={0.3} />
          
          <ambientLight intensity={0.4} color="#f5f0eb" />
          <directionalLight 
            position={[8, 12, 8]} 
            intensity={1.8} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={30}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={-0.001}
            shadow-normalBias={0.02}
            color="#fff8f0"
          />
          <directionalLight
            position={[-5, 8, -5]}
            intensity={0.4}
            color="#e0e8ff"
          />
          <pointLight position={[0, 2.8, 0]} intensity={0.3} color="#fff5e6" distance={8} decay={2} />

          <ContactShadows
            position={[0, -0.001, 0]}
            opacity={0.35}
            scale={20}
            blur={2.5}
            far={6}
          />
          
          {mode === 'orbit' ? (
            <>
              <PerspectiveCamera makeDefault position={[0, 8, 10]} fov={50} />
              <OrbitControls 
                makeDefault 
                target={[0, 0, 0]} 
                maxPolarAngle={Math.PI / 2 - 0.05}
                minDistance={2}
                maxDistance={20}
                enableDamping
                dampingFactor={0.08}
              />
            </>
          ) : (
            <>
               <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={60} />
               <OrbitControls 
                makeDefault 
                target={[0, 1.6, 0]} 
                enablePan={false}
                enableZoom={false}
                enableDamping
                dampingFactor={0.08}
              />
            </>
          )}

          <RoomScene roomWidthCm={roomW} roomDepthCm={roomD} items={items} />
          
        </Canvas>
        
        {mode === 'walk' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-lg pointer-events-none text-xs font-medium text-muted-foreground flex gap-4">
            <span>Click and drag to look around</span>
          </div>
        )}
      </div>
    </div>
  );
}
