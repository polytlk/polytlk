from sqlmodel import Session, select

from eden.models.models import Meaning, Unit, UnitMeaningLink, QueryUnitMeaning


def get_or_create_unit(db: Session, unit_text: str):
    statement = select(Unit).where(Unit.text == unit_text)
    unit = db.exec(statement).first()

    if not unit:
        unit = Unit(text=unit_text)
        db.add(unit)
        db.commit()

    return unit


def get_or_create_meaning(db: Session, meaning_text: str, was_split: bool):
    statement = select(Meaning).where(Meaning.text == meaning_text)
    meaning = db.exec(statement).first()

    if not meaning:
        meaning = Meaning(text=meaning_text, was_split=was_split)
        db.add(meaning)
        db.commit()

    return meaning


def get_or_create_link(db: Session, u_id: int, m_id: int, sound: str):
    statement = select(UnitMeaningLink).where(
        UnitMeaningLink.unit_id == u_id, UnitMeaningLink.meaning_id == m_id,
    )

    link = db.exec(statement).first()

    if not link:
        link = UnitMeaningLink(unit_id=u_id, meaning_id=m_id, sound=sound)
        db.add(link)
        db.commit()

    return link

def get_or_create_query_unit_meaning(db: Session, q_id: int, u_id: int, m_id: int):
    statement = select(QueryUnitMeaning).where(
        QueryUnitMeaning.query_id == q_id, QueryUnitMeaning.unit_id == u_id, QueryUnitMeaning.meaning_id == m_id
    )

    qum = db.exec(statement).first()

    if not qum:
        qum = QueryUnitMeaning(query_id=q_id, unit_id=u_id, meaning_id=m_id)
        db.add(qum)
        db.commit()

    return qum
