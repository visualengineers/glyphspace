import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should start with no toasts', (done: DoneFn) => {
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(0);
      done();
    });
  });

  it('should add a toast via show()', () => {
    service.show('Hello', 'info', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);
    expect(latest[0].message).toBe('Hello');
    expect(latest[0].type).toBe('info');
  });

  it('should add success toast', () => {
    service.success('Done', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);
    expect(latest[0].type).toBe('success');
  });

  it('should add error toast', () => {
    service.error('Failed', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);
    expect(latest[0].type).toBe('error');
  });

  it('should add warning toast', () => {
    service.warning('Careful', 0);
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest[0].type).toBe('warning');
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

  it('should auto-remove toast after duration', (done: DoneFn) => {
    service.show('Temp', 'info', 50); // 50ms duration
    let latest: Toast[] = [];
    service.toasts$.subscribe(t => (latest = t));

    expect(latest.length).toBe(1);

    setTimeout(() => {
      expect(latest.length).toBe(0);
      done();
    }, 100);
  });
});
