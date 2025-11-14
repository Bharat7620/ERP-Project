import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


interface JobWorkLine {
  id?: string;
  itemCode: string;
  description: string;
  qtyIssued: number;
  weight: number;
  uom: string;
  remarks?: string;
}

interface JobWorkChallan {
  id?: string;
  challanNo: string;
  challanDate: string;
  supplier: string;
  vehicleNo: string;
  lines: JobWorkLine[];
  status: 'issued' | 'pending_return' | 'returned' | 'completed';
  createdAt?: string;
}

interface JobWorkReceipt {
  id?: string;
  challanId: string;
  challanNo: string;
  receiptDate: string;
  qtyReceived: number;
  actualWeight: number;
  kataWeight: number;
  difference: number;
  jobCharge: number;
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-jobwork',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './jobwork.html',
  styleUrls: ['./jobwork.css']
})
export class Jobwork implements OnInit {
  activeTab: 'issue' | 'receive' | 'list' | 'invoices' = 'issue';

  // Issue Challan Form
  issueChallan: JobWorkChallan = {
    challanNo: '',
    challanDate: new Date().toISOString().split('T')[0],
    supplier: '',
    vehicleNo: '',
    lines: [{ itemCode: '', description: '', qtyIssued: 0, weight: 0, uom: 'MT', remarks: '' }],
    status: 'issued'
  };

  // Receipt Form
  receiptForm: JobWorkReceipt = {
    challanId: '',
    challanNo: '',
    receiptDate: new Date().toISOString().split('T')[0],
    qtyReceived: 0,
    actualWeight: 0,
    kataWeight: 0,
    difference: 0,
    jobCharge: 0,
    status: 'pending'
  };

  // Lists
  challans: JobWorkChallan[] = [];
  receipts: JobWorkReceipt[] = [];
  filteredChallans: JobWorkChallan[] = [];
  filteredReceipts: JobWorkReceipt[] = [];

  // UI States
  loading = false;
  message = '';
  errorMessage = '';
  showDetailModal = false;
  selectedChallan: JobWorkChallan | null = null;

  // Filters
  searchChallanNo = '';
  filterSupplier = '';
  filterStatus = '';
  filterReceiptStatus = '';

  private challanApiUrl = 'http://localhost:8080/api/jobwork/challan';
  private receiptApiUrl = 'http://localhost:8080/api/jobwork/receipt';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllChallans();
    this.getAllReceipts();
  }

  // Jump Button hook (optional)
  onBeforeNavigate() {
    console.log('[Jobwork] jumping to Reports…');
  }

  switchTab(tab: 'issue' | 'receive' | 'list' | 'invoices') {
    this.activeTab = tab;
    if (tab === 'list') {
      this.getAllChallans();
    } else if (tab === 'invoices') {
      this.getAllReceipts();
    }
  }

  // ========== ISSUE CHALLAN ==========
  addIssueLine() {
    this.issueChallan.lines.push({
      itemCode: '',
      description: '',
      qtyIssued: 0,
      weight: 0,
      uom: 'MT',
      remarks: ''
    });
  }

  removeIssueLine(index: number) {
    this.issueChallan.lines.splice(index, 1);
  }

  issueChallanSubmit() {
    if (!this.issueChallan.challanNo || !this.issueChallan.supplier || this.issueChallan.lines.length === 0) {
      this.message = 'Please fill all required fields!';
      return;
    }

    this.http.post(this.challanApiUrl, this.issueChallan).subscribe({
      next: () => {
        this.message = 'Jobwork Challan issued successfully!';
        this.resetIssueForm();
        this.getAllChallans();
        setTimeout(() => this.switchTab('list'), 1500);
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to issue challan!';
      }
    });
  }

  resetIssueForm() {
    this.issueChallan = {
      challanNo: '',
      challanDate: new Date().toISOString().split('T')[0],
      supplier: '',
      vehicleNo: '',
      lines: [{ itemCode: '', description: '', qtyIssued: 0, weight: 0, uom: 'MT', remarks: '' }],
      status: 'issued'
    };
    this.message = '';
  }

  getTotalIssuedQty(): number {
    return this.issueChallan.lines.reduce((sum, line) => sum + line.qtyIssued, 0);
  }

  getTotalIssuedWeight(): number {
    return this.issueChallan.lines.reduce((sum, line) => sum + line.weight, 0);
  }

  // ========== RECEIVE CHALLAN ==========
  recordReceipt() {
    if (!this.receiptForm.challanNo || this.receiptForm.qtyReceived === 0) {
      this.message = 'Please fill all required fields!';
      return;
    }

    // Calculate difference
    this.receiptForm.difference = this.receiptForm.actualWeight - this.receiptForm.kataWeight;

    this.http.post(this.receiptApiUrl, this.receiptForm).subscribe({
      next: () => {
        this.message = 'Jobwork receipt recorded successfully!';
        this.resetReceiptForm();
        this.getAllReceipts();
        setTimeout(() => this.switchTab('invoices'), 1500);
      },
      error: err => {
        console.error(err);
        this.message = 'Failed to record receipt!';
      }
    });
  }

  resetReceiptForm() {
    this.receiptForm = {
      challanId: '',
      challanNo: '',
      receiptDate: new Date().toISOString().split('T')[0],
      qtyReceived: 0,
      actualWeight: 0,
      kataWeight: 0,
      difference: 0,
      jobCharge: 0,
      status: 'pending'
    };
    this.message = '';
  }

  // ========== LIST CHALLANS ==========
  getAllChallans() {
    this.loading = true;
    this.http.get<any[]>(this.challanApiUrl).subscribe({
      next: res => {
        this.challans = res;
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to fetch challans!';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredChallans = this.challans.filter(c => {
      const matchChallan = c.challanNo.toLowerCase().includes(this.searchChallanNo.toLowerCase());
      const matchSupplier = !this.filterSupplier || c.supplier.toLowerCase().includes(this.filterSupplier.toLowerCase());
      const matchStatus = !this.filterStatus || c.status === this.filterStatus;
      return matchChallan && matchSupplier && matchStatus;
    });
  }

  clearFilters() {
    this.searchChallanNo = '';
    this.filterSupplier = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  // ========== LIST RECEIPTS ==========
  getAllReceipts() {
    this.loading = true;
    this.http.get<any[]>(this.receiptApiUrl).subscribe({
      next: res => {
        this.receipts = res;
        this.applyReceiptFilters();
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to fetch receipts!';
        this.loading = false;
      }
    });
  }

  applyReceiptFilters() {
    this.filteredReceipts = this.receipts.filter(r => {
      const matchStatus = !this.filterReceiptStatus || r.status === this.filterReceiptStatus;
      return matchStatus;
    });
  }

  clearReceiptFilters() {
    this.filterReceiptStatus = '';
    this.applyReceiptFilters();
  }

  // ========== MODAL ==========
  openDetailModal(challan: JobWorkChallan) {
    this.selectedChallan = JSON.parse(JSON.stringify(challan));
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedChallan = null;
  }

  // ========== ACTIONS ==========
  deleteChallan(id?: string) {
    if (!id || !confirm('Are you sure?')) return;

    this.http.delete(`${this.challanApiUrl}/${id}`).subscribe({
      next: () => {
        this.getAllChallans();
      },
      error: err => {
        console.error(err);
        alert('Failed to delete challan');
      }
    });
  }

  approvReceipt(id?: string) {
    if (!id) return;

    this.http.patch(`${this.receiptApiUrl}/${id}/approve`, {}).subscribe({
      next: () => {
        this.getAllReceipts();
      },
      error: err => {
        console.error(err);
        alert('Failed to approve receipt');
      }
    });
  }

  printChallan(challan: JobWorkChallan) {
    let printContent = `
      JOBWORK CHALLAN
      ================
      Challan No: ${challan.challanNo}
      Date: ${challan.challanDate}
      Supplier: ${challan.supplier}
      Vehicle: ${challan.vehicleNo}
      
      Items:
    `;

    challan.lines.forEach((line, idx) => {
      printContent += `
      ${idx + 1}. ${line.itemCode} - ${line.description}
         Qty: ${line.qtyIssued} ${line.uom}, Weight: ${line.weight}
      `;
    });

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow?.document.write(`<pre>${printContent}</pre>`);
    printWindow?.print();
  }

  exportToExcel() {
    let csv = 'Challan No,Date,Supplier,Vehicle,Item Code,Description,Qty,Weight,UOM,Status\n';
    this.filteredChallans.forEach(c => {
      c.lines.forEach(line => {
        csv += `${c.challanNo},${c.challanDate},${c.supplier},${c.vehicleNo},${line.itemCode},${line.description},${line.qtyIssued},${line.weight},${line.uom},${c.status}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jobwork-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  getWeightDifference(receipt: JobWorkReceipt): number {
    return receipt.actualWeight - receipt.kataWeight;
  }

  getPenaltyOrBonus(receipt: JobWorkReceipt): string {
    const diff = this.getWeightDifference(receipt);
    if (diff > 0) return `Penalty: ₹${(diff * 100).toFixed(2)}`;
    return `Bonus: ₹${(Math.abs(diff) * 50).toFixed(2)}`;
  }
}
