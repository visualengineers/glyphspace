import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayControlsComponent } from './overlaycontrols.component';

describe('OverlaycontrolsComponent', () => {
  let component: OverlayControlsComponent;
  let fixture: ComponentFixture<OverlayControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
