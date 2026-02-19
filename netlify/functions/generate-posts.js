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

    // FALLBACK: Use pre-written posts if OpenAI fails
    let posts = [];
    
    try {
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
      posts = parsePostsFromResponse(responseText);
      
    } catch (aiError) {
      console.error('OpenAI error, using fallback:', aiError.message);
      // Use fallback posts
      posts = getFallbackPosts(businessType, tone, count);
    }

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
    console.error('Generation error:', error);
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

function getFallbackPosts(businessType, tone, count) {
  const fallbackPosts = {
    gym: [
      "New year, new you starts NOW. Not tomorrow. Not Monday. Today. Let's go! 💪",
      "Your only competition is the person you were yesterday. Keep pushing forward.",
      "Consistency > Perfection. Show up, do the work, see results.",
      "Rest days are important, but so is showing up. What's your workout today?",
      "Strong is the new skinny. Build muscle, build confidence, build life.",
      "You don't have to go fast. You just have to go. Progress is progress.",
      "Sore today, strong tomorrow. Your body is thanking you for every rep.",
      "Excuses don't burn calories. Get up and move! 🔥",
      "The only bad workout is the one you didn't do. Make it count today.",
      "Transformation doesn't happen overnight. Trust the process.",
      "Your mindset is everything. Train your mind as hard as your body.",
      "Champions aren't made in gyms. Champions are made from something deep inside them.",
      "Fitness is not about being better than someone else. It's about being better than you used to be.",
      "Success starts with self-discipline. Show up even when you don't feel like it.",
      "Every rep, every set, every workout gets you one step closer to your goals.",
      "The pain you feel today will be the strength you feel tomorrow.",
      "Stop wishing. Start doing. Your dream body requires work.",
      "Believe in yourself and all that you are. You are stronger than you think.",
      "Train insane or remain the same. Push past your limits today!",
      "Your body achieves what your mind believes. Think positive, train hard.",
      "Small daily improvements lead to stunning long-term results. Keep going!",
      "Muscles are torn in the gym, fed in the kitchen, and built in bed. Rest matters!",
      "Don't count days. Make the days count. Every workout matters.",
      "You're one workout away from a better mood. Come get that endorphin rush!",
      "Strive for progress, not perfection. Every step forward counts.",
      "The hardest lift is lifting yourself off the couch. But you got this!",
      "Your fitness journey is a marathon, not a sprint. Pace yourself and enjoy the ride.",
      "Sweat is just fat crying. Let's make it cry today! 😤",
      "Winners train, losers complain. Which one are you today?",
      "Strong mind, strong body. Work on both and watch yourself transform."
    ],
    restaurant: [
      "Fresh ingredients. Bold flavors. Come taste the difference today! 🍽️",
      "Life is too short for boring food. Try our chef's special this week!",
      "What's your comfort food? Share in the comments! ❤️",
      "Weekend brunch plans? We're ready for you! Reserve your table now.",
      "Behind every great dish is a team that cares. Meet our kitchen crew!",
      "New menu item alert! 🚨 Come try our [seasonal special] before it's gone.",
      "Food brings people together. Who are you bringing to dinner tonight?",
      "The secret ingredient is always love (and a little butter 😉)",
      "Craving something delicious? We've got you covered. See you soon!",
      "From farm to table, we source the best. Taste the freshness in every bite.",
      "Happy hour just got happier! Join us 4-6pm for $5 appetizers and drinks 🍻",
      "Date night done right. Romantic ambiance, amazing food, unforgettable moments.",
      "What's your go-to order? Let us know in the comments! 👇",
      "Foodie alert! Today's special is [dish name]. Limited quantities available!",
      "Nothing says love like sharing a great meal. Bring your favorite person today ❤️",
      "Pro tip: Save room for dessert. You won't regret it! 🍰",
      "We don't just serve food. We serve experiences. Come make memories with us.",
      "Local ingredients, global flavors. That's how we roll. 🌍",
      "Hungry? We're open and ready to serve you! Walk-ins welcome.",
      "Thank you for supporting local! Your community loves you back. 🙏",
      "Weekend vibes + good food = the perfect combination. See you this Saturday!",
      "Chef's kiss moment: When that first bite hits different. Come get yours! 👨‍🍳",
      "Food is our love language. What's yours? Share below! 💬",
      "Celebrating something special? Let us make it even more memorable. Book now!",
      "Rainy day? Comfort food weather! Come warm up with us. ☔",
      "We believe every meal should be an adventure. Ready to explore?",
      "Fresh baked bread. House-made sauces. Attention to detail. That's our promise.",
      "Can't decide? Try our tasting menu. A little bit of everything, all amazing.",
      "Supporting local farmers means fresher food for you. Win-win! 🌾",
      "Join us tonight! Tables are filling up fast. Reserve yours now. 📞"
    ],
    salon: [
      "Bad hair day? We've got you! Walk-ins welcome. ✂️",
      "Your hair is your crown. Wear it with confidence. Book your appointment today!",
      "New season, new look? Let's refresh your style together!",
      "Self-care isn't selfish. Treat yourself to a little pampering today. 💆‍♀️",
      "Before & after transformations that'll make you say WOW! Swipe to see ➡️",
      "Healthy hair starts with the right care. Ask us about our treatment options!",
      "Color season is here! Ready for a bold change or subtle refresh?",
      "We don't just do hair. We boost confidence, one cut at a time.",
      "Pro tip: Regular trims keep your hair healthy and gorgeous. Book yours now!",
      "Meet our amazing stylists! Talented, friendly, and here to make you look incredible.",
      "Wedding season is coming! Book your bridal hair trial early. 👰",
      "That fresh haircut feeling hits different. Come get yours! ✨",
      "Love your color? Thank your stylist! Don't forget to rebook before you leave.",
      "Hair goals: Achieved. ✅ Tag us in your selfies! We love seeing you shine.",
      "Damaged hair? We've got the perfect treatment plan for you. Let's talk!",
      "New here? First-time clients get 15% off! Welcome to the fam! 🎉",
      "Your hair, your rules. We're just here to make it fabulous.",
      "Behind the chair: A day in the life of a stylist. It's all about making you smile!",
      "Texture, volume, shine – what's your hair priority? We've got solutions for all!",
      "Hair inspo: Check out this gorgeous transformation! Who's next?",
      "Pro products make all the difference. Ask about our take-home recommendations!",
      "Confidence looks good on you. Let us help you wear it every day. 💁",
      "From dull to dazzling! Ready for your glow-up? Book now.",
      "Your stylist is your partner in haircare. Communication is key! Tell us what you want.",
      "Summer hair don't care? We'll make sure it does! Schedule your refresh now. ☀️",
      "Blondes, brunettes, redheads – we love them all! What's your shade?",
      "Hair emergency? We can squeeze you in! Call us for same-day appointments.",
      "Because you deserve to look and feel amazing. That's what we're here for.",
      "Trends come and go, but great hair is timeless. Let's create your signature look!",
      "Thank you for trusting us with your hair! Your support means everything. 🙏"
    ]
  };

  const posts = fallbackPosts[businessType] || fallbackPosts.gym;
  return posts.slice(0, count);
}

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
