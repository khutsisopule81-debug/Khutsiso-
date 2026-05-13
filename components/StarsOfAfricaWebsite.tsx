import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface FormData {
  playerName: string;
  dateOfBirth: string;
  position: string;
  school: string;
  ageCategory: string;
  parentName: string;
  contactNumber: string;
  alternativeNumber: string;
  email: string;
  needsTransport: string;
  medicalConditions: string;
  proofOfPayment: File | null;
}

interface FormErrors {
  [key: string]: string;
}

const CONTACT_NUMBER = '27734429023';
const WHATSAPP_URL = `https://wa.me/${CONTACT_NUMBER}`;
const BANK_DETAILS = {
  bank: 'FNB',
  account: '63164309990',
  reference: 'Player Name + TRIAL',
  fee: 'R380',
};

const TRIAL_DETAILS = [
  ['Trial Dates', '29 June – 3 July 2026'],
  ['Venue', '72 Indra Street, Mayfair West, Johannesburg'],
  ['Registration Fee', 'R380'],
  ['Training Starts', '08:00 Sharp'],
  ['Transport', 'Optional Academy Transport'],
  ['Meals', 'Lunch & Refreshments Provided'],
];

const AGE_CATEGORIES = ['U13', 'U14', 'U15', 'U17', 'U19'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function StarsOfAfricaWebsite() {
  const [formData, setFormData] = useState<FormData>({
    playerName: '',
    dateOfBirth: '',
    position: '',
    school: '',
    ageCategory: '',
    parentName: '',
    contactNumber: '',
    alternativeNumber: '',
    email: '',
    needsTransport: '',
    medicalConditions: '',
    proofOfPayment: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Validation rules
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 10 || age > 20) {
        newErrors.dateOfBirth = 'Player must be between 10 and 20 years old';
      }
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Preferred position is required';
    }

    if (!formData.school.trim()) {
      newErrors.school = 'School information is required';
    }

    if (!formData.ageCategory) {
      newErrors.ageCategory = 'Age category is required';
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }

    if (formData.alternativeNumber && !/^\d{10,}$/.test(formData.alternativeNumber.replace(/\D/g, ''))) {
      newErrors.alternativeNumber = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.needsTransport) {
      newErrors.needsTransport = 'Please specify if transport is needed';
    }

    if (!formData.proofOfPayment) {
      newErrors.proofOfPayment = 'Proof of payment is required';
    } else if (formData.proofOfPayment.size > MAX_FILE_SIZE) {
      newErrors.proofOfPayment = 'File size must be less than 5MB';
    } else {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(formData.proofOfPayment.type)) {
        newErrors.proofOfPayment = 'Only JPG, PNG, and PDF files are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, proofOfPayment: file }));
      if (errors.proofOfPayment) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.proofOfPayment;
          return newErrors;
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix the errors above and try again');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Prepare form data with file upload
      const submitFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          submitFormData.append(key, value);
        }
      });

      // Replace with your actual backend endpoint
      const response = await fetch('/api/register', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setSubmitStatus('success');
      setSubmitMessage('Registration submitted successfully! We will contact you soon.');

      // Reset form
      setFormData({
        playerName: '',
        dateOfBirth: '',
        position: '',
        school: '',
        ageCategory: '',
        parentName: '',
        contactNumber: '',
        alternativeNumber: '',
        email: '',
        needsTransport: '',
        medicalConditions: '',
        proofOfPayment: null,
      });

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Scroll to success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Failed to submit registration. Please try again or contact us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Status Messages */}
      {submitStatus !== 'idle' && (
        <div className={`fixed top-0 left-0 right-0 z-50 p-4 ${submitStatus === 'success' ? 'bg-green-900' : 'bg-red-900'}`}>
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            {submitStatus === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400" />
            )}
            <p className={submitStatus === 'success' ? 'text-green-200' : 'text-red-200'}>
              {submitMessage}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-yellow-500 to-black py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4">STARS OF AFRICA</h1>
        <p className="text-xl md:text-2xl font-semibold mb-6">Official Trial Registration 2026</p>
        <p className="max-w-3xl mx-auto text-lg text-gray-200">
          Join one of South Africa's leading football academies and showcase your talent during our official June/July 2026 trials.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#register"
            className="bg-black text-yellow-400 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Navigate to registration form"
          >
            Register Now
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-black transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Contact us on WhatsApp"
          >
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-yellow-400 mb-6">About The Academy</h2>

        <p className="text-gray-300 leading-8 text-lg">
          Stars of Africa Football Academy provides a nurturing environment for aspiring young footballers, empowering them to reach their full potential and become successful professionals. By combining rigorous training with academic support and mentorship, we strive to produce individuals capable of excelling both within and beyond football.
        </p>
      </section>

      {/* Trial Details */}
      <section className="bg-zinc-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-yellow-400 mb-10">Trial Details</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRIAL_DETAILS.map((item, index) => (
              <div
                key={index}
                className="bg-black border border-yellow-500 p-6 rounded-3xl shadow-lg"
              >
                <h3 className="text-2xl font-bold mb-2 text-yellow-400">{item[0]}</h3>
                <p className="text-gray-300 text-lg">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-yellow-400 mb-10">Player Registration Form</h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6" noValidate>
          {/* Player Full Name */}
          <div>
            <label htmlFor="playerName" className="block text-sm font-semibold text-gray-300 mb-2">
              Player Full Name *
            </label>
            <input
              id="playerName"
              name="playerName"
              type="text"
              value={formData.playerName}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.playerName ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="Enter player's full name"
              aria-invalid={!!errors.playerName}
              aria-describedby={errors.playerName ? 'playerName-error' : undefined}
              required
            />
            {errors.playerName && (
              <p id="playerName-error" className="text-red-400 text-sm mt-1">{errors.playerName}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-300 mb-2">
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.dateOfBirth ? 'ring-2 ring-red-500' : ''
              }`}
              aria-invalid={!!errors.dateOfBirth}
              aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
              required
            />
            {errors.dateOfBirth && (
              <p id="dateOfBirth-error" className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Preferred Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-semibold text-gray-300 mb-2">
              Preferred Position *
            </label>
            <input
              id="position"
              name="position"
              type="text"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.position ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="e.g., Goalkeeper, Defender, Midfielder, Forward"
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'position-error' : undefined}
              required
            />
            {errors.position && (
              <p id="position-error" className="text-red-400 text-sm mt-1">{errors.position}</p>
            )}
          </div>

          {/* School */}
          <div>
            <label htmlFor="school" className="block text-sm font-semibold text-gray-300 mb-2">
              Current School & Grade *
            </label>
            <input
              id="school"
              name="school"
              type="text"
              value={formData.school}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.school ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="e.g., St. John's High School, Grade 10"
              aria-invalid={!!errors.school}
              aria-describedby={errors.school ? 'school-error' : undefined}
              required
            />
            {errors.school && (
              <p id="school-error" className="text-red-400 text-sm mt-1">{errors.school}</p>
            )}
          </div>

          {/* Age Category */}
          <div>
            <label htmlFor="ageCategory" className="block text-sm font-semibold text-gray-300 mb-2">
              Age Category *
            </label>
            <select
              id="ageCategory"
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.ageCategory ? 'ring-2 ring-red-500' : ''
              }`}
              aria-invalid={!!errors.ageCategory}
              aria-describedby={errors.ageCategory ? 'ageCategory-error' : undefined}
              required
            >
              <option value="">Select Age Category</option>
              {AGE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.ageCategory && (
              <p id="ageCategory-error" className="text-red-400 text-sm mt-1">{errors.ageCategory}</p>
            )}
          </div>

          {/* Parent/Guardian Name */}
          <div>
            <label htmlFor="parentName" className="block text-sm font-semibold text-gray-300 mb-2">
              Parent/Guardian Name *
            </label>
            <input
              id="parentName"
              name="parentName"
              type="text"
              value={formData.parentName}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.parentName ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="Enter parent or guardian's name"
              aria-invalid={!!errors.parentName}
              aria-describedby={errors.parentName ? 'parentName-error' : undefined}
              required
            />
            {errors.parentName && (
              <p id="parentName-error" className="text-red-400 text-sm mt-1">{errors.parentName}</p>
            )}
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-300 mb-2">
              Contact Number *
            </label>
            <input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.contactNumber ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="e.g., 073 442 9023"
              aria-invalid={!!errors.contactNumber}
              aria-describedby={errors.contactNumber ? 'contactNumber-error' : undefined}
              required
            />
            {errors.contactNumber && (
              <p id="contactNumber-error" className="text-red-400 text-sm mt-1">{errors.contactNumber}</p>
            )}
          </div>

          {/* Alternative Number */}
          <div>
            <label htmlFor="alternativeNumber" className="block text-sm font-semibold text-gray-300 mb-2">
              Alternative Number
            </label>
            <input
              id="alternativeNumber"
              name="alternativeNumber"
              type="tel"
              value={formData.alternativeNumber}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.alternativeNumber ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="e.g., 073 442 9023"
              aria-invalid={!!errors.alternativeNumber}
              aria-describedby={errors.alternativeNumber ? 'alternativeNumber-error' : undefined}
            />
            {errors.alternativeNumber && (
              <p id="alternativeNumber-error" className="text-red-400 text-sm mt-1">{errors.alternativeNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.email ? 'ring-2 ring-red-500' : ''
              }`}
              placeholder="your.email@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />
            {errors.email && (
              <p id="email-error" className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Transport */}
          <div>
            <label htmlFor="needsTransport" className="block text-sm font-semibold text-gray-300 mb-2">
              Need Transport? *
            </label>
            <select
              id="needsTransport"
              name="needsTransport"
              value={formData.needsTransport}
              onChange={handleInputChange}
              className={`w-full bg-zinc-900 p-4 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                errors.needsTransport ? 'ring-2 ring-red-500' : ''
              }`}
              aria-invalid={!!errors.needsTransport}
              aria-describedby={errors.needsTransport ? 'needsTransport-error' : undefined}
              required
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.needsTransport && (
              <p id="needsTransport-error" className="text-red-400 text-sm mt-1">{errors.needsTransport}</p>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="md:col-span-2">
            <label htmlFor="medicalConditions" className="block text-sm font-semibold text-gray-300 mb-2">
              Medical Conditions / Allergies
            </label>
            <textarea
              id="medicalConditions"
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleInputChange}
              className="w-full bg-zinc-900 p-4 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition h-32 resize-vertical"
              placeholder="Please list any medical conditions or allergies (optional)"
              aria-label="Medical conditions or allergies"
            />
          </div>

          {/* File Upload */}
          <div className="md:col-span-2">
            <label htmlFor="proofOfPayment" className="block text-sm font-semibold text-gray-300 mb-2">
              Upload Proof of Payment *
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
            <div className="relative">
              <input
                id="proofOfPayment"
                name="proofOfPayment"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className={`w-full bg-zinc-900 p-4 rounded-xl text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition cursor-pointer ${
                  errors.proofOfPayment ? 'ring-2 ring-red-500' : ''
                }`}
                aria-invalid={!!errors.proofOfPayment}
                aria-describedby={errors.proofOfPayment ? 'proofOfPayment-error' : undefined}
                required
              />
            </div>
            {formData.proofOfPayment && (
              <p className="text-sm text-green-400 mt-2">
                ✓ {formData.proofOfPayment.name} ({(formData.proofOfPayment.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {errors.proofOfPayment && (
              <p id="proofOfPayment-error" className="text-red-400 text-sm mt-1">{errors.proofOfPayment}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 bg-yellow-500 text-black py-5 rounded-2xl text-xl font-bold hover:scale-[1.02] transition focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-busy={isSubmitting}
          >
            {isSubmitting && <Loader className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      </section>

      {/* Payment Details */}
      <section className="bg-zinc-900 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-yellow-400 mb-8">Payment Information</h2>

          <div className="bg-black border border-yellow-500 rounded-3xl p-8">
            <p className="text-xl mb-4">
              Trial Registration Fee: <span className="font-bold text-yellow-400">{BANK_DETAILS.fee}</span>
            </p>

            <div className="space-y-3 text-gray-300 text-lg">
              <p><span className="font-semibold">Bank:</span> {BANK_DETAILS.bank}</p>
              <p><span className="font-semibold">Account Number:</span> {BANK_DETAILS.account}</p>
              <p><span className="font-semibold">Reference:</span> {BANK_DETAILS.reference}</p>
            </div>

            <p className="mt-8 text-red-400 font-semibold">No cash payments accepted.</p>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-yellow-400 mb-8">Important Information</h2>

        <ul className="space-y-5 text-gray-300 text-lg leading-8">
          <li>• Registration closes on 25 June 2026.</li>
          <li>• Parents/guardians must attend on trial day.</li>
          <li>• Players arriving without proof of payment will not be allowed to participate.</li>
          <li>• Academy provides training kit, meals, and refreshments.</li>
          <li>• Selected players may receive scholarship opportunities.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 py-10 px-6 text-center">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4">Stars of Africa Football Academy</h3>

        <p className="text-gray-400 mb-3">72 Indra Street, Mayfair West, Johannesburg, 2092</p>

        <p className="text-gray-400 mb-6">WhatsApp: 073 442 9023</p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-500 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Contact us on WhatsApp"
        >
          Contact on WhatsApp
        </a>
      </footer>
    </div>
  );
}
