from contextlib import asynccontextmanager
from prisma import Prisma

db = Prisma()
# BUG-N11: module-level singleton with no reconnect logic — connection drop mid-runtime is unrecoverable


@asynccontextmanager
async def lifespan(_app):
    await db.connect()
    try:
        yield
    finally:
        await db.disconnect()
