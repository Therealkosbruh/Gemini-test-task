import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';
const genAI = new GoogleGenerativeAI("AIzaSyB71WzLi5fxwIx6HNETfKdRAv-qLlNhU-Y");

const conversationContextFile = 'conversation_context.json';

// Load conversation context from file
async function loadConversationContext() {
  try {
    const context = await fs.readFile(conversationContextFile, 'utf8');
    return JSON.parse(context);
  } catch (error) {
    return { history: [], userInput: '' };
  }
}

// Save conversation context to file
async function saveConversationContext(context) {
  await fs.writeFile(conversationContextFile, JSON.stringify(context));
}

// Converting file information to a GoogleGenerativeAI.Part object.
async function fileToGenerativePart(path, mimeType) {
  const buffer = await fs.readFile(path);
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// Chat function
async function Chat(userInput, imagePaths = []) {
    const context = await loadConversationContext();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
    let prompt = userInput.trim();
    let parts = [];
  
    if (imagePaths.length > 0) {
      const promises = imagePaths.map(async (path) => {
        const mimeType = path.endsWith(".png") ? "image/png" : "image/jpeg";
        return fileToGenerativePart(path, mimeType);
      });
      const results = await Promise.all(promises);
      parts.push(...results);
    }
  
    if (prompt !== "") {
      parts.push({ text: prompt });
    }
  
    // Start a new chat or continue an existing one
    let inputParts = [];
  
    // Convert context history to GoogleGenerativeAI.Part objects
    context.history.forEach((part) => {
      if (part.role === "user") {
        inputParts.push({ text: part.parts[0].text });
      } else if (part.role === "model") {
        inputParts.push({ text: part.parts[0].text });
      }
    });
  
    inputParts.push({ text: prompt });
  
    // Add image parts to inputParts
    if (imagePaths.length > 0) {
      inputParts.push(...parts);
    }
  
    // Convert inputParts to GoogleGenerativeAI.Part objects
    const partObjects = inputParts.map((part) => {
      if (typeof part.text === 'string') {
        return { text: part.text };
      } else if (part.inlineData) {
        return part;
      } else {
        throw new Error("Invalid part object");
      }
    });
  
    // Send the user's message and get the response
    const result = await model.generateContent(partObjects);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  
    // Update the conversation context
    context.history.push({ role: "user", parts: [{ text: prompt }] });
    context.history.push({ role: "model", parts: [{ text: text }] });
    context.userInput = prompt;
  
    await saveConversationContext(context);
}

// converting user voice message
async function voiceToText(audioFilePath) {
    const audio = await fileToGenerativePart(audioFilePath, "audio/wav");
    const prompt = "Extract text from this audio.";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent([audio, prompt]);
    const text = await result.response.text();
    return text;
  }

// converting ai respond to voice message
  async function textToVoice(text) {
    const model = genAI.getGenerativeModel({ model: "tts-voice-1.0" });
    const audio = await model.generateContent([{ text: text }]);
    const audioFilePath = await saveAudioFile(audio);
    return audioFilePath;
  }

// sending message 
  async function sendVoiceMessage(audioFilePath) {
    const text = await voiceToText(audioFilePath);
    const context = await loadConversationContext();
    context.history.push({ role: "user", parts: [{ text: text }] });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([{ text: text }]);
    const response = await result.response;
    const responseText = response.text();
    const responseAudioFilePath = await textToVoice(responseText);
    context.history.push({ role: "model", parts: [{ text: responseText }] });
    context.userInput = text;
    await saveConversationContext(context);
    console.log(responseText);
    sendVoiceMessage(responseAudioFilePath);
  }
  

//sendVoiceMessage("includes/input.mp3"); for voice chat
// Chat("Describe this cat"); //only message
// Chat("", ["includes/tonscanlogo.png"]); // only image
// Chat("What color of this cat?", ["includes/tonscanlogo.png"]); //message and image