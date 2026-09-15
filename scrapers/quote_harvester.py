"""
InsurCheck Quote Harvester & Persona Orchestrator.
Coordinates rate harvesting runs across standardized Ontario personas.
"""

import argparse
import asyncio
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from personas import ONTARIO_PERSONAS
from playwright_quote_scraper import MultiStepQuoteScraper

def list_personas():
    print("\n--- Standardized Ontario Driver Personas ---")
    for key, p in ONTARIO_PERSONAS.items():
        print(f"[{key}]: {p['label']}")
        print(f"   Location: {p['city']} ({p['postal_code']})")
        print(f"   Driver: Age {p['age']}, Class {p['license_class']}, {p['years_licensed']} yrs licensed")
        print(f"   Vehicle: {p['vehicle']['year']} {p['vehicle']['make']} {p['vehicle']['model']} ({p['vehicle']['annual_km']} km/yr)")
    print("---------------------------------------------\n")

def main():
    parser = argparse.ArgumentParser(description="InsurCheck Rate Harvester")
    parser.add_argument("--list-personas", action="store_true", help="List available driver personas")
    parser.add_argument("--target", choices=["squareone", "rates", "td"], default="squareone", help="Target platform")
    parser.add_argument("--persona", choices=list(ONTARIO_PERSONAS.keys()), default="young_brampton", help="Persona to execute")
    parser.add_argument("--all-personas", action="store_true", help="Run across all defined personas sequentially")
    parser.add_argument("--proxy", default=None, help="HTTP/HTTPS proxy URL")
    parser.add_argument("--headed", action="store_true", help="Run browser in visible mode")
    parser.add_argument("--no-screenshots", action="store_true", help="Disable step screenshot capture")

    args = parser.parse_args()

    if args.list_personas:
        list_personas()
        return

    scraper = MultiStepQuoteScraper(
        target=args.target,
        headless=not args.headed,
        proxy=args.proxy,
        capture_screenshots=not args.no_screenshots
    )

    if args.all_personas:
        print(f"Running automated harvest across all {len(ONTARIO_PERSONAS)} personas on {args.target.upper()}...")
        for p_key in ONTARIO_PERSONAS.keys():
            asyncio.run(scraper.run_persona(p_key))
    else:
        asyncio.run(scraper.run_persona(args.persona))

if __name__ == "__main__":
    main()
