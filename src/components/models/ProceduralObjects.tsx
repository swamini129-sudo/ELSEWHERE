import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingObjectProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  floatSpeed?: number;
  floatIntensity?: number;
  rotSpeed?: number;
  phase?: number;
  driftX?: number;
  driftZ?: number;
  parallaxDepth?: number;
  children: React.ReactNode;
  reducedMotion?: boolean;
}

export const FloatingGroup: React.FC<FloatingObjectProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  floatSpeed = 0.8,
  floatIntensity = 0.12,
  rotSpeed = 0.2,
  phase = 0,
  driftX = 0.04,
  driftZ = 0.03,
  parallaxDepth = 0.18,
  children,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialX = position[0];
  const initialY = position[1];
  const initialZ = position[2];
  const initialRotX = rotation[0];
  const initialRotY = rotation[1];
  const initialRotZ = rotation[2];

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime() + phase;

    // Smooth subtle pointer parallax reaction
    const px = state.pointer.x * parallaxDepth;
    const py = state.pointer.y * parallaxDepth * 0.8;

    // Subtle scroll dispersal as user leaves hero
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const heroH = typeof window !== 'undefined' ? (window.innerHeight * 0.9) : 800;
    const scrollProgress = Math.min(1.2, Math.max(0, scrollY / heroH));
    const disperseX = Math.sign(initialX) * scrollProgress * 0.55;
    const disperseY = Math.sign(initialY) * scrollProgress * 0.35;

    // Organic individual floating motion with unique phase and three-dimensional drift
    groupRef.current.position.y = initialY + Math.sin(t * floatSpeed) * floatIntensity + py + disperseY;
    groupRef.current.position.x = initialX + Math.cos(t * floatSpeed * 0.65) * driftX + px + disperseX;
    groupRef.current.position.z = initialZ + Math.sin(t * floatSpeed * 0.45) * driftZ;

    // Subtle gentle multi-axis rotations with slight natural response to view angle
    groupRef.current.rotation.x = initialRotX + Math.sin(t * rotSpeed * 0.7) * 0.045 + state.pointer.y * 0.03;
    groupRef.current.rotation.y = initialRotY + Math.cos(t * rotSpeed * 0.85) * 0.06 + state.pointer.x * 0.04;
    groupRef.current.rotation.z = initialRotZ + Math.sin(t * rotSpeed * 0.5) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {children}
    </group>
  );
};

// ============================================================================
// 1. CLEARLY RECOGNIZABLE OVER-EAR HEADPHONES PROCEDURAL 3D MODEL
// ============================================================================
export const HeadphonesModel: React.FC = () => {
  // Smooth continuous curves for headband and comfort cushion
  const { headbandCurve, cushionCurve } = useMemo(() => {
    const headbandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.95, 0.05, 0),
      new THREE.Vector3(-0.88, 0.5, 0),
      new THREE.Vector3(-0.6, 1.0, 0),
      new THREE.Vector3(0, 1.18, 0),
      new THREE.Vector3(0.6, 1.0, 0),
      new THREE.Vector3(0.88, 0.5, 0),
      new THREE.Vector3(0.95, 0.05, 0)
    ]);

    const cushionCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.65, 0.95, 0),
      new THREE.Vector3(-0.35, 1.12, 0),
      new THREE.Vector3(0, 1.18, 0),
      new THREE.Vector3(0.35, 1.12, 0),
      new THREE.Vector3(0.65, 0.95, 0)
    ]);

    return { headbandCurve, cushionCurve };
  }, []);

  return (
    <group>
      {/* --- A. CONTINUOUS HEADBAND ARCH --- */}
      {/* Outer Spring Band (Matte dark charcoal continuous tubular arch) */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[headbandCurve, 64, 0.045, 16, false]} />
        <meshStandardMaterial
          color="#1D201E"
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>

      {/* Underside Leather Cushion (Contoured comfort padding along arch) */}
      <mesh position={[0, -0.015, 0]} castShadow receiveShadow>
        <tubeGeometry args={[cushionCurve, 40, 0.082, 16, false]} />
        <meshStandardMaterial
          color="#141615"
          roughness={0.88}
          metalness={0.04}
        />
      </mesh>

      {/* --- B. LEFT TELESCOPING ADJUSTMENT SLIDER & YOKE --- */}
      <group position={[-0.95, 0.05, 0]}>
        {/* Slider Housing Block */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.22, 0.09]} />
          <meshStandardMaterial color="#262B28" roughness={0.4} metalness={0.25} />
        </mesh>
        {/* Brushed Stainless Extension Rod */}
        <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.24, 16]} />
          <meshStandardMaterial color="#A4ADA6" roughness={0.2} metalness={0.88} />
        </mesh>
        {/* Yoke Mount Block */}
        <mesh position={[0, -0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.11, 0.08, 0.08]} />
          <meshStandardMaterial color="#262B28" roughness={0.4} metalness={0.25} />
        </mesh>
        {/* Cantilever Yoke Arm connecting down to earcup outer pivot */}
        <mesh position={[-0.08, -0.48, 0]} rotation={[0, 0, -0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.045, 0.28, 0.06]} />
          <meshStandardMaterial color="#3A423D" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* --- C. RIGHT TELESCOPING ADJUSTMENT SLIDER & YOKE --- */}
      <group position={[0.95, 0.05, 0]}>
        {/* Slider Housing Block */}
        <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.22, 0.09]} />
          <meshStandardMaterial color="#262B28" roughness={0.4} metalness={0.25} />
        </mesh>
        {/* Brushed Stainless Extension Rod */}
        <mesh position={[0, -0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.24, 16]} />
          <meshStandardMaterial color="#A4ADA6" roughness={0.2} metalness={0.88} />
        </mesh>
        {/* Yoke Mount Block */}
        <mesh position={[0, -0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.11, 0.08, 0.08]} />
          <meshStandardMaterial color="#262B28" roughness={0.4} metalness={0.25} />
        </mesh>
        {/* Cantilever Yoke Arm connecting down to earcup outer pivot */}
        <mesh position={[0.08, -0.48, 0]} rotation={[0, 0, 0.25]} castShadow receiveShadow>
          <boxGeometry args={[0.045, 0.28, 0.06]} />
          <meshStandardMaterial color="#3A423D" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* --- D. LEFT EAR CUP (Distinct, recognizable over-ear cup) --- */}
      <group position={[-1.04, -0.58, 0]} rotation={[0, 0, 0.12]}>
        {/* Outer Pivot Cap (connects directly to yoke arm) */}
        <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#949E96" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Outer Earcup Housing (Sculpted matte charcoal acoustic chamber) */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.45, 0.2, 32]} />
          <meshStandardMaterial color="#1C1F1D" roughness={0.45} metalness={0.15} />
        </mesh>

        {/* Metallic Bevel Ring Accent */}
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.44, 0.016, 16, 36]} />
          <meshStandardMaterial color="#B4583A" roughness={0.3} metalness={0.65} />
        </mesh>

        {/* Cushion Base Ring */}
        <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 32]} />
          <meshStandardMaterial color="#141615" roughness={0.8} />
        </mesh>

        {/* Thick Plush Ear Cushion (Memory Foam Leatherette Doughnut) */}
        <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.34, 0.13, 24, 36]} />
          <meshStandardMaterial color="#101211" roughness={0.94} metalness={0.02} />
        </mesh>

        {/* Inner Acoustic Grille / Speaker Driver Cavity */}
        <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
          <cylinderGeometry args={[0.31, 0.31, 0.02, 24]} />
          <meshStandardMaterial color="#0A0C0B" roughness={0.96} />
        </mesh>
      </group>

      {/* --- E. RIGHT EAR CUP (Distinct, recognizable over-ear cup) --- */}
      <group position={[1.04, -0.58, 0]} rotation={[0, 0, -0.12]}>
        {/* Outer Pivot Cap (connects directly to yoke arm) */}
        <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#949E96" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Outer Earcup Housing (Sculpted matte charcoal acoustic chamber) */}
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.42, 0.2, 32]} />
          <meshStandardMaterial color="#1C1F1D" roughness={0.45} metalness={0.15} />
        </mesh>

        {/* Metallic Bevel Ring Accent */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.44, 0.016, 16, 36]} />
          <meshStandardMaterial color="#B4583A" roughness={0.3} metalness={0.65} />
        </mesh>

        {/* Cushion Base Ring */}
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.06, 32]} />
          <meshStandardMaterial color="#141615" roughness={0.8} />
        </mesh>

        {/* Thick Plush Ear Cushion (Memory Foam Leatherette Doughnut) */}
        <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <torusGeometry args={[0.34, 0.13, 24, 36]} />
          <meshStandardMaterial color="#101211" roughness={0.94} metalness={0.02} />
        </mesh>

        {/* Inner Acoustic Grille / Speaker Driver Cavity */}
        <mesh position={[-0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow>
          <cylinderGeometry args={[0.31, 0.31, 0.02, 24]} />
          <meshStandardMaterial color="#0A0C0B" roughness={0.96} />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// 2. KEYRING WITH KEYS PROCEDURAL 3D MODEL
// ============================================================================
export const KeyringModel: React.FC = () => {
  return (
    <group>
      {/* Main split ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.42, 0.038, 16, 36]} />
        <meshStandardMaterial color="#CBB57B" roughness={0.18} metalness={0.92} />
      </mesh>

      {/* Leather Key Fob */}
      <group position={[0.35, -0.4, 0.1]} rotation={[0.2, 0.1, -0.3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.9, 0.06]} />
          <meshStandardMaterial color="#22332B" roughness={0.72} />
        </mesh>
        {/* Fob brass grommet */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <torusGeometry args={[0.08, 0.02, 16, 24]} />
          <meshStandardMaterial color="#CBB57B" roughness={0.2} metalness={0.88} />
        </mesh>
        {/* Campus crest debossed shape */}
        <mesh position={[0, -0.08, 0.032]} receiveShadow>
          <boxGeometry args={[0.28, 0.28, 0.01]} />
          <meshStandardMaterial color="#182520" roughness={0.5} />
        </mesh>
      </group>

      {/* Brass Key */}
      <group position={[-0.15, -0.45, 0]} rotation={[0.3, 0.2, 0.4]}>
        {/* Key Head */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 24]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.22} metalness={0.88} />
        </mesh>
        {/* Key Head Hole */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          <meshStandardMaterial color="#222524" roughness={0.8} />
        </mesh>
        {/* Key Shaft */}
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.7, 0.03]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.22} metalness={0.88} />
        </mesh>
        {/* Key Teeth */}
        <mesh position={[0.07, -0.25, 0]} castShadow>
          <boxGeometry args={[0.05, 0.1, 0.03]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.22} metalness={0.88} />
        </mesh>
        <mesh position={[0.07, -0.42, 0]} castShadow>
          <boxGeometry args={[0.05, 0.08, 0.03]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.22} metalness={0.88} />
        </mesh>
      </group>

      {/* Silver Second Key */}
      <group position={[-0.32, -0.38, -0.1]} rotation={[-0.2, -0.3, 0.15]}>
        {/* Key Head */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.025, 24]} />
          <meshStandardMaterial color="#D8DCE0" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Key Shaft */}
        <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.09, 0.65, 0.025]} />
          <meshStandardMaterial color="#D8DCE0" roughness={0.2} metalness={0.92} />
        </mesh>
        {/* Key Teeth */}
        <mesh position={[-0.065, -0.28, 0]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.025]} />
          <meshStandardMaterial color="#D8DCE0" roughness={0.2} metalness={0.92} />
        </mesh>
      </group>
    </group>
  );
};

// ============================================================================
// 3. STUDENT ID CARD PROCEDURAL 3D MODEL
// ============================================================================
export const StudentIDModel: React.FC = () => {
  return (
    <group rotation={[0.25, -0.3, 0.15]}>
      {/* Plastic Card Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.08, 0.024]} />
        <meshStandardMaterial color="#FAF8F3" roughness={0.35} />
      </mesh>

      {/* University Banner Header */}
      <mesh position={[0, 0.36, 0.014]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.24, 0.005]} />
        <meshStandardMaterial color="#24372F" roughness={0.32} />
      </mesh>

      {/* Rust accent line */}
      <mesh position={[0, 0.22, 0.014]}>
        <boxGeometry args={[1.65, 0.035, 0.006]} />
        <meshStandardMaterial color="#B4583A" roughness={0.4} />
      </mesh>

      {/* Photo frame */}
      <mesh position={[-0.45, -0.12, 0.014]} receiveShadow>
        <boxGeometry args={[0.48, 0.52, 0.005]} />
        <meshStandardMaterial color="#C4CFBE" roughness={0.6} />
      </mesh>
      {/* Abstract silhouette avatar in photo */}
      <mesh position={[-0.45, -0.06, 0.018]}>
        <cylinderGeometry args={[0.1, 0.1, 0.002, 16]} />
        <meshStandardMaterial color="#24372F" roughness={0.5} />
      </mesh>
      <mesh position={[-0.45, -0.23, 0.018]}>
        <cylinderGeometry args={[0.16, 0.19, 0.002, 16]} />
        <meshStandardMaterial color="#24372F" roughness={0.5} />
      </mesh>

      {/* Text lines (Name, ID, Department) */}
      <mesh position={[0.22, 0.06, 0.014]}>
        <boxGeometry args={[0.75, 0.05, 0.004]} />
        <meshStandardMaterial color="#222524" roughness={0.4} />
      </mesh>
      <mesh position={[0.15, -0.07, 0.014]}>
        <boxGeometry args={[0.6, 0.04, 0.004]} />
        <meshStandardMaterial color="#7D8E73" roughness={0.4} />
      </mesh>
      <mesh position={[0.25, -0.19, 0.014]}>
        <boxGeometry args={[0.8, 0.04, 0.004]} />
        <meshStandardMaterial color="#A9B7A0" roughness={0.4} />
      </mesh>

      {/* Lanyard punch hole */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
        <meshStandardMaterial color="#E7E1D4" roughness={0.8} />
      </mesh>

      {/* Back Magnetic Stripe */}
      <mesh position={[0, 0.25, -0.014]} receiveShadow>
        <boxGeometry args={[1.7, 0.28, 0.004]} />
        <meshStandardMaterial color="#181A18" roughness={0.25} metalness={0.3} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 4. CLOSED NOTEBOOK PROCEDURAL 3D MODEL
// ============================================================================
export const NotebookModel: React.FC = () => {
  return (
    <group rotation={[0.4, 0.35, -0.2]}>
      {/* Front & Back Cover (Hardcover buckram green) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.45, 1.95, 0.2]} />
        <meshStandardMaterial color="#24372F" roughness={0.65} />
      </mesh>

      {/* Rounded spine */}
      <mesh position={[-0.72, 0, 0]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.95, 24, 1, false, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#1B2923" roughness={0.7} />
      </mesh>

      {/* Exposed paper block (warm ivory pages) */}
      <mesh position={[0.04, 0, 0]} receiveShadow>
        <boxGeometry args={[1.34, 1.87, 0.17]} />
        <meshStandardMaterial color="#FAF7F2" roughness={0.92} />
      </mesh>

      {/* Elastic band keeper */}
      <mesh position={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.08, 1.98, 0.215]} />
        <meshStandardMaterial color="#B4583A" roughness={0.75} />
      </mesh>

      {/* Ribbon bookmark hanging from bottom */}
      <group position={[0.1, -1.05, 0]} rotation={[0.1, 0, 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.4, 0.01]} />
          <meshStandardMaterial color="#B4583A" roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.25, 0.04]} rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.25, 0.01]} />
          <meshStandardMaterial color="#B4583A" roughness={0.55} />
        </mesh>
      </group>

      {/* Debossed cover title frame */}
      <mesh position={[0, 0.4, 0.102]}>
        <boxGeometry args={[0.6, 0.28, 0.005]} />
        <meshStandardMaterial color="#1E2F28" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, 0.104]}>
        <boxGeometry args={[0.48, 0.02, 0.002]} />
        <meshStandardMaterial color="#CBB57B" roughness={0.3} metalness={0.75} />
      </mesh>
    </group>
  );
};

// ============================================================================
// 5. REUSABLE WATER BOTTLE PROCEDURAL 3D MODEL
// ============================================================================
export const WaterBottleModel: React.FC = () => {
  return (
    <group rotation={[0.2, -0.2, 0.35]}>
      {/* Bottle Body - Muted Sage Powdercoat */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.46, 0.46, 1.5, 32]} />
        <meshStandardMaterial color="#6E8268" roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Base protective rim */}
      <mesh position={[0, -0.92, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.465, 0.465, 0.08, 32]} />
        <meshStandardMaterial color="#DCE0E4" roughness={0.2} metalness={0.88} />
      </mesh>

      {/* Tapered Shoulder */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.46, 0.35, 32]} />
        <meshStandardMaterial color="#6E8268" roughness={0.52} metalness={0.06} />
      </mesh>

      {/* Threaded Neck */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.2, 32]} />
        <meshStandardMaterial color="#DCE0E4" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Steel Cap */}
      <group position={[0, 1.08, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.22, 32]} />
          <meshStandardMaterial color="#DCE0E4" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Rubber grip ring on cap */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.275, 0.275, 0.08, 32]} />
          <meshStandardMaterial color="#1F2321" roughness={0.9} />
        </mesh>
        {/* Metal loop carry handle */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.16, 0.03, 16, 24]} />
          <meshStandardMaterial color="#DCE0E4" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
};
