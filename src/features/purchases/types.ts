import type { PurchaseCategory, PurchaseSource } from '../../lib/database.types';

export type { PurchaseCategory, PurchaseSource };

export interface Purchase {
  id: string;
  householdId: string;
  itemName: string;
  merchant: string | null;
  purchaseDate: string;
  priceCents: number | null;
  currency: string;
  category: PurchaseCategory;
  modelNumber: string | null;
  serialNumber: string | null;
  notes: string | null;
  returnDeadline: string | null;
  warrantyExpires: string | null;
  source: PurchaseSource;
}

export interface PurchaseInput {
  itemName: string;
  merchant: string | null;
  purchaseDate: string;
  priceCents: number | null;
  currency: string;
  category: PurchaseCategory;
  modelNumber: string | null;
  serialNumber: string | null;
  notes: string | null;
  returnDeadline: string | null;
  warrantyExpires: string | null;
}
