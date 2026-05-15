import { useCallback, useEffect, useRef, useState } from 'react';

const SWING_VISUAL_DURATION_MS = 200;

export function usePlayerInput() {
  const keys = useRef<Record<string, boolean>>({});
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const visualSwingTimeout = useRef<number | undefined>(undefined);

  const [isSwinging, setIsSwinging] = useState(false);
  const [isVisualSwinging, setIsVisualSwinging] = useState(false);

  const syncSwingingState = useCallback(() => {
    setIsSwinging(Boolean(keys.current.Space || keys.current.MouseDown));
  }, []);

  const triggerVisualSwing = useCallback(() => {
    setIsVisualSwinging(true);

    if (visualSwingTimeout.current !== undefined) {
      window.clearTimeout(visualSwingTimeout.current);
    }

    visualSwingTimeout.current = window.setTimeout(() => {
      setIsVisualSwinging(false);
      visualSwingTimeout.current = undefined;
    }, SWING_VISUAL_DURATION_MS);
  }, []);

  const clearSwingInput = useCallback(() => {
    keys.current.Space = false;
    keys.current.MouseDown = false;
    setIsSwinging(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.current[event.code] = true;

      if (event.code === 'Space') {
        triggerVisualSwing();
      }

      syncSwingingState();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
      syncSwingingState();
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleMouseDown = () => {
      keys.current.MouseDown = true;
      triggerVisualSwing();
      syncSwingingState();
    };

    const handleMouseUp = () => {
      keys.current.MouseDown = false;
      syncSwingingState();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      if (visualSwingTimeout.current !== undefined) {
        window.clearTimeout(visualSwingTimeout.current);
      }
    };
  }, [syncSwingingState, triggerVisualSwing]);

  return {
    isSwinging,
    isVisualSwinging,
    mouseX,
    mouseY,
    clearSwingInput
  };
}
