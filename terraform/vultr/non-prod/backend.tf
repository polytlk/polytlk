terraform {
  backend "pg" {
    skip_index_creation = true
    skip_schema_creation = true 
    skip_table_creation = true
  }
}
