import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center px-6 py-2.5 border text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5";
  
  const variants = {
    primary: "border-transparent text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 focus:ring-violet-500",
    secondary: "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:text-violet-700 focus:ring-violet-500",
    danger: "border-transparent text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-500",
    success: "border-transparent text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:ring-emerald-500",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Memproses...
        </>
      ) : children}
    </button>
  );
};