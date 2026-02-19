const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
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
    const { reviewText, tone = 'professional' } = JSON.parse(event.body);

    if (!reviewText || reviewText.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Review text is required' })
      };
    }

    // Define tone instructions
    const toneInstructions = {
      professional: 'Write a professional, courteous response that maintains business reputation.',
      apologetic: 'Write an empathetic, apologetic response that acknowledges the customer\'s concerns and offers to make things right.',
      friendly: 'Write a warm, friendly response that feels personal and genuine.'
    };

    const systemPrompt = `You are an expert at responding to Google Business reviews. ${toneInstructions[tone] || toneInstructions.professional}

Guidelines:
- Keep responses between 50-150 words
- For negative reviews: Acknowledge the issue, apologize sincerely, offer a resolution
- For positive reviews: Express gratitude, highlight what they enjoyed, invite them back
- For neutral reviews: Thank them for feedback, mention improvements
- Use the customer's name if mentioned in the review
- Never be defensive or argumentative
- Sound human and authentic, not robotic
- End with a call to action when appropriate (contact us, come back, etc.)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Review to respond to:\n\n"${reviewText}"` }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        response,
        tone,
        reviewText: reviewText.substring(0, 200) // Return truncated for confirmation
      })
    };

  } catch (error) {
    console.error('Error generating review response:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate response',
        details: error.message 
      })
    };
  }
};
