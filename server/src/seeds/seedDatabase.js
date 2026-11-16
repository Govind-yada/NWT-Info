import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Package from '../models/Package.js';
import Portfolio from '../models/Portfolio.js';
import Testimonial from '../models/Testimonial.js';
import FAQ from '../models/FAQ.js';
import Order from '../models/Order.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import CalendarEvent from '../models/CalendarEvent.js';
import { connectDB } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seed] Starting database initialization...');

    // Clear existing collections
    await User.deleteMany({});
    await Service.deleteMany({});
    await Package.deleteMany({});
    await Portfolio.deleteMany({});
    await Testimonial.deleteMany({});
    await FAQ.deleteMany({});
    await Order.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await CalendarEvent.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // 1. Create Administrator User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nwtinfo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Nwt2026!';
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'NWT System Administrator',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      phone: '+91 98765 43210',
      role: 'admin',
      company: 'Next World Tech',
      address: 'NWT Cyber Tower, Tech Hub, Bangalore, India',
    });
    console.log(`[Seed] Admin user created: ${admin.email} (Password: ${adminPassword})`);

    // 2. Create Demo Customer User
    const customer = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@techventure.in',
      password: 'Customer@123',
      phone: '+91 98111 22334',
      role: 'customer',
      company: 'TechVenture Solutions',
      address: 'Indiranagar 100ft Road, Bangalore, India',
    });
    console.log(`[Seed] Demo customer created: ${customer.email} (Password: Customer@123)`);

    // 3. Create 7 Real Digital Services
    const servicesData = [
      {
        name: 'Website Development',
        slug: 'website-development',
        category: 'Website Development',
        shortDescription: 'High-performance, responsive websites built with modern frameworks tailored for conversions.',
        description: 'Our Website Development service transforms your brand vision into an engaging, lightning-fast digital storefront. From high-converting landing pages to bespoke enterprise web portals, we craft responsive, accessible, and SEO-optimized web experiences.',
        icon: 'Layout',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Responsive design across all devices',
          'Modern UI/UX with smooth micro-interactions',
          'SEO optimized semantic markup',
          'Fast loading speed (90+ PageSpeed score)',
          'Razorpay payment gateway ready',
          'Admin content management controls',
        ],
        startingPrice: 1999,
        order: 1,
        isActive: true,
      },
      {
        name: 'Software Development',
        slug: 'software-development',
        category: 'Software Development',
        shortDescription: 'Custom cloud-native software systems, automated ERPs, and resilient business workflow tools.',
        description: 'We architect and build tailored enterprise software solutions engineered to automate operations, scale seamlessly, and reduce operational bottlenecks with clean, maintainable microservices architecture.',
        icon: 'Code',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Tailored business workflow automation',
          'Role-based permissions & security audits',
          'RESTful and GraphQL API backends',
          'PostgreSQL, MongoDB & Redis caching',
          'Automated CI/CD pipelines',
          '24/7 Monitoring & uptime guarantee',
        ],
        startingPrice: 24999,
        order: 2,
        isActive: true,
      },
      {
        name: 'Mobile App Development',
        slug: 'mobile-app-development',
        category: 'Mobile App Development',
        shortDescription: 'Native and cross-platform mobile apps for iOS and Android with delightful user experiences.',
        description: 'Engage your mobile-first audience with intuitive, fluid iOS and Android mobile applications built on React Native and Flutter, complete with push notifications, offline storage, and in-app purchases.',
        icon: 'Smartphone',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Cross-platform iOS & Android compatibility',
          'Offline mode data synchronization',
          'Push notifications & biometric authentication',
          'App Store & Play Store publishing support',
          'Real-time analytics and crash reporting',
        ],
        startingPrice: 19999,
        order: 3,
        isActive: true,
      },
      {
        name: 'SEO / SMO',
        slug: 'seo-smo',
        category: 'SEO / SMO',
        shortDescription: 'Data-driven search engine optimization and viral social media optimization strategies.',
        description: 'Dominate organic search results and maximize your brand visibility on Google, Instagram, and LinkedIn. Our SEO/SMO experts leverage technical audits, keyword clustering, and high-authority link-building.',
        icon: 'TrendingUp',
        image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Comprehensive On-page & Technical SEO audit',
          'High-intent keyword research & clustering',
          'Google Business Profile local optimization',
          'Social media profile growth & engagement',
          'Monthly transparent rankings & ROI reports',
        ],
        startingPrice: 4999,
        order: 4,
        isActive: true,
      },
      {
        name: 'Content Management',
        slug: 'content-management',
        category: 'Content Management',
        shortDescription: 'Intuitive headless CMS and custom content publishing platforms for effortless updates.',
        description: 'Take full control of your digital narratives. We deploy robust, flexible Content Management Systems that empower non-technical marketing teams to publish articles, case studies, and landing pages instantly.',
        icon: 'FileText',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Drag-and-drop page builder integration',
          'Custom blog & case study workflows',
          'Multi-author permissions and draft workflows',
          'Automatic media compression & CDN delivery',
          'Multi-language localization support',
        ],
        startingPrice: 7999,
        order: 5,
        isActive: true,
      },
      {
        name: 'Digital Marketing',
        slug: 'digital-marketing',
        category: 'Digital Marketing',
        shortDescription: 'Performance marketing campaigns across Google Ads, Meta, and LinkedIn with proven ROI.',
        description: 'Supercharge your client acquisition funnel with precision-targeted performance advertising. We craft compelling ad creatives, optimize conversion rates (CRO), and lower your customer acquisition cost (CAC).',
        icon: 'Target',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Targeted Google Search & Display ad campaigns',
          'Meta (Facebook & Instagram) hyper-targeted ads',
          'Conversion tracking pixel setup',
          'A/B split testing of ad creatives & headlines',
          'Dedicated growth manager & weekly reporting',
        ],
        startingPrice: 8999,
        order: 6,
        isActive: true,
      },
      {
        name: 'Branding & Campaign Management',
        slug: 'branding-campaign-management',
        category: 'Branding & Campaign Management',
        shortDescription: 'Memorable brand identity design, logo suites, voice guidelines, and 360° launch campaigns.',
        description: 'Stand out in crowded markets with a distinctive brand voice, iconic logo system, and cohesive visual language. We shape authentic brand stories that resonate deeply and drive long-term brand equity.',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
        features: [
          'Complete brand identity & logo design system',
          'Typography, color palettes & usage guidelines',
          'Stationery, business cards & social media kits',
          'Product launch campaign strategy',
          'Brand voice & messaging guidelines',
        ],
        startingPrice: 5999,
        order: 7,
        isActive: true,
      },
    ];

    const createdServices = await Service.insertMany(servicesData);
    console.log(`[Seed] Created ${createdServices.length} digital services.`);

    // 4. Create Packages (including Static Website, Classic Website, Premium Website for Website Development)
    const webDevService = createdServices.find((s) => s.category === 'Website Development');
    const softwareService = createdServices.find((s) => s.category === 'Software Development');
    const appService = createdServices.find((s) => s.category === 'Mobile App Development');
    const seoService = createdServices.find((s) => s.category === 'SEO / SMO');

    const packagesData = [
      // Website Development Packages
      {
        serviceId: webDevService._id,
        name: 'Static*',
        slug: 'static-website',
        description: 'Ideal for small businesses and individuals looking for a sleek, fast, and informative web presence.',
        price: 1999,
        discountPrice: 2999,
        deliveryEstimate: '5-7 Business Days',
        features: [
          'Up to 5 Responsive Pages (Home, About, Services, Gallery, Contact)',
          'Modern Mobile-First Responsive Design',
          'Contact Form with Email Integration',
          'Basic On-Page SEO & Social Meta Tags',
          'Google Maps & WhatsApp Click-to-Chat',
          '1 Year Free Hosting & Domain Support Guidance',
        ],
        isPopular: false,
        isActive: true,
        order: 1,
      },
      {
        serviceId: webDevService._id,
        name: 'Classic*',
        slug: 'classic-website',
        description: 'Perfect for growing companies needing dynamic content, customer interaction, and service showcases.',
        price: 3999,
        discountPrice: 5999,
        deliveryEstimate: '8-10 Business Days',
        features: [
          'Up to 10 Custom Designed Pages',
          'Dynamic Content Management Dashboard',
          'Blog / News & Portfolio Gallery Section',
          'Speed Optimization (Sub-second load times)',
          'Razorpay 30% Advance Payment Setup',
          'Advanced SEO & Schema.org Integration',
          'Google Analytics & Search Console Setup',
          '3 Months Dedicated Technical Maintenance',
        ],
        isPopular: true,
        isActive: true,
        order: 2,
      },
      {
        serviceId: webDevService._id,
        name: 'Premium*',
        slug: 'premium-website',
        description: 'Full-featured enterprise portal with custom animations, multi-step forms, and custom integrations.',
        price: 5999,
        discountPrice: 8999,
        deliveryEstimate: '14-18 Business Days',
        features: [
          'Unlimited Custom Styled Pages',
          'Bespoke Interactive Animations & 3D Elements',
          'Client Portal / Authentication & User Profiles',
          'Multi-Step Custom Project Booking System',
          'Payment Gateway (Razorpay/Stripe with Advance split)',
          'Google Calendar Appointment Synchronization',
          'High-Security Audit & Cloudflare Protection',
          '6 Months Priority Support & Maintenance',
        ],
        isPopular: false,
        isActive: true,
        order: 3,
      },

      // Software Development Packages
      {
        serviceId: softwareService._id,
        name: 'Business Automation MVP',
        slug: 'business-automation-mvp',
        description: 'Custom internal tool or workflow automation to digitize core business workflows.',
        price: 24999,
        deliveryEstimate: '2-3 Weeks',
        features: [
          'Custom Database Design (MongoDB/PostgreSQL)',
          'Role-based User Permissions (Admin, Staff, Customer)',
          'Interactive Data Tables with Search & CSV Export',
          'Automated Email & SMS Alerts',
          'RESTful API Backend with Security Hardening',
        ],
        isPopular: false,
        isActive: true,
        order: 1,
      },
      {
        serviceId: softwareService._id,
        name: 'Enterprise Cloud System',
        slug: 'enterprise-cloud-system',
        description: 'Scalable cloud software architecture with real-time analytics, third-party APIs, and microservices.',
        price: 49999,
        deliveryEstimate: '4-6 Weeks',
        features: [
          'Complete Microservices Architecture',
          'Real-time Analytics Dashboard with Recharts',
          'Third-party Webhooks & Payment Gateway Integrations',
          'Automated Background Worker Jobs',
          'Dockerized Cloud Deployment (AWS / GCP)',
          '1 Year SLA & Dedicated Support',
        ],
        isPopular: true,
        isActive: true,
        order: 2,
      },

      // Mobile App Packages
      {
        serviceId: appService._id,
        name: 'Starter Cross-Platform App',
        slug: 'starter-cross-platform-app',
        description: 'Fast, responsive React Native mobile app for iOS and Android with essential user features.',
        price: 19999,
        deliveryEstimate: '2-3 Weeks',
        features: [
          'iOS & Android Cross-Platform Deployment',
          'User Authentication & Secure Sessions',
          'Push Notifications Integration',
          'In-App Navigation & Clean Tab Bars',
          'Store Submission Assistance',
        ],
        isPopular: true,
        isActive: true,
        order: 1,
      },

      // SEO Packages
      {
        serviceId: seoService._id,
        name: 'Growth SEO & SMO Package',
        slug: 'growth-seo-smo-package',
        description: 'Monthly ranking booster with on-page optimization, content strategy, and social visibility.',
        price: 4999,
        deliveryEstimate: 'Monthly Recurring',
        features: [
          'Audit of 20 Priority Target Keywords',
          'Technical Core Web Vitals Fixes',
          'Google My Business Optimization',
          '12 Custom Social Media Graphics / Month',
          'Monthly Executive Ranking & Traffic Report',
        ],
        isPopular: true,
        isActive: true,
        order: 1,
      },
    ];

    const createdPackages = await Package.insertMany(packagesData);
    console.log(`[Seed] Created ${createdPackages.length} dynamic service packages.`);

    // 5. Create Sample Booking, Order, and Verified Payment for Demo Customer
    const classicPkg = createdPackages.find((p) => p.slug === 'classic-website');
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 3);

    const bookingRef = 'NWT-BK-DEMO-001';
    const sampleBooking = await Booking.create({
      bookingReference: bookingRef,
      userId: customer._id,
      serviceId: webDevService._id,
      packageId: classicPkg._id,
      scheduledDate,
      timeSlot: 'Morning Slot (10:00 AM - 01:00 PM)',
      status: 'confirmed',
      notes: 'Please incorporate a dark navy aesthetic with vibrant blue highlights.',
    });

    const totalAmount = classicPkg.price; // 9999
    const advanceAmount = Math.round(totalAmount * 0.30); // 3000
    const remainingAmount = totalAmount - advanceAmount; // 6999

    const sampleOrder = await Order.create({
      orderNumber: 'NWT-ORD-202611-1001',
      userId: customer._id,
      bookingId: sampleBooking._id,
      serviceId: webDevService._id,
      packageId: classicPkg._id,
      projectTitle: 'TechVenture Enterprise Portal & Client Hub',
      proposedDomain: 'techventure.in',
      description: 'Comprehensive digital portal for our tech consulting agency. Needs client intake form, dynamic case studies, and advance payment checkout.',
      requiredFeatures: ['Client Intake Form', 'Interactive Portfolio Filter', '30% Advance Payment Gate', 'Google Calendar Sync'],
      referenceWebsites: ['https://stripe.com', 'https://linear.app'],
      totalAmount,
      advanceAmount,
      remainingAmount,
      advancePaid: true,
      remainingPaid: false,
      paymentStatus: 'advance_paid',
      projectStatus: 'in_progress',
      scheduledDate,
      remainingPaymentRequested: false,
      timeline: [
        {
          status: 'Order Placed',
          note: 'Customer initiated booking for Classic Website.',
          timestamp: new Date(Date.now() - 2 * 86400000),
        },
        {
          status: '30% Advance Paid',
          note: `Verified advance payment of ₹${advanceAmount.toLocaleString('en-IN')} via Razorpay. Order confirmed!`,
          timestamp: new Date(Date.now() - 2 * 86400000 + 3600000),
        },
        {
          status: 'In Progress',
          note: 'UI Wireframing & Design Tokens finalized. Frontend development commenced.',
          updatedBy: admin._id,
          timestamp: new Date(Date.now() - 1 * 86400000),
        },
      ],
    });

    // Sample Payment record
    await Payment.create({
      paymentReference: 'NWT-PAY-100101',
      orderId: sampleOrder._id,
      userId: customer._id,
      type: 'advance',
      amount: advanceAmount,
      currency: 'INR',
      razorpayOrderId: 'order_demo_1001',
      razorpayPaymentId: 'pay_demo_success_9988',
      razorpaySignature: 'demo_verified_signature_token',
      status: 'success',
      paymentMethod: 'UPI / Razorpay',
    });

    // Sample Calendar Event
    await CalendarEvent.create({
      title: `Project Kickoff: ${sampleOrder.projectTitle}`,
      description: `Customer: ${customer.name} (${customer.email}). Order #${sampleOrder.orderNumber}`,
      date: scheduledDate,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      type: 'booking',
      bookingId: sampleBooking._id,
      orderId: sampleOrder._id,
      userId: customer._id,
    });

    console.log('[Seed] Created sample verified order, booking, and payment record.');

    // 6. Create Showcase Portfolio Items
    const portfolioData = [
      {
        title: 'FinEdge – Wealth Analytics Platform',
        slug: 'finedge-wealth-analytics',
        category: 'Website Development',
        clientName: 'FinEdge Capital',
        description: 'Next-generation fintech web application with real-time portfolio dashboards, interactive KaTeX financial computations, and automated KYC onboarding.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        liveUrl: 'https://example.com/finedge',
        tags: ['React', 'Tailwind CSS', 'Recharts', 'Razorpay', 'Node.js'],
        completionDate: '2026',
        isFeatured: true,
        order: 1,
      },
      {
        title: 'OmniLogistics ERP & Fleet Tracker',
        slug: 'omnilogistics-erp',
        category: 'Software Development',
        clientName: 'Omni Freight Logistics',
        description: 'Cloud ERP software coordinating over 450 freight carriers with automated dispatch routing, driver mobile sync, and invoicing.',
        thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
        liveUrl: 'https://example.com/omni',
        tags: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Google Maps API'],
        completionDate: '2026',
        isFeatured: true,
        order: 2,
      },
      {
        title: 'PulseFit – On-Demand Health App',
        slug: 'pulsefit-health-app',
        category: 'Mobile App Development',
        clientName: 'Pulse Fitness India',
        description: 'Cross-platform mobile application featuring interactive workout streams, calorie tracking, community challenges, and Razorpay subscription recurring payments.',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
        liveUrl: 'https://example.com/pulsefit',
        tags: ['React Native', 'Node.js', 'Razorpay', 'Cloudinary'],
        completionDate: '2026',
        isFeatured: true,
        order: 3,
      },
      {
        title: 'Veritas Law – Corporate Brand Identity',
        slug: 'veritas-law-branding',
        category: 'Branding & Campaign Management',
        clientName: 'Veritas Legal Partners',
        description: 'Comprehensive brand overhaul including logo mark, executive stationery, bespoke typography system, and responsive corporate web portal.',
        thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
        liveUrl: 'https://example.com/veritas',
        tags: ['Branding', 'UI/UX Design', 'Design Systems', 'SEO'],
        completionDate: '2026',
        isFeatured: true,
        order: 4,
      },
    ];

    await Portfolio.insertMany(portfolioData);
    console.log('[Seed] Created portfolio gallery entries.');

    // 7. Create Testimonials
    const testimonialsData = [
      {
        clientName: 'Vikramaditya Roy',
        clientRole: 'Founder & CEO',
        clientCompany: 'Roy Dynamics Pvt Ltd',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        rating: 5,
        review: 'NWT Info delivered our corporate website in record time with unmatched aesthetic polish. Their 30% advance booking model and transparent project milestones gave us complete peace of mind.',
        serviceProvided: 'Website Development',
        isFeatured: true,
        order: 1,
      },
      {
        clientName: 'Dr. Neha Kulkarni',
        clientRole: 'Managing Director',
        clientCompany: 'CarePlus Diagnostics',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        rating: 5,
        review: 'The custom software ERP created by NWT Info automated 80% of our patient report generation and booking workflows. Highly professional engineers and world-class architecture.',
        serviceProvided: 'Software Development',
        isFeatured: true,
        order: 2,
      },
      {
        clientName: 'Rohan Mehra',
        clientRole: 'Growth Lead',
        clientCompany: 'UrbanKart E-Commerce',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        rating: 5,
        review: 'Our organic traffic surged by 240% within 4 months of NWT Info taking over our technical SEO and search campaigns. Best ROI from any digital agency we have partnered with.',
        serviceProvided: 'SEO / SMO',
        isFeatured: true,
        order: 3,
      },
    ];

    await Testimonial.insertMany(testimonialsData);
    console.log('[Seed] Created client testimonials.');

    // 8. Create FAQs
    const faqsData = [
      {
        question: 'How does the 30% advance booking system work?',
        answer: 'When you select any service package and submit your project requirements, our system calculates exactly 30% of the MongoDB-verified package price. You pay this 30% advance securely via Razorpay to lock in your project slot and kickoff date. The remaining 70% balance is only requested upon successful milestone review and project completion.',
        category: 'Pricing & Payments',
        order: 1,
        isActive: true,
      },
      {
        question: 'What happens after I complete the advance payment?',
        answer: 'Your project order and booking date are instantly confirmed in our database. Your project appears in your personal Customer Dashboard with live timeline progress tracking. Our technical project lead contacts you within 24 hours to begin wireframing and milestone delivery.',
        category: 'Project Delivery',
        order: 2,
        isActive: true,
      },
      {
        question: 'Can I upload design briefs, documents, and reference links?',
        answer: 'Yes! Step 3 of our booking flow allows uploading project specs, PDFs, brand guidelines, mockups, and wireframes up to 15MB securely via Cloudinary. You can also specify reference websites and required features.',
        category: 'Services',
        order: 3,
        isActive: true,
      },
      {
        question: 'How are remaining balances collected?',
        answer: 'Once your project reaches the review or completion stage, the administrator generates a remaining balance payment request. You will see an instant "Pay Remaining 70%" button in your Customer Dashboard that launches Razorpay for the remaining balance.',
        category: 'Pricing & Payments',
        order: 4,
        isActive: true,
      },
      {
        question: 'Is Google Calendar synchronization included?',
        answer: 'Yes, confirmed project dates automatically synchronize with our internal calendar and Google Calendar API, preventing double-bookings and keeping milestone schedules synchronized across all devices.',
        category: 'General',
        order: 5,
        isActive: true,
      },
    ];

    await FAQ.insertMany(faqsData);
    console.log('[Seed] Created FAQs.');

    console.log('[Seed] Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// If run directly via node command
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.js')) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
