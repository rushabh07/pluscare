import OpenAI from "openai";
import User from "../models/userModel.js";
import Department from "../models/departmentModel.js";
import Appointment from "../models/appointmentModel.js";

// Helper to lazy-load the OpenAI client to ensure dotenv has populated process.env
const getOpenAIClient = () => {
    const apiKey = process.env.NVIDIA_API_KEY;
    const baseURL = "https://integrate.api.nvidia.com/v1";
    const defaultModel = "meta/llama-3.2-11b-vision-instruct";

    const client = apiKey
        ? new OpenAI({
            apiKey: apiKey,
            baseURL: baseURL,
        })
        : null;

    return { client, defaultModel };
};

// ------------------------------------------------------------
// Nvidia API integration (optional, separate client)
// ------------------------------------------------------------
// Nvidia API key should be stored in .env as NVIDIA_API_KEY. If not set, the function
// will fallback to a placeholder for local testing (do NOT commit real keys).
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const nvidiaClient = new OpenAI({
    apiKey: nvidiaApiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
});

/**
 * Call Nvidia's large model (gpt-oss-120b) with a chat completion request.
 * @param {Array} messages - Array of {role, content} objects.
 * @returns {Promise<string>} The model's reply content.
 */
export const nvidiaChat = async (messages = []) => {
    if (!nvidiaApiKey) {
        throw new Error("NVIDIA_API_KEY is not configured in .env");
    }
    const completion = await nvidiaClient.chat.completions.create({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: messages,
        temperature: 1,
        top_p: 1,
        max_tokens: 4096,
        stream: false,
    });
    // Nvidia may include a reasoning_content field; fallback to normal content.
    const reasoning = completion.choices[0]?.message?.reasoning_content;
    const content = completion.choices[0]?.message?.content || "";
    return reasoning ? `${reasoning}\n${content}` : content;
};

/**
 * Existing chatWithAI uses primary client (Ollama/OpenAI). Remains unchanged.
 */




/**
 * System prompt for PlusCare AI Assistant
 */
const SYSTEM_PROMPT = `You are the AI Health Assistant for PlusCare Hospital Management System.

Always format your response using a clean, well-structured layout:

### 🩺 Summary
- Provide a clear, empathetic 2-3 sentence overview of the topic or condition.

### 📋 Key Details
- List key facts, symptoms, or diagnostic components using standard bullet points (-).
- Place EACH bullet point on its own new line.
- Use **bold text** to highlight critical medical terms, tests, or metrics.

### 💡 Recommendations
- Provide practical, actionable next steps or lifestyle advice on separate bullet points (-).

### ⚠️ Medical Disclaimer
- State clearly that the information provided is for educational purposes only and does not replace professional medical advice.
- Advise seeking immediate emergency care or consulting a doctor for severe symptoms.

Formatting Rules:
- Use standard Markdown headings (###) without rigid section numbering.
- Use standard hyphen bullet points (- ) rather than raw bullet symbols.
- Keep responses concise, clear, professional, and visually structured.
- If answering questions about hospital services, doctors, or departments, use data from the PlusCare database.`;

/**
 * Handle AI Assistant conversation
 * @param {Array} messages - Array of message objects [{ role: 'user'|'assistant', content: string }]
 */
export const chatWithAI = async (messages = []) => {
    const { client, defaultModel } = getOpenAIClient();
    if (!client) {
        throw new Error("AI API key is missing. Please check backend .env for OLLAMA_API or OPENAI_API_KEY.");
    }
    const formattedMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
            role: m.role || (m.from === "user" ? "user" : "assistant"),
            content: m.content || m.text || "",
        })),
    ];
    try {
        const response = await client.chat.completions.create({
            model: defaultModel,
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 600,
        });
        return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your request at this time.";
    } catch (error) {
        if (error?.response?.status === 429) {
            // Rate limit exceeded – return a friendly fallback message
            return "The AI service is currently at capacity. Please try again a moment later.";
        }
        console.error("chatWithAI error:", error);
        throw error;
    }
};

/**
 * Helper to safely extract JSON from AI response text
 */
const extractJSON = (text) => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (err) {
                return null;
            }
        }
        return null;
    }
};

/**
 * Analyze symptoms and recommend department, doctor, & available slots based on live MongoDB data
 * @param {string} symptom - Symptoms described by user
 */
export const analyzeSymptomsAndTriage = async (symptom) => {
    const { client, defaultModel } = getOpenAIClient();
    if (!client) {
        throw new Error("AI API key is missing. Please check backend .env for OLLAMA_API or OPENAI_API_KEY.");
    }

    // 1. Fetch live Departments and Doctor Users from MongoDB
    const departments = await Department.find({ status: "Active" });
    const doctors = await User.find({ role: "Doctor" }).select("-password");

    const deptList = departments.map((d) => ({
        id: d._id,
        name: d.name,
        description: d.description,
    }));

    const doctorList = doctors.map((doc) => ({
        id: doc._id,
        userId: doc._id,
        name: doc.fullName || "Dr. Specialist",
        specialization: doc.specialization || "General Medicine",
        departmentName: doc.department || "General Medicine",
    }));

    // 2. Prompt AI to select the best Department & Doctor based on symptoms
    const triagePrompt = `You are a clinical triage assistant for PlusCare Hospital.
A patient presents with the following symptoms: "${symptom}".

Available Departments in our Hospital Database:
${JSON.stringify(deptList, null, 2)}

Available Doctors in our Hospital Database:
${JSON.stringify(doctorList, null, 2)}

Analyze the symptoms and return a JSON object ONLY with the following schema:
{
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "advice": "Brief medical recommendation / guidance in simple terms",
  "department": "Exact Department Name matched from DB",
  "doctorName": "Exact Doctor Name matched from DB",
  "doctorId": "Matching Doctor User DB _id"
}

Strict Rules:
- Select from the provided hospital database doctors and departments whenever possible.
- Do NOT provide a final medical diagnosis. Always recommend visiting the appropriate doctor.
- Return valid JSON only, without any markdown enclosing text.`;

    try {
        const completion = await client.chat.completions.create({
            model: defaultModel,
            messages: [{ role: "user", content: triagePrompt }],
            temperature: 0.3,
        });
        const resultText = completion.choices[0]?.message?.content;
        const parsedResult = extractJSON(resultText) || {
            priority: "Medium",
            advice: "Please consult with a specialist for further evaluation.",
            department: deptList[0]?.name || "General Medicine",
            doctorName: doctorList[0]?.name || "Dr. Specialist",
            doctorId: doctorList[0]?.userId || doctorList[0]?.id,
        };

        // 3. Find target doctor details and default slots
        const selectedDoc = doctors.find(
            (doc) =>
                doc.fullName === parsedResult.doctorName ||
                doc._id.toString() === parsedResult.doctorId
        ) || doctors[0];

        const standardSlots = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"];

        return {
            priority: parsedResult.priority || "Medium",
            advice: parsedResult.advice || "We recommend consulting a specialist.",
            department: parsedResult.department || selectedDoc?.department || "General Medicine",
            doctor: selectedDoc?.fullName || parsedResult.doctorName || "Dr. Specialist",
            doctorId: selectedDoc?._id || parsedResult.doctorId,
            doctorObjId: selectedDoc?._id,
            availableSlots: standardSlots,
        };
    } catch (error) {
        if (error?.response?.status === 429) {
            return {
                priority: "Medium",
                advice: "The AI service is currently overloaded. Please try again later.",
                department: "General Medicine",
                doctor: "Dr. Specialist",
                doctorId: null,
                doctorObjId: null,
                availableSlots: [],
            };
        }
        console.error("analyzeSymptomsAndTriage error:", error);
        throw error;
    }
};

/**
 * Check if an appointment slot is available to prevent double booking
 */
export const checkSlotAvailability = async (doctorId, appointmentDate, timeSlot) => {
    const dateObj = new Date(appointmentDate);
    const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
    const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

    const existing = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        timeSlot: timeSlot,
        status: { $ne: "Cancelled" },
    });

    return !existing;
};
