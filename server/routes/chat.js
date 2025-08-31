import express from 'express';
import axios from 'axios';
import Expert from '../models/Expert.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userMessages = req.body.messages;
    const lastUserMessage = userMessages.slice(-1)[0];
    const originalInput = lastUserMessage.content.trim().toLowerCase();

    // Manual greeting detection for friendly canned replies
    const greetings = [
      'hi', 'hello', 'hey', 'good', 'good morning', 'morning', 'good afternoon',
      'afternoon', 'good evening', 'evening', 'good night', 'night'
    ];

    if (greetings.some(greet => originalInput === greet || originalInput.startsWith(greet + ' '))) {
      let reply = '';
      if (originalInput.includes('morning')) reply = "Good morning! How can I help you today?";
      else if (originalInput.includes('afternoon')) reply = "Good afternoon! How can I help you today?";
      else if (originalInput.includes('evening')) reply = "Good evening! How can I help you today?";
      else if (originalInput.includes('night')) reply = "Have a Good night! How can I help you today?";
      else reply = "Hello! How can I help you today?";

      return res.json({
        ai: reply,
        experts: []
      });
    }

    // Normalize synonyms (map user phrases to standard keywords)
    const normalizationMap = {
      'user interface': 'ui',
      'user experience': 'ux',
      'ui/ux': 'ui ux',
      'front end': 'frontend',
      'back end': 'backend',
      // Add other mappings as needed
    };
    let normalizedInput = originalInput;
    Object.entries(normalizationMap).forEach(([key, val]) => {
      normalizedInput = normalizedInput.replace(new RegExp(key, 'gi'), val);
    });

    // Stop words to filter out non-meaningful words
    const stopWords = [
      'i', 'need', 'want', 'show', 'the', 'any', 'is', 'to', 'please', 'expert', 'experts', 'get',
      'here', 'me', 'require', 'could', 'would', 'can', 'tell', 'a', 'an', 'of', 'for',
      'with', 'on', 'at', 'and', 'in', 'do', 'does', 'how', 'what', 'where', 'who', 'when',
      'hi', 'hello', 'hey', 'ok', 'okay', 'chat', 'good', 'morning', 'afternoon', 'evening', 'location',
      'help', 'thanks', 'thank', 'yes', 'no'
    ];

    // Extract keywords filtering out stop words
    let keywords = normalizedInput
      .split(/\s+/)
      .filter(word => word && !stopWords.includes(word));

    if (keywords.length === 0) {
      // If after filtering no keywords, just send to AI directly without fetching experts
      const knowledgePrompt = {
        role: 'system',
        content: `You are an expert assistant for a platform connecting users with technical experts. Reply concisely and helpfully based only on the experts available on this platform. Do not mention external job platforms or websites. Give answer in max 2-3 lines.`
      };

      const aiResponse = await axios.post(
        'https://api.fireworks.ai/inference/v1/chat/completions',
        {
          model: 'accounts/fireworks/models/deepseek-v3p1',
          max_tokens: 300,
          temperature: 0.4,
          messages: [knowledgePrompt, lastUserMessage]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let aiContent = aiResponse.data.choices[0].message.content || '';
      if (aiContent.includes('</think>')) {
        aiContent = aiContent.split('</think>')[1].trim();
      }

      return res.json({
        ai: aiContent,
        experts: []
      });
    }

    // Build AND queries for MongoDB string matching in multiple fields
    const andQueries = keywords.map(kw => ({
      $or: [
        { domain: new RegExp(`\\b${kw}\\b`, 'i') },
        { about: new RegExp(`\\b${kw}\\b`, 'i') },
        { name: new RegExp(`\\b${kw}\\b`, 'i') },
        { location: new RegExp(`\\b${kw}\\b`, 'i') }
      ]
    }));

    const limitExperts = 20;

    // Fetch experts matching all keywords (AND logic)
    const experts = await Expert.find({ $and: andQueries }).limit(limitExperts).lean();

    // AI system prompt to keep answers concise and relevant
    const siteFeaturesText = `
This platform ("Domain Expert Discovery") helps users find and connect with verified technical experts.
Main features:
- Toggle dark mode via profile in top right
- Search experts by name, domain, or location
- Filter experts by domain (AI, Backend, Cloud, Cybersecurity, Data Science, etc)
- Save experts to Wishlist and view them later on the Wishlist page
- Contact support via Contact page
- Users get recommendations based on their interests
`;

const knowledgePrompt = {
  role: 'system',
  content: `
You are a helpful assistant on a platform for connecting users with technical experts. 
If the user's question is about a technology, such as "java", briefly explain what it is (max 2-3 lines), 
Do not tell the user how to use the site or mention the search, filter, or wishlist features.
${siteFeaturesText}  when user mentions about site then you should tell about site not everytime.
Do not mention external websites.`
};



    // Call AI for conversational response
    const aiResponse = await axios.post(
      'https://api.fireworks.ai/inference/v1/chat/completions',
      {
        model: 'accounts/fireworks/models/deepseek-v3p1',
        max_tokens: 300,
        temperature: 0.4,
        messages: [knowledgePrompt, lastUserMessage]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let aiContent = aiResponse.data.choices[0].message.content || '';

    if (aiContent.includes('</think>')) {
      aiContent = aiContent.split('</think>')[1].trim();
    }

    return res.json({
      ai: aiContent,
      experts
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
