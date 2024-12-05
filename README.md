# Action: Email Notification

This GitHub Action enables you to send email notifications through various email
services like SMTP or AWS SES during your CI/CD workflows.

## Features

- Send emails using SMTP or AWS SES.
- Supports custom email body and subject.
- Attach files to your emails.
- Convert Markdown content to HTML.
- Authentication via username/password or AWS credentials.

## Inputs

| Input              | Description                                                                        | Required | Default |
| ------------------ | ---------------------------------------------------------------------------------- | -------- | ------- |
| `type`             | Type of email service to use (`ses` or `password`).                                | Yes      |         |
| `server_address`   | SMTP server address.                                                               | Yes      |         |
| `server_port`      | SMTP server port.                                                                  | No       | `25`    |
| `username`         | Username for SMTP authentication.                                                  | Yes      |         |
| `password`         | Password for SMTP authentication.                                                  | Yes      |         |
| `subject`          | Subject of the email.                                                              | Yes      |         |
| `to`               | Recipients' email addresses (comma-separated).                                     | Yes      |         |
| `from`             | Sender's full name (optionally with email address in `<>`).                        | Yes      |         |
| `body`             | Email body text (or filename prefixed with `file://` to load content from a file). | No       |         |
| `region`           | AWS region (required for AWS SES).                                                 | No       |         |
| `access_key`       | AWS access key (required for AWS SES).                                             | No       |         |
| `secret_key`       | AWS secret key (required for AWS SES).                                             | No       |         |
| `attachments`      | List of file attachments to include in the email (files only, no folders).         | No       |         |
| `convert_markdown` | If `true`, converts Markdown in the email body to HTML.                            | No       |         |

## Outputs

| Output    | Description                          |
| --------- | ------------------------------------ |
| `mail_id` | ID of the sent email (if available). |

## Usage Examples

### Sending Email via SMTP

```yaml
name: Send Email Notification via SMTP

on:
  push:
    branches:
      - main

jobs:
  email_notification:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Send Email Notification
        uses: hemupadhyay26/action-email-notification@v1
        with:
          type: 'password'
          server_address: 'smtp.example.com'
          server_port: '587'
          username: ${{ secrets.SMTP_USERNAME }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: 'Deployment Successful'
          to: 'recipient1@example.com,recipient2@example.com'
          from: 'Your Name <yourname@example.com>'
          body: 'file://message.txt'
          attachments: 'path/to/attachment1.txt,path/to/attachment2.jpg'
          convert_markdown: true
```

### Sending Email via AWS SES

```yaml
name: Send Email Notification via AWS SES

on:
  push:
    branches:
      - main

jobs:
  email_notification:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Send Email Notification via AWS SES
        uses: hemupadhyay26/action-email-notification@v1
        with:
          type: 'ses'
          region: 'us-east-1'
          access_key: ${{ secrets.AWS_ACCESS_KEY }}
          secret_key: ${{ secrets.AWS_SECRET_KEY }}
          subject: 'Deployment Notification'
          to: 'recipient1@example.com,recipient2@example.com'
          from: 'Your Name <yourname@example.com>'
          body: 'Deployment to the production environment was successful!'
          attachments: 'path/to/attachment1.txt'
          convert_markdown: true
```

## Notes

- **SMTP Authentication**: Use the `username` and `password` inputs for
  authenticating to your SMTP server.
- **AWS SES**: When using `type` as `ses`, provide `region`, `access_key`, and
  `secret_key` for AWS SES configuration.
- **Markdown Conversion**: Set `convert_markdown` to `true` to automatically
  convert Markdown content in the body to HTML.
