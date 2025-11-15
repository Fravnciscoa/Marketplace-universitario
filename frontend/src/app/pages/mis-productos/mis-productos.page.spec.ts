import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisProductosPage } from './mis-productos.page';

describe('MisProductosPage', () => {
  let component: MisProductosPage;
  let fixture: ComponentFixture<MisProductosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisProductosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
