import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reportandanalytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportandanalytics.html',
  styleUrls: ['./reportandanalytics.css']
})
export class Reportandanalytics implements OnInit {
  allStock: any[] = [];
  filteredStock: any[] = [];
  loading = false;
  
  filters = {
    location: '',
    material: ''
  };

  locations: string[] = [];
  materials: string[] = [];

  private apiUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStockData();
  }

  loadStockData() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.allStock = data;
        this.filteredStock = data;
        this.extractFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stock:', err);
        this.loading = false;
      }
    });
  }

  extractFilters() {
    this.locations = [...new Set(this.allStock.map(s => s.location))].filter(Boolean);
    this.materials = [...new Set(this.allStock.map(s => s.material))].filter(Boolean);
  }

  applyFilters() {
    this.filteredStock = this.allStock.filter(stock => {
      const matchLocation = !this.filters.location || stock.location === this.filters.location;
      const matchMaterial = !this.filters.material || stock.material === this.filters.material;
      return matchLocation && matchMaterial;
    });
  }

  resetFilters() {
    this.filters = { location: '', material: '' };
    this.filteredStock = this.allStock;
  }
}
