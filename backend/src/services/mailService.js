import nodemailer from 'nodemailer';

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // Default fallback to user's Gmail App credentials
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT || 465; // Default to 465 SSL to bypass cloud port blocks
  const user = process.env.SMTP_USER || 'gangatharan949@gmail.com';
  const pass = process.env.SMTP_PASS || 'indb pgtm brux izqh';

  if (host && user && pass) {
    console.log("Using SMTP configuration...");
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  } else {
    console.log("No custom SMTP configured. Initializing Ethereal Test Email Account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      transporter.isTest = true;
    } catch (e) {
      console.error("Failed to initialize Ethereal Test Account. Falling back to console-only logger...", e);
      // Fallback dummy transporter that logs to console on failure
      transporter = {
        sendMail: async (options) => {
          console.log("\n[EMAIL FALLBACK LOGGER] Sending email:");
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body: ${options.html}`);
          return { messageId: 'dummy-id' };
        },
        isTest: true
      };
    }
  }
  return transporter;
}

export async function sendOtpEmail(email, name, otp) {
  try {
    const mailTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || 'gangatharan949@gmail.com',
      to: email,
      subject: 'CareerPilot AI - Verify Your Account',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">CareerPilot AI Mentor</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">AI-Powered Placement Assistant</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;"/>
          <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">Thank you for joining CareerPilot AI. Please verify your student profile using the verification code below to start practicing resume scoring, study roadmaps, and mock interviews:</p>
          
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 15px 0; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #8b5cf6;">${otp}</span>
          </div>
          
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
            This OTP is valid for 15 minutes. If you did not register on CareerPilot, please ignore this email.
          </p>
        </div>
      `
    };

    const info = await mailTransporter.sendMail(mailOptions);
    
    if (mailTransporter.isTest) {
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
      console.log("\n------------------------------------------------------------");
      console.log(`[Ethereal Mail Sandbox] Email sent to: ${email}`);
      console.log(`OTP Code: ${otp}`);
      if (previewUrl) {
        console.log(`Open message inbox preview at: ${previewUrl}`);
      }
      console.log("------------------------------------------------------------\n");
    } else {
      console.log(`Email sent successfully to ${email}`);
    }
    return info;
  } catch (err) {
    console.error("Failed to send OTP email: ", err);
    throw err;
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    const mailTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || 'gangatharan949@gmail.com',
      to: email,
      subject: 'Welcome to CareerPilot AI - Your Placement Journey Begins!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="display: inline-block; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; margin-bottom: 10px;">
              <span style="font-size: 32px;">🎯</span>
            </div>
            <h1 style="color: #8b5cf6; font-size: 26px; margin: 0; font-weight: 800;">Welcome to CareerPilot AI!</h1>
            <p style="color: #64748b; font-size: 15px; margin-top: 5px;">Your Personalized AI Placement Mentor</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;"/>
          
          <p style="font-size: 16px; line-height: 1.6; color: #334155;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">We are thrilled to welcome you to the platform! CareerPilot AI is designed to streamline your entire placement preparation journey in one visual workspace.</p>
          
          <h3 style="font-size: 16px; color: #1e293b; margin-top: 25px; margin-bottom: 12px; font-weight: 700;">🚀 Here is what you can do right now:</h3>
          <ul style="padding-left: 20px; font-size: 15px; color: #475569; line-height: 1.8;">
            <li>📝 <strong>ATS Resume Audit:</strong> Drag and drop your PDF resume to check your score and skill gaps.</li>
            <li>💬 <strong>Interactive AI Chat:</strong> Ask complex questions like "How does HashMap work under the hood?"</li>
            <li>🏆 <strong>Mock Interviews:</strong> Practice turn-based Java technical panels with evaluation scoring.</li>
            <li>🧠 <strong>Aptitude Rounds:</strong> Practice Quantitative, Logical, and Verbal MCQs with detailed solutions.</li>
            <li>📅 <strong>30-Day Planner:</strong> Set up daily tasks and build preparation streaks.</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173" style="display: inline-block; padding: 12px 30px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);">
              Start Preparing Now
            </a>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            If you need any guidance during your preparation, feel free to chat with your AI Placement Mentor anytime. Let's land that dream offer together!
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 15px;"/>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            CareerPilot AI Agent &bull; Placement Mentor Team
          </p>
        </div>
      `
    };

    const info = await mailTransporter.sendMail(mailOptions);
    if (mailTransporter.isTest) {
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
      console.log("\n------------------------------------------------------------");
      console.log(`[Ethereal Mail Sandbox] Welcome Email sent to: ${email}`);
      if (previewUrl) {
        console.log(`Open welcome message preview at: ${previewUrl}`);
      }
      console.log("------------------------------------------------------------\n");
    }
    return info;
  } catch (err) {
    console.error("Failed to send welcome email: ", err);
  }
}

export async function sendPerformanceReportEmail(email, name, report) {
  try {
    const { testType, score, weakAreas, recommendations } = report;
    const mailTransporter = await getTransporter();
    
    // Choose theme color depending on performance score
    const isPassing = score >= 70;
    const scoreColor = isPassing ? '#10b981' : '#f59e0b';
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'gangatharan949@gmail.com',
      to: email,
      subject: `CareerPilot AI - ${testType} Performance Report`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #8b5cf6; font-size: 24px; margin: 0; font-weight: 800;">Performance Report</h2>
            <p style="color: #64748b; font-size: 15px; margin-top: 5px;">${testType} Evaluation</p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;"/>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">
            You have successfully completed a mock <strong>${testType}</strong> evaluation. Here is your personalized performance report and recommended study guide:
          </p>

          <!-- Score Card -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="display: block; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px;">
              Score Achieved
            </span>
            <span style="font-size: 38px; font-weight: 800; color: ${scoreColor};">
              ${score}%
            </span>
          </div>

          <!-- Weak Areas Box -->
          <div style="background-color: rgba(245, 158, 11, 0.05); border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 15px; font-weight: 700;">
              ⚠️ Identified Weak Areas
            </h4>
            <p style="margin: 0; font-size: 14.5px; color: #78350f; line-height: 1.5;">
              ${weakAreas || 'No significant weak areas identified! Great work.'}
            </p>
          </div>

          <!-- Recommended Study Plan Box -->
          <div style="background-color: rgba(139, 92, 246, 0.05); border-left: 4px solid #8b5cf6; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #6d28d9; font-size: 15px; font-weight: 700;">
              💡 Recommended Study Plan &amp; Roadmaps
            </h4>
            <p style="margin: 0; font-size: 14.5px; color: #4c1d95; line-height: 1.5;">
              ${recommendations}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173" style="display: inline-block; padding: 12px 30px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 10px;">
              Practice Another Mock Test
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
            This evaluation report was generated automatically based on your responses. Keep practicing to improve!
          </p>
        </div>
      `
    };

    const info = await mailTransporter.sendMail(mailOptions);
    if (mailTransporter.isTest) {
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
      console.log("\n------------------------------------------------------------");
      console.log(`[Ethereal Mail Sandbox] Performance Report sent to: ${email}`);
      console.log(`Score: ${score}%`);
      if (previewUrl) {
        console.log(`Open report message preview at: ${previewUrl}`);
      }
      console.log("------------------------------------------------------------\n");
    }
    return info;
  } catch (err) {
    console.error("Failed to send performance report email: ", err);
  }
}

export async function sendResetPasswordEmail(email, name, otp) {
  try {
    const mailTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || 'gangatharan949@gmail.com',
      to: email,
      subject: 'CareerPilot AI - Reset Your Password',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #8b5cf6; font-size: 24px; margin: 0;">CareerPilot AI Mentor</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">AI-Powered Placement Assistant</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;"/>
          <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">We received a request to reset your password. Use the verification OTP code below to set up your new credentials:</p>
          
          <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 15px 0; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #8b5cf6;">${otp}</span>
          </div>
          
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
            This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `
    };

    const info = await mailTransporter.sendMail(mailOptions);
    if (mailTransporter.isTest) {
      const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
      console.log("\n------------------------------------------------------------");
      console.log(`[Ethereal Mail Sandbox] Password Reset Email sent to: ${email}`);
      console.log(`Reset OTP: ${otp}`);
      if (previewUrl) {
        console.log(`Open reset message preview at: ${previewUrl}`);
      }
      console.log("------------------------------------------------------------\n");
    }
    return info;
  } catch (err) {
    console.error("Failed to send reset password email: ", err);
    throw err;
  }
}

export default { sendOtpEmail, sendWelcomeEmail, sendPerformanceReportEmail, sendResetPasswordEmail };
