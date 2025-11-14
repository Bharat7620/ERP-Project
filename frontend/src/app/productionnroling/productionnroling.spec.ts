import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Productionnroling } from './productionnroling';

describe('Productionnroling', () => {
  let component: Productionnroling;
  let fixture: ComponentFixture<Productionnroling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Productionnroling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Productionnroling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
