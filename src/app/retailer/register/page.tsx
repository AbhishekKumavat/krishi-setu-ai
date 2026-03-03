'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin, Phone, Store, Image as ImageIcon } from 'lucide-react';
import { addRetailer } from '@/app/retailer/data-service';

export default function RetailerRegistration() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image/jpeg|image/png|image/webp')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPG, PNG, or WEBP image.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setImage(file);
      setImageName(file.name);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !location.trim() || !contact.trim() || !image) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields and upload an image.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real application, you would send this data to your backend
      // For this demo, we'll store the new retailer in localStorage
      
      // Create a new retailer object
      const newRetailer = {
        id: `reg_${Date.now()}`, // Generate a unique ID
        name: name.trim(),
        image: `/retailers/${image.name}`, // This would be the actual image path in a real app
        location: location.trim(),
        mapsLink: `https://maps.app.goo.gl/${encodeURIComponent(location)}`, // Generate a map link
        iframeLink: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${Math.floor(Math.random() * 10000)}!2d${75.5 + Math.random() * 0.1}!3d${20.9 + Math.random() * 0.1}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd90efe7bb9db4b%3A0x6243ab3d8b3b16b1!2s${encodeURIComponent(name.trim())}!5e0!3m2!1sen!2sin!4v${Date.now()}`, // Simulated iframe link
        rating: 4.0, // Initial rating
        reviewsCount: 0,
        contact: contact.trim(),
        verified: false, // New registrations are not verified initially
        stock: [], // Start with empty stock
      };

      // Add the new retailer using the data service
      await addRetailer({
        id: newRetailer.id,
        name: newRetailer.name,
        image: newRetailer.image,
        location: newRetailer.location,
        mapsLink: newRetailer.mapsLink,
        iframeLink: newRetailer.iframeLink,
        rating: newRetailer.rating,
        reviewsCount: newRetailer.reviewsCount,
        contact: newRetailer.contact,
        verified: newRetailer.verified,
        stock: newRetailer.stock,
      });
      
      toast({
        title: 'Registration Successful!',
        description: 'Your retailer account has been created. Our team will verify your information shortly.',
      });

      // Reset form
      setName('');
      setLocation('');
      setContact('');
      setImage(null);
      setImageName('');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Redirect to retailer dashboard or marketplace
      setTimeout(() => {
        router.push('/retailer');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'There was an error registering your retailer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Store className="w-6 h-6" />
              Register as Retailer
            </CardTitle>
            <CardDescription className="text-green-100">
              Join our retailer marketplace to reach more customers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Store Name *</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Store className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your store name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Store Location *</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Enter your store address/location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="contact"
                      type="tel"
                      placeholder="Enter your contact number"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Store Image *</Label>
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 transition-colors"
                      onClick={triggerFileInput}
                    >
                      {previewUrl ? (
                        <div className="space-y-3">
                          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-green-200">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-gray-600 truncate">{imageName}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="mx-auto h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG, or WEBP (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Register as Retailer'
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Your registration will be reviewed by our team</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Once approved, your store will appear in the marketplace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>You can manage your inventory and customer interactions through your dashboard</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}