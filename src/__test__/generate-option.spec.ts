import { describe, expect, it } from '@jest/globals'
import { generate_node_option, type FieldNodeOption } from '..'

describe('Генерация graphql query option', () => {
  it('генерация option типа string"', () => {
    const input: FieldNodeOption = { field: 'name', value: 'string' }
    const output = generate_node_option(input)
    expect(output).toEqual('name: "string"')
  })

  it('генерация option типа null"', () => {
    const input: FieldNodeOption = { field: 'name', value: null }
    const output = generate_node_option(input)
    expect(output).toEqual('name: null')
  })

  it('генерация option типа undefined"', () => {
    const input: FieldNodeOption = { field: 'name', value: undefined }
    const output = generate_node_option(input)
    expect(output).toEqual('name: undefined')
  })

  it('генерация option типа boolean"', () => {
    const input: FieldNodeOption = { field: 'boolean', value: true }
    const output = generate_node_option(input)
    expect(output).toEqual('boolean: true')
  })

  it('генерация option типа number"', () => {
    const input: FieldNodeOption = { field: 'name', value: 5 }
    const output = generate_node_option(input)
    expect(output).toEqual('name: 5')
  })

  it('генерация option типа OBJECT"', () => {
    const input: FieldNodeOption = {
      field: 'name',
      value: { data: { hello: 'world' } }
    }
    const output = generate_node_option(input)
    expect(output).toEqual('name: {data: {hello: "world"}}')
  })
})
