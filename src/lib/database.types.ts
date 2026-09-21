// Hand-written to match supabase/migrations/*.sql. Regenerate by hand (or
// with `supabase gen types typescript`, once the CLI can reach the linked
// project) whenever a migration changes these shapes.

export type HouseholdRole = 'owner' | 'member';
export type PurchaseCategory = 'electronics' | 'appliance' | 'furniture' | 'other';
export type PurchaseSource = 'manual' | 'photo' | 'email';

export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      household_members: {
        Row: {
          household_id: string;
          user_id: string;
          role: HouseholdRole;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          household_id: string;
          created_by: string;
          item_name: string;
          merchant: string | null;
          purchase_date: string;
          price_cents: number | null;
          currency: string;
          category: PurchaseCategory;
          model_number: string | null;
          serial_number: string | null;
          notes: string | null;
          return_deadline: string | null;
          warranty_expires: string | null;
          source: PurchaseSource;
          extraction_confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          created_by: string;
          item_name: string;
          merchant?: string | null;
          purchase_date: string;
          price_cents?: number | null;
          currency?: string;
          category?: PurchaseCategory;
          model_number?: string | null;
          serial_number?: string | null;
          notes?: string | null;
          return_deadline?: string | null;
          warranty_expires?: string | null;
          source?: PurchaseSource;
          extraction_confidence?: number | null;
        };
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>;
        Relationships: [];
      };
      merchant_policies: {
        Row: {
          merchant_key: string;
          default_return_days: number;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      category_defaults: {
        Row: {
          category: PurchaseCategory;
          default_warranty_months: number;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
