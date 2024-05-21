"use server";

import { EmailContent, EmailProductInfo, NotificationType } from "@/types";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const Notification = {
  WELCOME: "WELCOME",
  CHANGE_OF_STOCK: "CHANGE_OF_STOCK",
  LOWEST_PRICE: "LOWEST_PRICE",
  THRESHOLD_MET: "THRESHOLD_MET",
};

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
) {
  const THRESHOLD_PERCENTAGE = 40;
  const emailTemplates = {
    WELCOME: `
        <div>
          <h2>Welcome to PriceRadar! 🤝</h2>
          <p>You are now tracking ${product.title}.</p>
          <p>Here's an example of how you'll receive updates:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${product.title} is back in stock!</h3>
            <p>We're excited to let you know that ${product.title} is now back in stock.</p>
            <p>Don't miss out - <a href="${product.url}" target="_blank" rel="noopener noreferrer">buy it now</a>!</p>
          </div>
          <p>Stay tuned for more updates on ${product.title} and other products you're tracking.</p>
        </div>
      `,
    CHANGE_OF_STOCK: `
        <div>
          <h4>Hey, ${product.title} is now restocked! Grab yours before they run out again!</h4>
          <p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
        </div>
      `,
    LOWEST_PRICE: `
      <div>
        <h4>Hey, ${product.title} has reached its lowest price to this date!</h4>
        <p>Grab the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
      </div>
    `,
    THRESHOLD_MET: `
    <div>
      <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
      <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
    </div>
  `,
  };
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;
  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `PriceRadar | Now Tracking ${shortenedTitle}`;
      body = emailTemplates.WELCOME;
      break;
    case Notification.LOWEST_PRICE:
      subject = `PriceRadar | Lowest Price for ${shortenedTitle}`;
      body = emailTemplates.LOWEST_PRICE;
      break;
    case Notification.CHANGE_OF_STOCK:
      subject = `PriceRadar | ${shortenedTitle} Back in Stock`;
      body = emailTemplates.CHANGE_OF_STOCK;
      break;
    case Notification.THRESHOLD_MET:
      subject = `PriceRadar | Discount Alert for ${shortenedTitle}`;
      body = emailTemplates.THRESHOLD_MET;
      break;

    default:
      throw new Error("Invalid notification type.");
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  pool: true,
  service: "hotmail",
  port: 2525,
  auth: {
    user: process.env.PR_EMAIL,
    pass: process.env.PR_EMAIL_APP_PW,
  },
  maxConnections: 1,
});

export const sendEmail = async (
  emailContent: EmailContent,
  sendTo: string[]
) => {
  const mailOptions = {
    from: process.env.PR_EMAIL,
    to: sendTo,
    subject: emailContent.subject,
    html: emailContent.body,
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) return console.log(error);

    console.log("Email sent: ", info);
  });
};
