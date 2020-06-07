import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSaleComponent } from './token-sale.component';

describe('TokenSaleComponent', () => {
  let component: TokenSaleComponent;
  let fixture: ComponentFixture<TokenSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
