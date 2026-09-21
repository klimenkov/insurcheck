import os
import sys
import json
import argparse
import asyncio
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import User

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

API_ID = int(os.getenv("TELEGRAM_API_ID"))
API_HASH = os.getenv("TELEGRAM_API_HASH")
DEFAULT_TARGET = os.getenv("TELEGRAM_TARGET_CHAT", "Paul_Merinque")
SESSION_PATH = str(Path(__file__).parent / "telegram_user")
STATE_PATH = Path(__file__).parent / "tg_state.json"
OUTPUT_PATH = Path(__file__).parent / "tg_last_messages.json"

def load_state():
    if STATE_PATH.exists():
        try:
            with open(STATE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"last_message_id": 0, "last_sync": None}

def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

async def fetch_messages(chat_target=None, limit=30, mark_read=False, ignore_state=False):
    target = chat_target or DEFAULT_TARGET
    state = load_state()
    last_id = 0 if ignore_state else state.get("last_message_id", 0)

    client = TelegramClient(SESSION_PATH, API_ID, API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("ERROR: Client is not authorized. Please run `python scripts/tg_login.py` first.")
        await client.disconnect()
        sys.exit(1)

    try:
        entity = await client.get_entity(target)
    except Exception as e:
        print(f"ERROR: Could not resolve target chat '{target}': {e}")
        await client.disconnect()
        sys.exit(1)

    entity_name = getattr(entity, 'first_name', '') or getattr(entity, 'title', target)
    print(f"Fetching messages from: {entity_name} ({target})... (min_id={last_id}, limit={limit})")

    messages = []
    # If last_id > 0, we fetch messages newer than last_id
    if last_id > 0:
        async for msg in client.iter_messages(entity, min_id=last_id, limit=limit, reverse=True):
            if msg.text:
                sender = await msg.get_sender()
                sender_name = getattr(sender, 'first_name', 'Unknown') if sender else 'Unknown'
                messages.append({
                    "id": msg.id,
                    "date": msg.date.isoformat(),
                    "sender_id": msg.sender_id,
                    "sender_name": sender_name,
                    "is_outgoing": msg.out,
                    "text": msg.text
                })
    else:
        # First run: get recent messages in chronological order
        raw_msgs = []
        async for msg in client.iter_messages(entity, limit=limit):
            if msg.text:
                sender = await msg.get_sender()
                sender_name = getattr(sender, 'first_name', 'Unknown') if sender else 'Unknown'
                raw_msgs.append({
                    "id": msg.id,
                    "date": msg.date.isoformat(),
                    "sender_id": msg.sender_id,
                    "sender_name": sender_name,
                    "is_outgoing": msg.out,
                    "text": msg.text
                })
        messages = list(reversed(raw_msgs))

    await client.disconnect()

    if not messages:
        print("No new messages found.")
        return []

    print(f"\nFound {len(messages)} message(s):")
    for m in messages:
        author = "You" if m["is_outgoing"] else m["sender_name"]
        print(f"[{m['date'][:19]}] (ID: {m['id']}) {author}: {m['text']}")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)
    print(f"\nSaved messages to: {OUTPUT_PATH}")

    if mark_read and messages:
        new_max_id = max(m["id"] for m in messages)
        state["last_message_id"] = new_max_id
        state["last_sync"] = datetime.now().isoformat()
        save_state(state)
        print(f"Updated last_message_id to {new_max_id}")

    return messages

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch messages from Telegram chat")
    parser.add_argument("--chat", type=str, default=DEFAULT_TARGET, help="Target username or chat ID")
    parser.add_argument("--limit", type=int, default=30, help="Max messages to fetch")
    parser.add_argument("--all", action="store_true", help="Ignore saved state and fetch last N messages")
    parser.add_argument("--mark-read", action="store_true", help="Update last_message_id in state")
    args = parser.parse_args()

    asyncio.run(fetch_messages(chat_target=args.chat, limit=args.limit, mark_read=args.mark_read, ignore_state=args.all))
