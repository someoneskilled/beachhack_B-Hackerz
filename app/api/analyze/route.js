import { Groq } from "groq-sdk";

export async function POST(req) {
  try {
    const { image } = await req.json();
    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Ensure the image URL is correctly formatted
    const imageUrl = image.startsWith('data:image') ? image : `data:image/png;base64,${image}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and describe its contents." },
            { type: "image_url", image_url: { url: imageUrl } }, // Corrected structure
          ],
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content || "No analysis result.";
    return Response.json({ text });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return Response.json({ error: "Failed to analyze image." }, { status: 500 });
  }
}