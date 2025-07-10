import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagiclensComponent } from './magiclens.component';

describe('MagiclensComponent', () => {
  let component: MagiclensComponent;
  let fixture: ComponentFixture<MagiclensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagiclensComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagiclensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
