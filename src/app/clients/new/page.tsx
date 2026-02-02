import { ClientForm } from '@/components/client-form';

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novi klijent</h1>
      <ClientForm />
    </div>
  );
}
