"use server";
import { dbConnect } from '@/lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';

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

export async function getPrompt(userId){
    try {
        await dbConnect();
    
        const p = await User.findOne({clerkUserId:userId});

        
        return {
          success: true,
          prompt: p.prompt,
        };
      } catch (error) {
        console.error("Error getting prompt:", error);
        return { success: false, error: error.message };
      }
}


export async function getProducts() {
    try {
        await dbConnect();

        const products = await Product.find({})
            .populate({
                path: "user",
                select: "name location", 
            })
            .sort({ createdAt: -1 }) 
            .lean(); 

        const formattedProducts = products.map(product => ({
            ...product,
            _id: product._id.toString(),
            user: {
                ...product.user,
                _id: product.user?._id?.toString() || null,
            }
        }));

        return {
            success: true,
            products: formattedProducts
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: error.message };
    }
}


export async function getProductById(productId) {
    try {
      await dbConnect();
      
      const product = await Product.findById(productId)
        .populate({
          path: "user",
          select: "name location contactDetails", 
        })
        .lean();
      
      if (!product) {
        return { success: false, error: "Product not found" };
      }
      
      const formattedProduct = {
        ...product,
        _id: product._id.toString(),
        user: {
          ...product.user,
          _id: product.user?._id?.toString() || null,
        },
        createdAt: product.createdAt ? product.createdAt.toISOString() : null,
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
      };
      
      return {
        success: true,
        product: formattedProduct
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return { success: false, error: error.message };
    }
  }


  // app/actions/useractions.js (add this function)

export async function getSellerById(sellerId) {
    try {
      await dbConnect();
      
      const seller = await User.findById(sellerId)
        .select("name profession experience skills uniqueSellingPoint location contactDetails languages prompt")
        .lean();
      
      if (!seller) {
        return { success: false, error: "Seller not found" };
      }
      
      // Format the MongoDB object
      const formattedSeller = {
        ...seller,
        _id: seller._id.toString(),
      };
      
      return {
        success: true,
        seller: formattedSeller
      };
    } catch (error) {
      console.error("Error fetching seller:", error);
      return { success: false, error: error.message };
    }
  }


  // app/actions/useractions.js (add this function)

export async function getUserProfile(userId) {
    try {
      await dbConnect();
      
      // Find user by clerk ID
      const user = await User.findOne({ clerkUserId: userId }).lean();
      
      if (!user) {
        return { success: false, message: "User profile not found" };
      }
      
      // Format the MongoDB object for client-side use
      const formattedUser = {
        ...user,
        _id: user._id.toString(),
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      };
      
      return {
        success: true,
        profile: formattedUser
      };
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      return { success: false, error: error.message };
    }
  }