"use server"
import { dbConnect } from '@/lib/mongodb';
import User from '../models/User';


export async function createUserProfile(profileData, userId) {
    try {
        await dbConnect();
        
        // Check if a profile already exists for this user
        const existingProfile = await User.findOne({ clerkUserId: userId });
        
        if (existingProfile) {
            return { 
                success: false, 
                message: 'Profile already exists for this user'
            };
        }
        
        // Generate AI prompt from user data
        const aiPrompt = generateUserPrompt(profileData);
        
        // Create new profile
        const newProfile = new User({
            clerkUserId: userId,
            ...profileData,
            prompt: aiPrompt
        });
        
        await newProfile.save();
        return { 
            success: true, 
            message: 'User profile created successfully',
            profile: newProfile
        };
    } catch (error) {
        console.error('Error creating User profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate structured prompt for AI based on artisan data
 */
function generateUserPrompt(profileData) {
    const { 
        name, 
        profession, 
        experience, 
        experienceSince, 
        skills, 
        uniqueSellingPoint, 
        location, 
        languages 
    } = profileData;
    
    const locationString = `${location.village}, ${location.district}, ${location.state}`;
    const experienceDate = experienceSince instanceof Date ? 
        experienceSince.getFullYear() : 
        new Date(experienceSince).getFullYear();
    
    return `Artisan profile:
Name: ${name}
Profession: ${profession}
Experience: ${experience} years (since ${experienceDate})
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