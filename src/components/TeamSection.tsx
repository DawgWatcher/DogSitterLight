const team = [
  {
    name: 'David',
    role: 'Dog Trainer',
    bio: '10 years experience, LIMA-certified. Specializes in behavior modification. Primary caretaker and builder of ThePupPad\u2019s digital assets.',
    photo: '/team/david.jpg',
  },
  {
    name: 'Lexi',
    role: 'Certified Trainer & Facility Manager',
    bio: 'LIMA approach (Least Invasive, Minimally Aversive). Cares for dogs, trains them, and keeps operations running smoothly.',
    photo: '/team/lexi.png',
  },
  {
    name: 'Juju',
    role: 'Groomer',
    bio: 'Specializes in dogs that are difficult to groom due to personality or disabilities.',
    photo: '/team/juju.jpg',
  },
  {
    name: 'Liz',
    role: 'Owner',
    bio: 'Tech background. Responsible for all digital operations and business profitability.',
    photo: '/team/liz.png',
  },
];

export default function TeamSection() {
  return (
    <section id="meet-our-team" className="bg-white py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-5 md:px-8">
        <h2 className="text-plum font-extrabold text-2xl md:text-3xl text-center mb-10 md:mb-14">
          Meet Our Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-cream rounded-2xl p-6 flex flex-col items-center text-center"
            >
              {/* Photo */}
              <img
                src={member.photo}
                alt={`${member.name} — ${member.role}`}
                loading="lazy"
                className="w-40 h-40 md:w-44 md:h-44 rounded-full object-cover mb-4"
              />

              {/* Name */}
              <h3 className="text-plum font-bold text-lg">{member.name}</h3>

              {/* Role badge */}
              <span className="inline-block mt-1 mb-3 text-gold font-semibold text-sm">
                {member.role}
              </span>

              {/* Bio */}
              <p className="text-plum text-[14px] md:text-[15px] leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
