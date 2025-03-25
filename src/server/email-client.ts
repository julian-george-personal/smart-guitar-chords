import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import config from "./config";

const client = new SESClient({
  region: config.region,
  endpoint: config.sesEndpoint,
});

export function sendRecoverPasswordEmail() {}
