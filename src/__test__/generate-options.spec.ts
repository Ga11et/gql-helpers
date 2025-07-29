import { describe, expect, it } from '@jest/globals'
import { generate_node_options, type NodeOption } from '..'

describe('Генерация graphql query options', () => {
  it('генерация пустого options"', () => {
    const input: NodeOption[] = []
    const output = generate_node_options(input)
    expect(output).toEqual('')
  })

  it('генерация options без сортировки и фильтров', () => {
    const input: NodeOption[] = [
      { type: 'field', field: 'id', value: 1 },
      { type: 'field', field: 'meta', value: { pageSize: 16, page: 1 } },
      { type: 'field', field: 'guid', value: 'asdasdasdasd' },
      { type: 'field', field: 'boolean', value: true },
      {
        type: 'field',
        field: 'deepobject',
        value: { data: { owner: { guid: '123' } } }
      }
    ]
    const output = generate_node_options(input)
    expect(output).toEqual(
      '(id: 1, meta: {pageSize: 16, page: 1}, guid: "asdasdasdasd", boolean: true, deepobject: {data: {owner: {guid: "123"}}})'
    )
  })

  it('генерация options с пустой сортировкой', () => {
    const input: NodeOption[] = [{ type: 'sort', sorts: [] }]
    const output = generate_node_options(input)
    expect(output).toEqual('')
  })

  it('генерация options с заполненной сортировкой', () => {
    const input: NodeOption[] = [
      {
        type: 'sort',
        sorts: [{ field: 'guid' }, { field: 'caption', type: 'ASC' }]
      }
    ]
    const output = generate_node_options(input)
    expect(output).toEqual('(sort: ["guid","-caption"])')
  })

  it('генерация options с пустыми фильтрами', () => {
    const input: NodeOption[] = [{ type: 'filter', groups: [] }]
    const output = generate_node_options(input)
    expect(output).toEqual('')
  })

  it('генерация options с заполненными фильтрами', () => {
    const input: NodeOption[] = [
      {
        type: 'filter',
        groups: [
          {
            filters: [
              { sign: '>', key: 'id', value: 12345 },
              { sign: '=', key: 'name', value: 'fyodor' },
              { sign: '~', key: 'owner', value: null },
              { sign: '>=', key: 'age', value: 18 }
            ]
          }
        ]
      }
    ]
    const output = generate_node_options(input)
    expect(output).toEqual('(filter: [[">","id",12345],["=","name","fyodor"],["~","owner",null],[">=","age",18]])')
  })

  it('генерация options c максимально заполненными данными', () => {
    const input: NodeOption[] = [
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
    ]
    const output = generate_node_options(input)
    expect(output).toEqual(
      '(filter: [["and",["=","name","fyodor"],[">=","age",18]],["or",["=","guid","fyodor"],["=","valid",false]]], sort: ["-caption","type","date","-title","name"], meta: {pageSize: 16, page: 1}, name: {data: {hello: "world"}}, boolean: true, field: "hello")'
    )
  })
})
