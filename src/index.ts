import chalk = require('chalk')

const TAG_MAP: { [tagName: string]: (content: string) => string } = {
  b: chalk.bold,
  i: chalk.italic, // not widely supported
  u: chalk.underline,
  s: chalk.strikethrough,

  bold: chalk.bold,
  underline: chalk.underline,
  strikethrough: chalk.strikethrough,
  italic: chalk.italic,
  inverse: chalk.inverse,

  black: chalk.black,
  red: chalk.red,
  green: chalk.green,
  yellow: chalk.yellow,
  blue: chalk.blue,
  magenta: chalk.magenta,
  cyan: chalk.cyan,
  white: chalk.white,
  gray: chalk.gray,

  bgBlack: chalk.bgBlack,
  bgRed: chalk.bgRed,
  bgGreen: chalk.bgGreen,
  bgYellow: chalk.bgYellow,
  bgBlue: chalk.bgBlue,
  bgMagenta: chalk.bgMagenta,
  bgCyan: chalk.bgCyan,
  bgWhite: chalk.bgWhite
}

const TAG_REGEX = new RegExp('</?(' + Object.keys(TAG_MAP).join('|') + ')>', 'g')

// Special formatter for root element
TAG_MAP['root'] = (content: string) => content

interface Tag {
  type: 'tag',
  name: string,
  children: Element[]
}

interface Text {
  type: 'text',
  content: string
}

type Element = Tag | Text

const isTag = (el: Element): el is Tag => el.type === 'tag'

// Based on code by Henrik Joretag
// https://github.com/HenrikJoreteg/html-parse-stringify
const parse = (markup: string): Tag => {
  let current: Tag = {
    type: 'tag',
    name: 'root',
    children: []
  }
  let stack = [ current ]
  let start = 0

  markup.replace(TAG_REGEX, (tag: string, name: string, index: number) => {
    // Any text data since the last tag?
    if (start < index) {
      current.children.push({
        type: 'text',
        content: markup.slice(start, index)
      })
    }

    start = index + tag.length

    // Is opening tag?
    if (tag.charAt(1) !== '/') {
      current = {
        type: 'tag',
        name,
        children: []
      }

      stack[stack.length - 1].children.push(current)
      stack.push(current)
    } else {
      // When encountering a closing tag, close all open tags until the
      // innermost open tag with the same name.
      //
      // If the closing tag is unmatched, ignore it.
      const matchingLevel = stack.map(tag => tag.name).lastIndexOf(name)
      if (matchingLevel !== -1) {
        stack = stack.slice(0, matchingLevel)
        current = stack[matchingLevel - 1]
      }
    }

    return ''
  })

  // Still need to add a text node for any trailing text
  if (start < markup.length) {
    current.children.push({
      type: 'text',
      content: markup.slice(start)
    })
  }

  return stack[0]
}

let serialize = (tag: Tag): string => {
  const format = TAG_MAP[tag.name]

  const content = tag.children.map((child) => {
    if (isTag(child)) {
      return serialize(child)
    } else {
      return child.content
    }
  }).join('')

  return format ? format(content) : `<${tag.name}>${content}</${tag.name}>`
}

export = (markup: string): string => serialize(parse(markup))
