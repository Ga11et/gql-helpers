import { describe, expect, it } from '@jest/globals'
import { generate_node_schema, type NodeSchemaField } from '..'

describe('Генерация graphql query schema', () => {
  it('пустая schema', () => {
    const input: NodeSchemaField[] = []
    const output = generate_node_schema(input)
    expect(output).toEqual('')
  })

  it('fields только верхнего уровня', () => {
    const input: NodeSchemaField[] = [
      { type: 'field', source: 'field1' },
      { type: 'field', source: 'field2' },
      { type: 'field', source: 'field3' },
      { type: 'field', source: 'field4' },
      { type: 'field', source: 'field5' },
      { type: 'field', source: 'field6' }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ field1 field2 field3 field4 field5 field6 }')
  })

  it('fields c повторяющимся source', () => {
    const input: NodeSchemaField[] = [
      { type: 'field', source: 'field1' },
      { type: 'field', source: 'field2' },
      { type: 'field', source: 'field3' },
      { type: 'field', source: 'field1' },
      { type: 'field', source: 'field5' },
      { type: 'field', source: 'field1' }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ field1 field2 field3 field5 }')
  })

  it('fields c глубоким расположением', () => {
    const input: NodeSchemaField[] = [
      { type: 'field', source: 'data.meta.data.field1' },
      { type: 'field', source: 'data.meta.data.field2' },
      { type: 'field', source: 'data.meta.field3' },
      { type: 'field', source: 'data.meta.field4' },
      { type: 'field', source: 'meta.field5' },
      { type: 'field', source: 'meta.data.field5' }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ data { meta { data { field1 field2 } field3 field4 } } meta { field5 data { field5 } } }')
  })

  it('fields c вложенным schema без options', () => {
    const input: NodeSchemaField[] = [
      {
        type: 'schema',
        title: 'Unit',
        options: [],
        fields: [
          { type: 'field', source: 'field' },
          { type: 'field', source: 'field2' },
          { type: 'field', source: 'field3' },
          { type: 'field', source: 'field4' }
        ]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ Unit { field field2 field3 field4 } }')
  })

  it('fields c вложенным schema с options', () => {
    const input: NodeSchemaField[] = [
      {
        type: 'schema',
        title: 'Unit',
        options: [
          { type: 'field', value: 'value', field: 'field' },
          {
            type: 'sort',
            sorts: [{ field: 'field', type: 'ASC' }, { field: 'caption' }]
          },
          {
            type: 'filter',
            groups: [{ filters: [{ sign: '=', key: 'key', value: 'value' }] }]
          }
        ],
        fields: [
          { type: 'field', source: 'field' },
          { type: 'field', source: 'field2' },
          { type: 'field', source: 'field3' },
          { type: 'field', source: 'field4' }
        ]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual(
      '{ Unit(field: "value", sort: ["-field","caption"], filter: ["=","key","value"]) { field field2 field3 field4 } }'
    )
  })

  it('fields c вложенным schema с именем', () => {
    const input: NodeSchemaField[] = [
      {
        type: 'schema',
        name: 'CUSTOM_NAME',
        title: 'Unit',
        options: [{ type: 'field', value: 'value', field: 'field' }],
        fields: [{ type: 'field', source: 'field' }]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ CUSTOM_NAME: Unit(field: "value") { field } }')
  })

  it('fields c вложенным schema внутри schema', () => {
    const input: NodeSchemaField[] = [
      {
        type: 'schema',
        title: 'Unit',
        options: [{ type: 'field', value: 'value', field: 'field' }],
        fields: [
          { type: 'field', source: 'field' },
          {
            type: 'schema',
            title: 'Relation',
            options: [{ type: 'field', value: true, field: 'corruption' }],
            fields: [{ type: 'field', source: 'field' }]
          }
        ]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual('{ Unit(field: "value") { field Relation(corruption: true) { field } } }')
  })

  it('fields c вложенным schema внутри schema внутри schema', () => {
    const input: NodeSchemaField[] = [
      {
        type: 'schema',
        title: 'Unit',
        options: [{ type: 'field', value: 'value', field: 'field' }],
        fields: [
          { type: 'field', source: 'field' },
          {
            type: 'schema',
            title: 'Relation',
            options: [{ type: 'field', value: true, field: 'corruption' }],
            fields: [
              { type: 'field', source: 'field' },
              {
                type: 'schema',
                title: 'Inner_Relation',
                options: [{ type: 'sort', sorts: [{ field: 'caption' }] }],
                fields: [{ type: 'field', source: 'field' }]
              }
            ]
          }
        ]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual(
      '{ Unit(field: "value") { field Relation(corruption: true) { field Inner_Relation(sort: ["caption"]) { field } } } }'
    )
  })

  it('fields c максимальной вложенностью', () => {
    const input: NodeSchemaField[] = [
      { type: 'field', source: 'data.field1' },
      { type: 'field', source: 'field2' },
      { type: 'field', source: 'data.field3' },
      { type: 'field', source: 'field4' },
      {
        type: 'schema',
        title: 'Relation_1',
        options: [
          {
            type: 'filter',
            groups: [
              {
                title: 'and',
                filters: [
                  { sign: '=', key: 'name', value: 'fyodor' },
                  { sign: '>=', key: 'age', value: 18 }
                ]
              },
              {
                title: 'or',
                filters: [
                  { sign: '=', key: 'guid', value: 'fyodor' },
                  { sign: '=', key: 'valid', value: false }
                ]
              }
            ]
          },
          {
            type: 'sort',
            sorts: [
              { field: 'caption', type: 'ASC' },
              { field: 'type' },
              { field: 'date', type: 'DESC' },
              { field: 'title', type: 'ASC' },
              { field: 'name' }
            ]
          },
          { field: 'meta', value: { pageSize: 16, page: 1 } },
          { field: 'name', value: { data: { hello: 'world' } } },
          { field: 'boolean', value: true },
          { type: 'field', field: 'field', value: 'hello' }
        ],
        fields: [
          { type: 'field', source: 'field' },
          { type: 'field', source: 'field2' },
          { type: 'field', source: 'field3' },
          { type: 'field', source: 'field4' }
        ]
      },
      {
        type: 'schema',
        name: 'R2',
        title: 'Relation_2',
        options: [
          {
            type: 'filter',
            groups: [
              {
                filters: [
                  { sign: '=', key: 'name', value: 'fyodor' },
                  { sign: '>=', key: 'age', value: 18 }
                ]
              }
            ]
          },
          {
            type: 'sort',
            sorts: [{ field: 'caption' }]
          }
        ],
        fields: [
          { type: 'field', source: 'field' },
          { type: 'field', source: 'field2' },
          {
            type: 'schema',
            options: [{ type: 'field', field: 'hello', value: 'world' }],
            title: 'Second_Relation',
            fields: [{ type: 'field', source: 'data.field' }]
          },
          { type: 'field', source: 'field4' }
        ]
      }
    ]
    const output = generate_node_schema(input)
    expect(output).toEqual(
      '{ data { field1 field3 } field2 field4 Relation_1(filter: [["and",["=","name","fyodor"],[">=","age",18]],["or",["=","guid","fyodor"],["=","valid",false]]], sort: ["-caption","type","date","-title","name"], meta: {pageSize: 16, page: 1}, name: {data: {hello: "world"}}, boolean: true, field: "hello") { field field2 field3 field4 } R2: Relation_2(filter: [["=","name","fyodor"],[">=","age",18]], sort: ["caption"]) { field field2 Second_Relation(hello: "world") { data { field } } field4 } }'
    )
  })
})
