import os

from sqlmodel import SQLModel, create_engine

from eden.models.models import Meaning, Unit, UnitMeaningLink

# Store the engine globally
DB_HOST = 'localhost'
DB_PORT = '5300'

DB_PASS = os.getenv('DB_PASS')
DB_URL = 'postgresql://postgres:{0}@{1}:{2}'.format(DB_PASS, DB_HOST, DB_PORT)

if __name__ == "__main__":
    engine = create_engine(DB_URL, echo=True)

    SQLModel.metadata.create_all(engine)
