import * as aws from '@aws-sdk/client-ses'
import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

interface AWSConfig {
  accessKey: string
  secretKey: string
  region: string
}

export const connectWithSes = ({
  accessKey,
  secretKey,
  region
}: AWSConfig): Transporter => {
  const ses = new aws.SES({
    apiVersion: '2010-12-01',
    region: region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey
    }
  })

  return nodemailer.createTransport({
    SES: { ses, aws }
  })
}
interface passwordConfig {
  username: string
  password: string
  serverAddress: string
  serverPort: string
  secure: string
}
export const connectWithPassword = ({
  username,
  password,
  serverAddress,
  serverPort,
  secure
}: passwordConfig): Transporter => {
  if (!serverAddress) {
    throw new Error('Server address must be specified')
  }
  const smtpOptions: SMTPTransport.Options = {
    host: serverAddress,
    port: Number(serverPort),
    secure: secure === 'true', // true for port 465, false for other ports
    auth: {
      user: username,
      pass: password
    }
  }

  return nodemailer.createTransport(smtpOptions)
}
