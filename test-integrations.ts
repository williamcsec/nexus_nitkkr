import { generateGroqRecommendations } from './lib/groq/recommendations';
import { generateCertificateUrl } from './lib/cloudinary/generate-certificate';

async function runTests() {
    console.log("==========================================");
    console.log("🧪 RUNNING INTEGRATION TESTS");
    console.log("==========================================");

    // 1. Test Cloudinary
    console.log("\n[Test 1] Cloudinary Certificate Generation");
    try {
        const studentName = "Aarav Sharma";
        const eventName = "Tech Symposium 2026";
        const templateId = "dxjuioanw"; // using the cloud name as a dummy template ID to see if URL builds properly

        const url = generateCertificateUrl(studentName, eventName, templateId);
        console.log("✅ Successfully generated Cloudinary URL:");
        console.log(url);
        if (!url.includes(encodeURIComponent(studentName))) {
            throw new Error("URL does not contain the encoded student name.");
        }
    } catch (err: any) {
        console.error("❌ Cloudinary Test Failed:", err.message);
    }

    // 2. Test Groq AI
    console.log("\n[Test 2] Groq AI Recommendations (Llama-3.3-70b)");
    try {
        const studentProfile = {
            branch: "Computer Science",
            interests: ["blockchain", "aiml", "webdev"]
        };

        const upcomingEvents = [
            { id: "evt-001", title: "Web3 Hackathon", description: "Build smart contracts", event_type: "Hackathon", tags: ["blockchain", "web3"] },
            { id: "evt-002", title: "Poetry Slam", description: "Open mic night", event_type: "Cultural", tags: ["literature"] },
            { id: "evt-003", title: "AI/ML Workshop", description: "Intro to Neural Networks", event_type: "Workshop", tags: ["aiml", "python"] }
        ];

        console.log("Sending prompt to Groq...");
        const recs = await generateGroqRecommendations(studentProfile, upcomingEvents);

        console.log("✅ Groq Response Received:");
        console.log(JSON.stringify(recs, null, 2));

        if (!Array.isArray(recs) || recs.length === 0) {
            throw new Error("Groq returned an empty or invalid recommendations array.");
        }
    } catch (err: any) {
        console.error("❌ Groq Test Failed:", err);
    }

    console.log("\n==========================================");
    console.log("🏁 TESTS COMPLETED");
    console.log("==========================================");
}

runTests();
