const slots = ['09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00'];

export default function Booking() {
  return (
    <section id="booking" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-olive-600 text-sm font-semibold tracking-[0.3em] uppercase mb-3">Reserve Your Court</p>
          <h2 className="text-4xl font-bold text-stone-800">Book a Padel Court</h2>
          <div className="w-16 h-1 bg-olive-600 rounded-full mx-auto mt-4" />
        </div>
        <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Court</label>
              <div className="grid grid-cols-2 gap-3">
                {['Court 1','Court 2'].map((c) => (
                  <button key={c} className="py-3 rounded-xl font-semibold border-2 border-stone-200 hover:border-olive-600 hover:bg-olive-600 hover:text-white transition-all">{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-2">Players</label>
              <div className="grid grid-cols-2 gap-3">
                {['2 Players','4 Players'].map((p) => (
                  <button key={p} className="py-3 rounded-xl font-semibold border-2 border-stone-200 hover:border-olive-600 hover:bg-olive-600 hover:text-white transition-all">{p}</button>
                ))}
              </div>
            </div>
          </div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Available Time Slots</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
            {slots.map((s) => (
              <button key={s} className="py-2 rounded-lg text-sm font-medium border-2 border-stone-200 hover:border-olive-600 hover:bg-olive-600 hover:text-white transition-all">{s}</button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-stone-200">
            <p className="text-sm text-stone-500">90 minutes · $24 total</p>
            <button className="bg-olive-600 hover:bg-olive-700 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105">Confirm Booking</button>
          </div>
        </div>
      </div>
    </section>
  );
}
