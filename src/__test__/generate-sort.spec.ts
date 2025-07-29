import { describe, expect, it } from '@jest/globals'
import { generate_node_options_sort, type Sort } from '..'

describe('Генерация graphql query sort', () => {
  it('пустая сортировка"', () => {
    const input: Sort[] = []
    const output = generate_node_options_sort(input)
    expect(output).toBeUndefined()
  })

  it('Сортируем одно поле по убыванию', () => {
    const input: Sort[] = [{ field: 'caption' }]
    const output = generate_node_options_sort(input)
    expect(output).toEqual('sort: ["caption"]')
  })

  it('Сортируем одно поле по возрастанию', () => {
    const input: Sort[] = [{ field: 'caption', type: 'ASC' }]
    const output = generate_node_options_sort(input)
    expect(output).toEqual('sort: ["-caption"]')
  })

  it('Сортируем несколько полей по возрастанию и убыванию', () => {
    const input: Sort[] = [
      { field: 'caption', type: 'ASC' },
      { field: 'type' },
      { field: 'date', type: 'DESC' },
      { field: 'title', type: 'ASC' },
      { field: 'name' }
    ]
    const output = generate_node_options_sort(input)
    expect(output).toEqual('sort: ["-caption","type","date","-title","name"]')
  })
})
