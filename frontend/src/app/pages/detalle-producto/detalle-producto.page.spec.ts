import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleProductoPage } from './detalle-producto.page';

describe('DetalleProductoPage', () => {
  let component: DetalleProductoPage;
  let fixture: ComponentFixture<DetalleProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
