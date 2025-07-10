import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterTabComponent } from './filter-tab.component';

describe('FilterTabComponent', () => {
  let component: FilterTabComponent;
  let fixture: ComponentFixture<FilterTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
