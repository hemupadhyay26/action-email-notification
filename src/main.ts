import * as core from '@actions/core'
import { sleep } from './sleep'
import { connectWithPassword, connectWithSes } from './connection'
import { getText } from './getText'
import { getFrom } from './getFrom'
import { getAttachments } from './getAttachments'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<string | void> {
  try {
    let serverAddress = core.getInput('server_address')
    let serverPort = core.getInput('server_port')
    let secure = core.getInput('secure')
    let username = core.getInput('username')
    let password = core.getInput('password')
    const accessKey = core.getInput('access_key')
    const secretKey = core.getInput('secret_access_key')
    const region = core.getInput('region')

    // intial input for setup connection
    const type = core.getInput('type', { required: true })

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
    const to = core.getInput('to', { required: false })
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

    while (true) {
      try {
        const info = await transporter.sendMail(mailOptions)
        core.info('Mail is sent')
        core.setOutput('Mail id:', info.messageId)
        break
      } catch (error: any) {
        if (!error.message.includes('Try again later,')) {
          core.setFailed(error.message)
          break
        }
        if (i > 10) {
          core.setFailed(error.message)
          break
        }
        console.log('Received: ' + error.message)
        if (i < 2) {
          console.log('Trying again in a minute...')
        } else {
          console.log('Trying again in ' + i + ' minutes...')
        }
        await sleep(i * 60000)
        i++
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
