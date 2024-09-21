data "external_schema" "django" {
  program = [
    "poetry",
    "run",
    "python",
    "manage.py",
    "atlas-provider-django",
    "--dialect", "postgresql"
  ]
}

env "django" {
  src = data.external_schema.django.url
  dev = "docker://postgres/16"
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}

env "local" {
  url = "postgres://postgres:helloworld@:5300/?sslmode=disable"
  migration {
    dir = "file://migrations"
  }
  format {
    migrate {
      diff = "{{ sql . \"  \" }}"
    }
  }
}