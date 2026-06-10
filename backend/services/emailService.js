const nodemailer = require('nodemailer');

/**
 * Sends an email notification to a candidate when their application status is updated.
 * Falls back to logging to the console if SMTP details are missing in .env.
 */
const sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, companyName, newStatus) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT) || 587;

  // Simulator fallback for development if email credentials are not configured
  if (!emailUser || !emailPass) {
    console.log('\n======================================================================');
    console.log(`✉️  [EMAIL SIMULATOR - NO CREDENTIALS CONFIGURED]`);
    console.log(`To: ${candidateEmail} (${candidateName})`);
    console.log(`Subject: Application Status Updated`);
    console.log(`Body:`);
    console.log(`  Dear ${candidateName},`);
    console.log(`  Your application for "${jobTitle}" at "${companyName}" has been updated.`);
    console.log(`  New Status: [${newStatus}]`);
    console.log('======================================================================\n');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const statusColor = newStatus === 'Shortlisted' ? '#22C55E' : newStatus === 'Rejected' ? '#EF4444' : '#2563EB';

    const mailOptions = {
      from: `"HireFlow Platform" <${emailUser}>`,
      to: candidateEmail,
      subject: 'Application Status Updated - HireFlow',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F8FAFC; color: #1E293B;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563EB; font-size: 24px; margin: 0;">HireFlow</h1>
            <p style="color: #64748B; font-size: 14px; margin: 5px 0 0 0;">Job Board & Application Tracking</p>
          </div>
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h2 style="color: #1E293B; font-size: 18px; margin-top: 0;">Hi ${candidateName},</h2>
            <p>Your application status has been updated by the employer. Here are the details:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #F1F5F9; border-left: 4px solid #2563EB; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #64748B;">Job Position:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #1E293B;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #64748B;">Company:</td>
                  <td style="padding: 4px 0; color: #1E293B;">${companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; color: #64748B;">New Status:</td>
                  <td style="padding: 4px 0; font-weight: 700; color: ${statusColor};">${newStatus.toUpperCase()}</td>
                </tr>
              </table>
            </div>
            
            <p style="margin-bottom: 0;">Please log in to your dashboard to track all your applications and communicate further.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94A3B8; font-size: 11px;">
            <p>© ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Status update email sent successfully to ${candidateEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send status update email via SMTP:', error.message);
  }
};

const sendApplicationNotificationEmail = async (
  employerEmail,
  employerName,
  jobTitle,
  candidateDetails
) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT) || 587;

  const {
    fullName,
    email,
    phone,
    location,
    skills,
    summary,
    education,
    experience,
    resumeUrl,
  } = candidateDetails;

  const apiHost = process.env.VITE_API_URL || 'http://localhost:5000';
  const fullResumeUrl = resumeUrl ? `${apiHost}${resumeUrl}` : '';

  // Simulator fallback for development if email credentials are not configured
  if (!emailUser || !emailPass) {
    console.log('\n======================================================================');
    console.log(`✉️  [EMAIL SIMULATOR - NO CREDENTIALS CONFIGURED]`);
    console.log(`To Employer: ${employerEmail} (${employerName})`);
    console.log(`Subject: New Applicant for "${jobTitle}"`);
    console.log(`Body:`);
    console.log(`  Dear ${employerName},`);
    console.log(`  A new candidate has applied for your job posting: "${jobTitle}".`);
    console.log(`  Candidate Profile Details:`);
    console.log(`    - Name: ${fullName}`);
    console.log(`    - Email: ${email}`);
    console.log(`    - Phone: ${phone}`);
    console.log(`    - Location: ${location}`);
    console.log(`    - Skills: ${skills.join(', ')}`);
    console.log(`    - Summary: ${summary}`);
    console.log(`    - Education: ${education.join(', ')}`);
    console.log(`    - Experience: ${experience.join(', ')}`);
    console.log(`    - Resume: ${fullResumeUrl || 'None uploaded'}`);
    console.log('======================================================================\n');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"HireFlow Platform" <${emailUser}>`,
      to: employerEmail,
      subject: `New Application Received for ${jobTitle} - HireFlow`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #F8FAFC; color: #1E293B;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563EB; font-size: 24px; margin: 0;">HireFlow</h1>
            <p style="color: #64748B; font-size: 14px; margin: 5px 0 0 0;">Job Board & Application Tracking</p>
          </div>
          <div style="background-color: #FFFFFF; padding: 25px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h2 style="color: #1E293B; font-size: 18px; margin-top: 0;">Hello ${employerName},</h2>
            <p>A new candidate has applied for your job posting: <strong style="color: #2563EB;">${jobTitle}</strong>. Here are the candidate's profile details:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #F1F5F9; border-left: 4px solid #2563EB; border-radius: 4px; font-size: 14px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; width: 130px; vertical-align: top;">Full Name:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #1E293B;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Email:</td>
                  <td style="padding: 6px 0; color: #1E293B;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Phone Number:</td>
                  <td style="padding: 6px 0; color: #1E293B;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Location:</td>
                  <td style="padding: 6px 0; color: #1E293B;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Skills:</td>
                  <td style="padding: 6px 0; color: #1E293B;">${skills.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Summary:</td>
                  <td style="padding: 6px 0; color: #1E293B; line-height: 1.5;">${summary}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Work Experience:</td>
                  <td style="padding: 6px 0; color: #1E293B; line-height: 1.5;">
                    <ul style="margin: 0; padding-left: 18px;">
                      ${experience.map(exp => `<li>${exp}</li>`).join('')}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Education:</td>
                  <td style="padding: 6px 0; color: #1E293B; line-height: 1.5;">
                    <ul style="margin: 0; padding-left: 18px;">
                      ${education.map(edu => `<li>${edu}</li>`).join('')}
                    </ul>
                  </td>
                </tr>
                ${fullResumeUrl ? `
                <tr>
                  <td style="padding: 10px 0 6px 0; font-weight: 600; color: #64748B; vertical-align: top;">Resume Document:</td>
                  <td style="padding: 10px 0 6px 0;">
                    <a href="${fullResumeUrl}" target="_blank" style="background-color: #2563EB; color: #FFFFFF; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 12px; display: inline-block;">View / Download Resume</a>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="margin-bottom: 0;">Please log in to your dashboard to review this candidate and manage their application status.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #94A3B8; font-size: 11px;">
            <p>© ${new Date().getFullYear()} HireFlow Platform. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Application notification email sent successfully to employer ${employerEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send application notification email via SMTP:', error.message);
  }
};

module.exports = {
  sendStatusUpdateEmail,
  sendApplicationNotificationEmail,
};

