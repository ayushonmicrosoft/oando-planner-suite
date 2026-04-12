"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGetPlan, useListPlans, getGetPlanQueryKey, getListPlansQueryKey } from '@workspace/api-client-react';
import { Loader2, ArrowLeft, Layers, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_ROOM_WIDTH = 500;
const DEMO_ROOM_DEPTH = 500;
const DEMO_ITEMS = [
  { instanceId: '1', name: 'Executive Desk', widthCm: 180, depthCm: 80, heightCm: 75, x: 200, y: 100, rotation: 0, color: '#4a3b32', shape: 'rect' },
  { instanceId: '2', name: 'Ergo Chair', widthCm: 60, depthCm: 60, heightCm: 110, x: 260, y: 110, rotation: 90, color: '#222222', shape: 'round' },
  { instanceId: '3', name: 'Bookshelf', widthCm: 120, depthCm: 40, heightCm: 200, x: 50, y: 400, rotation: 0, color: '#f0f0f0', shape: 'rect' },
  { instanceId: '4', name: 'L-Desk', widthCm: 160, depthCm: 120, heightCm: 75, x: 50, y: 50, rotation: 0, color: '#8B6914', shape: 'l-left' },
];

function FurnitureItem({ item }: { item: any }) {
  const w = (item.widthCm || 60) / 100;
  const d = (item.depthCm || 60) / 100;
  const h = (item.heightCm || 75) / 100;
  const ix = item.x / 100;
  const iy = item.y / 100;
  const rotRad = (item.rotation || 0) * (Math.PI / 180);
  const color = item.color || '#3b82f6';
  const isRound = item.shape === 'round' || item.shape === 'circle';
  const isLShape = item.shape === 'l-left' || item.shape === 'l-right';

  return (
    <group position={[ix + w / 2, 0, iy + d / 2]} rotation={[0, -rotRad, 0]}>
      {isRound ? (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <cylinderGeometry args={[w / 2, w / 2, h, 32]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
        </mesh>
      ) : isLShape ? (
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
      ) : (
        <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.15} />
        </mesh>
      )}

      <Html position={[0, h + 0.25, 0]} center distanceFactor={8}>
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          color: '#1a1a1a',
          padding: '3px 8px',
          borderRadius: '4px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 500,
          border: '1px solid rgba(0,0,0,0.08)',
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

function RoomScene({ roomWidthCm, roomDepthCm, items }: { roomWidthCm: number, roomDepthCm: number, items: any[] }) {
  const width = roomWidthCm / 100;
  const depth = roomDepthCm / 100;
  const wallHeight = 3;
  const wallThickness = 0.1;
  const cx = width / 2;
  const cy = depth / 2;

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0ede8', roughness: 0.85 }), []);
  const wallMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e8e4df';
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 4) {
      for (let j = 0; j < 128; j += 4) {
        const v = 220 + Math.random() * 15;
        ctx.fillStyle = `rgb(${v},${v - 3},${v - 6})`;
        ctx.fillRect(i, j, 4, 4);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0 });
  }, []);

  const gridSize = Math.max(width, depth);
  const gridDiv = Math.round(gridSize * 2);

  return (
    <group position={[-cx, 0, -cy]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0, cy]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} />
      </mesh>

      <gridHelper
        args={[gridSize, gridDiv, '#999999', '#bbbbbb']}
        position={[cx, 0.005, cy]}
      />

      <mesh position={[cx, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, wallThickness]} />
        <primitive object={wallMaterial} />
      </mesh>
      <mesh position={[cx, wallHeight / 2, depth]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, wallThickness]} />
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

        <Canvas shadows dpr={[1, 2]}>
          <color attach="background" args={['#2a2a2a']} />
          <Sky sunPosition={[10, 20, 10]} turbidity={0.1} rayleigh={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
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
