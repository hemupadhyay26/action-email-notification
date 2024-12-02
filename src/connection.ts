import * as aws from '@aws-sdk/client-ses'
const nodemailer = require('nodemailer')

interface AWSConfig {
  accessKey: string
  secretKey: string
  region: string
}

export const connectWithSes = ({ accessKey, secretKey, region }: AWSConfig) => {
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
}: passwordConfig) => {
  if (!serverAddress) {
    throw new Error('Server address must be specified')
  }
  if (!secure) {
    secure = serverPort === '465' ? 'true' : 'false'
  }
  return nodemailer.createTransport({
    host: `${serverAddress}`,
    port: serverPort,
    secure: secure, // true for port 465, false for other ports
    auth: {
      user: `${username}`,
      pass: `${password}`
    }
  })
}
