import express from 'express';
import axios from 'axios';
import Expert from '../models/Expert.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userMessages = req.body.messages;
    const lastUserMessage = userMessages.slice(-1)[0];
    const originalInput = lastUserMessage.content.trim().toLowerCase();

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
      return res.json({ ai: reply, experts: [] });
    }

    const normalizationMap = {
      'user interface': 'ui',
      'user experience': 'ux',
      'ui/ux': 'ui ux',
      'front end': 'frontend',
      'back end': 'backend',
      'ai': 'artificial intelligence',
    };
    let normalizedInput = originalInput;
    Object.entries(normalizationMap).forEach(([key, val]) => {
      normalizedInput = normalizedInput.replace(new RegExp(key, 'gi'), val);
    });

    const stopWords = [
      'i', 'need', 'want', 'show', 'the', 'any', 'is', 'to', 'please', 'expert', 'experts', 'get',
      'here', 'me', 'require', 'could', 'would', 'can', 'tell', 'a', 'an', 'of', 'for',
      'with', 'on', 'at', 'and', 'in', 'do', 'does', 'how', 'what', 'where', 'who', 'when',
      'hi', 'hello', 'hey', 'ok', 'okay', 'chat', 'good', 'morning', 'afternoon', 'evening', 'location',
      'help', 'thanks', 'thank', 'yes', 'no', 'roadmap', 'project', 'system', 'give'
    ];

    let keywords = normalizedInput
      .split(/\s+/)
      .filter(word => word && !stopWords.includes(word));

    const roadmapTriggers = [
  'roadmap', 'plan', 'planning', 'project', 'system', 'strategy', 'blueprint', 'framework', 'agenda', 'scheme', 'schedule', 'timeline', 'program', 'outline', 'proposal', 'design', 'path',
  'approach', 'course', 'method', 'guide', 'workflow', 'procedure','initiative', 'milestone', 'road map', 'plan of action', 'roadmapping','planning process', 'game plan', 'master plan', 'road line', 'schedule plan',
  'map', 'direction', 'steps', 'sequence', 'framework plan', 'task list','execution plan', 'development plan', 'process map', 'planning strategy'
];

    const isRoadmapRequest =
  roadmapTriggers.some(trigger =>
    originalInput.includes(trigger)
  ) &&
  originalInput.split(/\s+/).length > 2; // Only trigger if more than two words in input



    const aiKeywords = ['ai', 'artificial intelligence'];
    const isAiRelated = keywords.some(k => aiKeywords.includes(k));
    const shortAnswer = (keywords.length > 0 && keywords.length <= 2 && !isAiRelated);

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

    if (isRoadmapRequest) {
      const roadmapPrompt = {
        role: 'system',
        content: `
You are a helpful assistant for a platform connecting users with technical experts.
The user is asking about building a system.
Tell about a system first(2-3 lines) then continue.
Reply with a professional, well-formatted answer using proper Markdown formatting:

- Use # for main heading
- Use ## for subheadings  
- Use numbered lists (1. 2. 3.) for main domains
- Use **bold** for emphasis on key terms
- Keep each point on separate lines with proper line breaks
- List key expert domains and skills needed for the project
- Do NOT provide a full detailed roadmap, only the expertise overview required
- U should show matching experts for that domains, particularly domains which are present in our site and don't mention anything abour our platform
- Atlast u should ask if they need experts in any particular domain so that they can find in our site

Make sure to use proper line breaks and spacing for readability.
`
      };
      const aiResponse = await axios.post(
        'https://api.fireworks.ai/inference/v1/chat/completions',
        {
          model: 'accounts/fireworks/models/deepseek-v3p1',
          max_tokens: 600,
          temperature: 0.4,
          messages: [roadmapPrompt, lastUserMessage]
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
      return res.json({ ai: aiContent, experts: [] });
    }

    let promptContent = `
You are a helpful assistant on a platform for connecting users with technical experts. 
If the user's question is about a technology, such as "java", briefly explain what it is (max 3-4 lines).
Show this line only 2 times in chat "You can find many more domain experts on the [Experts page](/experts)."
Do not tell the user how to use the site or mention the search, filter, or wishlist features.
${siteFeaturesText} When user mentions about site then you should tell about site not everytime.
Do not mention external websites.


`;
    if (shortAnswer) {
      promptContent += `\nPlease keep your answer concise and limited to 2-3 lines.\n`;
    } else if (isAiRelated) {
      promptContent += `\nSince the question relates to AI or artificial intelligence, provide a detailed and informative response.\n`;
    }
    const knowledgePrompt = { role: 'system', content: promptContent };

    if (keywords.length === 0) {
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
      return res.json({ ai: aiContent, experts: [] });
    }

    const andQueries = keywords.map(kw => ({
      $or: [
        { domain: new RegExp(`\\b${kw}\\b`, 'i') },
        { about: new RegExp(`\\b${kw}\\b`, 'i') },
        { name: new RegExp(`\\b${kw}\\b`, 'i') },
        { location: new RegExp(`\\b${kw}\\b`, 'i') }
      ]
    }));

    const limitExperts = 20;
    const experts = await Expert.find({ $and: andQueries }).limit(limitExperts).lean();

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

const aboutTriggers = ['about', 'about us', 'who are you', 'what is this', 'what is this site', 'website info'];
const contactTriggers = ['contact', 'support', 'help', 'customer care', 'reach us', 'get in touch', 'contact page', 'mail', 'email'];
const wishlistTriggers = ['wishlist', 'saved', 'favorites', 'bookmarked', 'remembered', 'saved list'];
const expertsPageTriggers = ['expert', 'experts', 'domain experts', 'find experts', 'search experts', 'browse experts'];

if (contactTriggers.some(trigger => originalInput.includes(trigger))) {
  return res.json({
    ai: `You can reach our support team via the **[Contact page](/contact)** for any assistance or inquiries.`,
    experts: []
  });
}

if (wishlistTriggers.some(trigger => originalInput.includes(trigger))) {
  return res.json({
    ai: `You can save experts to your **[Wishlist](/dashboard)** for quick access. Manage your favorites anytime.`,
    experts: []
  });
}

if (aboutTriggers.some(trigger => originalInput.includes(trigger))) {
  return res.json({
    ai: `The About page provides information about the Domain Expert Discovery platform, its mission, and how it helps users connect with technical experts. Learn more on the **[About page](/about)**.`,
    experts: []
  });
}

    let aiContent = aiResponse.data.choices[0].message.content || '';
if (aiContent.includes('</think>')) {
  aiContent = aiContent.split('</think>')[1].trim();
}
    // Always add the About page markdown link before returning! 
//aiContent += "\n\nFor more information, visit our [**About page**](/about).";



    return res.json({ ai: aiContent, experts });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
