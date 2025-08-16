import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Calendar, MapPin, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Community: React.FC = () => {
  const { toast } = useToast();
  
  const handleJoinEvent = () => {
    toast({
      title: "Event Joined",
      description: "You have successfully joined this event.",
      variant: "default",
    });
  };
  
  const handleJoinGroup = () => {
    toast({
      title: "Group Joined",
      description: "You have successfully joined this group.",
      variant: "default",
    });
  };
  
  const upcomingEvents = [
    {
      id: 1,
      title: "International Food Festival",
      description: "Experience cuisines from around the world at this community-organized food festival.",
      date: "August 15, 2023",
      time: "12:00 PM - 8:00 PM",
      location: "Central Park, Lisbon",
      attendees: 48
    },
    {
      id: 2,
      title: "Thai Cooking Workshop",
      description: "Learn how to make authentic Thai dishes with Chef Niran. All ingredients provided.",
      date: "August 22, 2023",
      time: "6:00 PM - 9:00 PM",
      location: "Community Kitchen, Barcelona",
      attendees: 12
    },
    {
      id: 3,
      title: "Spice Market Tour",
      description: "Guided tour of the best spice shops and international markets in the city.",
      date: "August 28, 2023",
      time: "10:00 AM - 1:00 PM",
      location: "Old Market District, Berlin",
      attendees: 15
    }
  ];
  
  const communityGroups = [
    {
      id: 1,
      name: "Asian Food Enthusiasts",
      description: "A group for people who love Asian cuisine and want to share recipes, restaurant recommendations, and cooking tips.",
      members: 247,
      topics: ["Chinese", "Japanese", "Thai", "Vietnamese", "Korean"]
    },
    {
      id: 2,
      name: "Mediterranean Cooking",
      description: "Explore the healthy and delicious Mediterranean diet with fellow expats and locals.",
      members: 189,
      topics: ["Greek", "Italian", "Spanish", "Lebanese"]
    },
    {
      id: 3,
      name: "Vegetarian & Vegan Expats",
      description: "Finding plant-based options abroad can be challenging. Connect with others to share tips and recommendations.",
      members: 156,
      topics: ["Vegetarian", "Vegan", "Plant-based", "Organic"]
    }
  ];
  
  const discussionTopics = [
    {
      id: 1,
      title: "Where to find authentic Mexican ingredients in Lisbon?",
      author: "Maria G.",
      replies: 12,
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      title: "Best Asian supermarkets in Barcelona?",
      author: "Jin L.",
      replies: 8,
      lastActive: "5 hours ago"
    },
    {
      id: 3,
      title: "Recipe substitutions for hard-to-find ingredients",
      author: "Ahmed K.",
      replies: 24,
      lastActive: "1 day ago"
    },
    {
      id: 4,
      title: "Monthly potluck dinner - who's interested?",
      author: "Sophia T.",
      replies: 32,
      lastActive: "2 days ago"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-montserrat text-3xl font-bold mb-4">Join Our Global Food Community</h1>
          <p className="text-lg max-w-3xl mx-auto">
            Connect with fellow expatriates who share your passion for food. Attend events, join discussion groups, and share your culinary discoveries.
          </p>
        </div>
        
        <Tabs defaultValue="events" className="w-full mb-12">
          <TabsList className="mb-8 w-full justify-center">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community Groups
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discussions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <div className="grid gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-2/3">
                        <h3 className="font-montserrat text-xl font-semibold mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{event.date} • {event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{event.attendees} people attending</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/3 flex flex-col justify-center items-center">
                        <Button 
                          className="w-full md:w-auto bg-[#5A8D3B] hover:bg-[#5A8D3B]/90 rounded-full mb-2"
                          onClick={handleJoinEvent}
                        >
                          Join Event
                        </Button>
                        <Button variant="outline" className="w-full md:w-auto rounded-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="groups">
            <div className="grid md:grid-cols-2 gap-6">
              {communityGroups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="p-6">
                    <h3 className="font-montserrat text-xl font-semibold mb-2">{group.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.members} members</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{group.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 rounded-full"
                      onClick={handleJoinGroup}
                    >
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="discussions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discussionTopics.map((topic) => (
                    <div key={topic.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-montserrat text-lg font-medium">{topic.title}</h3>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <User className="h-3 w-3 mr-1" />
                            <span className="mr-4">{topic.author}</span>
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>{topic.replies} replies</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {topic.lastActive}
                        </div>
                      </div>
                      <div className="mt-3 flex">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarFallback>T</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 self-end ml-1">+{topic.replies - 3} more</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center mt-6">
              <Button className="bg-[#5A8D3B] hover:bg-[#5A8D3B]/90 rounded-full">
                Start a New Discussion
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-white rounded-xl card-shadow p-6 text-center">
          <h2 className="font-montserrat text-2xl font-bold mb-4">Share Your Food Journey</h2>
          <p className="mb-6 text-gray-600 max-w-3xl mx-auto">
            Contribute to our growing community by sharing your food discoveries, recipes, and experiences living abroad. Your knowledge helps other expats connect with the tastes of home.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-[#5A8D3B] hover:bg-[#5A8D3B]/90 rounded-full">
              Share a Recipe
            </Button>
            <Button className="bg-[#F5A623] hover:bg-[#F5A623]/90 rounded-full">
              Post a Food Story
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
