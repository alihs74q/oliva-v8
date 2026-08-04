import { CircleDashed, Baby, Users, Tv } from 'lucide-react';

const AMENITIES = [
  {
    icon: CircleDashed,
    title: '2 Padel Courts',
    desc: 'Professional-grade glass courts with premium flooring and lighting for day & night play.',
    accent: 'from-[#4a6741]/10 to-[#4a6741]/5',
  },
  {
    icon: Baby,
    title: 'Kids Section',
    desc: 'A dedicated safe play area for children while parents enjoy a match or a coffee.',
    accent: 'from-amber-100/50 to-amber-50/30',
  },
  {
    icon: Users,
    title: 'Cozy Tables',
    desc: 'Comfortable seating and dining tables with a relaxed atmosphere for friends and family.',
    accent: 'from-orange-100/40 to-orange-50/20',
  },
  {
    icon: Tv,
    title: 'Big Screen TV',
    desc: 'Watch live sports and matches on our massive screen while you eat and relax.',
    accent: 'from-stone-200/50 to-stone-100/30',
  },
];

export default function Amenities() {
  return (
    <section id="about" className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[#4a6741] tracking-[0.2em] uppercase mb-3">What We Offer</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800">More Than Just a Café</h2>
          <p className="text-stone-500 mt-3 max-w-xl mx-auto">
            A complete experience combining sport, food, and relaxation under one roof.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AMENITIES.map((item, i) => (
            <div
              key={item.title}
              className="group relative bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Image placeholder */}
              <style>{`
                @keyframes glowPulse {
                  0%, 100% {
                    box-shadow: 0 0 8px #4a6741, 0 0 16px #4a6741, 0 0 32px rgba(74, 103, 65, 0.3);
                    filter: brightness(1);
                  }
                  50% {
                    box-shadow: 0 0 12px #4a6741, 0 0 24px #4a6741, 0 0 40px rgba(74, 103, 65, 0.5);
                    filter: brightness(1.05);
                  }
                }
              `}</style>
              <div className={`relative h-32 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 transition-all duration-300`}
                style={{
                  animation: 'glowPulse 3s ease-in-out infinite',
                  boxShadow: '0 0 8px #4a6741, 0 0 16px #4a6741, 0 0 32px rgba(74, 103, 65, 0.3)',
                }}>
                <div className="flex flex-col items-center gap-1">
                  <item.icon size={32} className="text-[#4a6741]/40 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs text-stone-400">Add image</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-[#4a6741] transition-colors duration-200">
                {item.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#4a6741] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
