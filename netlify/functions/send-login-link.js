const { Resend } = require('resend');
const { createToken } = require('./lib/storage-simple');

const resend = new Resend(process.env.RESEND_API_KEY);
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

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
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    // Create secure token
    const token = await createToken(email, TOKEN_EXPIRY);

    // Create login link
    const loginUrl = `${process.env.SITE_URL || 'https://reviewpilot.business'}/dashboard.html?token=${token}`;

    // Send email via Resend
    try {
      await resend.emails.send({
        from: 'ReviewPilot <noreply@reviewpilot.business>',
        to: email,
        subject: '🔐 Your ReviewPilot Login Link',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 32px; font-weight: 900; color: #2563eb; margin-bottom: 10px; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
              .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 40px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">ReviewPilot</div>
                <p style="color: #64748b;">Your secure login link is ready</p>
              </div>
              
              <p>Hi there,</p>
              <p>Click the button below to access your ReviewPilot dashboard:</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">🔐 Login to Dashboard</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link expires in 15 minutes and can only be used once.
              </div>
              
              <p style="font-size: 14px; color: #64748b;">
                If you didn't request this login link, you can safely ignore this email.
              </p>
              
              <div class="footer">
                <p>ReviewPilot - Custom Website Design</p>
                <p>Need help? Reply to this email</p>
              </div>
            </div>
          </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success but with fallback
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Login link generated',
          loginUrl: loginUrl, // Fallback if email fails
          expiresIn: '15 minutes',
          warning: 'Email delivery may be delayed'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Login link sent to your email',
        expiresIn: '15 minutes'
      })
    };
  } catch (error) {
    console.error('Login link error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
