export function getFrom(from: string, username: string): string {
  if (from.match(/.+ <.+@.+>/)) {
    return from
  }

  return `"${from}" <${username}>`
}
