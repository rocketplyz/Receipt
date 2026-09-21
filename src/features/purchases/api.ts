import { supabase } from '../../lib/supabase';
import { getCurrentHouseholdId } from '../households/api';
import type { CategoryDefaultLookup, MerchantPolicyLookup } from './deadlines';
import type { Purchase, PurchaseInput } from './types';

type PurchaseRow = {
  id: string;
  household_id: string;
  item_name: string;
  merchant: string | null;
  purchase_date: string;
  price_cents: number | null;
  currency: string;
  category: Purchase['category'];
  model_number: string | null;
  serial_number: string | null;
  notes: string | null;
  return_deadline: string | null;
  warranty_expires: string | null;
  source: Purchase['source'];
};

const PURCHASE_COLUMNS =
  'id, household_id, item_name, merchant, purchase_date, price_cents, currency, category, model_number, serial_number, notes, return_deadline, warranty_expires, source';

function mapRowToPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    householdId: row.household_id,
    itemName: row.item_name,
    merchant: row.merchant,
    purchaseDate: row.purchase_date,
    priceCents: row.price_cents,
    currency: row.currency,
    category: row.category,
    modelNumber: row.model_number,
    serialNumber: row.serial_number,
    notes: row.notes,
    returnDeadline: row.return_deadline,
    warrantyExpires: row.warranty_expires,
    source: row.source,
  };
}

/** Earliest upcoming deadline for a purchase, or null if it has none. */
export function nextDeadline(purchase: Pick<Purchase, 'returnDeadline' | 'warrantyExpires'>): string | null {
  const deadlines = [purchase.returnDeadline, purchase.warrantyExpires].filter(
    (d): d is string => d !== null,
  );
  if (deadlines.length === 0) {
    return null;
  }
  return deadlines.sort()[0];
}

export async function listPurchases(searchQuery?: string): Promise<Purchase[]> {
  const householdId = await getCurrentHouseholdId();

  let query = supabase.from('purchases').select(PURCHASE_COLUMNS).eq('household_id', householdId);

  const trimmedQuery = searchQuery?.trim();
  if (trimmedQuery) {
    query = query.textSearch('search_vector', trimmedQuery, {
      type: 'websearch',
      config: 'english',
    });
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const purchases = (data as PurchaseRow[]).map(mapRowToPurchase);

  // Soonest deadline first; purchases with no deadline at all sort last.
  return purchases.sort((a, b) => {
    const deadlineA = nextDeadline(a);
    const deadlineB = nextDeadline(b);
    if (deadlineA === null && deadlineB === null) return 0;
    if (deadlineA === null) return 1;
    if (deadlineB === null) return -1;
    return deadlineA.localeCompare(deadlineB);
  });
}

export async function getPurchase(id: string): Promise<Purchase> {
  const { data, error } = await supabase
    .from('purchases')
    .select(PURCHASE_COLUMNS)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }
  return mapRowToPurchase(data as PurchaseRow);
}

export async function createPurchase(input: PurchaseInput): Promise<Purchase> {
  const householdId = await getCurrentHouseholdId();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not signed in');
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert({
      household_id: householdId,
      created_by: user.id,
      item_name: input.itemName,
      merchant: input.merchant,
      purchase_date: input.purchaseDate,
      price_cents: input.priceCents,
      currency: input.currency,
      category: input.category,
      model_number: input.modelNumber,
      serial_number: input.serialNumber,
      notes: input.notes,
      return_deadline: input.returnDeadline,
      warranty_expires: input.warrantyExpires,
    })
    .select(PURCHASE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }
  return mapRowToPurchase(data as PurchaseRow);
}

export async function updatePurchase(id: string, input: PurchaseInput): Promise<Purchase> {
  const { data, error } = await supabase
    .from('purchases')
    .update({
      item_name: input.itemName,
      merchant: input.merchant,
      purchase_date: input.purchaseDate,
      price_cents: input.priceCents,
      currency: input.currency,
      category: input.category,
      model_number: input.modelNumber,
      serial_number: input.serialNumber,
      notes: input.notes,
      return_deadline: input.returnDeadline,
      warranty_expires: input.warrantyExpires,
    })
    .eq('id', id)
    .select(PURCHASE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }
  return mapRowToPurchase(data as PurchaseRow);
}

export async function deletePurchase(id: string): Promise<void> {
  const { error } = await supabase.from('purchases').delete().eq('id', id);
  if (error) {
    throw error;
  }
}

export async function getMerchantPolicies(): Promise<MerchantPolicyLookup> {
  const { data, error } = await supabase.from('merchant_policies').select('merchant_key, default_return_days');
  if (error) {
    throw error;
  }
  return Object.fromEntries(data.map((row) => [row.merchant_key, row.default_return_days]));
}

export async function getCategoryDefaults(): Promise<CategoryDefaultLookup> {
  const { data, error } = await supabase
    .from('category_defaults')
    .select('category, default_warranty_months');
  if (error) {
    throw error;
  }
  return Object.fromEntries(data.map((row) => [row.category, row.default_warranty_months]));
}
