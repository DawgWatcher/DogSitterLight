import BookingForm from "@/components/BookingForm";

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-forest-800 mb-2">
            ThePupPad
          </h1>
          <p className="text-lg text-gray-600">
            Kennel-free dog care — book your pup&apos;s stay
          </p>
        </header>
        <BookingForm />
      </div>
    </main>
  );
}
