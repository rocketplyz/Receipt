import { useRouter } from 'expo-router';

import { createPurchase } from '../../../src/features/purchases/api';
import { PurchaseForm } from '../../../src/features/purchases/components/PurchaseForm';

export default function NewPurchase() {
  const router = useRouter();

  return (
    <PurchaseForm
      submitLabel="Save purchase"
      onSubmit={async (input) => {
        await createPurchase(input);
        router.back();
      }}
    />
  );
}
