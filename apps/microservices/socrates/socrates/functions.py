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
                        'type': 'string',
                    },
                    'description': 'Words found in user input',
                },
                'meaning': {
                    'type': 'string',
                    'description': 'meaning of user input',
                },
                'dialogue': {
                    'type': 'array',
                    'items': {
                        'type': 'string',
                    },
                    'description': 'example dialogue using user input',
                },
            },
            'required': ['words', 'meaning', 'dialogue'],
        },
    },
]
