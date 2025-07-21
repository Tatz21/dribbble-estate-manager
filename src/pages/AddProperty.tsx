import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePropertyTypes, useCreateProperty, useProfile } from '@/hooks/useSupabaseQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function AddProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: propertyTypes = [] } = usePropertyTypes();
  const createProperty = useCreateProperty();
  
  const [formData, setFormData] = useState({
    title: '',
    property_type_id: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    description: '',
    features: [],
    images: []
  });

  const [featureInput, setFeatureInput] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const uploadImages = async (files) => {
    if (!files.length) return [];
    
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `properties/${fileName}`;

      const { error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to add a property.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload images first
      const uploadedImageUrls = await uploadImages(imageFiles);
      const propertyData = {
        title: formData.title,
        property_type_id: formData.property_type_id,
        price: parseFloat(formData.price),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? parseFloat(formData.square_feet) : null,
        description: formData.description,
        features: formData.features,
        images: uploadedImageUrls,
        agent_id: profile.id,
        status: 'available'
      };

      await createProperty.mutateAsync(propertyData);
      
      toast({
        title: "Property added successfully",
        description: "The property has been added to your listings.",
      });
      
      navigate('/properties');
    } catch (error) {
      console.error('Error adding property:', error);
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('Files selected:', files.length);
    
    if (files.length === 0) return;
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Please select only image files.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file sizes (max 5MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Files too large",
        description: "Please select images smaller than 5MB each.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Adding files to state:', validFiles.length);
    setImageFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      console.log('Total files after update:', newFiles.length);
      return newFiles;
    });
    
    // Clear the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    console.log('Removing image at index:', index);
    setImageFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('Files after removal:', newFiles.length);
      return newFiles;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/properties">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Property</h1>
            <p className="text-muted-foreground mt-1">
              Create a new property listing
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Luxury 3BHK in Bandra West"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="property_type_id">Property Type *</Label>
                  <select
                    id="property_type_id"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.property_type_id}
                    onChange={(e) => setFormData({...formData, property_type_id: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 25000000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    placeholder="400050"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="square_feet">Area (sq ft)</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    placeholder="e.g., 1200"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({...formData, square_feet: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property features, location benefits, etc."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add feature (e.g., Swimming Pool, Gym, Parking)"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Choose images to upload (Max 5MB each)
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Selected: {imageFiles.length} files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
              
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 justify-end">
            <Link to="/properties">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="btn-gradient" disabled={uploading}>
              {uploading ? 'Adding Property...' : 'Add Property'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}