import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rating } from '@/components/ui/rating';
import { Testimonial } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const { text, author, location, rating } = testimonial;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card className="bg-[#F9F5F0] rounded-xl">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Rating value={rating} readOnly />
        </div>
        
        <p className="mb-4 italic">{text}</p>
        
        <div className="flex items-center">
          <Avatar className="mr-3 h-10 w-10 bg-gray-300">
            <AvatarFallback>{getInitials(author)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{author}</h4>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
