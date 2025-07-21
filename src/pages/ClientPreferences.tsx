import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, X, Search, Heart, MapPin, Home, DollarSign, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClients } from '@/hooks/useSupabaseQuery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function ClientPreferences() {
  const { toast } = useToast();
  const { data: clients = [], isLoading, refetch } = useClients();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [preferences, setPreferences] = useState({
    preferred_locations: [],
    budget_min: 0,
    budget_max: 10000000,
    property_types: [],
    bedrooms: [1, 5],
    bathrooms: [1, 4],
    amenities: [],
    notes: ''
  });

  const [newLocation, setNewLocation] = useState('');
  const [newAmenity, setNewAmenity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const propertyTypes = [
    'Apartment', 'House', 'Villa', 'Studio', 'Penthouse', 'Duplex', 'Office', 'Retail', 'Warehouse'
  ];

  const commonAmenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Balcony', 
    'Air Conditioning', 'Elevator', 'Wifi', 'Furnished', 'Pet Friendly'
  ];

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = async (clientId: string) => {
    setSelectedClient(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setPreferences({
        preferred_locations: client.preferred_locations || [],
        budget_min: client.budget_min || 0,
        budget_max: client.budget_max || 10000000,
        property_types: [],
        bedrooms: [1, 5],
        bathrooms: [1, 4],
        amenities: [],
        notes: client.notes || ''
      });
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !preferences.preferred_locations.includes(newLocation.trim())) {
      setPreferences(prev => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((_, i) => i !== index)
    }));
  };

  const togglePropertyType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      property_types: prev.property_types.includes(type)
        ? prev.property_types.filter(t => t !== type)
        : [...prev.property_types, type]
    }));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !preferences.amenities.includes(newAmenity.trim())) {
      setPreferences(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const removeAmenity = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleSavePreferences = async () => {
    if (!selectedClient) {
      toast({
        title: "No client selected",
        description: "Please select a client to update preferences.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          preferred_locations: preferences.preferred_locations,
          budget_min: preferences.budget_min,
          budget_max: preferences.budget_max,
          notes: preferences.notes
        })
        .eq('id', selectedClient);

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: "Client preferences have been successfully updated.",
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update client preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Preferences</h1>
            <p className="text-muted-foreground mt-1">Loading client data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Preferences</h1>
              <p className="text-muted-foreground mt-1">
                Manage detailed client property preferences and requirements
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Selection */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Select Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedClient === client.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleClientSelect(client.id)}
                  >
                    <div className="font-medium">{client.full_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{client.client_type}</div>
                    {client.email && (
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedClient ? (
              <Card className="card-modern">
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Client Selected</h3>
                    <p className="text-muted-foreground">Select a client from the left panel to manage their preferences</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Location Preferences */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add preferred location (e.g., Bandra, Worli)"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                      />
                      <Button type="button" onClick={addLocation}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferred_locations.map((location, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {location}
                          <button
                            type="button"
                            onClick={() => removeLocation(index)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Range */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Budget Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                        <Input
                          id="budget_min"
                          type="number"
                          value={preferences.budget_min}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            budget_min: parseInt(e.target.value) || 0
                          }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                        <Input
                          id="budget_max"
                          type="number"
                          value={preferences.budget_max}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            budget_max: parseInt(e.target.value) || 0
                          }))}
                          placeholder="10000000"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm font-medium">
                        Budget Range: ₹{preferences.budget_min?.toLocaleString()} - ₹{preferences.budget_max?.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Types */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Property Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {propertyTypes.map((type) => (
                        <Button
                          key={type}
                          variant={preferences.property_types.includes(type) ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePropertyType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Room Requirements */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Room Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Bedrooms: {preferences.bedrooms[0]} - {preferences.bedrooms[1]}</Label>
                      <Slider
                        value={preferences.bedrooms}
                        onValueChange={(value) => setPreferences(prev => ({
                          ...prev,
                          bedrooms: value
                        }))}
                        max={10}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Bathrooms: {preferences.bathrooms[0]} - {preferences.bathrooms[1]}</Label>
                      <Slider
                        value={preferences.bathrooms}
                        onValueChange={(value) => setPreferences(prev => ({
                          ...prev,
                          bathrooms: value
                        }))}
                        max={6}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Preferred Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {commonAmenities.map((amenity) => (
                        <Button
                          key={amenity}
                          variant={preferences.amenities.includes(amenity) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleAmenity(amenity)}
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" onClick={addAmenity}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {preferences.amenities.filter(a => !commonAmenities.includes(a)).length > 0 && (
                      <div className="space-y-2">
                        <Label>Custom Amenities:</Label>
                        <div className="flex flex-wrap gap-2">
                          {preferences.amenities.filter(a => !commonAmenities.includes(a)).map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {amenity}
                              <button
                                type="button"
                                onClick={() => removeAmenity(preferences.amenities.indexOf(amenity))}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Any specific requirements, preferences, or notes about the client's property needs..."
                      value={preferences.notes}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSavePreferences} 
                    disabled={isUpdating}
                    className="btn-gradient"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}