import OlivaLogo from './OlivaLogo';

type Route = 'home' | 'menu';

export default function Footer({ navigate }: { navigate: (to: Route) => void }) {
  return (
    <footer id="contact" className="bg-stone-800 text-stone-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="mb-4"><OlivaLogo size={64} showText={false} /></div>
            <p className="text-sm leading-relaxed">From court to cup — your one-stop destination for padel, great coffee, and good times.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => navigate('menu')} className="hover:text-white transition-colors">Menu</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Beirut, Lebanon</li><li>+961 71 234 567</li><li>hello@oliva.com</li><li>Open daily · 9am – 11pm</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-700 text-center text-xs text-stone-500">© {new Date().getFullYear()} Oliva. From Court to Cup.</div>
      </div>
    </footer>
  );
}
