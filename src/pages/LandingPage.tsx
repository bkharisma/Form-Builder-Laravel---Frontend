import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a3a5c] tracking-tight mb-4">
          Welcome to Kopega
        </h1>
        <p className="text-lg text-[#525252] mb-8">
          Dynamic Form Builder — Create, manage, and analyze forms with ease.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-[#1a3a5c] text-white font-semibold text-base hover:bg-[#2b5a8a] transition-colors shadow-sm"
        >
          Sign In
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
