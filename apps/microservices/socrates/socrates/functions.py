"""Contains functions to be form parameters."""


functions = [
    {
        'name': 'get_interpretation',
        'description': 'get relevant learning from a user input',
        'parameters': {
            'type': 'object',
            'properties': {
                'words': {
                    'type': 'array',
                    'items': {
                        'type': 'array',
                        'minItems': 3,
                        'maxItems': 3,
                        'items': {
                            'type': 'string',
                        }
                    },
                    'description': 'Words used in the text: Character (Pinyin) - Meaning',
                },
                'meaning': {
                    'type': 'string',
                    'description': 'Overall meaning of the text:',
                },
                'dialogue': {
                    'type': 'array',
                    'items': {
                        'type': 'array',
                        'minItems': 3,
                        'maxItems': 3,
                        'items': {
                            'type': 'string',
                        },
                    },
                    'description': 'example dialogue using user input',
                },
            },
            'required': ['words', 'meaning', 'dialogue'],
        },
    },
]
