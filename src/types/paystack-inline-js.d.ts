declare module "@paystack/inline-js" {
  export interface PaystackTransaction {
    reference: string;
    status?: string;
    trans?: string;
    transaction?: string;
    message?: string;
    [key: string]: unknown;
  }

  export interface PaystackCustomField {
    display_name: string;
    variable_name: string;
    value: string;
  }

  export interface PaystackTransactionOptions {
    key: string;
    email: string;
    /** Amount in the currency's subunit (e.g. pesewas for GHS, kobo for NGN). */
    amount: number;
    currency?: string;
    reference?: string;
    metadata?: {
      custom_fields?: PaystackCustomField[];
      [key: string]: unknown;
    };
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
    onLoad?: (response: unknown) => void;
    [key: string]: unknown;
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
    resumeTransaction(accessCode: string, options?: Partial<PaystackTransactionOptions>): void;
    cancelTransaction(id: string): void;
  }
}
