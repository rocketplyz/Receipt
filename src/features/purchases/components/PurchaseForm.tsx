import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useThemeColors } from '../../../theme/colors';
import { getCategoryDefaults, getMerchantPolicies } from '../api';
import {
  calculateReturnDeadline,
  calculateWarrantyExpires,
  type CategoryDefaultLookup,
  type MerchantPolicyLookup,
} from '../deadlines';
import type { Purchase, PurchaseCategory, PurchaseInput } from '../types';

const CATEGORIES: { value: PurchaseCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export interface PurchaseFormProps {
  initialPurchase?: Purchase;
  submitLabel: string;
  onSubmit: (input: PurchaseInput) => Promise<void>;
}

export function PurchaseForm({ initialPurchase, submitLabel, onSubmit }: PurchaseFormProps) {
  const colors = useThemeColors();

  const [itemName, setItemName] = useState(initialPurchase?.itemName ?? '');
  const [merchant, setMerchant] = useState(initialPurchase?.merchant ?? '');
  const [purchaseDate, setPurchaseDate] = useState<Date>(
    initialPurchase ? fromIsoDate(initialPurchase.purchaseDate) : new Date(),
  );
  const [priceText, setPriceText] = useState(
    initialPurchase?.priceCents != null ? (initialPurchase.priceCents / 100).toString() : '',
  );
  const [category, setCategory] = useState<PurchaseCategory>(
    initialPurchase?.category ?? 'other',
  );
  const [modelNumber, setModelNumber] = useState(initialPurchase?.modelNumber ?? '');
  const [serialNumber, setSerialNumber] = useState(initialPurchase?.serialNumber ?? '');
  const [notes, setNotes] = useState(initialPurchase?.notes ?? '');
  // Once the user (or an edit load) has set a deadline directly, stop
  // auto-recalculating it when purchase date/merchant/category change —
  // the manual value below is used as-is instead of the suggestion.
  const [manualReturnDeadline, setManualReturnDeadline] = useState<Date | null>(
    initialPurchase?.returnDeadline ? fromIsoDate(initialPurchase.returnDeadline) : null,
  );
  const [manualWarrantyExpires, setManualWarrantyExpires] = useState<Date | null>(
    initialPurchase?.warrantyExpires ? fromIsoDate(initialPurchase.warrantyExpires) : null,
  );
  const [returnDeadlineTouched, setReturnDeadlineTouched] = useState(Boolean(initialPurchase));
  const [warrantyExpiresTouched, setWarrantyExpiresTouched] = useState(Boolean(initialPurchase));

  const [merchantPolicies, setMerchantPolicies] = useState<MerchantPolicyLookup>({});
  const [categoryDefaults, setCategoryDefaults] = useState<CategoryDefaultLookup>({});

  const returnDeadline = returnDeadlineTouched
    ? manualReturnDeadline
    : calculateReturnDeadline(purchaseDate, merchant, merchantPolicies);
  const warrantyExpires = warrantyExpiresTouched
    ? manualWarrantyExpires
    : calculateWarrantyExpires(purchaseDate, category, categoryDefaults);

  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [showWarrantyDatePicker, setShowWarrantyDatePicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getMerchantPolicies()
      .then(setMerchantPolicies)
      .catch(() => undefined);
    getCategoryDefaults()
      .then(setCategoryDefaults)
      .catch(() => undefined);
  }, []);

  async function handleSubmit() {
    if (!itemName.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit({
        itemName: itemName.trim(),
        merchant: merchant.trim() || null,
        purchaseDate: toIsoDate(purchaseDate),
        priceCents: priceText.trim() ? Math.round(parseFloat(priceText) * 100) : null,
        currency: 'USD',
        category,
        modelNumber: modelNumber.trim() || null,
        serialNumber: serialNumber.trim() || null,
        notes: notes.trim() || null,
        returnDeadline: returnDeadline ? toIsoDate(returnDeadline) : null,
        warrantyExpires: warrantyExpires ? toIsoDate(warrantyExpires) : null,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
      setIsSubmitting(false);
    }
  }

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Field label="Item name" colors={colors}>
        <TextInput
          placeholder="Dishwasher"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          value={itemName}
          onChangeText={setItemName}
        />
      </Field>

      <Field label="Merchant" colors={colors}>
        <TextInput
          placeholder="Best Buy"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          value={merchant}
          onChangeText={setMerchant}
        />
      </Field>

      <Field label="Purchase date" colors={colors}>
        <DateField
          colors={colors}
          date={purchaseDate}
          onPress={() => setShowPurchaseDatePicker(true)}
        />
        {showPurchaseDatePicker ? (
          <DateTimePicker
            value={purchaseDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, date) => {
              setShowPurchaseDatePicker(Platform.OS === 'ios');
              if (date) setPurchaseDate(date);
            }}
          />
        ) : null}
      </Field>

      <Field label="Price (optional)" colors={colors}>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="299.99"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          value={priceText}
          onChangeText={setPriceText}
        />
      </Field>

      <Field label="Category" colors={colors}>
        <View style={styles.chipRow}>
          {CATEGORIES.map(({ value, label }) => {
            const selected = category === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.accent : colors.border,
                    backgroundColor: selected ? `${colors.accent}22` : colors.surface,
                  },
                ]}
                onPress={() => setCategory(value)}
              >
                <Text style={{ color: selected ? colors.accent : colors.text }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Return deadline" colors={colors}>
        <DateField
          colors={colors}
          date={returnDeadline}
          placeholder="No return window"
          onPress={() => setShowReturnDatePicker(true)}
        />
        {showReturnDatePicker ? (
          <DateTimePicker
            value={returnDeadline ?? purchaseDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, date) => {
              setShowReturnDatePicker(Platform.OS === 'ios');
              if (date) {
                setManualReturnDeadline(date);
                setReturnDeadlineTouched(true);
              }
            }}
          />
        ) : null}
      </Field>

      <Field label="Warranty expires" colors={colors}>
        <DateField
          colors={colors}
          date={warrantyExpires}
          placeholder="No warranty tracked"
          onPress={() => setShowWarrantyDatePicker(true)}
        />
        {showWarrantyDatePicker ? (
          <DateTimePicker
            value={warrantyExpires ?? purchaseDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_event, date) => {
              setShowWarrantyDatePicker(Platform.OS === 'ios');
              if (date) {
                setManualWarrantyExpires(date);
                setWarrantyExpiresTouched(true);
              }
            }}
          />
        ) : null}
      </Field>

      <Field label="Model number (optional)" colors={colors}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          value={modelNumber}
          onChangeText={setModelNumber}
        />
      </Field>

      <Field label="Serial number (optional)" colors={colors}>
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
          value={serialNumber}
          onChangeText={setSerialNumber}
        />
      </Field>

      <Field label="Notes (optional)" colors={colors}>
        <TextInput
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textMuted}
          style={[inputStyle, styles.multiline]}
          value={notes}
          onChangeText={setNotes}
        />
      </Field>

      {errorMessage ? (
        <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isSubmitting}
        style={[styles.button, { backgroundColor: colors.accent, opacity: isSubmitting ? 0.6 : 1 }]}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ReturnType<typeof useThemeColors>;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

function DateField({
  colors,
  date,
  placeholder = 'Select a date',
  onPress,
}: {
  colors: ReturnType<typeof useThemeColors>;
  date: Date | null;
  placeholder?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.input, styles.dateField, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <Text style={{ color: date ? colors.text : colors.textMuted, fontSize: 16 }}>
        {date ? formatDate(date) : placeholder}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 20,
    paddingBottom: 48,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dateField: {
    justifyContent: 'center',
    minHeight: 52,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  error: {
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
