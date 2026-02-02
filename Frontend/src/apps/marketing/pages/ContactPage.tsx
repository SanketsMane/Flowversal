/**
 * Contact Page
 * Contact information and form
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { MarketingRoute } from '../MarketingApp';
import { useTheme } from '@/core/theme/ThemeContext';

interface ContactPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'info@flowversal.com',
      description: 'Our team will respond within 24 hours',
      href: 'mailto:info@flowversal.com',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+91 97194 30007',
      description: 'Mon-Fri from 9am to 6pm IST',
      href: 'tel:+919719430007',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: 'India',
      description: 'Schedule an appointment first',
      href: '#',
      gradient: 'from-cyan-500 to-teal-500',
    },
  ];

  const faqs = [
    {
      question: 'What is your response time?',
      answer: 'We typically respond to all inquiries within 24 hours during business days.',
    },
    {
      question: 'Do you offer technical support?',
      answer: 'Yes! We provide comprehensive technical support to all our customers via email and chat.',
    },
    {
      question: 'Can I schedule a demo?',
      answer: 'Absolutely! Contact us to schedule a personalized demo of Flowversal.',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className={`mb-6 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              <MessageSquare className="w-3 h-3 mr-1" />
              Get in Touch
            </Badge>
            
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Let's Start a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            
            <p className={`text-lg sm:text-xl leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 transition-all group text-center border ${
                    theme === 'dark'
                      ? 'bg-[#1A1A2E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{method.title}</h3>
                  <a
                    href={method.href}
                    className="text-blue-400 hover:text-blue-300 transition-colors block mb-2 cursor-pointer"
                  >
                    {method.value}
                  </a>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{method.description}</p>
                </Card>
              );
            })}
          </div>

          {/* Contact Form & Info */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className={`p-8 border ${
                theme === 'dark'
                  ? 'bg-[#1A1A2E] border-white/10'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h2 className={`text-2xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Send us a Message</h2>
                
                {submitted ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Message Sent!</h3>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>We'll get back to you as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors ${
                            theme === 'dark'
                              ? 'bg-[#0E0E1F] border-white/10 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors ${
                            theme === 'dark'
                              ? 'bg-[#0E0E1F] border-white/10 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors ${
                            theme === 'dark'
                              ? 'bg-[#0E0E1F] border-white/10 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Subject *
                        </label>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors ${
                            theme === 'dark'
                              ? 'bg-[#0E0E1F] border-white/10 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="">Select a subject</option>
                          <option value="sales">Sales Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="demo">Request a Demo</option>
                          <option value="partnership">Partnership</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Message *
                      </label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={6}
                        className={`w-full border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors resize-none ${
                          theme === 'dark'
                            ? 'bg-[#0E0E1F] border-white/10 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 text-lg py-6 cursor-pointer"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* FAQ Sidebar */}
            <div className="space-y-6">
              <Card className={`p-6 border ${
                theme === 'dark'
                  ? 'bg-[#1A1A2E] border-white/10'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Business Hours</h3>
                </div>
                <div className={`space-y-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>9am - 6pm IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>10am - 4pm IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-gray-500">Closed</span>
                  </div>
                </div>
              </Card>

              <Card className={`p-6 border ${
                theme === 'dark'
                  ? 'bg-[#1A1A2E] border-white/10'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Quick FAQs</h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index}>
                      <h4 className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{faq.question}</h4>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};