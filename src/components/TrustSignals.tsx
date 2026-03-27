const signals = [
  {
    heading: 'Kennel-Free, Always.',
    description:
      'No cages, no kennels. Your dog roams freely in our home — couches included.',
  },
  {
    heading: 'Daily Photo & Video Updates.',
    description:
      "You'll never wonder how they're doing. We send multiple updates every day.",
  },
  {
    heading: 'Large Fenced Yard.',
    description:
      'Plenty of room to run, play, and tire themselves out.',
  },
  {
    heading: 'Meet Us First.',
    description:
      "Every new family starts with a free Meet & Greet. No commitment until you're comfortable.",
  },
];

export default function TrustSignals() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {signals.map((signal) => (
            <div key={signal.heading}>
              <h3 className="text-plum font-bold text-lg md:text-xl flex items-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                {signal.heading}
              </h3>
              <p className="mt-2 text-plum/70 font-normal text-[15px] md:text-base leading-relaxed pl-4">
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
