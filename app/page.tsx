import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, TrendingUp, Users, Zap, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900">PressScape</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                How It Works
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            <span>Trusted by 1,000+ SEO Professionals</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where Quality Content
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Meets Premium Publishers
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            The most transparent marketplace for guest posts, sponsored articles, and link insertions.
            Connect with verified publishers across thousands of quality websites.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Buying <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signup?role=publisher">
              <Button variant="outline" size="lg">
                List Your Website
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: "5,000+", label: "Verified Websites" },
              { value: "100%", label: "Escrow Protection" },
              { value: "48h", label: "Avg. Turnaround" },
              { value: "4.8★", label: "Avg. Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your SEO
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From finding the perfect websites to managing orders, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Verified Publishers",
                description: "All websites verified with real metrics from Moz & Ahrefs. No fake DA or inflated traffic numbers.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Funds held in escrow until your order is completed. 100% money-back guarantee.",
              },
              {
                icon: TrendingUp,
                title: "Real Metrics",
                description: "Live Domain Authority, Domain Rating, and organic traffic data updated weekly.",
              },
              {
                icon: Users,
                title: "Multiple Roles",
                description: "Be a buyer, publisher, or affiliate - switch between roles anytime from your dashboard.",
              },
              {
                icon: Zap,
                title: "Fast Turnaround",
                description: "Most orders completed within 7 days. Need it faster? Urgent delivery available.",
              },
              {
                icon: Star,
                title: "Quality Guarantee",
                description: "Review publishers before ordering. Transparent ratings and reviews from real buyers.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-200 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get quality backlinks for your website.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Browse & Select", description: "Filter websites by DA, DR, niche, price, and more. Save favorites for later." },
              { step: "2", title: "Place Order", description: "Choose guest post or link insertion. Provide content or let the publisher write." },
              { step: "3", title: "Get Published", description: "Review and approve. Your link goes live. Payment released to publisher." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div className="pt-10 pl-4">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Scale Your SEO?</h2>
            <p className="text-xl text-violet-100 mb-8">
              Join thousands of SEO professionals who trust PressScape for their link building needs.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-violet-600 hover:bg-gray-100">
                Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-xl text-white">PressScape</span>
              </div>
              <p className="text-sm">
                The most transparent guest post marketplace. Quality content meets premium publishers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/affiliate" className="hover:text-white transition-colors">Affiliate Program</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 PressScape. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
