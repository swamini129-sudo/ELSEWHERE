
import React, { useState, useEffect, Suspense, lazy } from 'react';

const ProceduralObjectsScene = lazy(() => import('./ProceduralObjectsScene'));

interface SceneProps {
  reducedMotion?: boolean;
  onReportClick?: () => void;
  onBrowseClick?: () => void;
  onMemoryMatchClick?: () => void;
  onFindClick?: () => void;
}

// Keep the hero background clean while the 3D scene loads
export const HeroFallback: React.FC = () => null;

export const Hero3DCanvas: React.FC<SceneProps> = ({
  reducedMotion,
  onReportClick,
  onBrowseClick,
  onMemoryMatchClick,
  onFindClick,
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  // Don't show placeholder shapes before the real scene is ready
  if (hasWebGL !== true) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ProceduralObjectsScene
        reducedMotion={reducedMotion}
        onReportClick={onReportClick}
        onBrowseClick={onBrowseClick}
        onMemoryMatchClick={onMemoryMatchClick}
        onFindClick={onFindClick}
      />
    </Suspense>
  );
};
