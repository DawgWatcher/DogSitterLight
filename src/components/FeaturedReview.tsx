function GoldStar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="#FFCA4B"
      aria-hidden="true"
    >
      <path d="M10 1.25l2.47 5.01 5.53.8-4 3.9.94 5.5L10 13.77l-4.94 2.69.94-5.5-4-3.9 5.53-.8L10 1.25z" />
    </svg>
  );
}

export default function FeaturedReview() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <div className="bg-cream rounded-2xl p-8 md:p-10 max-w-2xl mx-auto">
          {/* Stars */}
          <div className="flex gap-1 justify-center mb-5" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <GoldStar key={i} />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-plum text-center text-base md:text-lg italic leading-relaxed">
            &ldquo;David and Lexi are amazing. My dog comes home happy and
            exhausted every single time. I wouldn&rsquo;t trust anyone
            else.&rdquo;
          </blockquote>

          {/* Attribution */}
          <p className="mt-5 text-plum font-semibold text-center text-sm md:text-base">
            — Sarah M.
          </p>
        </div>
      </div>
    </section>
  );
}
