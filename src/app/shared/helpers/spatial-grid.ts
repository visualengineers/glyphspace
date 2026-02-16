/**
 * Spatial grid for efficient O(1) lookups of items by position.
 * Used for viewport culling and hit testing with large datasets.
 */
export class SpatialGrid<T> {
  private grid = new Map<string, Set<T>>();
  private itemToCells = new Map<T, string[]>();
  private cellSize: number;
  private bounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;

  constructor(cellSize = 50) {
    this.cellSize = cellSize;
  }

  /**
   * Get the cell key for a given position
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Clear the grid completely
   */
  clear(): void {
    this.grid.clear();
    this.itemToCells.clear();
    this.bounds = null;
  }

  /**
   * Insert an item at a given position
   */
  insert(item: T, x: number, y: number, radius = 0): void {
    // Remove from previous cells if already inserted
    this.remove(item);

    const cells: string[] = [];

    // Insert into all cells that the item's bounding box overlaps
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        cells.push(key);

        let cell = this.grid.get(key);
        if (!cell) {
          cell = new Set();
          this.grid.set(key, cell);
        }
        cell.add(item);
      }
    }

    this.itemToCells.set(item, cells);

    // Update bounds
    if (!this.bounds) {
      this.bounds = { minX: x, maxX: x, minY: y, maxY: y };
    } else {
      if (x < this.bounds.minX) this.bounds.minX = x;
      if (x > this.bounds.maxX) this.bounds.maxX = x;
      if (y < this.bounds.minY) this.bounds.minY = y;
      if (y > this.bounds.maxY) this.bounds.maxY = y;
    }
  }

  /**
   * Remove an item from the grid
   */
  remove(item: T): void {
    const cells = this.itemToCells.get(item);
    if (cells) {
      for (const key of cells) {
        const cell = this.grid.get(key);
        if (cell) {
          cell.delete(item);
          if (cell.size === 0) {
            this.grid.delete(key);
          }
        }
      }
      this.itemToCells.delete(item);
    }
  }

  /**
   * Update an item's position (remove and re-insert)
   */
  update(item: T, x: number, y: number, radius = 0): void {
    this.insert(item, x, y, radius);
  }

  /**
   * Query all items within a rectangular region
   */
  queryRect(left: number, right: number, bottom: number, top: number): Set<T> {
    const result = new Set<T>();

    const minCellX = Math.floor(left / this.cellSize);
    const maxCellX = Math.floor(right / this.cellSize);
    const minCellY = Math.floor(bottom / this.cellSize);
    const maxCellY = Math.floor(top / this.cellSize);

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const item of cell) {
            result.add(item);
          }
        }
      }
    }

    return result;
  }

  /**
   * Query all items near a point (within a given radius)
   */
  queryPoint(x: number, y: number, radius = 0): Set<T> {
    return this.queryRect(x - radius, x + radius, y - radius, y + radius);
  }

  /**
   * Get the number of items in the grid
   */
  get size(): number {
    return this.itemToCells.size;
  }

  /**
   * Get all items in the grid
   */
  getAllItems(): T[] {
    return Array.from(this.itemToCells.keys());
  }

  /**
   * Get the current bounds of all items
   */
  getBounds(): { minX: number; maxX: number; minY: number; maxY: number } | null {
    return this.bounds;
  }

  /**
   * Set the cell size (will require re-insertion of all items)
   */
  setCellSize(size: number): void {
    this.cellSize = size;
  }

  /**
   * Get current cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }
}
