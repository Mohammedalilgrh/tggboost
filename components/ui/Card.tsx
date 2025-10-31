
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      {title && (
        <div className="flex items-center mb-4">
            {icon && <span className="mr-3 text-blue-400">{icon}</span>}
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
