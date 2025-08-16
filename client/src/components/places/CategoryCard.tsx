import React from 'react';
import { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const { name, icon, description } = category;
  
  const getCategoryColor = (categoryName: string) => {
    switch(categoryName.toLowerCase()) {
      case 'international markets':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'restaurants':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'grocery stores':
        return 'bg-accent bg-opacity-10 text-accent';
      case 'expat groups':
        return 'bg-primary bg-opacity-10 text-primary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const colorClass = getCategoryColor(name);
  
  return (
    <div 
      className="bg-white rounded-xl card-shadow p-4 text-center hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${colorClass}`}>
        <i className={`${icon} text-2xl`}></i>
      </div>
      <h3 className="font-montserrat font-semibold">{name}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
};

export default CategoryCard;
