from contextlib import asynccontextmanager
from prisma import Prisma

db = Prisma()


@asynccontextmanager
async def lifespan(_app):
    await db.connect()
    yield
    await db.disconnect()
