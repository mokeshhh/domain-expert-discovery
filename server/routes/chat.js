import express from 'express';
import axios from 'axios';
import Expert from '../models/Expert.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userMessages = req.body.messages;
    const lastUserMessage = userMessages.slice(-1)[0];
    const originalInput = lastUserMessage.content.trim().toLowerCase();

    // 1. Immediate Greeting Handler
    const greetings = [
      'hi', 'hello', 'hey', 'good morning', 'morning', 'good afternoon',
      'afternoon', 'good evening', 'evening', 'good night'
    ];

    if (greetings.some(greet => originalInput === greet || originalInput.startsWith(greet + ' '))) {
      let reply = "Hello! I am your assistant for Domain Expert Discovery. How can I help you find an expert today?";
      return res.json({ ai: reply, experts: [] });
    }

    // 2. Intent Detection & Keyword Extraction
    // Removed 'expert/experts' from stopwords so we can detect search intent
    const seekerKeywords = ['expert', 'experts', 'profiles', 'people', 'talent', 'developers', 'find', 'show'];
    const stopWords = [
      'i', 'need', 'want', 'the', 'is', 'to', 'please', 'get', 'here', 'me', 'require', 
      'could', 'would', 'can', 'tell', 'a', 'an', 'of', 'for', 'with', 'on', 'at', 'and', 'in'
    ];

    const keywords = originalInput
      .split(/\s+/)
      .filter(word => word && !stopWords.includes(word) && !seekerKeywords.includes(word));

    // 3. Database-First Query Logic
    // Using flexible regex to ensure 'frontend' matches 'frontend developer'
    let experts = [];
    if (keywords.length > 0) {
      const orQueries = keywords.map(kw => ({
        $or: [
          { domain: new RegExp(kw, 'i') },
          { about: new RegExp(kw, 'i') },
          { name: new RegExp(kw, 'i') },
          { location: new RegExp(kw, 'i') }
        ]
      }));
      experts = await Expert.find({ $or: orQueries }).limit(10).lean();
    }

    // 4. Feature Navigation Triggers
    const contactTriggers = ['contact', 'support', 'help', 'mail'];
    const wishlistTriggers = ['wishlist', 'saved', 'favorites'];

    if (contactTriggers.some(t => originalInput.includes(t))) {
      return res.json({ ai: "You can reach our support team via the **[Contact page](/contact)**.", experts: [] });
    }
    if (wishlistTriggers.some(t => originalInput.includes(t))) {
      return res.json({ ai: "Manage your favorites on your **[Wishlist](/dashboard)** page.", experts: [] });
    }

    // 5. Specialized Roadmap Logic
    const roadmapTriggers = ['roadmap', 'plan', 'strategy', 'path', 'steps'];
    const isRoadmapRequest = roadmapTriggers.some(t => originalInput.includes(t)) && originalInput.split(/\s+/).length > 2;

    if (isRoadmapRequest) {
      const roadmapPrompt = {
        role: 'system',
        content: `You are a technical consultant. Create a 5-step roadmap for ${keywords.join(' ')} project.
        Mention that we have ${experts.length} experts in our database who specialize in these areas.
        Ask the user if they want to view details for these experts.`
      };
      const aiResponse = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
          model: 'accounts/fireworks/models/deepseek-v3p1',
          max_tokens: 600,
          temperature: 0.4,
          messages: [roadmapPrompt, lastUserMessage]
        },
        { headers: { Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`, 'Content-Type': 'application/json' } }
      );
      let aiContent = aiResponse.data.choices[0].message.content || '';
      return res.json({ ai: aiContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim(), experts });
    }

    // 6. Final AI Response with Database Context Injection
    const promptContent = `
    You are the assistant for the "Domain Expert Discovery" platform.
    INTERNAL DATABASE CONTEXT: We found ${experts.length} matching profiles for "${keywords.join(' ')}".
    
    INSTRUCTIONS:
    - If experts > 0: Explain the tech briefly and say "I found these expert profiles for you below."
    - If experts == 0: Explain the tech but admit we don't have matching experts yet. Suggest checking the [Experts page](/experts).
    - Stay concise (3-4 lines). Do not mention external sites.
    `;

    const aiResponse = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', {
        model: 'accounts/fireworks/models/deepseek-v3p1',
        max_tokens: 300,
        temperature: 0.3,
        messages: [{ role: 'system', content: promptContent }, lastUserMessage]
      },
      { headers: { Authorization: `Bearer ${process.env.FIREWORKS_API_KEY}`, 'Content-Type': 'application/json' } }
    );

    let aiContent = aiResponse.data.choices[0].message.content || '';
    aiContent = aiContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // 7. Return AI text AND MongoDB results
    return res.json({ ai: aiContent, experts });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;