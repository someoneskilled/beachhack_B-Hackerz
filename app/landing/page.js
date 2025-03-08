'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import imageCompression from 'browser-image-compression';
import { fetchProducts, createProduct, deleteProduct } from '../actions/useractions';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function ProductLandingPage() {
    const { user } = useUser();
    const userId = user?.id;

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch existing products on page load
    useEffect(() => {
        if (userId) {
            loadProducts();
        }
    }, [userId]);
    

    // Load products using the imported function
    const loadProducts = async () => {
        try {
            const result = await fetchProducts(userId);
            if (result.success) {
                setProducts(result.data);
            } else {
                setError(result.message || 'Failed to fetch products.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('An error occurred. Please try again.');
        }
    };

    // Handle image compression and upload to Vercel Blob
    const handleImageUpload = async (file) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);

        const formData = new FormData();
        formData.append('file', compressedFile);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        return data.url;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Upload images and get URLs
            const imageUrls = await Promise.all(
                imageFiles.map((file) => handleImageUpload(file))
            );

            // Create product using the imported function
            const result = await createProduct(
                {
                    name,
                    description,
                    price,
                    images: imageUrls,
                },
                userId
            );

            if (result.success) {
                resetForm();
                setShowForm(false);
                loadProducts(); // Refresh product list
            } else {
                setError(result.message || 'Failed to create product.');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form fields
    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setImages([]);
        setImageFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle product deletion using the imported function
    const handleDelete = async (productId) => {
        try {
            const result = await deleteProduct(productId);
            if (result.success) {
                loadProducts(); // Refresh product list
            } else {
                setError(result.message || 'Failed to delete product.');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setError('An error occurred. Please try again.');
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Create preview URLs for the selected images
        const newImagePreviews = files.map(file => URL.createObjectURL(file));

        // Update both the preview images and the actual files
        setImages(prev => [...prev, ...newImagePreviews]);
        setImageFiles(prev => [...prev, ...files]);
    };

    // Remove an image from the selection
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Image slider component
    const ImageSlider = ({ images }) => {
        const [currentIndex, setCurrentIndex] = useState(0);

        const nextSlide = () => {
            setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
        };

        const prevSlide = () => {
            setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
        };

        if (!images || images.length === 0) return null;

        return (
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
                <div
                    className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(- $ {currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="min-w-full h-full flex-shrink-0">
                            <img
                                src={image}
                                alt={`Product image  $ {index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute hidden left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                            aria-label="Previous image"
                        >
                            <FiChevronLeft size={0} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute hidden right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
                            aria-label="Next image"
                        >
                            <FiChevronRight size={0} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-colors  $ {
                    currentIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                                    aria-label={`Go to image  $ {index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-800">Your Product Listings</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-purple-500 font-bold text-white px-5 py-3 rounded-lg transition-all shadow-md"
                    >
                        {showForm ? <FiX size={20} /> : <FiPlus size={20} />}
                        {showForm ? 'Close Form' : 'Add Listing'}
                    </motion.button>
                </motion.div>

                {/* Add Listing Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white p-8 rounded-xl shadow-lg mb-8"
                            >
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter product name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            placeholder="Describe your product"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ( ₹ )</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <FiPlus size={18} />
                                                Add Images
                                            </label>
                                            <span className="text-sm text-gray-500">
                                                {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected
                                            </span>
                                        </div>

                                        {/* Image previews */}
                                        {images.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={image}
                                                            alt={`Preview  $ {index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            aria-label="Remove image"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={resetForm}
                                            className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Reset
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : (
                                                'Create Listing'
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center"
                        >
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-700 hover:text-red-900"
                            >
                                <FiX size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Display Existing Listings */}
                <div className="mt-8">
                    {products.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-white rounded-xl shadow-sm"
                        >
                            <p className="text-gray-500 text-lg">You don't have any listings yet.</p>
                            <p className="text-gray-400 mt-2">Click "Add Listing" to create your first product.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {products.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <ImageSlider images={product.images} />
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                                        <p className="text-gray-600 mb-3 line-clamp-3">{product.description}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-2xl font-bold text-purple-600"> ₹ {parseFloat(product.price).toFixed(2)}</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(product._id)}
                                                className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <FiTrash2 size={16} />
                                                <span>Delete</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}