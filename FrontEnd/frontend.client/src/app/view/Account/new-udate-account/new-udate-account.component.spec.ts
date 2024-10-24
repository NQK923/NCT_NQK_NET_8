import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUdateAccountComponent } from './new-udate-account.component';

describe('NewUdateAccountComponent', () => {
  let component: NewUdateAccountComponent;
  let fixture: ComponentFixture<NewUdateAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewUdateAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewUdateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
