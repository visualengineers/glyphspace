import { TestBed } from '@angular/core/testing';
import { SettingsControlPanelComponent } from './settingscontrols.component';
import { ConfigService } from '../../services/config.service';
import { FilterService } from '../../services/filter.service';
import { ProjectionService } from '../../services/projection.service';
import { TRANSITION_SPEED, transitionStep } from '../../shared/constants/canvas-constants';

describe('SettingsControlPanelComponent transition speed', () => {
  const create = () =>
    TestBed.runInInjectionContext(
      () =>
        new SettingsControlPanelComponent(
          TestBed.inject(ConfigService),
          TestBed.inject(FilterService),
          {} as ProjectionService
        )
    );
  const emitted = (panel: SettingsControlPanelComponent) => {
    const levels: number[] = [];
    panel.changeAnimationSpeed.subscribe(level => levels.push(level));
    return levels;
  };

  it('starts at the default level', () => {
    expect(create().animationSpeed).toBe(TRANSITION_SPEED.default);
  });

  // The overlay showed 10 on start, but 10 after going down and up again moved ten times slower.
  it('reports levels, so 10 after going down and up is the 10 a canvas starts with', () => {
    const panel = create();
    const levels = emitted(panel);

    panel.decreaseSpeed();
    panel.decreaseSpeed();
    panel.increaseSpeed();
    panel.increaseSpeed();

    expect(levels).toEqual([9, 8, 9, 10]);
    expect(transitionStep(levels[levels.length - 1])).toBe(transitionStep(TRANSITION_SPEED.default));
  });

  it('stays within the levels', () => {
    const panel = create();
    const levels = emitted(panel);

    panel.increaseSpeed();
    for (let i = 0; i < 20; i++) panel.decreaseSpeed();

    expect(panel.animationSpeed).toBe(TRANSITION_SPEED.min);
    expect(levels[0]).toBe(TRANSITION_SPEED.max - 1);
    expect(levels[levels.length - 1]).toBe(TRANSITION_SPEED.min);
  });
});

describe('transitionStep', () => {
  it('moves 10 % of the way per frame at the fastest level and 1 % at the slowest', () => {
    expect(transitionStep(TRANSITION_SPEED.max)).toBeCloseTo(0.1);
    expect(transitionStep(TRANSITION_SPEED.min)).toBeCloseTo(0.01);
  });
});
