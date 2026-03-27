const stats = [
  { value: '5.0', label: 'Stars on Rover' },
  { value: '617', label: 'Verified Reviews' },
  { value: '329', label: 'Returning Families' },
];

export default function TrustBlock() {
  return (
    <section className="bg-cream py-16">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-plum font-extrabold text-[40px] md:text-[48px] leading-tight">
                {stat.value}
              </p>
              <div className="mx-auto mt-2 w-8 h-0.5 bg-gold rounded-full" />
              <p className="mt-2 text-plum font-semibold text-sm md:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
