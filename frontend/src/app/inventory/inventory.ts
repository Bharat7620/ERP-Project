import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.css']
})
export class Inventory implements OnInit {

  stockData: any[] = [];
  filteredStock: any[] = [];

  locations: string[] = [];
  materials: string[] = [];

  selectedLocation: string = '';
  selectedMaterial: string = '';
  loading = false;
  errorMessage = '';

  private apiUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAllStock();
  }

  // Fetch all stock
  fetchAllStock() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.stockData = res;
        this.filteredStock = res;
        this.populateFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch stock data.';
        this.loading = false;
      }
    });
  }

  // Dynamically populate dropdown filters
  populateFilters() {
    this.locations = [...new Set(this.stockData.map(item => item.location))];
    this.materials = [...new Set(this.stockData.map(item => item.material))];
  }

  // Apply selected filters
  applyFilters() {
    this.filteredStock = this.stockData.filter(item =>
      (this.selectedLocation ? item.location === this.selectedLocation : true) &&
      (this.selectedMaterial ? item.material === this.selectedMaterial : true)
    );
  }

  // Reset filters
  resetFilters() {
    this.selectedLocation = '';
    this.selectedMaterial = '';
    this.filteredStock = [...this.stockData];
  }

  // Format date display
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { hour12: true });
  }
}
