import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: {
    type: [String], 
    validate: [(val) => val.length <= 5, "Maximum of 5 images allowed"], 
  },
}, { timestamps: true });

export default mongoose.models.Product||mongoose.model("Product", ProductSchema);
