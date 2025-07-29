import { describe, expect, it } from '@jest/globals'
import { generate_node_options_filters, type FilterGroup } from '..'

describe('Генерация graphql query filters', () => {
  it('пустые фильтры"', () => {
    const input: FilterGroup[] = []
    const output = generate_node_options_filters(input)
    expect(output).toBeUndefined()
  })

  it('один активный фильтр число', () => {
    const input: FilterGroup[] = [
      {
        filters: [{ sign: '>', value: 100, key: 'id' }]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe('filter: [">","id",100]')
  })

  it('один активный фильтр строка', () => {
    const input: FilterGroup[] = [
      {
        filters: [{ sign: '>', key: 'id', value: 'hello' }]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe('filter: [">","id","hello"]')
  })

  it('один активный фильтр null', () => {
    const input: FilterGroup[] = [
      {
        filters: [{ sign: '>', key: 'id', value: null }]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe('filter: [">","id",null]')
  })

  it('несколько активных фильтров', () => {
    const input: FilterGroup[] = [
      {
        filters: [
          { sign: '>', key: 'id', value: 12345 },
          { sign: '=', key: 'name', value: 'fyodor' },
          { sign: '~', key: 'owner', value: null },
          { sign: '>=', key: 'age', value: 18 }
        ]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe('filter: [[">","id",12345],["=","name","fyodor"],["~","owner",null],[">=","age",18]]')
  })

  it('несколько активных фильтров объединённых or', () => {
    const input: FilterGroup[] = [
      {
        title: 'or',
        filters: [
          { sign: '=', key: 'name', value: 'fyodor' },
          { sign: '>=', key: 'age', value: 18 }
        ]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe('filter: ["or",["=","name","fyodor"],[">=","age",18]]')
  })

  it('несколько FilterGroup без причины', () => {
    const input: FilterGroup[] = [
      {
        title: 'and',
        filters: [
          { sign: '=', key: 'name', value: 'fyodor' },
          { sign: '>=', key: 'age', value: 18 }
        ]
      },
      {
        filters: [
          { sign: '=', key: 'guid', value: 'fyodor' },
          { sign: '=', key: 'valid', value: false }
        ]
      }
    ]
    const output = generate_node_options_filters(input)
    expect(output).toBe(
      'filter: [["and",["=","name","fyodor"],[">=","age",18]],[["=","guid","fyodor"],["=","valid",false]]]'
    )
  })

  it('несколько FilterGroup с объединением', () => {
    const input: FilterGroup[] = [
      {
        title: 'or',
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
    const output = generate_node_options_filters(input)
    expect(output).toBe(
      'filter: [["or",["=","name","fyodor"],[">=","age",18]],["or",["=","guid","fyodor"],["=","valid",false]]]'
    )
  })
})
