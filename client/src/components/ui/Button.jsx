import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', isLoading, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[48px] px-4 py-2 break-words leading-tight";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-teal/90 focus:ring-brand",
    danger: "bg-danger text-white hover:bg-danger/90 focus:ring-danger",
    outline: "border-2 border-gray-200 text-gray-900 hover:bg-gray-50 focus:ring-gray-200",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
