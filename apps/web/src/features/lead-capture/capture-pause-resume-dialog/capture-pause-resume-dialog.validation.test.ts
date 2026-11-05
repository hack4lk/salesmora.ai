import { describe, expect, it } from 'vitest';
import { captureIntakeIssue as issue, type CaptureIntakeSource } from './capture-pause-resume-dialog.validation';
const source: CaptureIntakeSource = { id: 'source', version: 2, name: 'Website', type: 'website', status: 'active', canPause: true, canResume: true, resumeReadiness: 'ready', approved: [{ label: 'Assignment', value: 'Sam Rivera' }] };
describe('pause/resume presentation guards', () => {
  it('allows only active-to-paused and ready paused-to-active transitions', () => {
    expect(issue(source, 'pause')).toBeNull(); expect(issue({ ...source, status: 'paused' }, 'resume')).toBeNull();
    for (const status of ['draft', 'scheduled', 'archived'] as const) for (const action of ['pause', 'resume'] as const) expect(issue({ ...source, status }, action)).toBe('unavailable');
    expect(issue(source, 'resume')).toBe('unavailable'); expect(issue({ ...source, status: 'paused' }, 'pause')).toBe('unavailable');
  });
  it('separately enforces pause and resume capabilities', () => {
    expect(issue({ ...source, canPause: false }, 'pause')).toBe('forbidden'); expect(issue({ ...source, status: 'paused', canResume: false }, 'resume')).toBe('forbidden');
  });
  it('requires current approved configuration and resolved readiness before resuming', () => {
    const paused = { ...source, status: 'paused' as const };
    expect(issue({ ...paused, approved: [] }, 'resume')).toBe('invalid');
    expect(issue({ ...paused, resumeReadiness: 'checking' }, 'resume')).toBe('checking'); expect(issue({ ...paused, resumeReadiness: 'blocked' }, 'resume')).toBe('blocked');
    expect(issue({ ...source, resumeReadiness: 'blocked' }, 'pause')).toBeNull();
  });
  it('requires a source identity and positive version for server comparison', () => {
    expect(issue({ ...source, version: 0 }, 'pause')).toBe('invalid'); expect(issue({ ...source, id: '' }, 'pause')).toBe('invalid');
  });
});
