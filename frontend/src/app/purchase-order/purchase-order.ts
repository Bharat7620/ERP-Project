import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './purchase-order.html',
  styleUrls: ['./purchase-order.css']
})
export class PurchaseOrder implements OnInit {
  activeTab: 'create' | 'list' = 'create';

  po = {
    orderNo: '',
    party: '',
    date: '',
    location: '',         // ✅ required by backend
    elements: [
      { material: '', grade: '', section: '', steelWidth: 0, length: 0, pcs: 0, quantity: 0, type: '', receivedQuantity: 0, remarks: '' }
    ]
  };

  purchaseOrders: any[] = [];
  message = '';
  loading = false;
  errorMessage = '';

  // PO Modal
  showPOModal = false;
  selectedPO: any = null;

  // GRN Modal
  showGRNModal = false;
  selectedPOForGRN: any = null;
  grnNumber = '';
  vehicleNo = '';
  grnDate: string | null = null;

  private poApiUrl = 'http://localhost:8080/api/po';
  private grnApiUrl = 'http://localhost:8080/api/grn';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllPOs();
  }

  switchTab(tab: 'create' | 'list') {
    this.activeTab = tab;
    if (tab === 'list') this.getAllPOs();
  }

  addElement() {
    this.po.elements.push({ material: '', grade: '', section: '', steelWidth: 0, length: 0, pcs: 0, quantity: 0, type: '', receivedQuantity: 0, remarks: '' });
  }

  removeElement(index: number) {
    this.po.elements.splice(index, 1);
  }

  createPO() {
    this.http.post(this.poApiUrl, this.po).subscribe({
      next: () => {
        this.message = 'Purchase Order created successfully!';
        this.resetForm();
        this.getAllPOs();
        this.switchTab('list');
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to create Purchase Order!';
      }
    });
  }

  resetForm() {
    this.po = {
      orderNo: '',
      party: '',
      date: '',
      location: 'Butibori', // default for convenience
      elements: [{ material: '', grade: '', section: '', steelWidth: 0, length: 0, pcs: 0, quantity: 0, type: '', receivedQuantity: 0, remarks: '' }]
    };
  }

  getAllPOs() {
    this.loading = true;
    this.http.get<any[]>(this.poApiUrl).subscribe({
      next: res => { this.purchaseOrders = res; this.loading = false; },
      error: err => { console.error(err); this.errorMessage = 'Failed to fetch Purchase Orders!'; this.loading = false; }
    });
  }

  // PO Details Modal
  openPOModal(po: any) {
    this.http.get<any>(`${this.poApiUrl}/${po.id}`).subscribe({
      next: res => { this.selectedPO = res; this.showPOModal = true; },
      error: err => console.error(err)
    });
  }

  closePOModal() {
    this.showPOModal = false;
    this.selectedPO = null;
  }

  // GRN Modal
  openGRNModal(po: any) {
    this.http.get<any>(`${this.poApiUrl}/${po.id}`).subscribe({
      next: res => {
        // Deep copy PO to avoid modifying original
        this.selectedPOForGRN = JSON.parse(JSON.stringify(res));

        // Store previous received quantities separately
        this.selectedPOForGRN.elements.forEach((e: any) => {
          e.receivedQuantityFromServer = e.receivedQuantity || 0; // already received
          e.receivedQuantity = 0; // new GRN input
          e.remarks = '';
        });

        this.grnNumber = `GRN-${Date.now()}`;
        this.vehicleNo = '';
        this.grnDate = new Date().toISOString().slice(0, 10);
        this.showGRNModal = true;
      },
      error: err => console.error(err)
    });
  }

  closeGRNModal() {
    this.showGRNModal = false;
    this.selectedPOForGRN = null;
    this.grnNumber = '';
    this.vehicleNo = '';
    this.grnDate = null;
  }

  qtyLeftFor(e: any) {
    const total = Number(e.quantity || 0);
    const already = Number(e.receivedQuantityFromServer || 0);
    const newRec = Number(e.receivedQuantity || 0);
    return Math.max(0, total - already - newRec);
  }

  submitGRN() {
    if (!this.selectedPOForGRN) return;

    const poId = this.selectedPOForGRN.id;

    const items = this.selectedPOForGRN.elements
      .filter((e: any) => Number(e.receivedQuantity) > 0)
      .map((e: any) => ({
        poElementId: e.id,
        receivedQty: Number(e.receivedQuantity),
        remarks: e.remarks || ''
      }));

    const grnBody = {
      grnNumber: this.grnNumber,
      vehicleNo: this.vehicleNo,
      grnDate: this.grnDate,
      // location is set on backend from PO; no need to pass from FE
      items
    };

    this.http.post<any>(`${this.grnApiUrl}/po/${poId}`, grnBody).subscribe({
      next: () => {
        alert('GRN created successfully!');
        this.closeGRNModal();
        this.getAllPOs();
      },
      error: err => {
        console.error(err);
        alert(err?.error?.message || 'Failed to create GRN.');
      }
    });
  }
}
