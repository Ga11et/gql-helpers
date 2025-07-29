export interface FilterGroup {
  title?: 'or' | 'and'
  filters: Filter[]
}
export interface Sort {
  field: string
  type?: 'ASC' | 'DESC'
}
export interface Option {
  field: string
  value: unknown
}

export interface FieldNodeOption {
  field: string
  value: unknown
  type?: 'field'
}
interface FilterNodeOption {
  type: 'filter'
  groups: FilterGroup[]
}
interface SortNodeOption {
  type: 'sort'
  sorts: Sort[]
}

interface DefaultField {
  type: 'field'
  source: string
}
interface SchemaField {
  type: 'schema'
  title: string
  name?: string
  options: NodeOption[]
  fields: NodeSchemaField[]
}
export type NodeSchemaField = DefaultField | SchemaField

export type NodeOption = FieldNodeOption | FilterNodeOption | SortNodeOption

export interface Filter {
  sign: string
  key: string
  value: unknown
}

type GQLFilter = [string, string, unknown]
interface RequestSource {
  [key: string]: RequestSource | null
}

export function generate_node(title: string, options: NodeOption[], fields: NodeSchemaField[]) {
  const options_string = generate_node_options(options)
  const data = generate_node_schema(fields)

  if (!data) return ''
  return `${title}${options_string} ${data}`
}
export function generate_node_options(options: NodeOption[]) {
  if (!options?.length) return ''

  const output = []
  for (const option of options) {
    if (option.type === 'filter') output.push(generate_node_options_filters(option.groups))
    else if (option.type === 'sort') output.push(generate_node_options_sort(option.sorts))
    else if (option.type === 'field') output.push(generate_node_option(option))
    else output.push(generate_node_option(option))
  }

  if (!output.filter(Boolean).length) return ''
  return '(' + output.join(', ') + ')'
}
export function generate_node_options_filters(groups: FilterGroup[]): string | undefined {
  function generate_filter(filter: Filter): GQLFilter {
    return [filter.sign, filter.key, filter.value]
  }
  function handle_group(group: FilterGroup) {
    if (!group?.filters?.length) return undefined

    if (group.filters.length === 1) return generate_filter(group.filters[0])
    const output = group.filters.map(generate_filter)

    if (group.title) return [group.title, ...output]
    return output
  }

  if (!groups?.length) return undefined
  if (groups.length === 1) return 'filter: ' + JSON.stringify(handle_group(groups[0]))

  const output = groups.map(handle_group)
  return 'filter: ' + JSON.stringify(output)
}

export function generate_node_options_sort(sorts: Sort[]): string | undefined {
  if (!sorts?.length) return undefined

  const output = []

  for (const sort of sorts) {
    const output_string = sort.type === 'ASC' ? '-' + sort.field : sort.field
    output.push(output_string)
  }

  return 'sort: ' + JSON.stringify(output)
}

export function generate_node_option(option: FieldNodeOption): string {
  return option.field + ': ' + generate_node_option_value(option.value)
}
function generate_node_option_value(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`
  else if (typeof value === 'number') return value.toString()
  else if (typeof value === 'boolean') return value.toString()
  else if (value && typeof value === 'object') return generate_node_option_value_object(value)
  return JSON.stringify(value)
}
function generate_node_option_value_object(object: object): string {
  const output = []

  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'string') output.push(`${key}: "${value}"`)
    else if (typeof value === 'number') output.push(`${key}: ${value.toString()}`)
    else if (typeof value === 'boolean') output.push(`${key}: ${value.toString()}`)
    else output.push(`${key}: ${generate_node_option_value_object(value)}`)
  }

  return '{' + output.join(', ') + '}'
}
export function generate_node_schema(fields: NodeSchemaField[]): string {
  if (!fields?.length) return ''

  const fields_schema = generate_schema_from_fields(fields)
  const output = generate_gql_string_from_schema(fields_schema)
  return '{ ' + output + ' }'
}

function generate_schema_from_fields(fields?: NodeSchemaField[]) {
  if (!fields?.length) return {}

  const output = {}
  for (const field of fields) {
    if (field.type === 'field') {
      unite_schema_row(output, generate_schema_row_from_source(field.source))
    } else if (field.type === 'schema') {
      const node = generate_node(field.title, field.options, field.fields)
      const row = { [field.name ? field.name + ': ' + node : node]: null }
      unite_schema_row(output, row)
    }
  }

  return output
}

function generate_schema_row_from_source(source: string): RequestSource {
  if (source.includes('.')) {
    const parts = source.split('.')
    const result: RequestSource | null = parts.reduceRight<RequestSource | null>((acc, key) => ({ [key]: acc }), null)
    return result || {}
  }
  return { [source]: null }
}

function unite_schema_row(target: RequestSource, source: RequestSource): RequestSource {
  for (const key in source) {
    if (source[key] instanceof Object && target[key] instanceof Object) {
      unite_schema_row(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
function generate_gql_string_from_schema(obj: RequestSource): string {
  const parts = []

  for (const key in obj) {
    if (!obj[key]) {
      parts.push(key)
      continue
    }
    const children = generate_gql_string_from_schema(obj[key])
    parts.push(`${key} { ${children} }`)
  }

  return parts.join(' ')
}
