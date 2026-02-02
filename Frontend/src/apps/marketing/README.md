# Flowversal Marketing Site

Complete public-facing marketing website for Flowversal, the AI workflow automation platform.

## 📁 Structure

```
/apps/marketing/
├── MarketingApp.tsx          # Main router component
├── index.ts                  # Entry point
├── components/
│   ├── MarketingNav.tsx      # Sticky navigation with gradient effect
│   └── MarketingFooter.tsx   # Footer with links and social media
└── pages/
    ├── LandingPage.tsx       # Homepage with hero, features, testimonials
    ├── PricingPage.tsx       # Subscription tiers (Free/Pro/Enterprise)
    ├── FeaturesPage.tsx      # Detailed product capabilities
    └── AboutPage.tsx         # Company story, mission, and team
```

## 🎨 Pages

### Landing Page (`/`)
- **Hero Section** - Gradient headline, CTA buttons, trust badges
- **Stats Section** - 50K+ workflows, 99.9% uptime, etc.
- **Features Grid** - 6 main features with icons and descriptions
- **Use Cases** - Customer support, content generation, data processing, lead management
- **Testimonials** - 3 customer quotes
- **Final CTA** - Get started for free

### Pricing Page (`/pricing`)
- **3 Pricing Tiers**:
  - **Free**: 100 runs/month, 5 workflows, basic features
  - **Pro**: $29/month, unlimited runs, all features, AI integrations
  - **Enterprise**: Custom pricing, dedicated support, SSO
- **Annual Billing Toggle** - Save 17% with annual plans
- **Feature Comparison Table** - Detailed breakdown by category
- **FAQ Section** - 6 common questions
- **CTA** - Start free trial

### Features Page (`/features`)
- **6 Main Features** - Visual builder, AI integration, form builder, conditional logic, data processing, analytics
- **Technical Features** - API/webhooks, security, cloud infrastructure, version control
- **Integrations Grid** - OpenAI, Anthropic, Slack, Discord, etc.
- **CTA** - Start building free

### About Page (`/about`)
- **Company Story** - Founded 2021, mission to democratize automation
- **Stats** - Team size, customers, funding
- **Core Values** - 6 values with icons (Customer First, Innovation, Simplicity, etc.)
- **Team Section** - 4 founding team members
- **CTA** - Join the revolution

## 🎯 Design System

### Colors
- **Background**: `#0E0E1F` (dark navy)
- **Card Background**: `#1A1A2E`
- **Gradient**: Blue (#3B82F6) → Violet (#8B5CF6) → Cyan (#06B6D4)
- **Text**: White primary, gray-300/400 secondary

### Components Used
- ShadCN UI: Button, Badge, Card, Switch, ScrollArea
- Lucide Icons: Comprehensive icon set
- Responsive: Mobile-first design (sm, md, lg breakpoints)

## 🚀 Navigation

### Internal (Client-side)
```tsx
onNavigate('home')      // Landing page
onNavigate('pricing')   // Pricing page
onNavigate('features')  // Features page
onNavigate('about')     // About page
```

### External (Window navigation)
```tsx
window.location.href = '/app'              // Go to main app
window.location.href = '/app?signup=true'  // Sign up flow
window.location.href = '/admin'            // Admin panel
window.location.href = '/docs'             // Documentation
```

## 🔗 URL Routing

The marketing site is accessible at:

### Development
- `http://localhost/` - Root shows marketing site
- `http://localhost/marketing` - Marketing site explicitly
- `http://localhost/app` - Main application
- `http://localhost/admin` - Admin panel

### Production
- `https://flowversal.com/` - Marketing site
- `https://app.flowversal.com/` - Main application
- `https://admin.flowversal.com/` - Admin panel
- `https://docs.flowversal.com/` - Documentation

## 📱 Responsive Design

All pages are fully responsive with:
- Mobile menu (hamburger) on small screens
- Responsive grids (1 col mobile → 2/3/4 cols desktop)
- Touch-friendly buttons and spacing
- Optimized font sizes per breakpoint

## ✨ Key Features

### Navigation Bar
- Sticky header with scroll effects
- Glass morphism background on scroll
- Mobile hamburger menu
- "Sign In" and "Get Started Free" CTAs

### Footer
- 5 columns: Brand, Product, Company, Resources, Legal
- Social media links (Twitter, LinkedIn, GitHub, Email)
- Copyright and branding

### Animations
- Hover effects on cards and buttons
- Scale transforms on icons
- Gradient background orbs
- Smooth transitions throughout

## 🎬 Next Steps

### Phase 2: Authentication
- Integrate real Supabase auth
- Sign up/login forms
- Google OAuth
- Password reset flow

### Phase 3: Backend Integration
- Connect pricing to Stripe
- Real user testimonials from database
- Dynamic stats from analytics

### Phase 4: SEO & Performance
- Meta tags and Open Graph
- Image optimization
- Lazy loading
- Analytics integration (Mixpanel, Google Analytics)

## 📝 Content Updates

To update marketing content, edit:
- **Hero copy**: `/apps/marketing/pages/LandingPage.tsx` (line ~44)
- **Pricing tiers**: `/apps/marketing/pages/PricingPage.tsx` (line ~17)
- **Team members**: `/apps/marketing/pages/AboutPage.tsx` (line ~52)
- **Footer links**: `/apps/marketing/components/MarketingFooter.tsx` (line ~21)

---

**Built with** ❤️ by the Flowversal team
