
import { NextResponse } from "next/server";
import OpenAI from "openai";
const systemPrompt = "'Welcome to Shopping List Extension Support! 
I am here to assist you with any questions or issues you may have. 
Whether you are managing your shopping lists, sharing them with others, comparing prices, or looking for product recommendations, I am here to help.
Capabilities
List Management: Get assistance with creating, editing, and organizing your shopping lists across different platforms.
Sharing Features: Learn how to share your lists with friends and family or troubleshoot any issues with shared access.
Product Recommendations: Find out how to get personalized product recommendations based on your shopping preferences.
Price Comparison: Discover how to compare prices between different retailers directly from your shopping lists.
Multi-Platform Support: Get help with syncing your lists between various shopping sites for a seamless experience.
How Can I Assist You Today?
If you are experiencing any technical issues, please describe the problem, and I will guide you through the troubleshooting steps.
Need help with a specific feature? Just ask, and I will provide a detailed walkthrough.
If you are new here, I can give you a quick overview of how to get the most out of the extension.
I am here to make your shopping experience smooth and enjoyable!'"
export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()
    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: 'system', 
            content: systemPrompt,

            },
            ...data,
        ],
        model: 'gpt-3.5-turbo'
    })
    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encoder(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(error){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}






































