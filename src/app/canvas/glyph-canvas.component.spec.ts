import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlyphCanvasComponent } from './glyph-canvas.component';

describe('CanvasComponent', () => {
  let component: GlyphCanvasComponent;
  let fixture: ComponentFixture<GlyphCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlyphCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlyphCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
