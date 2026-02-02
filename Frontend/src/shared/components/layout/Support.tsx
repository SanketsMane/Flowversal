import { Mail, MessageSquare, Send, Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

export function Support() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className={`min-h-screen ${bgMain} pt-20 pb-12 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl mb-4 ${textPrimary}`}>Support Center</h1>
          <p className={`text-lg ${textSecondary}`}>
            Need help? We're here for you 24/7
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#00C6FF]" />
              </div>
              <h3 className={`text-xl mb-2 ${textPrimary}`}>Email Support</h3>
              <p className={`${textSecondary} mb-4 text-sm`}>
                Get in touch with our support team
              </p>
              <a
                href="mailto:support@flowversal.com"
                className="text-[#00C6FF] hover:text-[#0072FF] transition-colors break-all"
              >
                support@flowversal.com
              </a>
            </div>

            {/* Live Chat Card */}
            <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-[#00C6FF]" />
              </div>
              <h3 className={`text-xl mb-2 ${textPrimary}`}>Live Chat</h3>
              <p className={`${textSecondary} mb-4 text-sm`}>
                Chat with our support team in real-time
              </p>
              <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105">
                <span className="text-center">Start Chat</span>
              </button>
            </div>

            {/* Hours Card */}
            <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#00C6FF]" />
              </div>
              <h3 className={`text-xl mb-2 ${textPrimary}`}>Support Hours</h3>
              <div className={`${textSecondary} space-y-2 text-sm`}>
                <p>Monday - Friday: 9AM - 6PM EST</p>
                <p>Saturday: 10AM - 4PM EST</p>
                <p>Sunday: Closed</p>
                <p className="text-[#00C6FF] mt-3">Emergency support available 24/7</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#00C6FF]" />
              </div>
              <h3 className={`text-xl mb-2 ${textPrimary}`}>Location</h3>
              <p className={`${textSecondary} text-sm`}>
                Flowversal Inc.<br />
                123 Innovation Drive<br />
                San Francisco, CA 94102<br />
                United States
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className={`${bgCard} border ${borderColor} rounded-xl p-8`}>
              <h2 className={`text-2xl mb-6 ${textPrimary}`}>Send us a Message</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className={`text-xl mb-2 ${textPrimary}`}>Message Sent!</h3>
                  <p className={textSecondary}>
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block mb-2 ${textSecondary} text-sm`}>Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-3 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block mb-2 ${textSecondary} text-sm`}>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-3 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                        required
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className={`block mb-2 ${textSecondary} text-sm`}>Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help you?"
                      className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-3 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block mb-2 ${textSecondary} text-sm`}>Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-3 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all resize-none`}
                      required
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-center">Send Message</span>
                    </button>
                  </div>
                </form>
              )}

              {/* FAQ Section */}
              <div className="mt-12 pt-8 border-t ${borderColor}">
                <h3 className={`text-xl mb-4 ${textPrimary}`}>Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <details className={`${inputBg} border ${borderColor} rounded-lg p-4 cursor-pointer group`}>
                    <summary className={`${textPrimary} cursor-pointer list-none flex items-center justify-between`}>
                      <span>How do I create my first workflow?</span>
                      <span className="text-[#00C6FF] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className={`${textSecondary} mt-3 text-sm`}>
                      Click on "AI Apps" in the sidebar, choose a template or start from scratch, add AI agents, configure your workflow, and publish it.
                    </p>
                  </details>
                  <details className={`${inputBg} border ${borderColor} rounded-lg p-4 cursor-pointer group`}>
                    <summary className={`${textPrimary} cursor-pointer list-none flex items-center justify-between`}>
                      <span>What's included in the Pro plan?</span>
                      <span className="text-[#00C6FF] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className={`${textSecondary} mt-3 text-sm`}>
                      Unlimited workflows, projects, and AI agents, 10,000 executions/month, 500GB storage, advanced analytics, and priority support.
                    </p>
                  </details>
                  <details className={`${inputBg} border ${borderColor} rounded-lg p-4 cursor-pointer group`}>
                    <summary className={`${textPrimary} cursor-pointer list-none flex items-center justify-between`}>
                      <span>Can I integrate with external APIs?</span>
                      <span className="text-[#00C6FF] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className={`${textSecondary} mt-3 text-sm`}>
                      Yes! Plus and Pro plans include API access and custom integrations with your favorite tools and services.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
