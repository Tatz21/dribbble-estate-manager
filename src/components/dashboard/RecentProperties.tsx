import React from 'react';
import { MoreHorizontal, MapPin, Bed, Bath, Square, Eye, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const recentProperties = [
  {
    id: 1,
    title: "Luxury 3BHK Apartment",
    location: "Bandra West, Mumbai",
    price: "₹2.5 Cr",
    type: "Sale",
    bedrooms: 3,
    bathrooms: 2,
    area: "1450 sq ft",
    image: "photo-1721322800607-8c38375eef04",
    status: "Hot Deal",
    agent: "Rajesh Kumar",
    posted: "2 days ago"
  },
  {
    id: 2,
    title: "Modern 2BHK with Sea View",
    location: "Worli, Mumbai",
    price: "₹85,000/month",
    type: "Rent",
    bedrooms: 2,
    bathrooms: 2,
    area: "1200 sq ft",
    image: "photo-1487958449943-2429e8be8625",
    status: "Verified",
    agent: "Priya Sharma",
    posted: "1 day ago"
  },
  {
    id: 3,
    title: "Commercial Office Space",
    location: "Andheri East, Mumbai",
    price: "₹1.8 Cr",
    type: "Sale",
    bedrooms: 0,
    bathrooms: 2,
    area: "2000 sq ft",
    image: "photo-1551038247-3d9af20df552",
    status: "Recently Added",
    agent: "Amit Patel",
    posted: "3 hours ago"
  }
];

export function RecentProperties() {
  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Properties</span>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentProperties.map((property) => (
          <div key={property.id} className="group relative overflow-hidden rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300">
            <div className="flex gap-4 p-4">
              <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`https://images.unsplash.com/${property.image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {property.type}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm truncate">{property.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.location}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Property</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {property.bedrooms}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    {property.area}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{property.price}</span>
                    <Badge 
                      className={`text-xs ${
                        property.status === 'Hot Deal' ? 'status-hot' : 
                        property.status === 'Verified' ? 'status-verified' : 
                        'bg-blue-500/10 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {property.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Agent: {property.agent} • {property.posted}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}