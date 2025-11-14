import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loi } from './loi';

describe('Loi', () => {
  let component: Loi;
  let fixture: ComponentFixture<Loi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
