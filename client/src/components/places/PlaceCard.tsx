import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { MapPin, Clock, Store, ImageOff } from 'lucide-react';
import { Place } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
  const { name, description, address, city, category, imageUrl, averageRating, tags } = place;
  const [imageError, setImageError] = useState(false);
  
  // If the imageUrl is a placeholder URL, don't use it
  const useImageUrl = imageUrl && !imageUrl.includes('placeholder.com') ? imageUrl : null;
  
  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
      case 'market':
        return 'bg-primary/10 text-primary';
      case 'restaurant':
        return 'bg-secondary/10 text-secondary';
      case 'grocery':
        return 'bg-accent/10 text-accent';
      case 'supermarket':
        return 'bg-green-500/10 text-green-700';
      case 'health food store':
        return 'bg-blue-500/10 text-blue-700';
      case 'bakery':
        return 'bg-orange-500/10 text-orange-700';
      case 'bulk store':
        return 'bg-purple-500/10 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categoryColor = getCategoryColor(category);
  
  const getCategoryBg = (category: string) => {
    switch(category.toLowerCase()) {
      case 'market':
        return 'from-green-500 to-blue-500';
      case 'restaurant':
        return 'from-orange-400 to-red-500';
      case 'grocery':
      case 'grocery store':
        return 'from-teal-500 to-green-500';
      case 'supermarket':
        return 'from-[#6D9075] to-emerald-500';
      case 'health food store':
        return 'from-[#6D9075] to-[#E8B4B8]';
      case 'bakery':
        return 'from-amber-400 to-orange-500';
      case 'bulk store':
        return 'from-purple-400 to-indigo-500';
      default:
        return 'from-[#6D9075] to-[#E8B4B8]';
    }
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <div className="absolute inset-0">
          {useImageUrl && !imageError ? (
            <div className="h-full w-full">
              <img 
                src={useImageUrl} 
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${getCategoryBg(category)} flex items-center justify-center`}>
              <div className="flex flex-col items-center justify-center text-white">
                <Store className="w-10 h-10 mb-2" />
                <span className="text-3xl font-bold">{name.substring(0, 1).toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={categoryColor}>
            {category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-montserrat font-semibold text-lg">{name}</h3>
          {averageRating && (
            <Rating value={averageRating} readOnly size="sm" />
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{address}, {city}</span>
        </div>
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
