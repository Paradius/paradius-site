import { describe, expect, it } from 'vitest';
import { classifyDevice, readDeviceClass } from './device-class';

const UA = {
  pixel: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  tab: 'Mozilla/5.0 (Linux; Android 14; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  androidDesktopSite: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  chromeos: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};

describe('classifyDevice', () => {
  it.each([
    ['Pixel 9', { platform: 'Android', userAgent: UA.pixel, maxTouchPoints: 5 }, 'touch'],
    ['Tab S7', { platform: 'Android', userAgent: UA.tab, maxTouchPoints: 10 }, 'touch'],
    ['Tab S7 in desktop-site mode keeps Android platform', { platform: 'Android', userAgent: UA.androidDesktopSite, maxTouchPoints: 10 }, 'touch'],
    ['iPhone without client hints', { userAgent: UA.iphone, maxTouchPoints: 5 }, 'touch'],
    ['iPad presenting as Mac', { userAgent: UA.mac, maxTouchPoints: 5 }, 'touch'],
    ['Mac', { userAgent: UA.mac, maxTouchPoints: 0 }, 'desktop'],
    ['Windows touchscreen laptop', { platform: 'Windows', userAgent: UA.windows, maxTouchPoints: 10 }, 'desktop'],
    ['Linux', { platform: 'Linux', userAgent: UA.linux, maxTouchPoints: 0 }, 'desktop'],
    ['ChromeOS', { platform: 'Chrome OS', userAgent: UA.chromeos, maxTouchPoints: 10 }, 'desktop'],
    ['Android UA without client hints', { userAgent: UA.pixel, maxTouchPoints: 5 }, 'touch'],
  ])('classifies %s', (_name, signals, expected) => {
    expect(classifyDevice(signals)).toBe(expected);
  });

  it('survives serialization into an inline script', () => {
    const revived = new Function(`return (${classifyDevice.toString()})`)();
    expect(revived({ platform: 'Android', userAgent: UA.tab, maxTouchPoints: 10 })).toBe('touch');
    expect(revived({ userAgent: UA.windows, maxTouchPoints: 0 })).toBe('desktop');
  });
});

describe('readDeviceClass', () => {
  it('treats a missing attribute as desktop', () => {
    expect(readDeviceClass({ dataset: {} } as unknown as HTMLElement)).toBe('desktop');
    expect(readDeviceClass({ dataset: { device: 'touch' } } as unknown as HTMLElement)).toBe('touch');
  });
});
