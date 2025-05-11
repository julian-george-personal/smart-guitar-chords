import sgMail, { MailDataRequired } from "@sendgrid/mail";
import config, { Environment } from "../config";

sgMail.setApiKey(config.sendgrid.apiKey);

export async function sendRecoverPasswordEmail(email: string, token: string) {
  const tokenLink = `${
    config.environment == Environment.Local ? "http" : "https"
  }://${config.domain}?recoverPasswordToken=${token}`;

  const msg: MailDataRequired = {
    to: email,
    from: `noreply@smartguitarchords.com`,
    templateId: config.sendgrid.recoverPasswordTemplateId,
    dynamicTemplateData: {
      user_email: email,
      reset_url: tokenLink,
    },
    mailSettings: {
      sandboxMode: { enable: config.environment == Environment.Local },
    },
  };

  try {
    await sgMail.send(msg);
    if (config.environment == Environment.Local) {
      console.log(`Password reset email successfully sent to ${email}`);
      console.log("Reset Url:", tokenLink);
    }
  } catch (error) {
    console.error("Error sending password reset email:", JSON.stringify(error));
    throw error;
  }
}
