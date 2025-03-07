import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true,
    },
    profilePic: {
        type: String,
        default: ''
      },
    name: {
        type: String,
        required: true,
    },
    profession: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
    skills: {
        type: [String],
        default: [],
    },
    uniqueSellingPoint: {
        type: String,
        required: true,
    },
    location: {
        village: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    contactDetails: {
        phone: { type: String, required: true },
        email: { type: String },
        alternatePhone: { type: String },
    },
    languages: {
        type: [String],
        default: [],
    },
    prompt: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;