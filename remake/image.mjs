import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB71WzLi5fxwIx6HNETfKdRAv-qLlNhU-Y");

async function generateImage(prompt) {
  const request = {
    prompt: prompt,
  };

  const response = await gemini.generate(request);
  const imageData = response.generatedImage;
  const imageDataURL = `data:${response.mime_type};base64,${imageData.toString("base64")}`;
  return imageDataURL;
}

const prompt = "A futuristic cityscape with towering skyscrapers";
generateImage(prompt).then((imageDataURL) => {
  console.log(imageDataURL);
}).catch((error) => {
  console.error(error);
});