// app/(main)/valuation/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { propertyAPI } from '@/lib/api/properties';
import { Calculator, MapPin, Home, DollarSign, ArrowRight, Loader2 } from 'lucide-react';

interface ValuationResult {
  location: string;
  size: number;
  estimated_value: number;
  price_per_sqm: number;
  comparable_count: number;
  currency: string;
}

export default function ValuationPage() {
  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch available locations for dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await propertyAPI.getLocations();
        const locationNames = response.data.map((loc: any) => loc.name);
        setLocations(locationNames);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await propertyAPI.getValuation(location, parseInt(size));
      setResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(err.response.data?.error || 'No comparable properties found in this location.');
      } else if (err.response?.data) {
        // Show validation errors
        const errors = Object.values(err.response.data).flat().join(', ');
        setError(errors);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Valuation Calculator</h1>
          <p className="text-lg text-gray-600">
            Get an instant property value estimate based on comparable properties in Kenya
          </p>
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Westlands, Kilimani, Karen"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  list="location-options"
                  required
                />
                <datalist id="location-options">
                  {locations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
                <p className="mt-1 text-sm text-gray-500">
                  Enter a location in Kenya (Nairobi, Mombasa, Kisumu, etc.)
                </p>
              </div>

              {/* Property Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  Property Size (sq ft)
                </label>
                <input
                  type="number"
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g., 1200"
                  min="1"
                  max="100000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the total floor area in square feet
                </p>
              </div>
            </div>

            {/* Property Type (Optional) */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type (Optional)
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="apartment">Apartment</option>
                <option value="bungalow">Bungalow</option>
                <option value="mansion">Mansion</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="plot">Plot / Land</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office Space</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !location || !size}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Get Valuation
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Try a different location or check the spelling.</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Estimated Property Value</h2>
              </div>
              <div className="text-5xl font-bold mt-4">
                {formatCurrency(result.estimated_value)}
              </div>
              <p className="mt-2 text-blue-100">
                Based on {result.comparable_count} comparable property{result.comparable_count !== 1 ? 'ies' : ''} in {result.location}
              </p>
            </div>

            {/* Result Details */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Price per sqm */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-gray-500 text-sm mb-1">Price per sqm</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(result.price_per_sqm)}
                  </div>
                </div>

                {/* Property Size */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-gray-500 text-sm mb-1">Your Property Size</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.size.toLocaleString()} sq ft
                  </div>
                </div>

                {/* Comparables */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="text-gray-500 text-sm mb-1">Comparable Properties</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.comparable_count}
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is an estimate based on comparable properties in the same area. 
                  Actual property value may vary based on condition, amenities, market conditions, and other factors. 
                  For a professional valuation, please contact a certified property valuer.
                </p>
              </div>

              {/* Call to Action */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/properties"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 border border-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Contact an Agent
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-600 text-sm">
              We analyze recent property sales in your area and calculate the average price per square meter to estimate your property's value.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Estimate</h3>
            <p className="text-gray-600 text-sm">
              This service is completely free. Get instant property value estimates without any obligation or contact information required.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Kenya Market Data</h3>
            <p className="text-gray-600 text-sm">
              Our valuation uses real data from properties across Kenya, including Nairobi, Mombasa, Kisumu, and other major cities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}