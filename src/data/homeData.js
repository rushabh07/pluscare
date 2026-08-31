export const services = [
  { icon: '📅', title: 'Smart Scheduling', desc: 'Instantly coordinate clinic visits or HD video slots linked to physician databases in real time.' },
  { icon: '🎥', title: 'Telehealth Hub', desc: 'Consult board-certified specialists via encrypted, high-definition video from anywhere.' },
  { icon: '📋', title: 'Unified EHR Portal', desc: 'Access your medical records, radiology reports, and lab results on a single secure dashboard.' },
  { icon: '🧠', title: 'AI Diagnostics', desc: 'Clinical intelligence algorithms evaluate symptoms and route patients to the correct care team.' },
  { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive certified e-prescriptions instantly forwarded to your nearest pharmacy.' },
  { icon: '❤️', title: 'Wearables Telemetry', desc: 'Sync smartwatches and fitness bands to stream vitals directly to your care coordinators.' },
];

export const departments = [
  { id: 'cardio', name: 'Cardiology',    code: 'CARD-01', doctors: 8,  icon: '❤️', desc: 'Complex coronary management, cardiac imaging, and advanced vascular interventions.' },
  { id: 'neuro',  name: 'Neurology',     code: 'NEUR-02', doctors: 6,  icon: '🧠', desc: 'Neurological syndromes, seizure management, cognitive wellness programs.' },
  { id: 'pedia',  name: 'Pediatrics',    code: 'PEDI-03', doctors: 12, icon: '👶', desc: 'Holistic infant, child, and youth medical care including vaccination tracking.' },
  { id: 'ortho',  name: 'Orthopedics',   code: 'ORTH-04', doctors: 7,  icon: '🦴', desc: 'Joint replacement, spinal therapies, and sports medicine rehabilitation.' },
  { id: 'derm',   name: 'Dermatology',   code: 'DERM-05', doctors: 5,  icon: '☀️', desc: 'Clinical skincare, skin malignancy screenings, and aesthetic dermatology.' },
  { id: 'onc',    name: 'Oncology',      code: 'ONCO-06', doctors: 9,  icon: '🧬', desc: 'Precision oncology therapies, cellular analysis, and compassionate care pathways.' },
];

export const testimonials = [
  { quote: 'PlusCare revolutionized our family healthcare. Getting a telehealth slot at 10 PM and speaking to a board-certified doctor in minutes felt futuristic.', author: 'Sarah Lindqvist', role: 'Product Designer & Mother of Two', location: 'San Francisco, CA', rating: 5 },
  { quote: 'The Smart AI Scheduler routed me to the exact cardiologist I needed in seconds. The whole experience was seamless and incredibly reassuring.', author: 'Robert Chen', role: 'Software Architect', location: 'Austin, TX', rating: 5 },
  { quote: 'Streaming my wearable vitals directly to my recovery team has made post-op rehabilitation smoother than I ever expected.', author: 'Helena Gözde', role: 'Academic Instructor', location: 'Chicago, IL', rating: 5 },
];

export const packages = [
  {
    name: 'Essential Wellness', priceMonthly: 29, priceAnnual: 23, popular: false,
    desc: 'Ideal for individuals seeking modern diagnostic access and preventive telehealth.',
    cta: 'Activate Essential',
    features: ['Unlimited AI Assistant Chat', '2 Specialist consultations / year', 'Electronic Health Records access', 'Digital Prescription routing', '24/7 Nurse Telehealth hotline'],
  },
  {
    name: 'Comprehensive Care', priceMonthly: 79, priceAnnual: 63, popular: true,
    desc: 'Perfect for families seeking deep health metric tracking and direct provider access.',
    cta: 'Subscribe to Premium',
    features: ['Everything in Essential, plus:', 'Unlimited Specialist consultations', 'Priority same-day clinic booking', 'Annual Metabolic Lab Panel', 'Continuous wearable telemetry sync'],
  },
  {
    name: 'Elite Specialized', priceMonthly: 149, priceAnnual: 119, popular: false,
    desc: 'Dedicated cardiology & neurology monitoring with priority physician slots.',
    cta: 'Enroll in Elite Care',
    features: ['Everything in Comprehensive, plus:', 'Direct specialist messaging', 'Bi-annual ECG & Cardiac Stress Tests', 'Custom clinical wellness plans', 'Zero wait-time emergency slots'],
  },
];

export const blogPosts = [
  { title: 'How AI is Rewriting Clinical Diagnostics', category: 'Health Tech', date: 'Jul 12, 2026', readTime: '6 min', image: 'https://images.unsplash.com/photo-1526253038957-bca54e259300?auto=format&fit=crop&q=80&w=400', desc: 'Deep-learning architectures support radiologists in locating micro-anomalies with 99.4% accuracy.' },
  { title: 'Dehydration: Metabolic Biomarkers to Watch', category: 'Preventive Care', date: 'Jul 8, 2026',  readTime: '4 min', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400', desc: 'Heart rate variability and blood glucose subtly signal systemic dehydration before thirst appears.' },
  { title: 'Wearable ECG in Post-Cardiac Rehabilitation', category: 'Cardiology', date: 'Jun 28, 2026', readTime: '8 min', image: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=400', desc: 'Patients syncing telemetry bands to coordinators show 40% fewer secondary cardiac incidents.' },
];

export const triageDB = {
  chest:   { dept: 'Cardiology',       priority: 'High — Urgent',  color: 'text-red-600 bg-red-50 border-red-200',     advice: 'AI detected possible cardiac indicators. Routed to Cardiology. If pain is acute, call emergency services immediately.' },
  head:    { dept: 'Neurology',        priority: 'Medium',          color: 'text-amber-600 bg-amber-50 border-amber-200', advice: 'Symptoms suggest tension headache or migraine pattern. Routing to Neurology team for assessment.' },
  child:   { dept: 'Pediatrics',       priority: 'Routine',         color: 'text-green-600 bg-green-50 border-green-200', advice: 'Pediatric assessment recommended. Scheduling with Pediatric specialist.' },
  default: { dept: 'General Medicine', priority: 'Routine',         color: 'text-blue-600 bg-blue-50 border-blue-200',   advice: 'Routing to Internal Medicine for a comprehensive initial evaluation.' },
};
