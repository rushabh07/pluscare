import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1"
});

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: "meta/llama3-8b-instruct",
      messages: [{role: "user", content: "hello"}],
    });
    console.log("Response for meta/llama3-8b-instruct:", response.choices[0].message.content);
  } catch (e) {
    console.error("Error with meta/llama3-8b-instruct:", e.status, e.message);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [{role: "user", content: "hello"}],
    });
    console.log("Response for meta/llama-3.1-8b-instruct:", response.choices[0].message.content);
  } catch (e) {
    console.error("Error with meta/llama-3.1-8b-instruct:", e.status, e.message);
  }
}
main();
