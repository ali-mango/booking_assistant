import {
  Heart, Sparkles, Shield, Clock, MapPin, Phone, Mail,
  Star, CheckCircle, ChevronRight, Menu, X,
  Stethoscope, Smile, Gem, Wrench, MessageSquare, Users
} from "lucide-react";
import { useState } from "react";
import ChatWidget from "./components/ChatWidget";

const services = [
  { name: "Dental Checkup", price: "₱300", duration: "20 min", desc: "Basic dental examination and consultation", icon: Stethoscope },
  { name: "Teeth Cleaning", price: "₱500", duration: "30 min", desc: "Professional teeth cleaning and polishing", icon: Sparkles },
  { name: "Tooth Extraction", price: "₱1,500", duration: "45 min", desc: "Simple tooth extraction procedure", icon: Shield },
  { name: "Filling & Restoration", price: "₱1,000", duration: "45 min", desc: "Dental filling and tooth restoration", icon: Wrench },
  { name: "Teeth Whitening", price: "₱3,000", duration: "60 min", desc: "Professional whitening treatment", icon: Gem },
  { name: "Free Consultation", price: "Free", duration: "15 min", desc: "Talk to our dentist about your needs", icon: MessageSquare },
];

const testimonials = [
  {
    name: "Maria Santos",
    text: "The AI booking was so easy! I just chatted and got my appointment in under a minute.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Juan Dela Cruz",
    text: "Super convenient, I booked at midnight and it confirmed instantly. Love it!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Ana Reyes",
    text: "Ang galing ng AI assistant! Nag-Tagalog pa siya sa akin. Very impressed.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];

const doctors = [
  {
    name: "Dr. Sarah Chen",
    specialty: "General Dentistry",
    exp: "10+ years experience",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. Miguel Santos",
    specialty: "Orthodontics",
    exp: "8+ years experience",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop&crop=face",
  },
  {
    name: "Dr. Lisa Reyes",
    specialty: "Cosmetic Dentistry",
    exp: "12+ years experience",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=500&fit=crop&crop=face",
  },
];

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ========== NAVIGATION ========== */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <Smile size={20} className="text-teal-500" />
            </div>
            <span className="text-lg font-bold text-gray-900">SmileCare</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#services" className="hover:text-teal-600 transition-colors">Services</a>
            <a href="#about" className="hover:text-teal-600 transition-colors">About</a>
            <a href="#doctors" className="hover:text-teal-600 transition-colors">Doctors</a>
            <a href="#contact" className="hover:text-teal-600 transition-colors">Contact</a>
           <a href="#contact" className="bg-teal-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-teal-600 transition-all">
  Book Now
</a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden">
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            <a href="#services" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 py-2">Services</a>
            <a href="#about" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 py-2">About</a>
            <a href="#doctors" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 py-2">Doctors</a>
            <a href="#contact" onClick={() => setMobileMenu(false)} className="block text-sm text-gray-600 py-2">Contact</a>
           <a href="#contact" onClick={() => setMobileMenu(false)} className="block w-full bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-medium text-center">Book Now</a>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 border border-teal-100">
              MAKATI CITY DENTAL CARE
            </div>
            <h1 className="text-4xl md:text-[52px] font-bold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Your smile deserves the best care
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-lg">
              Book your dental appointment in seconds using our AI assistant. Available 24/7, in English and Filipino.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
            <a href="#contact" className="bg-teal-500 text-white px-7 py-3 rounded-full font-medium hover:bg-teal-600 transition-all shadow-md shadow-teal-200/50 flex items-center gap-2">
  Book Appointment
  <ChevronRight size={16} />
</a>
              <a href="#services" className="px-7 py-3 rounded-full font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                View Services
              </a>
            </div>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2">
                <Users size={14} className="text-teal-500" />
                500+ Happy Patients
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2">
                <Star size={14} className="text-teal-500" />
                4.9 Star Rating
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2">
                <Heart size={14} className="text-teal-500" />
                10+ Years
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=500&fit=crop"
                alt="Modern dental clinic"
                className="w-full h-[420px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section id="services" className="py-20 px-6 bg-[#f8fafb]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              OUR SERVICES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              Comprehensive treatments<br />for every smile
            </h2>
            <p className="text-gray-500 max-w-lg">
              Transparent pricing, efficient appointments, and gentle care designed for busy Makati professionals and families.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50/50 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Icon size={20} className="text-teal-500" />
                  </div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-xs text-teal-500 font-medium bg-teal-50 px-2 py-0.5 rounded-full">{service.duration}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{service.desc}</p>
                  <p className="text-2xl font-bold text-teal-500">{service.price}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1fr] gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              BOOK IN 3 EASY STEPS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight">
              A faster way to schedule care
            </h2>
            <div className="space-y-8">
              {[
                { num: "01", title: "Start a Chat", desc: "Click the chat bubble and tell us what you need — in English or Filipino" },
                { num: "02", title: "Pick a Time", desc: "Our AI checks real-time availability and shows you open slots" },
                { num: "03", title: "Confirm Booking", desc: "Provide your name and number. Done! It appears on your calendar" },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <Heart size={20} className="text-teal-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient-first experience</h3>
              <p className="text-sm text-gray-500 leading-relaxed">We combine experienced dentists with a frictionless digital booking flow so you spend less time scheduling and more time smiling.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-teal-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bilingual support</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Whether you prefer English or Filipino, our AI assistant keeps booking simple, clear, and available whenever you need it.</p>
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=300&fit=crop"
                alt="Dental treatment"
                className="w-full h-[240px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 px-6 bg-[#f8fafb]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              WHAT OUR PATIENTS SAY
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Trusted by busy patients<br />across Makati
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.image} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className="text-teal-400 fill-teal-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DOCTORS ========== */}
      <section id="doctors" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              MEET OUR TEAM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Experienced dentists who<br />make care feel easy
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {doctors.map((d) => (
              <div key={d.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <img src={d.image} alt={d.name} className="w-full h-[280px] object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{d.name}</h3>
                  <p className="text-sm text-teal-500 font-medium">{d.specialty}</p>
                  <p className="text-xs text-gray-400 mt-1">{d.exp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONTACT / LOCATION ========== */}
      <section id="contact" className="py-20 px-6 bg-[#f8fafb]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              VISIT US
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
              Dental care in the heart of Makati City
            </h2>
            <div className="space-y-4 mt-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-teal-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Address</p>
                  <p className="text-sm text-gray-500">123 Main Street, Makati City</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-teal-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Phone</p>
                  <p className="text-sm text-gray-500">0917-123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-teal-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Hours</p>
                  <p className="text-sm text-gray-500">Mon-Sat 9AM-5PM, Sunday closed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-teal-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email</p>
                  <p className="text-sm text-gray-500">hello@smilecare.ph</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-4 border border-teal-100">
              MAKATI LOCATION
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy to find, easier to book</h3>
            <p className="text-sm text-gray-500 mb-6">Near business districts, with streamlined appointment booking and a calm clinic environment built for convenient dental visits.</p>
            <div className="bg-gray-100 rounded-2xl h-[280px] flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <MapPin size={18} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">SmileCare</p>
                <p className="text-xs text-gray-400">123 Main Street<br />Makati City</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <Smile size={14} className="text-teal-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">SmileCare Dental Clinic</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 SmileCare. All rights reserved. Powered by AI Booking Assistant.</p>
        </div>
      </footer>

      {/* ========== CHAT WIDGET ========== */}
      <ChatWidget />
    </div>
  );
}