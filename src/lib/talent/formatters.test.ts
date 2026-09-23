import { describe, expect, it } from 'vitest';
import { formatExperienceRange, formatExperienceYears } from './formatters';

const open = { role: 'Senior Flutter Developer', startDate: '2021-04', industryDescriptor: 'fintech startup', achievements: [], stack: [] };
const closed = { ...open, startDate: '2018-02', endDate: '2021-03' };

describe('formatExperienceYears', () => {
  it('reads an open entry as start year to now', () => { expect(formatExperienceYears(open)).toBe('2021 to now'); });
  it('reads a closed entry as start year to end year', () => { expect(formatExperienceYears(closed)).toBe('2018 to 2021'); });
});

describe('formatExperienceRange', () => {
  it('keeps the month form with Present for an open entry', () => { expect(formatExperienceRange(open)).toBe('Apr 2021 to Present'); });
  it('keeps the month form for a closed entry', () => { expect(formatExperienceRange(closed)).toBe('Feb 2018 to Mar 2021'); });
});
