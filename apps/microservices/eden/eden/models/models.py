from enum import Enum
from typing import List, Optional

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlmodel import Column, Field, Integer, Relationship, SQLModel

## class QueryUnitLink(SQLModel, table=True):
##     query_id: int = Field(default=None, foreign_key='query.id', primary_key=True)
##     unit_id: int = Field(default=None, foreign_key='unit.id', primary_key=True)
##
##
## class Query(SQLModel, table=True):
##     id: Optional[int] = Field(default=None, primary_key=True)
##     text: str
##     meaning: str
##
##     # Add a many-to-many relationship with Unit through a link table
##     units: List['Unit'] = Relationship(back_populates="queries", link_model=QueryUnitLink)
##     dialogues: List['Dialogue'] = Relationship(back_populates='query')
##
##


class ParticipantEnum(str, Enum):
    A = 'A'
    B = 'B'


class Dialogue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    participant: ParticipantEnum
    text: str
    sound: str
    meaning: str
    order: int = Field(sa_column=Column(Integer, nullable=False))

    # query_id: int = Field(default=None, foreign_key='query.id')
    # query: Query = Relationship(back_populates='dialogues')
    __table_args__ = (CheckConstraint(order.sa_column > 0),)


class UnitMeaningLink(SQLModel, table=True):
    unit_id: int = Field(default=None, foreign_key='unit.id', primary_key=True)
    meaning_id: int = Field(default=None, foreign_key='meaning.id', primary_key=True)
    sound: str

    unit: 'Unit' = Relationship(back_populates='meaning_links')
    meaning: 'Meaning' = Relationship(back_populates='unit_links')


class Unit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str

    # Define a many-to-many relationship with Query through QueryUnitLink
    meaning_links: list[UnitMeaningLink] = Relationship(back_populates='unit')

    __table_args__ = (UniqueConstraint('text'),)


class Meaning(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str

    # Analytics columns
    was_split: bool

    # Define a many-to-many relationship with Query through QueryUnitLink
    unit_links: list[UnitMeaningLink] = Relationship(back_populates='meaning')

    __table_args__ = (UniqueConstraint('text'),)
