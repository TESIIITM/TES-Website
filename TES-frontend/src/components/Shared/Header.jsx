import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-base/80 backdrop-blur-md border-b border-surface">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-3 group">
          {/* Drop your logo.png into the 'public' folder */}
          <img 
                        src="/teslogo-nobg-text-white.png"            alt="TES Logo" 
            className="w-20 h-10 object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
            /* Fallback block if the image isn't added yet */
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </Link>

        {/* Navigation Links */}
        <div className="hidden sm:flex items-center gap-8 font-bold text-sm text-text-muted">
          <Link to="/about" className="hover:text-lavender transition-colors">About</Link>
          <Link to="/articles" className="hover:text-flamingo transition-colors">Articles</Link>
          {/* Prominent CTA Button for Join */}
        </div>
        
      </nav>
    </header>
  );
}
