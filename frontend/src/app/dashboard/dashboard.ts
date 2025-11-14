import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  stats = {
    totalLOIs: 0,
    totalPOs: 0,
    totalStock: 0,
    totalDispatches: 0,
    pendingLOIs: 0,
    pendingPOs: 0
  };

  recentLOIs: any[] = [];
  recentPOs: any[] = [];
  loading = true;

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load LOIs
    this.http.get<any[]>(`${this.baseUrl}/loi`).subscribe({
      next: (lois) => {
        this.stats.totalLOIs = lois.length;
        this.stats.pendingLOIs = lois.filter(l => l.status === 'Pending').length;
        this.recentLOIs = lois.slice(0, 5);
      },
      error: (err) => console.error('Error loading LOIs:', err)
    });

    // Load POs
    this.http.get<any[]>(`${this.baseUrl}/po`).subscribe({
      next: (pos) => {
        this.stats.totalPOs = pos.length;
        this.stats.pendingPOs = pos.filter(p => p.status === 'Pending').length;
        this.recentPOs = pos.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading POs:', err);
        this.loading = false;
      }
    });

    // Load Stock
    this.http.get<any[]>(`${this.baseUrl}/stock`).subscribe({
      next: (stock) => {
        this.stats.totalStock = stock.length;
      },
      error: (err) => console.error('Error loading stock:', err)
    });

    // Load Dispatches
    this.http.get<any[]>(`${this.baseUrl}/dispatch`).subscribe({
      next: (dispatches) => {
        this.stats.totalDispatches = dispatches.length;
      },
      error: (err) => console.error('Error loading dispatches:', err)
    });
  }
}
