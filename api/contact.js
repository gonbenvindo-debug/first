// ===================================
// API ROUTES FOR CONTACT FORM
// Vercel Serverless Functions
// ===================================

import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method } = req;

    switch (method) {
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// POST /api/contact - Submit contact form
async function handlePost(req, res) {
  const {
    name,
    email,
    phone,
    company,
    product_type,
    project_type,
    budget,
    timeline,
    message
  } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, email, message' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate name length
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
  }

  // Validate message length
  if (message.length < 10 || message.length > 2000) {
    return res.status(400).json({ error: 'Message must be between 10 and 2000 characters' });
  }

  // Validate phone format if provided
  if (phone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone format' });
    }
  }

  try {
    // Create contact record
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        product_type: product_type ? product_type.trim() : null,
        project_type: project_type ? project_type.trim() : null,
        budget: budget ? budget.trim() : null,
        timeline: timeline ? timeline.trim() : null,
        message: message.trim(),
        status: 'pending',
        priority: determinePriority(budget, project_type)
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ error: 'Failed to submit contact form' });
    }

    // Send notification email
    try {
      await sendContactNotificationEmail(data);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    try {
      await sendContactConfirmationEmail(data);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({ 
      message: 'Contact form submitted successfully',
      contact: data 
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Failed to submit contact form' });
  }
}

// Helper function to determine priority based on budget and project type
function determinePriority(budget, projectType) {
  if (!budget && !projectType) return 'medium';
  
  const highBudgetKeywords = ['5000+', '10000+', 'elevado', 'alto'];
  const urgentProjectTypes = ['urgente', 'emergência', 'imediato'];
  
  const budgetLower = budget ? budget.toLowerCase() : '';
  const projectLower = projectType ? projectType.toLowerCase() : '';
  
  if (highBudgetKeywords.some(keyword => budgetLower.includes(keyword)) ||
      urgentProjectTypes.some(keyword => projectLower.includes(keyword))) {
    return 'high';
  }
  
  if (budgetLower.includes('1000+') || budgetLower.includes('médio')) {
    return 'medium';
  }
  
  return 'low';
}

// Send notification email to admin
async function sendContactNotificationEmail(contact) {
  console.log('Sending contact notification email for:', contact.email);
  
  // This would integrate with an email service like Resend
  /*
  const { data, error } = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL,
      to: [process.env.CONTACT_EMAIL],
      subject: `New Contact Form Submission - ${contact.name}`,
      html: generateContactNotificationTemplate(contact)
    })
  });

  if (error) {
    throw new Error('Failed to send notification email');
  }
  */
}

// Send confirmation email to customer
async function sendContactConfirmationEmail(contact) {
  console.log('Sending contact confirmation email to:', contact.email);
  
  // This would integrate with an email service like Resend
  /*
  const { data, error } = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL,
      to: [contact.email],
      subject: 'Thank you for contacting PrintCraft',
      html: generateContactConfirmationTemplate(contact)
    })
  });

  if (error) {
    throw new Error('Failed to send confirmation email');
  }
  */
}

function generateContactNotificationTemplate(contact) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Form Submission</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Contact Details</h3>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        ${contact.phone ? `<p><strong>Phone:</strong> ${contact.phone}</p>` : ''}
        ${contact.company ? `<p><strong>Company:</strong> ${contact.company}</p>` : ''}
        ${contact.product_type ? `<p><strong>Product Type:</strong> ${contact.product_type}</p>` : ''}
        ${contact.project_type ? `<p><strong>Project Type:</strong> ${contact.project_type}</p>` : ''}
        ${contact.budget ? `<p><strong>Budget:</strong> ${contact.budget}</p>` : ''}
        ${contact.timeline ? `<p><strong>Timeline:</strong> ${contact.timeline}</p>` : ''}
        <p><strong>Priority:</strong> ${contact.priority}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
        <h3>Message</h3>
        <p style="white-space: pre-wrap;">${contact.message}</p>
      </div>
      
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View in Admin Panel
        </a>
      </p>
    </div>
  `;
}

function generateContactConfirmationTemplate(contact) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Thank you for contacting PrintCraft!</h2>
      
      <p>Hi ${contact.name},</p>
      
      <p>Thank you for reaching out to us. We have received your message and will get back to you within 24 hours.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Your Message Summary</h3>
        <p><strong>Product Type:</strong> ${contact.product_type || 'Not specified'}</p>
        <p><strong>Project Type:</strong> ${contact.project_type || 'Not specified'}</p>
        <p><strong>Budget:</strong> ${contact.budget || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${contact.timeline || 'Not specified'}</p>
      </div>
      
      <p>If you have any questions or need to provide additional information, please don't hesitate to contact us directly at <a href="mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}">${process.env.NEXT_PUBLIC_CONTACT_EMAIL}</a> or call us at ${process.env.NEXT_PUBLIC_CONTACT_PHONE}.</p>
      
      <p>Best regards,<br>The PrintCraft Team</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
        <p>PrintCraft - Especialistas em produtos personalizados de publicidade</p>
        <p>${process.env.NEXT_PUBLIC_CONTACT_PHONE} | ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}</p>
      </div>
    </div>
  `;
}
