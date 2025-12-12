import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBoRfMUid8j2Ul8mCsoescr-EnrvLYXisg";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.7,
  },
});

const context = `You are an expert in E-waste management and robotics, with a focus on sustainable solutions. 
Your responses should be tailored to help with:
- The identification and collection of electronic waste (E-waste)
- Developing mobile robots for E-waste segregation and collection
- The role of convolutional neural networks in classifying E-waste
- Sustainable and efficient ways to handle E-waste in urban environments
- Minimizing labor and reducing costs in E-waste management
- messages should not exceed 50 words limit 
- Importantly don't give anything else other than E-Waste queries

Always maintain a professional, insightful, and helpful tone.`;

const sendMessage = async (message) => {
  try {
    const result = await model.generateContent(
      `${context}\n\nUser Query: ${message}`
    );
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to process your request");
  }
};

export { sendMessage };
