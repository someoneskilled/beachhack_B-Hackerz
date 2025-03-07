"use server";
import { dbConnect } from '@/lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';
import mongoose from 'mongoose';

export async function createUserProfile(profileData, userId) {
  try {
    await dbConnect();

    const existingProfile = await User.findOne({ clerkUserId: userId });
    if (existingProfile) {
      return {
        success: false,
        message: 'Profile already exists for this user',
      };
    }

    const aiPrompt = generateUserPrompt(profileData);

    const newProfile = new User({
      clerkUserId: userId,
      ...profileData,
      prompt: aiPrompt,
      profilePic: profileData.profilePic || '',
    });

    await newProfile.save();
    return {
      success: true,
      message: 'User profile created successfully',
    };
  } catch (error) {
    console.error('Error creating User profile:', error);
    return { success: false, error: error.message };
  }
}

function generateUserPrompt(profileData) {
  const { name, profession, experience, skills, uniqueSellingPoint, location, languages } = profileData;
  const locationString = `${location.village}, ${location.district}, ${location.state}`;
  const startYear = new Date().getFullYear() - experience;

  return `Artisan profile:
Name: ${name}
Profession: ${profession}
Experience: ${experience} years (since ${startYear})
Location: ${locationString}
Skills: ${skills.join(', ')}
Languages: ${languages.join(', ')}
Unique Style/Approach: ${uniqueSellingPoint}

When responding about this artisan, emphasize their craftsmanship in ${profession} with ${experience} years of experience. 
Highlight their unique approach: "${uniqueSellingPoint}".
Mention their specialized skills in ${skills.join(', ')}.
Note that they are based in ${locationString} and can communicate in ${languages.join(', ')}.
`;
}


export async function fetchProducts(userId) {
    try {
      await dbConnect();
      
      // Find user based on Clerk ID
      const user = await User.findOne({ clerkUserId: userId });
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }
  
      // Fetch products using the user's ObjectId
      const products = await Product.find({ user: user._id }).lean();
  
      // Convert ObjectIds and Dates to strings
      const formattedProducts = products.map(product => ({
        ...product,
        _id: product._id.toString(),
        user: product.user.toString(),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }));
  
      return {
        success: true,
        data: formattedProducts,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { success: false, error: error.message };
    }
  }


export async function createProduct(productData, userId) {
  try {
    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });
    const { name, description, price, images } = productData;

    const newProduct = new Product({
      user: user._id,
      name,
      description,
      price,
      images,
    });

    await newProduct.save();

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }
}


  
export async function deleteProduct(productId) {
    try {
      await dbConnect();
  
      const deletedProduct = await Product.findByIdAndDelete(productId).exec();
      if (!deletedProduct) {
        return {
          success: false,
          message: "Product not found",
        };
      }
  
      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  }