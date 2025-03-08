'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createUserProfile, getUserProfile } from '../actions/useractions';
import imageCompression from 'browser-image-compression';

export default function CreateProfilePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    experience: '',
    skills: [],
    uniqueSellingPoint: '',
    profilePic: '',
    location: {
      village: '',
      district: '',
      state: '',
      pincode: '',
    },
    contactDetails: {
      phone: '',
      email: '',
      alternatePhone: '',
    },
    languages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [languageInput, setLanguageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function checkExistingProfile() {
      if (!isUserLoaded || !user) return;
      
      try {
        setCheckingProfile(true);
        const { success, profile } = await getUserProfile(user.id);
        
        if (success && profile) {
          // User already has a profile, redirect to dashboard
          router.push('/landing');
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
        // If there's an error, we'll continue with the form in case they need to create a profile
      } finally {
        setCheckingProfile(false);
      }
    }
    
    checkExistingProfile();
  }, [isUserLoaded, user, router]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setSelectedFile(compressedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('Failed to process the image. Please try again.');
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUserLoaded || !user) {
      setError('You must be logged in to create a profile');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let profilePicUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const { url } = await uploadResponse.json();
        profilePicUrl = url;
      }

      let submitData = {
        ...formData,
        experience: parseInt(formData.experience),
        profilePic: profilePicUrl,
      };

      if (!submitData.contactDetails.email && user.primaryEmailAddress) {
        submitData.contactDetails.email = user.primaryEmailAddress.emailAddress;
      }

      const result = await createUserProfile(submitData, user.id);

      if (result.success) {
        router.push('/landing');
      } else {
        setError(result.message || 'Failed to create profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating your profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className=" bg-[#F5F5F5] p-6">
          <h1 className="text-3xl font-bold text-black">Create Your Artisan Profile</h1>
          <p className="text-gray-500 mt-2 text-lg">Share your craft and expertise with the world</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-base">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center text-black pb-3 border-b border-gray-200">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold">Basic Information</h2>
            </div>
            <div>
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-5">
                  <div
                    onClick={triggerFileSelect}
                    className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blacktransition-colors"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm text-gray-500 mt-2">Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="text-base text-gray-600">
                    {previewUrl ? 'Click to change' : 'Click to upload a photo'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Profession/Work*
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="e.g., Carpenter, Weaver, Potter"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Years of Experience*
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="Years in your craft"
                />
              </div>

              
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="space-y-6">
            <div className="flex items-center text-black pb-3 border-b border-gray-200">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold">Skills & Expertise</h2>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Add Skills
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-grow px-5 py-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="e.g., Woodcarving, Bamboo crafting"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 text-white px-6 py-3 rounded-r-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-base font-medium"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">Press Enter to add a skill</p>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-base flex items-center border border-blue-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 focus:outline-none hover:text-blue-900"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <span className="text-base text-gray-500 italic">No skills added yet</span>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Your Unique Style/Approach*
              </label>
              <textarea
                name="uniqueSellingPoint"
                value={formData.uniqueSellingPoint}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                rows="4"
                placeholder="What makes your work special or unique?"
              ></textarea>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <div className="flex items-center text-black pb-3 border-b border-gray-200">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold">Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Village/Town*
                </label>
                <input
                  type="text"
                  name="location.village"
                  value={formData.location.village}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  District*
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  State*
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Pincode*
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="flex items-center text-black pb-3 border-b border-gray-200">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <h2 className="text-2xl font-semibold">Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  name="contactDetails.phone"
                  value={formData.contactDetails.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="Your primary contact number"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="contactDetails.alternatePhone"
                  value={formData.contactDetails.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="Optional backup number"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="contactDetails.email"
                  value={formData.contactDetails.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder={user?.primaryEmailAddress?.emailAddress || 'Your email address'}
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-6">
            <div className="flex items-center text-black pb-3 border-b border-gray-200">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold">Languages You Speak</h2>
            </div>

            <div className="mb-6">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Add Language
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  className="flex-grow px-5 py-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blacktransition-colors text-base"
                  placeholder="e.g., Hindi, Tamil, English"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="bg-blue-600 text-white px-6 py-3 rounded-r-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-base font-medium"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">Press Enter to add a language</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {formData.languages.map((language) => (
                <span
                  key={language}
                  className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-base flex items-center border border-green-200"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-2 focus:outline-none hover:text-green-900"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              {formData.languages.length === 0 && (
                <span className="text-base text-gray-500 italic">No languages added yet</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-10 py-4 rounded-xl text-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg 
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading && (
                  <span className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                {loading ? 'Creating Profile...' : 'Create Profile'}
              </button>
            </div>
            <p className="text-center text-gray-500 text-base mt-6">
              * Required fields
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}