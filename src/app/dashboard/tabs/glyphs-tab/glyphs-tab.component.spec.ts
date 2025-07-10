import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlyphsTabComponent } from './glyphs-tab.component';

describe('GlyphsTabComponent', () => {
  let component: GlyphsTabComponent;
  let fixture: ComponentFixture<GlyphsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlyphsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlyphsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
