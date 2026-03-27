import BookingForm from '@/components/BookingForm';
import { SERVICES, ADDONS, SERVICE_OPTIONS } from '@/lib/pricing';

export default function BookingsPage() {
  return (
    <BookingForm
      services={SERVICES}
      addons={ADDONS}
      serviceOptions={SERVICE_OPTIONS}
    />
  );
}
