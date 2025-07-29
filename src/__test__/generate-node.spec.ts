import { describe, expect, it } from '@jest/globals'
import { generate_node, type NodeOption, type NodeSchemaField } from '..'

describe('Генерация graphql query node', () => {
  it('генерация пустого node"', () => {
    const title = 'Unit'
    const options: NodeOption[] = []
    const fields: NodeSchemaField[] = []
    const output = generate_node(title, options, fields)
    expect(output).toEqual('')
  })

  it('генерация node без options', () => {
    const title = 'Unit'
    const options: NodeOption[] = []
    const fields: NodeSchemaField[] = [
      {
        type: 'field',
        source: 'data.field'
      }
    ]
    const output = generate_node(title, options, fields)
    expect(output).toEqual('Unit { data { field } }')
  })

  it('генерация node с options', () => {
    const title = 'Unit'
    const options: NodeOption[] = [{ type: 'field', field: 'hello', value: 'world' }]
    const fields: NodeSchemaField[] = [
      {
        type: 'field',
        source: 'data.field'
      }
    ]
    const output = generate_node(title, options, fields)
    expect(output).toEqual('Unit(hello: "world") { data { field } }')
  })

  it('генерация node с вложенным node', () => {
    const title = 'Unit'
    const options: NodeOption[] = []
    const fields: NodeSchemaField[] = [
      {
        type: 'schema',
        options: [],
        title: 'Inner_Unit',
        fields: [{ type: 'field', source: 'data.field' }]
      }
    ]
    const output = generate_node(title, options, fields)
    expect(output).toEqual('Unit { Inner_Unit { data { field } } }')
  })

  it('генерация node с вложенным именованным node', () => {
    const title = 'Unit'
    const options: NodeOption[] = []
    const fields: NodeSchemaField[] = [
      {
        type: 'schema',
        name: 'NAMED_NODE',
        options: [],
        title: 'Inner_Unit',
        fields: [{ type: 'field', source: 'data.field' }]
      }
    ]
    const output = generate_node(title, options, fields)
    expect(output).toEqual('Unit { NAMED_NODE: Inner_Unit { data { field } } }')
  })
})
