import { firstValueFrom } from 'rxjs';
import { ToastService, Toast, MIN_ACTION_TOAST_MS } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should start with no toasts', async () => {
    const toasts = await firstValueFrom(service.toasts$);
    expect(toasts.length).toBe(0);
  });

  it('should add a toast via show()', () => {
    service.show('Hello', 'info', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);
    expect(latest[0].message).toBe('Hello');
    expect(latest[0].type).toBe('info');
  });

  it.each([
    ['success', 'Done'],
    ['error', 'Failed'],
    ['warning', 'Careful'],
  ] as const)('should add %s toast', (type, message) => {
    service[type](message, 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);
    expect(latest[0].type).toBe(type);
    expect(latest[0].message).toBe(message);
  });

  it('should assign unique IDs', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest[0].id).not.toBe(latest[1].id);
  });

  it('should remove a toast by id', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    const idToRemove = latest[0].id;
    service.remove(idToRemove);

    expect(latest.length).toBe(1);
    expect(latest[0].message).toBe('B');
  });

  it('should clear all toasts', () => {
    service.show('A', 'info', 0);
    service.show('B', 'info', 0);
    service.clear();

    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));
    expect(latest.length).toBe(0);
  });

  describe('showUndo', () => {
    function latestToasts(): Toast[] {
      let latest: Toast[] = [];
      service.toasts$.subscribe(t => (latest = t)).unsubscribe();
      return latest;
    }

    it('adds an info toast with an English "Undo" action', () => {
      service.showUndo('File replaced', () => true, 0);
      const [toast] = latestToasts();
      expect(toast.message).toBe('File replaced');
      expect(toast.type).toBe('info');
      expect(toast.action?.label).toBe('Undo');
    });

    it('runs the undo handler and adds nothing else when the undo succeeded', () => {
      const handler = vi.fn().mockReturnValue(true);
      service.showUndo('File replaced', handler, 0);

      latestToasts()[0].action?.handler();

      expect(handler).toHaveBeenCalledTimes(1);
      expect(latestToasts().length).toBe(1);
    });

    it('explains why when the action can no longer be undone', () => {
      service.showUndo('File replaced', () => false, 0);

      latestToasts()[0].action?.handler();

      const toasts = latestToasts();
      expect(toasts.length).toBe(2);
      expect(toasts[1].type).toBe('info');
      expect(toasts[1].message).toBe("Can't undo — other changes were made since.");
    });
  });

  it('should auto-remove toast after duration', () => {
    vi.useFakeTimers();
    try {
      service.show('Temp', 'info', 50); // 50ms duration
      let latest: Toast[] = [];
      service.toasts$.subscribe(t => (latest = t));

      expect(latest.length).toBe(1);

      vi.advanceTimersByTime(100);
      expect(latest.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  describe('action toasts and pause/resume', () => {
    function latestToasts(): Toast[] {
      let latest: Toast[] = [];
      service.toasts$.subscribe(t => (latest = t)).unsubscribe();
      return latest;
    }

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 1));
    });

    afterEach(() => vi.useRealTimers());

    it('keeps an undo toast for at least 10 s by default', () => {
      service.showUndo('File replaced', () => true);

      expect(latestToasts()[0].duration).toBe(MIN_ACTION_TOAST_MS);
      vi.advanceTimersByTime(MIN_ACTION_TOAST_MS - 1);
      expect(latestToasts().length).toBe(1);
      vi.advanceTimersByTime(1);
      expect(latestToasts().length).toBe(0);
    });

    it('extends a too-short duration when the toast has an action', () => {
      service.show('Saved', 'info', 2000, { label: 'Undo', handler: () => undefined });

      expect(latestToasts()[0].duration).toBe(MIN_ACTION_TOAST_MS);
    });

    it('keeps a sticky (duration 0) action toast sticky', () => {
      service.show('Saved', 'info', 0, { label: 'Undo', handler: () => undefined });

      vi.advanceTimersByTime(60000);
      expect(latestToasts().length).toBe(1);
    });

    it('does not auto-dismiss while paused and resumes with the remaining time', () => {
      service.show('Temp', 'info', 1000);
      const [toast] = latestToasts();

      vi.advanceTimersByTime(400);
      service.pause(toast.id);
      vi.advanceTimersByTime(5000);
      expect(latestToasts().length).toBe(1);

      service.resume(toast.id);
      vi.advanceTimersByTime(599);
      expect(latestToasts().length).toBe(1);
      vi.advanceTimersByTime(1);
      expect(latestToasts().length).toBe(0);
    });

    it('ignores pause/resume for unknown or already removed toasts', () => {
      service.show('Temp', 'info', 1000);
      const [toast] = latestToasts();
      service.remove(toast.id);

      expect(() => {
        service.pause(toast.id);
        service.resume(toast.id);
        service.pause(999);
      }).not.toThrow();
      vi.advanceTimersByTime(2000);
      expect(latestToasts().length).toBe(0);
    });

    it('stops pending timers on clear()', () => {
      service.show('A', 'info', 1000);
      service.clear();
      service.show('B', 'info', 0);

      vi.advanceTimersByTime(2000);
      expect(latestToasts().map(t => t.message)).toEqual(['B']);
    });
  });
});
