import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient

load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")
SESSION_PATH = str(Path(__file__).parent / "telegram_user")

async def main():
    print("=== Telegram Authorization ===")
    client = TelegramClient(SESSION_PATH, API_ID, API_HASH)
    await client.start()
    me = await client.get_me()
    print(f"\n[OK] Successfully authorized as: {me.first_name} (@{me.username or 'no_username'}, ID: {me.id})")
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
