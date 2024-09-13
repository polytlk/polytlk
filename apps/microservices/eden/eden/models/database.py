from sqlmodel import SQLModel, create_engine

# DB_HOST = "localhost"
# DB_PORT = "5300"

DB_HOST = 'postgresql.default.svc.cluster.local'
DB_PORT = '5432'

DB_PASS = 'TVzJ0J9113'
DB_URL = 'postgresql://postgres:{0}@{1}:{2}'.format(DB_PASS, DB_HOST, DB_PORT)

engine = create_engine(DB_URL, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)