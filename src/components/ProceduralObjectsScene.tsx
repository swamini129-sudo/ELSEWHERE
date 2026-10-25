import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HeadphonesModel } from './models/ProceduralObjects';

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
  setSelectedId: React.Dispatch<React.SetStateAction<ActionKey | null>>;
  onNavigate: () => void;
  children: React.ReactNode;
}

const InteractiveFloatingObject: React.FC<InteractiveObjectProps> = ({
  objectId,
  title,
  description,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  phase = 0,
  floatSpeed = 0.8,
  floatIntensity = 0.12,
  reducedMotion = false,
  selectedId,
  setSelectedId,
  onNavigate,
  children,
}) => {
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => { document.body.style.cursor = 'auto'; };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const time = state.clock.getElapsedTime() + phase;
    const floatOffset = reducedMotion
      ? 0
      : Math.sin(time * floatSpeed) * floatIntensity;
    const smoothing = 1 - Math.exp(-5 * delta);

    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      position[0],
      smoothing
    );

    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      position[1] + floatOffset,
      smoothing
    );

    group.current.position.z = position[2];

    if (!reducedMotion) {
      group.current.rotation.x = rotation[0] + Math.sin(time * 0.3) * 0.025;
      group.current.rotation.y = rotation[1] + Math.cos(time * 0.35) * 0.04;
      group.current.rotation.z = rotation[2] + Math.sin(time * 0.25) * 0.02;
    }
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedId((current) => (current === objectId ? null : objectId));
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {children}

      {selectedId === objectId && (
        <Html
          position={[0, 1.25, 0.15]}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="object-action-label"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <span className="object-label-kicker">EXPLORE</span>
            <strong>{title}</strong>
            <span className="object-label-description">{description}</span>

            <button
              type="button"
              className="object-label-link"
              onClick={(event) => {
                event.stopPropagation();
                onNavigate();
              }}
            >
              Open experience <span aria-hidden="true">↗</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

export const ProceduralObjectsScene: React.FC<SceneProps> = ({
  reducedMotion: reducedMotionProp = false,
  onReportClick = () => {},
}) => {
  const [selectedId, setSelectedId] = useState<ActionKey | null>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      // Canvas clicks are handled by the 3D object toggle / onPointerMissed.
      // Clicking the popup itself must not dismiss it before its button works.
      if (target.closest('canvas') || target.closest('.object-action-label')) return;
      setSelectedId(null);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handleOutsidePointerDown);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, []);

  const isMobile = viewportWidth < 768;

  return (
    <Canvas
      onPointerMissed={() => setSelectedId(null)}
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 8.2], fov: 42 }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        touchAction: 'pan-y',
        zIndex: 2,
      }}
      gl={{
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'default',
      }}
    >
      <ambientLight intensity={0.95} color="#FFF8E9" />

      <directionalLight
        position={[6, 8, 5.5]}
        intensity={1.45}
        color="#FFFDF9"
      />

      <directionalLight
        position={[-7, -2.5, 4]}
        intensity={0.62}
        color="#A9B7A0"
      />

      <pointLight
        position={[0, -4.5, 3]}
        intensity={0.48}
        color="#CBB996"
      />

      <pointLight
        position={[4.5, 3.5, 2.5]}
        intensity={0.22}
        color="#FAF7F2"
      />

      <InteractiveFloatingObject
        objectId="report"
        title="Report an item"
        description="Lost something? Tell us."
        position={[0, 0, 0.1]}
        rotation={[0.08, -0.18, 0.04]}
        scale={isMobile ? 1.48 : 1.65}
        phase={0.4}
        floatSpeed={0.8}
        floatIntensity={0.12}
        reducedMotion={reducedMotionProp}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onNavigate={onReportClick}
      >
        <HeadphonesModel />
      </InteractiveFloatingObject>
    </Canvas>
  );
};

export default ProceduralObjectsScene;
