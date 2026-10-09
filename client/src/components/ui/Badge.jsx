import React from 'react';

export const Badge = ({ children, variant = 'gray', className = '', ...props }) => {
  const variants = {
    gray: "bg-gray-100 text-gray-800",
    danger: "bg-danger/10 text-danger",
    warn: "bg-warn/10 text-warn-dark", // Assuming warn text needs to be darker
    safe: "bg-safe/10 text-safe",
    brand: "bg-brand/10 text-brand-dark"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
