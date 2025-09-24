import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, UserPlus } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const location = useLocation();

  const isActive = (path: string): boolean => location.pathname === path;

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Search functionality can be implemented here
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Educamp</h1>
              <p className="text-xs text-emerald-600">Vidura Higher Education</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-600 ${
                isActive('/') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/subjects"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-600 ${
                isActive('/subjects') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700'
              }`}
            >
              Subjects
            </Link>
            <Link
              to="/teachers"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-600 ${
                isActive('/teachers') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700'
              }`}
            >
              Teachers
            </Link>
            <Link
              to="/classes"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-emerald-600 ${
                isActive('/classes') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-700'
              }`}
            >
              Classes
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Auth Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-1 px-4 py-2 text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-slate-700 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/subjects"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Subjects
            </Link>
            <Link
              to="/teachers"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Teachers
            </Link>
            <Link
              to="/classes"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Classes
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/help"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Help
            </Link>
            <Link
              to="/enroll"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Enroll
            </Link>
            <div className="border-t border-slate-200 pt-4 pb-3">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
