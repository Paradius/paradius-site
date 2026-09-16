export type DeviceClass = 'touch' | 'desktop';

export interface DeviceSignals {
  platform?: string;
  userAgent: string;
  maxTouchPoints: number;
}

// Serialized with toString() into BaseLayout's inline head script: no outside references.
export function classifyDevice(signals: DeviceSignals): DeviceClass {
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
