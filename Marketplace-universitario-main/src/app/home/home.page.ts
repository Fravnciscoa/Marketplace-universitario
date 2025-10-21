import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface Product {
  id: string;
  titulo: string;
  precio: number;
  img: string;
  categoria: string;
  campus: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnInit {
  productos: Product[] = [
    {
      id: '1',
      titulo: 'Libro A',
      precio: 12000,
      img: 'assets/book-a.jpg',
      categoria: 'Libros',
      campus: 'Casa Central',
    },
    {
      id: '2',
      titulo: 'Auriculares',
      precio: 35000,
      img: 'assets/headphones.jpg',
      categoria: 'Electrónica',
      campus: 'Curauma',
    },
    {
      id: '3',
      titulo: 'Pelota',
      precio: 8000,
      img: 'assets/ball.jpg',
      categoria: 'Deportes',
      campus: 'Isabel Brown Cases',
    },
  ];

  // filtros
  selectedCats: Record<string, boolean> = {};
  selectedCampus: Record<string, boolean> = {};
  minPrice = 0;
  maxPrice = 500000;
  searchTerm = '';

  constructor() {}

  ngOnInit(): void {}

  // helpers para template
  cats() {
    return this.selectedCats;
  }
  campus() {
    return this.selectedCampus;
  }
  minPrecio() {
    return this.minPrice;
  }
  maxPrecio() {
    return this.maxPrice;
  }

  toggleCat(name: string, checked: boolean) {
    this.selectedCats[name] = checked;
  }

  toggleCampus(name: string, checked: boolean) {
    this.selectedCampus[name] = checked;
  }

  onPrecioRange(ev: any) {
    const v = ev?.detail?.value ?? ev?.detail ?? ev;
    if (v && typeof v === 'object') {
      this.minPrice = v.lower ?? v[0] ?? this.minPrice;
      this.maxPrice = v.upper ?? v[1] ?? this.maxPrice;
    }
  }

  onSearch(ev: any) {
    this.searchTerm = ev?.detail?.value ?? '';
  }

  visibles() {
    return this.productos.filter((p) => {
      if (
        this.searchTerm &&
        !p.titulo.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
        return false;

      const catsSelected = Object.keys(this.selectedCats).filter(
        (k) => this.selectedCats[k]
      );
      if (catsSelected.length && !catsSelected.includes(p.categoria)) return false;

      const campusSelected = Object.keys(this.selectedCampus).filter(
        (k) => this.selectedCampus[k]
      );
      if (campusSelected.length && !campusSelected.includes(p.campus)) return false;

      if (p.precio < this.minPrice || p.precio > this.maxPrice) return false;

      return true;
    });
  }

  trackById(_: number, item: Product) {
    return item.id;
  }
}
