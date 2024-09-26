from eden.models.models import Query, Dialogue, UnitMeaningLink, Unit, Meaning, QueryUnitMeaning
from atlas_provider_sqlalchemy.ddl import print_ddl

print_ddl("postgresql", [Query, Dialogue, UnitMeaningLink, Unit, Meaning, UnitMeaningLink, QueryUnitMeaning])