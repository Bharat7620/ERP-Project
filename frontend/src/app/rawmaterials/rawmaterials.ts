import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rawmaterials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rawmaterials.html',
  styleUrls: ['./rawmaterials.css']
})
export class Rawmaterials implements OnInit {
  grns: any[] = [];
  loading = false;
  errorMessage = '';

  private grnApiUrl = 'http://localhost:8080/api/grn';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllGRNs();
  }

  getAllGRNs() {
    this.loading = true;
    this.http.get<any[]>(this.grnApiUrl).subscribe({
      next: res => {
        this.grns = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to fetch GRNs!';
        this.loading = false;
      }
    });
  }
}
