import { GlyphObject } from "../../glyph/glyph-object";
import { FilterMode } from "../enum/filter-mode";

export abstract class ItemFilter {
    private _filterMode: FilterMode = FilterMode.And;

    abstract inFilter(item: GlyphObject): boolean;

    abstract clear(): void;

    abstract info(): string;

    abstract empty(): boolean;

    set filterMode(mode: FilterMode) {
        this._filterMode = mode;
    }

    get filterMode(): FilterMode {
        return this._filterMode;
    }
}