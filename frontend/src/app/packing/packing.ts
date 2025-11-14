import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-packing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './packing.html',
  styleUrls: ['./packing.css']
})
export class PackingComponent implements OnInit {
  showPackingForm = false;
  isEditMode = false;
  packingItems: any[] = [];
  completedProductions: any[] = [];
  selectedProduction: any = null;
  loading = false;
  message = '';

  packing = {
    id: null as number | null,
    srNo: null as number | null,
    poNo: '',
    grade: '',
    colourCode: '',
    gradeSection: '',
    sectionWt: '',
    length: null as number | null,
    noOfPcs: null as number | null,
    qtyInMt: null as number | null,
    heatNo: '',
    challanQty: null as number | null,
    challanNo: '',
    customer: '',
    docNo: '',
    packingDate: new Date().toISOString().slice(0, 10),
    lorryNo: '',
    status: 'PACKED'
  };

  private readonly apiUrl = 'http://localhost:8080/api/packing';
  private readonly productionApiUrl = 'http://localhost:8080/api/rolling-plan';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadPackingItems();
    this.loadCompletedProductions();
  }

  // ✅ Load all existing packing records
  loadPackingItems() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.packingItems = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading packing items:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Load all completed productions
  loadCompletedProductions() {
    this.http.get<any[]>(`${this.productionApiUrl}/completed`).subscribe({
      next: (data) => {
        this.completedProductions = data;
      },
      error: (err) => {
        console.error('Error loading completed productions:', err);
      }
    });
  }

  getCustomerName(production: any): string {
    return production?.customer || production?.customerName || 'Customer';
  }

  // ✅ Open packing form pre-filled from production
  openPackingFormFromProduction(production: any) {
    this.selectedProduction = production;
    this.showPackingForm = true;
    this.isEditMode = false;

    if (production.items && production.items.length > 0) {
      const firstItem = production.items[0];
      this.packing = {
        id: null,
        srNo: null,
        poNo: '',
        grade: firstItem.grade || '',
        colourCode: '',
        gradeSection: firstItem.section || '',
        sectionWt: '',
        length: firstItem.length || null,
        noOfPcs: firstItem.plannedQty || null,
        qtyInMt: firstItem.plannedQty || null,
        heatNo: 'HEAT-' + Date.now(),
        challanQty: null,
        challanNo: '',
        customer: production?.customer || production?.customerName || '',
        docNo: 'DOC-' + Date.now(),
        packingDate: new Date().toISOString().slice(0, 10),
        lorryNo: '',
        status: 'PACKED'
      };
    }
  }

  // ✅ Close form
  closePackingForm() {
    this.showPackingForm = false;
    this.resetForm();
  }

  // ✅ Save Packing
  savePacking() {
    if (!this.selectedProduction) {
      this.message = 'No production selected!';
      alert('❌ ' + this.message);
      return;
    }

    const url = `${this.apiUrl}/from-production/${this.selectedProduction.id}`;
    console.log('Sending packing data:', this.packing);

    // 🚀 No custom headers needed — Angular sets JSON automatically
    this.http.post<any>(url, this.packing).subscribe({
      next: (res) => {
        this.message = res?.message || 'Packing created successfully!';
        alert(`✅ ${this.message}\n\nPacking ID: ${res?.packingId || ''}`);
        this.loadPackingItems();
        this.loadCompletedProductions();
        this.closePackingForm();
      },
      error: (err) => {
        console.error('Packing error:', err);
        this.message = err?.error?.message || 'Failed to create packing.';
        alert('❌ ' + this.message);
      }
    });
  }

  // ✅ Reset form
  resetForm() {
    this.packing = {
      id: null,
      srNo: null,
      poNo: '',
      grade: '',
      colourCode: '',
      gradeSection: '',
      sectionWt: '',
      length: null,
      noOfPcs: null,
      qtyInMt: null,
      heatNo: '',
      challanQty: null,
      challanNo: '',
      customer: '',
      docNo: '',
      packingDate: new Date().toISOString().slice(0, 10),
      lorryNo: '',
      status: 'PACKED'
    };
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PACKED':
        return 'bg-success';
      case 'DISPATCHED':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  goToDispatch(packing: any) {
    globalThis.location.href = '/dispatch';
  }
}
