import {
  SESClient,
  SendEmailCommand,
  ListIdentitiesCommand,
  GetIdentityVerificationAttributesCommand,
} from "@aws-sdk/client-ses";
import config, { Environment } from "./config";

const client = new SESClient({
  region: config.region,
  endpoint: config.sesEndpoint,
});

export async function sendRecoverPasswordEmail(email: string, token: string) {
  const tokenLink = `${
    config.environment == Environment.Local ? "http" : "https"
  }://${config.domain}?recoverPasswordToken=${token}`;
  const params = {
    Source: `noreply@${config.domain.split(":")[0]}`, // Must be a verified email in AWS SES
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: { Data: "Password Recovery" },
      Body: {
        Html: {
          Data: `Recover your password at <a href="${tokenLink}">${tokenLink}</a>`,
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  const response = await client.send(command);
}
