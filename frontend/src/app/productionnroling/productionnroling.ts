import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productionnroling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productionnroling.html',
  styleUrls: ['./productionnroling.css']
})
export class Productionnroling implements OnInit {
  activeTab: 'create' | 'list' = 'create';

  // --- Data ---
  plan = {
    loiId: null,
    mill: '',
    shift: '',
    items: [] as any[]
  };

  lois: any[] = [];
  plans: any[] = [];
  message = '';
  loading = false;
  errorMessage = '';

  // Modal & selection data
  showStockModal = false;
  selectedItem: any = null;
  eligibleStock: any[] = [];
  selectedStocks: { [loiItemId: number]: any } = {};

  private loiApiUrl = 'http://localhost:8080/api/loi';
  private planApiUrl = 'http://localhost:8080/api/rolling-plan';
  private stockApiUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchLOIs();
    this.fetchPlans();
  }

  switchTab(tab: 'create' | 'list') {
    this.activeTab = tab;
    if (tab === 'list') this.fetchPlans();
  }

  // --- Load LOIs ---
  fetchLOIs() {
    this.http.get<any[]>(this.loiApiUrl).subscribe({
      next: res => this.lois = res.filter(loi => loi.status === 'Pending' || loi.status === 'Planned'),
      error: err => console.error('Failed to load LOIs', err)
    });
  }

  // --- On LOI selection ---
  onSelectLOI(event: any) {
    const id = event.target.value;
    if (!id) return;
    this.http.get<any>(`${this.loiApiUrl}/${id}`).subscribe({
      next: loi => {
        this.plan.loiId = loi.id;
        this.plan.items = loi.items.map((it: any) => ({
          loiItemId: it.id,
          material: it.material,
          grade: it.grade,
          section: it.section,
          length: it.length,
          quantity: it.quantity,
          unit: it.unit,
          selectedStock: null
        }));
      },
      error: err => console.error(err)
    });
  }

  // --- Open eligible stock modal for selected LOI item ---
 openStockModal(item: any) {
  this.selectedItem = item;
  this.showStockModal = true;

  this.http.get<any[]>(`${this.planApiUrl}/eligible-stock/${item.loiItemId}`).subscribe({
    next: res => {
      this.eligibleStock = res;
      console.log('Eligible stock response:', res);
      if (!res.length) {
        this.message = `⚠️ No eligible stock found for ${item.section}`;
      }
    },
    error: err => {
      console.error('Error fetching eligible stock', err);
      this.message = 'Failed to load eligible stock.';
    }
  });
}



  // --- Select a stock entry for one LOI item ---
  selectStockForItem(stock: any) {
    this.selectedStocks[this.selectedItem.loiItemId] = {
      loiItemId: this.selectedItem.loiItemId,
      stockId: stock.id,
      plannedQty: this.selectedItem.quantity
    };
    this.selectedItem.selectedStock = stock;
    this.showStockModal = false;
  }

  closeStockModal() {
    this.showStockModal = false;
  }

  // --- Final combined plan creation ---
  createPlanFromSelections() {
    const selections = Object.values(this.selectedStocks);
    if (!this.plan.loiId || !selections.length) {
      this.message = 'Select LOI and assign stock for at least one item.';
      return;
    }

    const payload = {
      loiId: this.plan.loiId,
      mill: this.plan.mill,
      shift: this.plan.shift,
      selectedStocks: selections
    };

    this.http.post<any>(`${this.planApiUrl}/from-selection`, payload).subscribe({
      next: res => {
        this.message = res.message || 'Rolling Plan created successfully!';
        if (res.details?.length) this.message += ` ${res.details.join(' ')}`;
        this.resetForm();
        this.fetchPlans();
        this.switchTab('list');
      },
      error: err => {
        console.error(err);
        this.message = err?.error?.message || 'Rolling Plan creation failed.';
      }
    });
  }

  resetForm() {
    this.plan = { loiId: null, mill: '', shift: '', items: [] };
    this.selectedStocks = {};
  }

  // --- Fetch all rolling plans ---
  fetchPlans() {
    this.loading = true;
    this.http.get<any[]>(this.planApiUrl).subscribe({
      next: res => { this.plans = res; this.loading = false; },
      error: err => { this.errorMessage = 'Failed to fetch plans'; this.loading = false; }
    });
  }

  badgeClass(status: string) {
    return {
      'badge': true,
      'badge-pending': status === 'Pending',
      'badge-planned': status === 'Planned',
      'badge-completed': status === 'Completed'
    };
  }

  // --- Mark Production as Completed ---
  markAsCompleted(plan: any) {
    if (!confirm(`Mark production ${plan.planNumber} as completed?`)) {
      return;
    }

    // Update plan status to Completed
    const updatedPlan = { ...plan, status: 'Completed' };
    
    this.http.put<any>(`${this.planApiUrl}/${plan.id}`, updatedPlan).subscribe({
      next: () => {
        this.message = 'Production marked as completed! Go to Packing module to create packing entries.';
        this.fetchPlans();
      },
      error: err => {
        console.error(err);
        this.message = err?.error?.message || 'Failed to update production status';
      }
    });
  }
}
