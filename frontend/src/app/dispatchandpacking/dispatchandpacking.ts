import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dispatchandpacking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dispatchandpacking.html',
  styleUrls: ['./dispatchandpacking.css']
})
export class DispatchandpackingComponent implements OnInit {
  showDispatchForm = false;
  isEditMode = false;
  dispatches: any[] = [];
  packedItems: any[] = [];
  selectedPacking: any = null;
  loading = false;
  message = '';

  dispatch = {
    id: null as number | null,
    dispatchId: `DISP-${Date.now().toString().slice(-6)}`,
    poNo: '',
    customer: '',
    section: '',
    qtyIssued: null as number | null,
    challanNo: '',
    vehicleNo: '',
    fromLocation: '',
    destination: '',
    dispatchDate: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  };


  private apiUrl = 'http://localhost:8080/api/dispatch';
  private packingApiUrl = 'http://localhost:8080/api/packing';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDispatches();
    this.loadPackedItems();
  }

  loadDispatches() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.dispatches = data;
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to load dispatch records.';
      }
    });
  }

  // Load packed items ready for dispatch
  loadPackedItems() {
    this.http.get<any[]>(`${this.packingApiUrl}/packed`).subscribe({
      next: (data) => {
        this.packedItems = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Open dispatch form with auto-filled data from packing
  openDispatchFormFromPacking(packing: any) {
    this.selectedPacking = packing;
    this.showDispatchForm = true;
    this.isEditMode = false;
    
    // Auto-fill data from packing
    this.dispatch = {
      id: null,
      dispatchId: `DISP-${Date.now().toString().slice(-6)}`,
      poNo: packing.poNo || '',
      customer: packing.customer || '',
      section: packing.gradeSection || '',
      qtyIssued: packing.qtyInMt || null,
      challanNo: packing.challanNo || '',
      vehicleNo: '',
      fromLocation: '',
      destination: '',
      dispatchDate: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    };
  }

  // Edit existing dispatch
  editDispatch(dispatch: any) {
    this.showDispatchForm = true;
    this.isEditMode = true;
    this.selectedPacking = null;
    this.dispatch = { ...dispatch };
  }

  closeDispatchForm() {
    this.showDispatchForm = false;
    this.isEditMode = false;
    this.selectedPacking = null;
    this.resetForm();
  }

  saveDispatch() {
    if (this.isEditMode && this.dispatch.id) {
      // Update existing dispatch
      this.http.put(`${this.apiUrl}/${this.dispatch.id}`, this.dispatch).subscribe({
        next: () => {
          this.message = 'Dispatch updated successfully!';
          this.loadDispatches();
          this.closeDispatchForm();
        },
        error: (err) => {
          console.error(err);
          this.message = 'Failed to update dispatch.';
        }
      });
    } else {
      // Create new dispatch from packing
      if (!this.selectedPacking) {
        this.message = 'No packing selected!';
        return;
      }

      const url = `${this.apiUrl}/from-packing/${this.selectedPacking.id}`;
      
      this.http.post<any>(url, this.dispatch).subscribe({
        next: (res) => {
          this.message = res.message || 'Dispatch created successfully!';
          alert(`✅ ${res.message}\n\nDispatch ID: ${res.dispatchId}`);
          this.loadDispatches();
          this.loadPackedItems();
          this.closeDispatchForm();
        },
        error: (err) => {
          console.error(err);
          this.message = err?.error?.message || 'Failed to create dispatch.';
          alert('❌ ' + this.message);
        }
      });
    }
  }

  resetForm() {
    this.dispatch = {
      id: null,
      dispatchId: `DISP-${Date.now().toString().slice(-6)}`,
      poNo: '',
      customer: '',
      section: '',
      qtyIssued: null,
      challanNo: '',
      vehicleNo: '',
      fromLocation: '',
      destination: '',
      dispatchDate: new Date().toISOString().slice(0, 10),
      status: 'Pending'
    };
  }

  // --- Update Dispatch Status ---
  updateDispatchStatus(dispatch: any, newStatus: string) {
    if (!confirm(`Update dispatch ${dispatch.dispatchId} to ${newStatus}?`)) {
      return;
    }

    const updatedDispatch = { ...dispatch, status: newStatus };
    
    this.http.put(`${this.apiUrl}/${dispatch.id}`, updatedDispatch).subscribe({
      next: () => {
        this.message = `Dispatch status updated to ${newStatus}!`;
        this.loadDispatches();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to update dispatch status.';
      }
    });
  }

  getBadgeClass(status: string): string {
    switch(status) {
      case 'In Transit': return 'bg-success';
      case 'Pending': return 'bg-warning';
      case 'Delivered': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}
