export interface StoreSettings {
  id: string;
  storeName: string;
  storeNameBn: string;
  branchName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  vatRegistrationNumber: string;
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number; // e.g. 5 for 5%
  enableTax: boolean;
  paperSize: '58mm' | '80mm';
  receiptHeaderNote: string;
  receiptFooterNote: string;
  enableSound: boolean;
  autoPrintReceipt: boolean;
  cashierName: string;
}
