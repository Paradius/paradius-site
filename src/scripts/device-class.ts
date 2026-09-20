export type DeviceClass = 'touch' | 'desktop';

export interface DeviceSignals {
  platform?: string;
  userAgent: string;
  maxTouchPoints: number;
  /* Whether the primary pointing device is a finger. Undefined only where
     matchMedia is missing, which is server-side rendering and old engines. */
  coarsePointer?: boolean;
}

// Serialized with toString() into BaseLayout's inline head script: no outside references.
export function classifyDevice(signals: DeviceSignals): DeviceClass {
  /* What is in the hand decides, not what the user agent claims: a tablet set
     to "desktop site" sends a desktop UA and hides its client hints, but its
     primary pointer is still a finger. A laptop with a touchscreen still has a
     mouse, so it stays on the desktop home. */
  if (typeof signals.coarsePointer === 'boolean') {
    return signals.coarsePointer ? 'touch' : 'desktop';
  }
  if (signals.platform) {
    return signals.platform === 'Android' || signals.platform === 'iOS' ? 'touch' : 'desktop';
  }
  if (/Android|iPhone|iPad|iPod/.test(signals.userAgent)) return 'touch';
  if (/Macintosh/.test(signals.userAgent) && signals.maxTouchPoints > 1) return 'touch';
  return 'desktop';
}

export function readDeviceClass(root: HTMLElement): DeviceClass {
  return root.dataset.device === 'touch' ? 'touch' : 'desktop';
}
