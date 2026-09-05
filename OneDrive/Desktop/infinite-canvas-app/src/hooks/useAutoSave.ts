import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

const AUTOSAVE_KEY = 'second-brain-canvas-autosave';
const AUTOSAVE_INTERVAL_MS = 2000;

/**
 * AutoSave hook — subscribes to store changes and debounce-saves to localStorage.
 * Also restores state on initial mount.
 */
export const useAutoSave = () => {
  // Restore on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.elements)) {
          useCanvasStore.setState({
            elements: data.elements || [],
            connections: data.connections || [],
            drawings: data.drawings || [],
            viewport: data.viewport || { panX: 0, panY: 0, zoom: 1 },
            nextZIndex: data.nextZIndex || Math.max(data.elements.length, 1),
          });
          console.log('[AutoSave] Restored', data.elements.length, 'elements from localStorage');
          return; // Don't load sample data if we have saved state
        }
      }
    } catch (e) {
      console.warn('[AutoSave] Could not restore saved state:', e);
    }

    // If no saved state, load sample data
    useCanvasStore.getState().loadSampleData();
  }, []);

  // Save on interval, but skip when the canvas hasn't actually changed
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useCanvasStore.getState();
      const snapshot = {
        elements: state.elements,
        connections: state.connections,
        drawings: state.drawings,
        viewport: state.viewport,
        nextZIndex: state.nextZIndex,
        savedAt: Date.now(),
      };
      const key = JSON.stringify({
        elements: snapshot.elements,
        connections: snapshot.connections,
        drawings: snapshot.drawings,
        viewport: snapshot.viewport,
        nextZIndex: snapshot.nextZIndex,
      });
      if (key === lastSavedRef.current) return;
      lastSavedRef.current = key;
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
      } catch (e) {
        console.warn('[AutoSave] Failed to save:', e);
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
};
