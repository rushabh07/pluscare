import { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import DepartmentsSection from '../components/DepartmentsSection';
import WhyChooseSection from '../components/WhyChooseSection';
import DoctorsSection from '../components/DoctorsSection';
import AISection from '../components/AISection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import BlogSection from '../components/BlogSection';
import EmergencyBanner from '../components/EmergencyBanner';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';

export default function Homepage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState('General Medicine');
  const [modalDoctorId, setModalDoctorId] = useState('');

  const openBook = (dept = 'General Medicine', doctorId = '') => {
    setModalDept(dept);
    setModalDoctorId(doctorId);
    setModalOpen(true);
  };

  return (
    <div className="w-full overflow-x-hidden bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
      <Navbar onBook={() => openBook()} />
      <main className="flex-1">
        <HeroSection onBook={() => openBook()} />
        <ServicesSection onBook={(dept) => openBook(dept)} />
        <DepartmentsSection onBook={(dept) => openBook(dept)} />
        <WhyChooseSection />
        <DoctorsSection onBook={(dept, name, docId) => openBook(dept, docId)} />
        <AISection />
        <TestimonialsSection />
        <PricingSection />
        <BlogSection />
        <EmergencyBanner />
      </main>
      <Footer />
      <BookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDept={modalDept}
        defaultDoctorId={modalDoctorId}
      />
    </div>
  );
}
