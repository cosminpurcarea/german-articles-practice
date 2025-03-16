import { rateLimitMiddleware } from './middleware';

// Helper function to run middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // Apply rate limiting
  try {
    await runMiddleware(req, res, rateLimitMiddleware);
  } catch (e) {
    return res.status(429).send('Too many requests, please try again later.');
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Get the form data
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !subject || !message) {
    return res.status(400).send('Please fill out all fields');
  }

  try {
    // Here we would normally send an email using a service like SendGrid, Mailgun, etc.
    // For this example, we'll just log the data and return a success message
    
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, you would send an email here
    // Example with SendGrid:
    // const msg = {
    //   to: 'contact@raegera.com',
    //   from: 'noreply@raegera.com',
    //   replyTo: email,
    //   subject: `[Contact Form] ${subject}`,
    //   text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    // };
    // await sgMail.send(msg);
    
    // Store the contact request in the database (optional)
    // This would require setting up a 'contact_requests' table in Supabase
    
    // Return success response
    return res.status(200).send('Your message has been sent! We will get back to you soon.');
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).send('Server error. Please try again later.');
  }
} 