import React, { useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  HeadphonesModel,
  StudentIDModel,
  NotebookModel,
  WaterBottleModel
} from './models/ProceduralObjects';

interface SceneProps {
  reducedMotion?: boolean;
  onReportClick?: () => void;
  onBrowseClick?: () => void;
  onMemoryMatchClick?: () => void;
  onFindClick?: () => void;
}

type ActionKey = 'report' | 'browse' | 'memory' | 'find';
interface InteractiveObjectProps {
  objectId: ActionKey;
  title: string;
  description: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  phase?: number;
  floatSpeed?: number;
  floatIntensity?: number;
  reducedMotion?: boolean;
  selectedId: ActionKey | null;
  setSelectedId: (id: ActionKey | null) => void;
  onNavigate: () => void;
  children: React.ReactNode;
}

const InteractiveFloatingObject: React.FC<InteractiveObjectProps> = ({
  objectId, title, description, position, rotation = [0, 0, 0], scale = 1,
  phase = 0, floatSpeed = 0.55, floatIntensity = 0.08, reducedMotion = false,
  selectedId, setSelectedId, onNavigate, children
}) => {
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, moved: false, offsetX: 0, offsetY: 0, startX: 0, startY: 0 });
  const base = useRef(new THREE.Vector3(...position));
  const { camera, raycaster, pointer, gl } = useThree();
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), -position[2]));
  const point = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!group.current) return;
    if (drag.current.active) return;
    const t = state.clock.getElapsedTime() + phase;
    const targetY = base.current.y + (reducedMotion ? 0 : Math.sin(t * floatSpeed) * floatIntensity);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, base.current.x, 0.12);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.12);
    group.current.position.z = base.current.z;
    if (!reducedMotion) {
      group.current.rotation.x = rotation[0] + Math.sin(t * 0.3) * 0.035;
      group.current.rotation.y = rotation[1] + Math.cos(t * 0.35) * 0.045;
      group.current.rotation.z = rotation[2] + Math.sin(t * 0.25) * 0.025;
    }
  });

  const updatePointerWorld = () => {
    raycaster.setFromCamera(pointer, camera);
    plane.current.constant = -base.current.z;
    if (raycaster.ray.intersectPlane(plane.current, point.current)) {
      base.current.x = THREE.MathUtils.clamp(point.current.x - drag.current.offsetX, -6.2, 6.2);
      base.current.y = THREE.MathUtils.clamp(point.current.y - drag.current.offsetY, -3.7, 3.7);
      if (group.current) {
        group.current.position.x = base.current.x;
        group.current.position.y = base.current.y;
      }
    }
  };

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); gl.domElement.style.cursor = 'grab'; }}
      onPointerOut={() => { if (!drag.current.active) gl.domElement.style.cursor = 'auto'; }}
      onPointerDown={(e) => {
        e.stopPropagation();
        drag.current.active = true;
        drag.current.moved = false;
        drag.current.startX = e.clientX;
        drag.current.startY = e.clientY;
        drag.current.offsetX = e.point.x - base.current.x;
        drag.current.offsetY = e.point.y - base.current.y;
        gl.domElement.style.cursor = 'grabbing';
        e.target.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return;
        e.stopPropagation();
        if (Math.hypot(e.clientX - drag.current.startX, e.clientY - drag.current.startY) > 5) drag.current.moved = true;
        updatePointerWorld();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const wasDrag = drag.current.moved;
        drag.current.active = false;
        gl.domElement.style.cursor = 'grab';
        if (!wasDrag) setSelectedId(selectedId === objectId ? null : objectId);
      }}
      onPointerCancel={() => { drag.current.active = false; gl.domElement.style.cursor = 'auto'; }}
    >
      {children}
      {selectedId === objectId && (
        <Html position={[0, 1.25, 0.15]} center distanceFactor={8} zIndexRange={[30, 0]} style={{ pointerEvents: 'auto' }}>
          <div className="object-action-label" onPointerDown={(e) => e.stopPropagation()}>
            <span className="object-label-kicker">EXPLORE</span>
            <strong>{title}</strong>
            <span className="object-label-description">{description}</span>
            <button type="button" className="object-label-link" onClick={(e) => { e.stopPropagation(); onNavigate(); }}>
              Open experience <span aria-hidden="true">↗</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

// Subtle camera rig that introduces gentle, cinematic pointer-based parallax and scroll-linked elevation
const CameraRig: React.FC<{ reducedMotion?: boolean }> = ({ reducedMotion }) => {
  useFrame((state) => {
    if (reducedMotion) return;
    // Calculate scroll progress away from top of page
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const heroH = typeof window !== 'undefined' ? (window.innerHeight * 0.9) : 800;
    const scrollProgress = Math.min(1.2, Math.max(0, scrollY / heroH));

    // Gentle camera translation tracking pointer + subtle elevation on scroll exit
    const targetX = 0;
    const targetY = scrollProgress * 0.85;
    const targetZ = 8.2 + scrollProgress * 0.5;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.04);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.04);
    state.camera.lookAt(0, scrollProgress * 0.35, 0);
  });
  return null;
};

export const ProceduralObjectsScene: React.FC<SceneProps> = ({ reducedMotion, onReportClick = () => {}, onBrowseClick = () => {}, onMemoryMatchClick = () => {}, onFindClick = () => {} }) => {
  const [selectedId, setSelectedId] = useState<ActionKey | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const isSmallLaptop = viewportWidth >= 1024 && viewportWidth < 1280;

  // Responsive scale and spread factors:
  // Dynamically calibrated so objects stay inside visible hero boundaries
  // while maintaining a strictly protected central zone for typography and controls.
  const spreadFactor = isTablet ? 0.76 : isSmallLaptop ? 0.88 : 1.0;
  const scaleFactor = isTablet ? 0.72 : isSmallLaptop ? 0.86 : 1.0;

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 8.2], fov: 42 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 2
      }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      }}
    >
      {/* Camera Parallax Rig */}
      <CameraRig reducedMotion={reducedMotion} />

      {/* Editorial Studio Lighting:
          Warm key light casting soft directional shadows, sage fill, and subtle rim accents */}
      <ambientLight intensity={0.95} color="#FFF8E9" />

      {/* Main Studio Key Light */}
      <directionalLight
        position={[6, 8, 5.5]}
        intensity={1.45}
        color="#FFFDF9"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.00015}
      />

      {/* Filmic Sage Fill Light */}
      <directionalLight
        position={[-7, -2.5, 4]}
        intensity={0.62}
        color="#A9B7A0"
      />

      {/* Warm Ambient Rim Highlights */}
      <pointLight position={[0, -4.5, 3]} intensity={0.48} color="#CBB996" />
      <pointLight position={[4.5, 3.5, 2.5]} intensity={0.22} color="#FAF7F2" />

      {/* Subtle Background Shadow Receiver Grounding Objects in Space */}
      <mesh position={[0, 0, -1.8]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <shadowMaterial opacity={0.06} color="#24372F" />
      </mesh>

      {/* 
        =======================================================================
        CAREFULLY ART-DIRECTED PRODUCT PHOTOGRAPHY COMPOSITION
        - Protected center zone: (|X| < 2.7, |Y| < 2.0) has zero objects.
        - Generous spacing between objects (vertical separation > 1.4 to 2.8 units).
        - Unique phase, drift, and parallax depth on each object.
        =======================================================================
      */}
      <InteractiveFloatingObject objectId="report" title="Report an item" description="Lost something? Tell us." position={[4.05 * spreadFactor, 1.35, 0.1]} rotation={[0.22, -0.25, 0.12]} scale={(isMobile ? 0.48 : 0.68) * scaleFactor} phase={0.4} reducedMotion={reducedMotion} selectedId={selectedId} setSelectedId={setSelectedId} onNavigate={onReportClick}>
        <HeadphonesModel />
      </InteractiveFloatingObject>
      <InteractiveFloatingObject objectId="find" title="Find your item" description="Search by name or detail." position={[-4.0 * spreadFactor, 1.25, 0.1]} rotation={[0.2, 0.32, -0.14]} scale={(isMobile ? 0.52 : 0.75) * scaleFactor} phase={1.6} reducedMotion={reducedMotion} selectedId={selectedId} setSelectedId={setSelectedId} onNavigate={onFindClick}>
        <WaterBottleModel />
      </InteractiveFloatingObject>
      <InteractiveFloatingObject objectId="memory" title="Memory Match" description="Connect the little clues." position={[-4.45 * spreadFactor, -1.8, 0.15]} rotation={[0.22, -0.28, 0.12]} scale={(isMobile ? 0.45 : 0.64) * scaleFactor} phase={2.7} reducedMotion={reducedMotion} selectedId={selectedId} setSelectedId={setSelectedId} onNavigate={onMemoryMatchClick}>
        <StudentIDModel />
      </InteractiveFloatingObject>
      <InteractiveFloatingObject objectId="browse" title="Browse the registry" description="Explore reported items." position={[4.45 * spreadFactor, -1.8, 0.1]} rotation={[0.25, -0.28, 0.12]} scale={(isMobile ? 0.48 : 0.68) * scaleFactor} phase={3.5} reducedMotion={reducedMotion} selectedId={selectedId} setSelectedId={setSelectedId} onNavigate={onBrowseClick}>
        <NotebookModel />
      </InteractiveFloatingObject>
    </Canvas>
  );
};

export default ProceduralObjectsScene;
