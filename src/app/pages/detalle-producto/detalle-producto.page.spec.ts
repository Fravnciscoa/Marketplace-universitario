import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleProductoPage } from './detalle-producto.page';

describe('DetalleProductoPage', () => {
  let component: DetalleProductoPage;
  let fixture: ComponentFixture<DetalleProductoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProductoPage], // Importa el componente standalone
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(10000)).toBe('$10.000');
    expect(component.formatPrice(5000)).toBe('$5.000');
  });

  it('should have product data', () => {
    expect(component.product).toBeTruthy();
    expect(component.product.name).toBe('Calculadora Científica usada');
    expect(component.product.price).toBe(10000);
  });

  it('should have related products', () => {
    expect(component.relatedProducts.length).toBeGreaterThan(0);
    expect(component.relatedProducts[0].name).toContain('MATEMÁTICAS');
  });
});
