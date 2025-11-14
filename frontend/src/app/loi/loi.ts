import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loi.html',
  styleUrls: ['./loi.css']
})
export class LOIComponent implements OnInit {

  activeTab: 'create' | 'list' = 'create';

  loi = {
    loiNumber: '',
    customerName: '',
    location: '',
    loiDate: '',
    status: 'Pending',
    items: [
      { material: '', grade: '', section: '', length: 0, quantity: 0, unit: 'TON' }
    ]
  };

  lois: any[] = [];
  loading = false;
  errorMessage = '';
  message = '';

  // details modal
  showLOIModal = false;
  selectedLOI: any = null;

  private loiApiUrl = 'http://localhost:8080/api/loi';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllLOIs();
  }

  switchTab(tab: 'create' | 'list') {
    this.activeTab = tab;
    if (tab === 'list') this.getAllLOIs();
  }

  // --- Create form helpers ---
  addItem() {
    this.loi.items.push({ material: '', grade: '', section: '', length: 0, quantity: 0, unit: 'TON' });
  }

  removeItem(ix: number) {
    this.loi.items.splice(ix, 1);
  }

  resetForm() {
    this.loi = {
      loiNumber: `LOI-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      customerName: '',
      location: 'Butibori',
      loiDate: new Date().toISOString().slice(0,10),
      status: 'Pending',
      items: [{ material: '', grade: '', section: '', length: 0, quantity: 0, unit: 'TON' }]
    };
    this.message = '';
  }

  createLOI() {
    // basic cleanup
    const payload = JSON.parse(JSON.stringify(this.loi));
    payload.items = payload.items.filter((it: any) => it.material && Number(it.quantity) > 0);

    if (!payload.items.length) {
      this.message = 'Please add at least one valid item.';
      return;
    }

    this.http.post<any>(this.loiApiUrl, payload).subscribe({
      next: res => {
        this.message = 'LOI created successfully!';
        this.resetForm();
        this.switchTab('list');
        this.getAllLOIs();
      },
      error: err => {
        console.error(err);
        this.message = err?.error?.message || 'Failed to create LOI';
      }
    });
  }

  // --- List / retrieve ---
  getAllLOIs() {
    this.loading = true;
    this.http.get<any[]>(this.loiApiUrl).subscribe({
      next: res => {console.log(res); this.lois = res || []; this.loading = false; },
      error: err => { console.error(err); this.errorMessage = 'Failed to fetch LOIs'; this.loading = false; }
    });
  }

  // --- Details modal ---
  openLOIModal(row: any) {
    this.http.get<any>(`${this.loiApiUrl}/${row.id}`).subscribe({
      next: res => { this.selectedLOI = res; this.showLOIModal = true; },
      error: err => console.error(err)
    });
  }

  closeLOIModal() {
    this.showLOIModal = false;
    this.selectedLOI = null;
  }

  // --- Status update quick action ---
  updateStatus(row: any, status: 'Pending' | 'Planned' | 'Completed') {
    this.http.put<any>(`${this.loiApiUrl}/${row.id}/status?status=${encodeURIComponent(status)}`, {}).subscribe({
      next: () => this.getAllLOIs(),
      error: err => console.error(err)
    });
  }

  // util
  badgeClass(status: string) {
    return {
      'badge': true,
      'badge-pending': status === 'Pending',
      'badge-planned': status === 'Planned',
      'badge-completed': status === 'Completed'
    };
  }
}
