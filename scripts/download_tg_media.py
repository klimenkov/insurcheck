import os
import sys
import asyncio
from telethon import TelegramClient
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

API_ID = int(os.getenv('TELEGRAM_API_ID'))
API_HASH = os.getenv('TELEGRAM_API_HASH')
SESSION = 'scripts/telegram_user'

async def check():
    client = TelegramClient(SESSION, API_ID, API_HASH)
    await client.connect()
    entity = await client.get_entity('Paul_Merinque')
    # Fetch recent 10 messages
    messages = await client.get_messages(entity, limit=10)
    os.makedirs('scripts/tg_media', exist_ok=True)
    for m in messages:
        if m:
            print(f"Msg {m.id} ({m.date}): text='{m.text}', has_media={bool(m.media)}")
            if m.photo or m.document:
                path = await client.download_media(m, file='scripts/tg_media/')
                print(f"  -> Downloaded: {path}")
    await client.disconnect()

if __name__ == '__main__':
    asyncio.run(check())
