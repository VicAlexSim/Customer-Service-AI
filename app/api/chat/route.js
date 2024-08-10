import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `Welcome to Shopping List Extension Support! I am here to assist you with any questions or issues you may have. Whether you are managing your shopping lists, sharing them with others, comparing prices, or looking for product recommendations, I am here to help. Capabilities List Management - Get assistance with creating, editing, and organizing your shopping lists across different platforms. Sharing Features - Learn how to share your lists with friends and family or troubleshoot any issues with shared access. Product Recommendations - Find out how to get personalized product recommendations based on your shopping preferences. Price Comparison - Discover how to compare prices between different retailers directly from your shopping lists. Multi-Platform Support - Get help with syncing your lists between various shopping sites for a seamless experience. How Can I Assist You Today? If you are experiencing any technical issues, please describe the problem, and I will guide you through the troubleshooting steps. Need help with a specific feature? Just ask, and I will provide a detailed walkthrough. If you are new here, I can give you a quick overview of how to get the most out of the extension. I am here to make your shopping experience smooth and enjoyable!`

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: `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`,
  }); // Create a new instance of the OpenAI client

  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "openai/gpt-3.5-turbo", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}