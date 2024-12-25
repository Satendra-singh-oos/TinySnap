import SibApiV3Sdk from "@getbrevo/brevo";
import { ApiError } from "./ApiError.js";

export const sendEmail = async (options) => {
  try {
    // Initialize Bravo mailing instance

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BRAVO_API_KEY
    );

    // create the smtpEMail
    const sendSmtpEmail = {
      sender: {
        name: "tinysnap",
        email: process.env.BRAVO_SENDER_EMAIL,
      },

      to: [
        {
          email: options.email,
        },
      ],

      subject: options.subject,
      htmlContent: options.htmlContent,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return response;
  } catch (error) {
    console.log("Error sending email ", error);
    throw new ApiError("Error sending Email Try Again !");
  }
};

export const emailVerificationContentHTML = (username, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 20px;
          }
          .email-content {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
            margin-bottom: 20px;
          }
          .email-body {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
          }
          .email-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #22BC66;
            text-decoration: none;
            border-radius: 5px;
          }
          .email-footer {
            font-size: 14px;
            color: #777777;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-content">
            <div class="email-header">Welcome to Our App, ${username}!</div>
            <div class="email-body">
              <p>We're very excited to have you on board.</p>
              <p>To verify your email, please click the button below:</p>
              <a 
                href="${verificationUrl}"
                class="email-button"
              >Verify Your Email</a>
              <p>Need help, or have questions? Just reply to this email, we'd love to help.</p>
            </div>
            <div class="email-footer">
              © ${new Date().getFullYear()} Our App. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const forgatePasswordContentHTML = (username, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 20px;
          }
          .email-content {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
            margin-bottom: 20px;
          }
          .email-body {
            font-size: 16px;
            color: #555555;
            line-height: 1.5;
          }
          .email-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #22BC66;
            text-decoration: none;
            border-radius: 5px;
          }
          .email-footer {
            font-size: 14px;
            color: #777777;
            margin-top: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-content">
            <div class="email-header">Welcome to Our App, ${username}!</div>
            <div class="email-body">
              <p>We got a request to reset the password of our account.</p>
              <p>To reset your password click on the following button or link:</p>
              <a 
                href="${verificationUrl}"
                class="email-button"
              >Reset password</a>
              <p>Need help, or have questions? Just reply to this email, we'd love to help.</p>
            </div>
            <div class="email-footer">
              © ${new Date().getFullYear()} Our App. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
