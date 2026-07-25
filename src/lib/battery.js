import { useEffect, useState } from './dom.js';

export function useBattery() {
  const [battery, setBattery] = useState({ supported: false, level: 1, charging: false });

  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') return undefined;
    let batteryManager = null;
    let cancelled = false;

    function sync() {
      if (!batteryManager || cancelled) return;
      setBattery({ supported: true, level: batteryManager.level, charging: batteryManager.charging });
    }

    navigator.getBattery().then((manager) => {
      if (cancelled) return;
      batteryManager = manager;
      sync();
      manager.addEventListener('levelchange', sync);
      manager.addEventListener('chargingchange', sync);
    }).catch(() => {
      /* Battery API blocked or unavailable: keep the simulated fallback */
    });

    return () => {
      cancelled = true;
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', sync);
        batteryManager.removeEventListener('chargingchange', sync);
      }
    };
  }, []);

  return battery;
}
