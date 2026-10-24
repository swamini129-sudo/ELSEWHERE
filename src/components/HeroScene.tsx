import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy-load the Three.js 3D canvas so the initial page bundle stays ultralight
const ProceduralObjectsScene = lazy(() => import('./ProceduralObjectsScene'));

interface SceneProps {
  reducedMotion?: boolean;
  onReportClick?: () => void;
  onBrowseClick?: () => void;
  onMemoryMatchClick?: () => void;
  onFindClick?: () => void;
}

// WebGL Fallback component with original procedural SVG shapes
export const HeroFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
      {/* Ambient code-drawn silhouettes in the corners */}
      <svg className="absolute -top-12 -left-12 w-64 h-64 text-sage opacity-25" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="50" cy="50" r="40" strokeDasharray="4 2" />
        <rect x="35" y="20" width="30" height="60" rx="6" />
      </svg>
      <svg className="absolute -bottom-10 -right-10 w-72 h-72 text-forest-surface opacity-30" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="20" y="30" width="80" height="55" rx="4" />
        <line x1="30" y1="45" x2="60" y2="45" />
        <line x1="30" y1="55" x2="80" y2="55" />
        <circle cx="85" cy="50" r="10" />
      </svg>
    </div>
  );
};

// Main Export with WebGL detection & Error Boundary
export const Hero3DCanvas: React.FC<SceneProps> = ({ reducedMotion, onReportClick, onBrowseClick, onMemoryMatchClick, onFindClick }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return <HeroFallback />;
  }

  if (hasWebGL === null) {
    return null;
  }

  return (
    <Suspense fallback={<HeroFallback />}>
      <ProceduralObjectsScene reducedMotion={reducedMotion} onReportClick={onReportClick} onBrowseClick={onBrowseClick} onMemoryMatchClick={onMemoryMatchClick} onFindClick={onFindClick} />
    </Suspense>
  );
};
