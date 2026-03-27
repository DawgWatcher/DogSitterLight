import ServiceCatalog from '@/components/ServiceCatalog';

export const metadata = {
  title: 'Services — ThePupPad',
  description: 'Boarding, daycare, dog walking, in-home visits, and meet & greets in Monroe Township, NJ.',
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-nunito text-3xl font-bold text-plum">
        What We Offer
      </h1>
      <p className="mt-2 font-nunito text-base text-plum/45">
        Small-group, cage-free care — every service, every size, every pup.
      </p>

      <div className="mt-8">
        <ServiceCatalog />
      </div>
    </div>
  );
}
