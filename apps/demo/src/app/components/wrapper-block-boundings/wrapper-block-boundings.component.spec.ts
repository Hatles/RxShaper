import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapperBlockBoundingsComponent } from './wrapper-block-boundings.component';

describe('WrapperBlockBoundingsComponent', () => {
  let component: WrapperBlockBoundingsComponent;
  let fixture: ComponentFixture<WrapperBlockBoundingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrapperBlockBoundingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperBlockBoundingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
