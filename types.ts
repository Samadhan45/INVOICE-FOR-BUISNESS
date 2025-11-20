
export enum PaymentStatus {
  Pending = 'बाकी',
  Paid = 'पूर्ण',
  Overdue = 'थकबाकी',
}

export interface LineItem {
  id: string;
  description: string;
  unit: string; // Added unit
  quantity: number;
  rate: number;
  amount: number;
}

export interface ClientDetails {
  name: string;
  phone: string;
  address: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;      // Bill Date
  startDate?: string; // Work Start
  endDate?: string;   // Work End
  client: ClientDetails;
  items: LineItem[];
  subtotal: number;
  discount: number;
  total: number;
  advance: number;   // New: Advance Payment
  balance: number;   // New: Balance Due
  status: PaymentStatus;
  notes: string;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  invoicesCount: number;
}
