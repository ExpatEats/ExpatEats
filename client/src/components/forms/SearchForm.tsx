import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface SearchFormProps {
  onSearch: (city: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const { toast } = useToast();
  
  // Get featured cities
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/cities'],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location);
    } else {
      toast({
        title: "Please enter a location",
        description: "Enter a city name to find food places",
        variant: "destructive",
      });
    }
  };
  
  const handleCityClick = (city: string) => {
    setLocation(city);
    onSearch(city);
  };
  
  const handleVisualSearch = () => {
    toast({
      title: "Visual Search",
      description: "This feature is coming soon!",
      variant: "default",
    });
  };
  
  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h3 className="font-montserrat text-xl font-semibold mb-4">Location-Based Search</h3>
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your location"
                className="w-full border border-gray-300 rounded-lg py-6 pl-10 pr-12"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <MapPin className="absolute left-3 top-3.5 text-gray-400" />
              {location && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-800"
                  onClick={() => setLocation('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-medium"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button
              type="button"
              className="w-full md:w-auto bg-secondary hover:bg-secondary/90 text-white py-3 px-6 rounded-lg font-medium"
              onClick={handleVisualSearch}
            >
              <Camera className="mr-2 h-4 w-4" />
              Visual
            </Button>
          </div>
        </div>
      </form>
      <div className="mt-4">
        <span className="text-sm text-gray-500">Popular cities:</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {cities.length > 0 ? (
            cities.map((city: any) => (
              <Badge 
                key={city.id}
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick(city.name)}
              >
                {city.name}
              </Badge>
            ))
          ) : (
            <>
              <Badge 
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick('Lisbon')}
              >
                Lisbon
              </Badge>
              <Badge 
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick('Barcelona')}
              >
                Barcelona
              </Badge>
              <Badge 
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick('Berlin')}
              >
                Berlin
              </Badge>
              <Badge 
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick('Amsterdam')}
              >
                Amsterdam
              </Badge>
              <Badge 
                className="bg-[#F9F5F0] hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer"
                onClick={() => handleCityClick('London')}
              >
                London
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
