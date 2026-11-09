import { FirstInOrder } from './first-in-order';

describe('FirstInOrder', () => {
  let ran: string[];
  const action = (key: string) => () => ran.push(key);

  beforeEach(() => (ran = []));

  it('waits for an earlier job that is still running', () => {
    const picker = new FirstInOrder(['a', 'b']);

    picker.succeeded('b', action('b'));
    expect(ran).toEqual([]);

    picker.succeeded('a', action('a'));
    expect(ran).toEqual(['a']);
  });

  it('runs the first job right away when it finishes first', () => {
    const picker = new FirstInOrder(['a', 'b']);

    picker.succeeded('a', action('a'));
    picker.succeeded('b', action('b'));

    expect(ran).toEqual(['a']);
  });

  it('falls back to the next job when an earlier one fails', () => {
    const picker = new FirstInOrder(['a', 'b', 'c']);

    picker.succeeded('c', action('c'));
    picker.succeeded('b', action('b'));
    picker.failed('a');

    expect(ran).toEqual(['b']);
  });

  it('runs nothing when every job fails', () => {
    const picker = new FirstInOrder(['a', 'b']);

    picker.failed('b');
    picker.failed('a');

    expect(ran).toEqual([]);
  });
});
