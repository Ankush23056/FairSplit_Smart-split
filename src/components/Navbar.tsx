import { Link } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-emerald-500 p-1.5 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">FairShare</span>
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
