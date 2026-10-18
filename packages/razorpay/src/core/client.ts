
import crypto from 'crypto';

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

export class RazorpayClient {
  private auth: string;
  private baseUrl = 'https://api.razorpay.com/v1';

  constructor(private config: RazorpayConfig) {
    this.auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');
  }

  private async request(path: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${this.auth}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json() as any;
    if (!res.ok) {
      throw new Error(`Razorpay Error: ${data.error?.description || JSON.stringify(data)}`);
    }
    return data;
  }

  // Orders
  async createOrder(opts: { amount: number; currency?: string; receipt: string; notes?: any }) {
    // amount in paise - e.g. 50000 = 500 INR
    return this.request('/orders', 'POST', {
      amount: opts.amount,
      currency: opts.currency || 'INR',
      receipt: opts.receipt,
      notes: opts.notes,
    });
  }

  async fetchOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  // Payments
  async fetchPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`);
  }

  async capturePayment(paymentId: string, amount: number, currency: string = 'INR') {
    return this.request(`/payments/${paymentId}/capture`, 'POST', { amount, currency });
  }

  // Refunds
  async createRefund(paymentId: string, amount?: number, notes?: any) {
    return this.request(`/payments/${paymentId}/refund`, 'POST', { amount, notes });
  }

  // Customers
  async createCustomer(data: { name: string; email: string; contact: string; notes?: any }) {
    return this.request('/customers', 'POST', data);
  }

  // Bank Account Verification (Penny drop)
  async verifyBankAccount(data: { account_number: string; ifsc: string; name?: string }) {
    // Uses Razorpay's fund account validation
    return this.request('/fund_accounts/validations', 'POST', {
      account_number: data.account_number,
      ifsc: data.ifsc,
      name: data.name,
    });
  }

  // UPI Verification
  async verifyUPI(vpa: string) {
    return this.request('/fund_accounts/validations', 'POST', {
      account_type: 'vpa',
      vpa: { address: vpa },
    });
  }

  // Payouts (RazorpayX)
  async createPayout(data: { account_number: string; fund_account_id: string; amount: number; currency?: string; mode: 'IMPS' | 'NEFT' | 'RTGS' | 'UPI'; purpose: string; queue_if_low_balance?: boolean }) {
    // Payouts API uses different base - https://api.razorpay.com/v1/payouts
    return this.request('/payouts', 'POST', {
      account_number: data.account_number,
      fund_account_id: data.fund_account_id,
      amount: data.amount, // in paise
      currency: data.currency || 'INR',
      mode: data.mode,
      purpose: data.purpose,
      queue_if_low_balance: data.queue_if_low_balance ?? true,
    });
  }

  async createFundAccount(data: { customer_id?: string; account_type: 'bank_account' | 'vpa'; bank_account?: { name: string; ifsc: string; account_number: string }; vpa?: { address: string }; }) {
    return this.request('/fund_accounts', 'POST', data);
  }
}

export const createRazorpayClient = (config: RazorpayConfig) => new RazorpayClient(config);
