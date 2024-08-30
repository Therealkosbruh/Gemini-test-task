import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiApi {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  // async image(prompt) {
  //   const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  //   const result = await model.generateImage(prompt);
  //   const response = await result.response;
  //   const image = response.image();
  //   return image;
  // }

  // async chatWithPrompt(prompt) {
  //   const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  //   const result = await model.generateContent(prompt);
  //   const response = await result.response;
  //   const text = response.text();
  //   return text;
  // }
}

export default GeminiApi;