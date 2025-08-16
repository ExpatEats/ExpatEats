import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import SearchForm from '@/components/forms/SearchForm';
import PlaceCard from '@/components/places/PlaceCard';
import UploadForm from '@/components/forms/UploadForm';
import { SubmissionForm } from '@/components/SubmissionForm';
import { Place } from '@/lib/types';
import { Camera, Utensils, Filter, MapPin } from 'lucide-react';

const Discover: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const category = params.get('category');
    
    if (city) setSelectedCity(city);
    if (category) setSelectedCategory(category);
  }, [location]);
  
  // Construct API query params
  const queryParams = new URLSearchParams();
  if (selectedCity) queryParams.set('city', selectedCity);
  if (selectedCategory) queryParams.set('category', selectedCategory);
  if (selectedTags.length > 0) queryParams.set('tags', selectedTags.join(','));
  
  // Fetch places based on filters
  const { data: places = [], isLoading, isError } = useQuery<Place[]>({
    queryKey: [`/api/places?${queryParams.toString()}`],
    enabled: !!(selectedCity || selectedCategory || selectedTags.length > 0),
  });
  
  const handleSearch = (city: string) => {
    setSelectedCity(city);
  };
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSelectedCity('');
    setSelectedCategory('');
    setSelectedTags([]);
  };
  
  const dietaryTags = [
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'gluten-free', label: 'Gluten-Free' },
    { id: 'organic', label: 'Organic' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' }
  ];
  
  const cuisineTags = [
    { id: 'asian', label: 'Asian' },
    { id: 'european', label: 'European' },
    { id: 'middle-eastern', label: 'Middle Eastern' },
    { id: 'african', label: 'African' },
    { id: 'latin', label: 'Latin American' },
    { id: 'american', label: 'North American' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="font-montserrat text-3xl font-bold">Discover Food Places</h1>
        <SubmissionForm 
          type="location" 
          buttonClassName="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white mt-4 sm:mt-0"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Filters sidebar - desktop */}
        <div className="hidden lg:block col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>
              
              {/* Location filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Location</h4>
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p className="text-sm">
                    {selectedCity ? selectedCity : 'All locations'}
                  </p>
                </div>
              </div>
              
              {/* Category filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Category</h4>
                <div className="space-y-2">
                  {['market', 'restaurant', 'grocery', 'community'].map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox 
                        id={`category-${category}`}
                        checked={selectedCategory === category}
                        onCheckedChange={() => 
                          setSelectedCategory(prev => prev === category ? '' : category)
                        }
                      />
                      <Label 
                        htmlFor={`category-${category}`}
                        className="ml-2 text-sm capitalize"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dietary preferences */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Dietary Preferences</h4>
                <div className="space-y-2">
                  {dietaryTags.map((tag) => (
                    <div key={tag.id} className="flex items-center">
                      <Checkbox 
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label 
                        htmlFor={`tag-${tag.id}`}
                        className="ml-2 text-sm"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Cuisine types */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Cuisine</h4>
                <div className="space-y-2">
                  {cuisineTags.map((tag) => (
                    <div key={tag.id} className="flex items-center">
                      <Checkbox 
                        id={`cuisine-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label 
                        htmlFor={`cuisine-${tag.id}`}
                        className="ml-2 text-sm"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          {/* Search and filter controls */}
          <div className="mb-6">
            <SearchForm onSearch={handleSearch} />
            
            {/* Mobile filter toggle */}
            <div className="flex justify-between items-center mt-4 lg:hidden">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
              
              {(selectedCity || selectedCategory || selectedTags.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Mobile filters panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md lg:hidden">
                {/* Category filter */}
                <h4 className="font-medium mb-2">Category</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['market', 'restaurant', 'grocery', 'community'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="capitalize"
                      onClick={() => 
                        setSelectedCategory(prev => prev === category ? '' : category)
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Dietary preferences */}
                <h4 className="font-medium mb-2">Dietary Preferences</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dietaryTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.label}
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Cuisine types */}
                <h4 className="font-medium mb-2">Cuisine</h4>
                <div className="flex flex-wrap gap-2">
                  {cuisineTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="places" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="places" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Browse Places
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Add New Place
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="places">
              {/* Results or loading state */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <div className="h-48 rounded-t-lg">
                        <Skeleton className="h-full w-full rounded-t-lg" />
                      </div>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-3" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 mb-4">Failed to load places. Please try again.</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : places.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No places found</h3>
                  {selectedCity || selectedCategory || selectedTags.length > 0 ? (
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or add a new place to our database.
                    </p>
                  ) : (
                    <p className="text-gray-600 mb-4">
                      Search for a city or select a category to find food places.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <PlaceCard 
                      key={place.id} 
                      place={place} 
                      onClick={() => {
                        toast({
                          title: "Place details",
                          description: `View details for ${place.name}`,
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upload">
              <div className="max-w-2xl mx-auto">
                <p className="text-lg mb-6">
                  Help our expat community by adding a new food place you've discovered. Your contributions make it easier for others to find authentic food and ingredients from home.
                </p>
                
                <UploadForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Discover;
