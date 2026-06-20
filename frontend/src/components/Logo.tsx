import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const IconLogo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer loop 1 */}
      <rect
        x="3"
        y="8"
        width="10"
        height="6"
        rx="3"
        transform="rotate(-45 3 8)"
        stroke="#4F46E5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Outer loop 2 */}
      <rect
        x="10"
        y="15"
        width="10"
        height="6"
        rx="3"
        transform="rotate(-45 10 15)"
        stroke="#06B6D4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Connection link/s-curve */}
      <path
        d="M9 9L15 15"
        stroke="#4F46E5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const FullLogo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <IconLogo size={size} />
      <span className="font-extrabold tracking-tight text-text-primary text-xl select-none">
        Short<span className="text-brand-primary">nr</span>
      </span>
    </div>
  );
};

export const NavbarLogo: React.FC<LogoProps> = ({ className = '', size = 28 }) => {
  return <FullLogo className={className} size={size} />;
};
