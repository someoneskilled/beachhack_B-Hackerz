import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});



export async function POST(req) {
    try {

        const { messages,initialPrompt } = await req.json();
        console.log(initialPrompt)

        const SYSTEM_PROMPT = `
        You are an AI assistant that helps people with general questions and tasks. Follow these guidelines:
        1. Provide clear, concise, and factual answers
        2. Break down complex topics into easy-to-understand explanations
        3. Admit when you don't know something
        4. Maintain a neutral and professional tone
        5. Verify facts before presenting them as truth
        `;

        const fullMessages = [
            { role: "system", content: SYSTEM_PROMPT },
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