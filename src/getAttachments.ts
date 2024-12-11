import * as glob from '@actions/glob'
import * as path from 'path'

export const getAttachments = async (
  attachments: string
): Promise<{ filename: string; path: string; cid: string }[]> => {
  // Create a globber instance with newline-separated patterns
  const globber = await glob.create(attachments.split(',').join('\n'))

  // Get matched files
  const files = await globber.glob()

  // Map the files to the desired format
  return files.map(file => ({
    filename: path.basename(file), // Extract the file name
    path: file, // Full file path
    cid: file.replace(/^.*[\\/]/, '') // Unique identifier (file name)
  }))
}
