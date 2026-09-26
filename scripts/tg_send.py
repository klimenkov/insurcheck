import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient

load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")
DEFAULT_TARGET = os.getenv("TELEGRAM_TARGET_CHAT", "Paul_Merinque")
SESSION_PATH = str(Path(__file__).parent / "telegram_user")

async def send_msg(text, target=None):
    chat = target or DEFAULT_TARGET
    client = TelegramClient(SESSION_PATH, API_ID, API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("ERROR: User is not authorized in Telethon.")
        await client.disconnect()
        return False

    try:
        entity = await client.get_entity(chat)
        sent = await client.send_message(entity, text)
        print(f"[OK] Message sent successfully! Message ID: {sent.id}")
        await client.disconnect()
        return True
    except Exception as e:
        print(f"ERROR: Failed to send message: {e}")
        await client.disconnect()
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        message_text = sys.argv[1]
    else:
        print("Usage: python scripts/tg_send.py '<message_text>'")
        sys.exit(1)

    asyncio.run(send_msg(message_text))
