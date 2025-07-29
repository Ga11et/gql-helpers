# gql-helpers

## Доступные функции

### Полная генерация // title (options) {data}

    generate_node(title: string, options: NodeOption[], fields: NodeSchemaField[]): string

### Генерация только options // (options)

    generate_node_options(options: NodeOption[]): string

### Генерация только data // {data}

    generate_node_schema(fields: NodeSchemaField[]): string

## Пример использования

    import { generate_node, type  NodeSchemaField, type NodeOption  } from 'gql-helpers'

    const options: NodeOption[] = [{ type: 'field', field: 'id', value: '1' }]
    const fields: NodeSchemaField[] = [{ filters: [
        { type: 'field', source: 'field' },
        { type: 'field', source: 'data.field' },
        { type: 'field', source: 'data.field2' },
        { type: 'field', source: 'field2' },
        { type: 'field', source: 'meta.field3' },
    ] }]
    const gql = generate_node('Title', options, fields)
    // gql = "Title(id: \"1\") { field data { field field2 } field2 meta { field3 } }"

## Пример использования с глубокой вложенностью

    import { generate_node, type  NodeSchemaField, type NodeOption  } from 'gql-helpers'

    const  title  =  'Title'
    const  options: NodeOption[] = [
    	{ type: 'field', field: 'id', value: '1' },
    	{
    		type: 'field',
    		field: 'deepobject',
    		value: { data: { owner: { guid: '123' } } }
    	}
    ]

    const  fields: NodeSchemaField[] = [
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
    const  output  =  generate_node(title, options, fields)
    // gql = "Title(id: \"1\", deepobject: {data: {owner: {guid: \"123\"}}}) { data { field1 field3 } field2 field4 Relation_1(filter: [[\"and\",[\"=\",\"name\",\"fyodor\"],[\">=\",\"age\",18]],[\"or\",[\"=\",\"guid\",\"fyodor\"],[\"=\",\"valid\",false]]], sort: [\"-caption\",\"type\",\"date\",\"-title\",\"name\"], meta: {pageSize: 16, page: 1}, name: {data: {hello: \"world\"}}, boolean: true, field: \"hello\") { field field2 field3 field4 } R2: Relation_2(filter: [[\"=\",\"name\",\"fyodor\"],[\">=\",\"age\",18]], sort: [\"caption\"]) { field field2 Second_Relation(hello: \"world\") { data { field } } field4 } }"
