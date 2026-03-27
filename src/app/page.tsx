import BookingForm from '@/components/BookingForm';

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-center py-8">
        <h1 className="text-2xl font-bold text-plum">Home</h1>
      </div>
      <BookingForm />
    </>
  );
}
