import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dispatchandpacking } from './dispatchandpacking';

describe('Dispatchandpacking', () => {
  let component: Dispatchandpacking;
  let fixture: ComponentFixture<Dispatchandpacking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dispatchandpacking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dispatchandpacking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
