const fs = require('fs')
const showdown = require('showdown')

export function getText(
  textOrFile: string,
  convertMarkdown: string | boolean
): string {
  let text = textOrFile

  // Read text from file
  if (textOrFile.startsWith('file://')) {
    const file = textOrFile.replace('file://', '')
    text = fs.readFileSync(file, 'utf8')
  }

  // Convert Markdown to HTML
  if (convertMarkdown) {
    const converter = new showdown.Converter({ tables: true })
    text = converter.makeHtml(text)
  }

  return text
}
