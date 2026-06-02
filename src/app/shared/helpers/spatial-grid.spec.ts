import { SpatialGrid } from './spatial-grid';

describe('SpatialGrid', () => {
  let grid: SpatialGrid<string>;

  beforeEach(() => {
    grid = new SpatialGrid<string>(50);
  });

  it('should start empty', () => {
    expect(grid.size).toBe(0);
    expect(grid.getAllItems()).toEqual([]);
    expect(grid.getBounds()).toBeNull();
  });

  it('should insert and retrieve items', () => {
    grid.insert('a', 10, 20);
    expect(grid.size).toBe(1);
    expect(grid.getAllItems()).toContain('a');
  });

  it('should track bounds after inserts', () => {
    grid.insert('a', 10, 20);
    grid.insert('b', 100, -30);
    const bounds = grid.getBounds();
    expect(bounds).toBeTruthy();
    expect(bounds?.minX).toBe(10);
    expect(bounds?.maxX).toBe(100);
    expect(bounds?.minY).toBe(-30);
    expect(bounds?.maxY).toBe(20);
  });

  it('should query items within a rectangle', () => {
    grid.insert('a', 10, 10);
    grid.insert('b', 200, 200);
    grid.insert('c', 25, 25);

    const result = grid.queryRect(0, 50, 0, 50);
    expect(result.has('a')).toBeTrue();
    expect(result.has('c')).toBeTrue();
    expect(result.has('b')).toBeFalse();
  });

  it('should query items near a point', () => {
    grid.insert('a', 100, 100);
    grid.insert('b', 500, 500);

    const result = grid.queryPoint(100, 100, 60);
    expect(result.has('a')).toBeTrue();
    expect(result.has('b')).toBeFalse();
  });

  it('should handle items with radius spanning multiple cells', () => {
    grid.insert('a', 50, 50, 60); // radius overlaps multiple cells
    // Item should be found in cell (0,0), (0,1), (1,0), (1,1) etc.
    const result = grid.queryRect(-10, 10, -10, 10);
    expect(result.has('a')).toBeTrue();
  });

  it('should remove items', () => {
    grid.insert('a', 10, 10);
    grid.insert('b', 20, 20);
    expect(grid.size).toBe(2);

    grid.remove('a');
    expect(grid.size).toBe(1);
    expect(grid.getAllItems()).not.toContain('a');
    expect(grid.getAllItems()).toContain('b');
  });

  it('should update item position', () => {
    grid.insert('a', 10, 10);
    grid.update('a', 500, 500);

    const nearOld = grid.queryPoint(10, 10, 10);
    expect(nearOld.has('a')).toBeFalse();

    const nearNew = grid.queryPoint(500, 500, 10);
    expect(nearNew.has('a')).toBeTrue();
  });

  it('should clear all items', () => {
    grid.insert('a', 10, 10);
    grid.insert('b', 20, 20);
    grid.clear();

    expect(grid.size).toBe(0);
    expect(grid.getAllItems()).toEqual([]);
    expect(grid.getBounds()).toBeNull();
  });

  it('should allow changing cell size', () => {
    grid.setCellSize(100);
    expect(grid.getCellSize()).toBe(100);
  });

  it('should return empty set for queries with no items', () => {
    const result = grid.queryRect(0, 100, 0, 100);
    expect(result.size).toBe(0);
  });
});
