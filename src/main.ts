import * as core from '@actions/core'
import { sleep } from './sleep'
import { connectWithPassword, connectWithSes } from './connection'
import { getText } from './getText'
import { getFrom } from './getFrom'
import { getAttachments } from './getAttachments'
import { SentMessageInfo } from 'nodemailer'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<string | void> {
  try {
    // intial input for setup connection
    const type = core.getInput('type', { required: true })

    // email server configuration
    const serverAddress = core.getInput('server_address')
    const serverPort = core.getInput('server_port')
    let secure = core.getInput('secure')
    const username = core.getInput('username')
    const password = core.getInput('password')
    const accessKey = core.getInput('access_key')
    const secretKey = core.getInput('secret_key')
    const region = core.getInput('region')

    if (!secure) {
      secure = serverPort === '465' ? 'true' : 'false'
    }

    let transporter
    if (type === 'ses') {
      transporter = connectWithSes({ accessKey, secretKey, region })
    } else if (type === 'password') {
      transporter = connectWithPassword({
        username,
        password,
        serverAddress,
        serverPort,
        secure
      })
    } else {
      core.setOutput('type value is invalid', type)
      return
    }

    // getting the inputs
    const subject = core.getInput('subject', { required: true })
    const from = core.getInput('from', { required: true })
    const to = core.getInput('to', { required: true })
    const body = core.getInput('body', { required: false })
    const htmlBody = core.getInput('html_body', { required: false })
    const cc = core.getInput('cc', { required: false })
    const bcc = core.getInput('bcc', { required: false })
    const attachments = core.getInput('attachments', { required: false })
    const convertMarkdown = core.getInput('convert_markdown', {
      required: false
    })

    if (!to && !cc && !bcc) {
      throw new Error("At least one of 'to', 'cc' or 'bcc' must be specified")
    }

    const mailOptions = {
      from: getFrom(from, username),
      to: to ? to : undefined,
      subject: getText(subject, false),
      cc: cc ? cc : undefined,
      bcc: bcc ? bcc : undefined,
      text: body ? getText(body, false) : undefined,
      html: htmlBody ? getText(htmlBody, convertMarkdown) : undefined,
      attachments: attachments ? await getAttachments(attachments) : undefined
    }

    let i = 0

    while (i <= 10) {
      try {
        //need to change it as it is still using the any type

        /* eslint-disable-line */ const info: SentMessageInfo =
          await transporter.sendMail(mailOptions)
        core.info('Mail sent successfully')
        /* eslint-disable-line */ core.setOutput('mail_id', info.messageId)
        break
      } catch (error) {
        const errorMessage = (error as Error).message // Ensure type safety for error

        if (!errorMessage.includes('Try again later,')) {
          core.setFailed(errorMessage)
          break // Exit loop for non-retryable errors
        }

        if (i > 10) {
          core.setFailed(`Exceeded retry attempts: ${errorMessage}`)
          break // Exit loop after 10 retries
        }

        console.log(`Attempt ${i + 1}: Received error: ${errorMessage}`)
        const retryDelay = i < 2 ? 1 : i // Delay in minutes (1 minute for the first 2 attempts)
        console.log(`Retrying in ${retryDelay} minute(s)...`)
        await sleep(retryDelay * 60000) // Sleep for the calculated delay

        i++
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
