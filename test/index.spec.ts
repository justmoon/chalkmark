import parse = require('../src')
import chalk = require('chalk')
import chai = require('chai')
const assert = chai.assert

describe('Parser', function () {
  it('should generate bold text', function () {
    const ex = parse('<b>foo</b>')

    assert.equal(ex, chalk.bold('foo'))
  })

  it('should generate underlined text', function () {
    const ex = parse('<u>foo</u>')

    assert.equal(ex, chalk.underline('foo'))
  })

  it('should support multiple tags', function () {
    const ex = parse('<b>foo</b><b>bar</b>')

    assert.equal(ex, chalk.bold('foo') + chalk.bold('bar'))
  })

  it('should support nested tags', function () {
    const ex = parse('<b><u>foo</u></b>')

    assert.equal(ex, chalk.bold(chalk.underline('foo')))
  })

  it('should support multiple and nested tags', function () {
    const ex = parse('<b><u>foo</u></b><red><b>bar</b></red>')

    assert.equal(ex, chalk.bold(chalk.underline('foo')) + chalk.red(chalk.bold('bar')))
  })

  it('should pass through unknown tags', function () {
    const ex = parse('<unknown>test</unknown>')

    assert.equal(ex, '<unknown>test</unknown>')
  })

  it('should pass through unknown tag called root', function () {
    const ex = parse('<root>test</root>')

    assert.equal(ex, '<root>test</root>')
  })

  it('should pass through leading text', function () {
    const ex = parse('test<b>foo</b>')

    assert.equal(ex, 'test' + chalk.bold('foo'))
  })

  it('should pass through trailing text', function () {
    const ex = parse('<b>foo</b>test')

    assert.equal(ex, chalk.bold('foo') + 'test')
  })

  it('should pass through empty string', function () {
    const ex = parse('')

    assert.equal(ex, '')
  })

  it('should ignore unmatched closing tags', function () {
    const ex = parse('<b>a<i>b</u>c</i></b>')

    assert.equal(ex, chalk.bold('a' + chalk.italic('bc')))
  })

  it('should insert missing closing tags', function () {
    const ex = parse('<b>a<i>b</b>c</i></b>')

    assert.equal(ex, chalk.bold('a' + chalk.italic('b')) + 'c')
  })
})
