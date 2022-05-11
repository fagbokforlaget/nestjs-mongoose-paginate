export const schema = {
  type: 'object',
  required: ['filter'],
  properties: {
    filter: {
      $ref: '#/definitions/props',
    },
  },
  definitions: {
    props: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[a-zA-Z].*$': {
              type: ['string', 'number', 'boolean', 'null'],
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[a-zA-Z].*$': {
              $ref: '#/definitions/comparison',
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[a-zA-Z].*$': {
              type: 'array',
              items: {
                type: ['string', 'number', 'boolean'],
              },
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[a-zA-Z].*$': {
              $ref: '#/definitions/logical',
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '[$](and|or|nor)$': {
              type: 'array',
              items: {
                $ref: '#/definitions/props',
              },
            },
          },
        },
      ],
    },
    logical: {
      type: 'object',
      additionalProperties: false,
      properties: {
        $not: {
          $ref: '#/definitions/comparison',
        },
      },
    },
    comparison: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            $regex: {
              type: 'string',
            },
            $options: {
              type: 'string',
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[$](eq|neq)$': {
              type: ['string', 'number', 'boolean', 'null'],
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[$](gt|gte|lt|lte)$': {
              type: 'number',
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          patternProperties: {
            '^[$](in|nin)$': {
              type: 'array',
              items: {
                type: ['string', 'number', 'boolean'],
              },
            },
          },
        },
      ],
    },
  },
};
