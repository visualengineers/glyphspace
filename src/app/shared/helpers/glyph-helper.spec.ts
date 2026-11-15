import * as THREE from 'three';
import { clusterGlyphs, getGlyphFromObject } from './glyph-helper';
import { GlyphCacheObject } from '../../glyph/glyph-cache-object';
import { GlyphObject } from '../../glyph/glyph-object';

function node(id: string, x: number, y: number): GlyphCacheObject {
  return new GlyphCacheObject(id, { x, y });
}

function summary(nodes: GlyphCacheObject[]): Record<string, string> {
  return Object.fromEntries(
    nodes.map(n => [n.id, n.isClusterRepresentative ? 'rep' : n.isClustered ? 'member' : 'alone'])
  );
}

describe('clusterGlyphs', () => {
  it('groups items within the radius and picks the one nearest the mean', () => {
    const nodes = [node('a', 0, 0), node('b', 2, 0), node('c', 4, 0), node('far', 100, 100)];

    clusterGlyphs(nodes, 5);

    expect(summary(nodes)).toEqual({ a: 'member', b: 'rep', c: 'member', far: 'alone' });
  });

  it('starts afresh on every call, so a new layout is clustered from scratch', () => {
    const nodes = [node('a', 0, 0), node('b', 1, 0)];
    clusterGlyphs(nodes, 5);

    nodes[1].position = { x: 100, y: 0 }; // e.g. another projection
    clusterGlyphs(nodes, 5);

    expect(summary(nodes)).toEqual({ a: 'alone', b: 'alone' });
  });

  it('does not take members of an earlier cluster, so every cluster keeps its representative', () => {
    // a's cluster is {a, b, c} with b as representative. d reaches b and c,
    // which belong to it already; before, d's cluster took them over and left
    // a hidden without a representative.
    const nodes = [node('a', 0, 0), node('b', 4, 0), node('c', 8, 0), node('d', 12, 0)];

    clusterGlyphs(nodes, 8);

    expect(summary(nodes)).toEqual({ a: 'member', b: 'rep', c: 'member', d: 'alone' });
  });

  it('clusters items at the same position', () => {
    const nodes = [node('a', 5, 5), node('b', 5, 5), node('c', 5, 5)];

    clusterGlyphs(nodes, 1);

    expect(nodes.filter(n => n.isClusterRepresentative).length).toBe(1);
    expect(nodes.every(n => n.isClustered)).toBe(true);
  });
});

describe('getGlyphFromObject', () => {
  it('finds the item of a mesh, of a mesh in a wrapper group, and nothing for other objects', () => {
    const glyph = new GlyphObject('7');
    const mesh = new THREE.Object3D();
    mesh.userData['item'] = new WeakRef(glyph);
    const wrapper = new THREE.Group();
    wrapper.userData['item'] = new WeakRef(glyph);
    const wrapped = new THREE.Object3D();
    wrapper.add(wrapped);

    expect(getGlyphFromObject(mesh)).toBe(glyph);
    expect(getGlyphFromObject(wrapped)).toBe(glyph);
    expect(getGlyphFromObject(new THREE.Object3D())).toBeNull();
  });
});
