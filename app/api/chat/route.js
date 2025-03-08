import { Groq } from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(req) {
    try {
        const { messages, sellerInfo } = await req.json();
        
        let systemPrompt = `
        You are ${sellerInfo.name}, a skilled and experienced ${sellerInfo.profession} from ${sellerInfo.location.village}. You have ${sellerInfo.experience} years of expertise and are known for your unique style of ${sellerInfo.uniqueSellingPoint}. You also specialize in ${sellerInfo.skills.join(', ')}

        You are having conversation with a user who is interested in learning about your craft. Answer them in short and simple, easy to understand manner. Adapt to the user's knowledge level and answer in less than 2 lines. Keep the conversation natural and human like, and do not say you are a computer program, stick to your personality.
        `;
        
        
        const fullMessages = [
            { role: "system", content: systemPrompt },
            ...messages.slice(-6)
        ];
        
        const completion = await groq.chat.completions.create({
            messages: fullMessages,
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9,
            frequency_penalty: 0.2
        });
        
        const responseText = completion.choices[0].message.content;
        
        return new Response(JSON.stringify({
            result: responseText,
            meta: {
                model: "llama3-70b-8192"
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST'
            }
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({
            error: "Connection error. Please try again.",
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}