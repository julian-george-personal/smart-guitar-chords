import { Resend } from "resend";
import config, { Environment } from "../config";

const resend = new Resend(config.resend.apiKey);

export async function sendRecoverPasswordEmail(email: string, token: string) {
  const isLocal = config.environment == Environment.Local;
  // 5173 is the Vite dev server port
  const tokenLink = `${isLocal ? "http" : "https"}://${config.domain}${isLocal ? ":5173" : ""}?recoverPasswordToken=${token}`;

  if (isLocal) {
    console.log(`Password reset email successfully sent to ${email}`);
    console.log("Reset Url:", tokenLink);
    return;
  }

  try {
    await resend.emails.send({
      from: "noreply@smartguitarchords.com",
      to: email,
      subject: "Reset your Smart Guitar Chords password",
      html: `<p>Click <a href="${tokenLink}">here</a> to reset your password.</p><p>Or copy this link: ${tokenLink}</p>`,
    });
  } catch (error) {
    console.error("Error sending password reset email:", JSON.stringify(error));
    throw error;
  }
}
