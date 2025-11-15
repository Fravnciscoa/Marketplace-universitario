import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicarProductoPage } from './publicar-producto.page';

describe('PublicarProductoPage', () => {
  let component: PublicarProductoPage;
  let fixture: ComponentFixture<PublicarProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicarProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
