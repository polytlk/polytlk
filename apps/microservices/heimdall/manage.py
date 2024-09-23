#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


import_error = """\
Could not import Django. Are you sure it's installed and
available on your PYTHONPATH environment variable? Did you
forget to activate a virtual environment?
"""


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'heimdall.settings')


    try:
        from django.core.management import execute_from_command_line  # noqa: WPS433, I001
    except ImportError as exc:  # noqa: I005
        raise ImportError(import_error) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
