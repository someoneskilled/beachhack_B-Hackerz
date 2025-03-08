'use client';

import { useState, useRef,useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createUserProfile,getUserProfile } from '../actions/useractions';
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
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview

  const fileInputRef = useRef(null); // Ref for file input


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
        // Compress the image
        const options = {
          maxSizeMB: 1, // Maximum size in MB
          maxWidthOrHeight: 1024, // Maximum width or height
          useWebWorker: true, // Use web worker for better performance
        };
        const compressedFile = await imageCompression(file, options);
        setSelectedFile(compressedFile);

        // Create a preview URL for the compressed image
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
    fileInputRef.current.click(); // Trigger file input click
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

      // Upload profile picture if selected
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

      // Prepare submit data with profile picture URL
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
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create Your Artisan Profile</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession/Work*
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Carpenter, Weaver, Potter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience*
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center">
                  <div
                    className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={triggerFileSelect}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500">Upload</span>
                    )}
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
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Skills & Expertise</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Skills
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Woodcarving, Bamboo crafting"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Unique Style/Approach*
              </label>
              <textarea
                name="uniqueSellingPoint"
                value={formData.uniqueSellingPoint}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="What makes your work special or unique?"
              ></textarea>
            </div>
          </div>

          {/* Location */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village/Town*
                </label>
                <input
                  type="text"
                  name="location.village"
                  value={formData.location.village}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District*
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode*
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  name="contactDetails.phone"
                  value={formData.contactDetails.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  name="contactDetails.alternatePhone"
                  value={formData.contactDetails.alternatePhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="contactDetails.email"
                  value={formData.contactDetails.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={user?.primaryEmailAddress?.emailAddress || ''}
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Languages You Speak</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Language
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hindi, Tamil, English"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.languages.map((language) => (
                <span
                  key={language}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-2 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 