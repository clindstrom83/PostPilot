// OpenAI Post Generation Function
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { businessType, tone, count = 30 } = JSON.parse(event.body);

    if (!businessType || !tone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Build the prompt based on business type and tone
    const prompt = buildPrompt(businessType, tone, count);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional social media content creator. Generate engaging, platform-appropriate posts that drive engagement. Each post should be concise, actionable, and authentic.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    // Parse the response
    const responseText = completion.choices[0].message.content;
    const posts = parsePostsFromResponse(responseText);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        posts: posts.slice(0, count),
        businessType,
        tone,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('OpenAI generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate posts',
        message: error.message 
      })
    };
  }
};

function buildPrompt(businessType, tone, count) {
  const toneMap = {
    professional: 'professional, authoritative, and trustworthy',
    casual: 'casual, friendly, and conversational',
    funny: 'witty, humorous, and entertaining'
  };

  const businessDescriptions = {
    gym: 'gym or fitness center',
    restaurant: 'restaurant or cafe',
    salon: 'hair salon or barber shop',
    realtor: 'real estate agent',
    coach: 'life coach or business coach',
    photographer: 'photographer',
    lawyer: 'law firm or attorney',
    dentist: 'dentist or dental office',
    plumber: 'plumber or HVAC service',
    boutique: 'boutique or retail store',
    consultant: 'business consultant',
    agency: 'marketing agency',
    freelancer: 'freelancer',
    other: 'small business'
  };

  const businessDesc = businessDescriptions[businessType] || 'business';
  const toneDesc = toneMap[tone] || 'professional';

  return `Generate ${count} unique social media posts for a ${businessDesc}. 

Tone: ${toneDesc}

Requirements:
- Each post should be 150-250 characters (perfect for Instagram/Facebook/Twitter)
- Mix of content types: tips, questions, behind-the-scenes, value-adds, calls-to-action
- Use emojis sparingly and naturally
- Include engagement hooks (questions, calls-to-action)
- Make them feel authentic, not salesy
- Vary the structure and approach

Format your response as a numbered list:
1. [First post]
2. [Second post]
3. [Third post]
...and so on.

Make each post unique and valuable. Ready? Generate ${count} posts:`;
}

function parsePostsFromResponse(responseText) {
  // Split by numbered lines
  const lines = responseText.split('\n');
  const posts = [];
  
  let currentPost = '';
  
  for (const line of lines) {
    // Check if line starts with a number (1., 2., etc.)
    const match = line.match(/^\d+\.\s*(.+)$/);
    
    if (match) {
      // Save previous post if exists
      if (currentPost.trim()) {
        posts.push(currentPost.trim());
      }
      // Start new post
      currentPost = match[1];
    } else if (line.trim() && currentPost) {
      // Continue current post
      currentPost += ' ' + line.trim();
    }
  }
  
  // Add last post
  if (currentPost.trim()) {
    posts.push(currentPost.trim());
  }
  
  return posts;
}
