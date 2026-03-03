import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface AIRecommendation {
    eventId: string;
    matchScore: number;
    reasoning: string;
}

export async function generateGroqRecommendations(
    studentProfile: any,
    upcomingEvents: any[]
): Promise<AIRecommendation[]> {
    const prompt = `
    You are an AI advisor for NIT Kurukshetra students.
    Student Profile (interests, branch, history): ${JSON.stringify(studentProfile)}
    Available Upcoming Events: ${JSON.stringify(upcomingEvents)}
    
    Based on the student's profile and past events, rate how likely they are to enjoy and attend each available event.
    
    Return a strictly valid JSON object containing a "recommendations" array matching this exact typescript interface:
    {
      "recommendations": Array<{
        "eventId": string, /* Strictly use the event object's 'id' field */
        "matchScore": number, /* 0 to 100 */
        "reasoning": string /* Short, engaging 1-sentence explanation addressing the student */
      }>
    }
  `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.2, // Low temperature for consistent JSON
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) return [];

        const json = JSON.parse(responseContent);
        return json.recommendations || [];
    } catch (error) {
        console.error("Groq API error:", error);
        return [];
    }
}
