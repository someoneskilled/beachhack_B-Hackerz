import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/app/models/Product";

export async function POST(req) {
  try {
    const { amount, productId, productName, quantity } = await req.json();
    
    // Validate the product and its price
    await dbConnect();
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Verify the amount
    const calculatedAmount = product.price * quantity;
    if (calculatedAmount !== amount) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Razorpay expects amount in the smallest currency unit (paise for INR)
    const razorpayAmount = amount * 100;
    
    // Create order
    const order = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        productId,
        productName,
        quantity
      }
    });
    
    return NextResponse.json({
      id: order.id,
      amount: razorpayAmount,
      currency: "INR"
    });
    
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}