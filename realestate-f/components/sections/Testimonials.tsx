'use client';

import { useState } from 'react';

export default function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Michael Otieno',
      role: 'Diaspora Client, USA',
      image: '/api/placeholder/80/80',
      content: 'As a Kenyan living in the US, I was hesitant about buying property back home. KenyaPrime made the process seamless with their virtual tours and excellent legal support. I now own a beautiful apartment in Nairobi!',
      rating: 5
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Investor, UK',
      image: '/api/placeholder/80/80',
      content: 'The team at KenyaPrime understood exactly what I was looking for. They found me a perfect investment property in Mombasa that has already appreciated significantly. Highly recommend their services!',
      rating: 5
    },
    {
      id: 3,
      name: 'David & Grace Mwangi',
      role: 'Local Clients, Nairobi',
      image: '/api/placeholder/80/80',
      content: 'From the initial consultation to the final handover, KenyaPrime provided exceptional service. Their attention to detail and market knowledge helped us secure our dream family home in Karen.',
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Client Experiences
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Hear from our satisfied clients who have found their dream properties through KenyaPrime.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          {/* Active Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex items-start gap-6">
              {/* Client Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {renderStars(testimonials[activeTestimonial].rating)}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg md:text-xl text-gray-200 mb-6 leading-relaxed italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>

                {/* Client Info */}
                <div>
                  <div className="font-semibold text-white text-lg">
                    {testimonials[activeTestimonial].name}
                  </div>
                  <div className="text-cyan-400">
                    {testimonials[activeTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial 
                    ? 'bg-cyan-400 w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '⭐', label: 'Google Reviews' },
            { icon: '🏆', label: 'Award Winning' },
            { icon: '🔒', label: 'Secure Transactions' },
            { icon: '💬', label: '24/7 Support' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-gray-300 font-medium text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}