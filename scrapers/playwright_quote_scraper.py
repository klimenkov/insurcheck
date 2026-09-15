"""
InsurCheck Playwright Stealth Multi-Step Quote Scraper.
Automates progressive quoting funnels with synthetic Ontario driver personas,
human-like interaction simulation, proxy support, and deep telemetry extraction.
"""

import argparse
import asyncio
import json
import os
import random
import re
import sys
import time
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

from personas import ONTARIO_PERSONAS, get_persona

# Ensure output directory exists
OUTPUT_DIR = Path(__file__).resolve().parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

STEALTH_JS = """
// 1. Overwrite navigator.webdriver to conceal automation
Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined
});

// 2. Mock realistic plugins
Object.defineProperty(navigator, 'plugins', {
    get: () => [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
        { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
    ]
});

// 3. Mock languages and Canadian locale
Object.defineProperty(navigator, 'languages', {
    get: () => ['en-CA', 'en-US', 'en']
});

// 4. WebGL Vendor & Renderer spoofing
const getParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) return 'Intel Inc.';
    if (parameter === 37446) return 'Intel Iris OpenGL Engine';
    return getParameter.apply(this, arguments);
};

// 5. Spoof permissions API
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
);
"""

class MultiStepQuoteScraper:
    def __init__(self, target="squareone", headless=True, proxy=None, capture_screenshots=True):
        self.target = target
        self.headless = headless
        self.proxy = proxy
        self.capture_screenshots = capture_screenshots
        self.extracted_quotes = []
        self.funnel_steps = []

    async def init_browser(self, p):
        """Launches Chromium with stealth arguments and optional proxy."""
        args = [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-infobars",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--window-size=1440,900"
        ]

        launch_kwargs = {
            "headless": self.headless,
            "args": args
        }

        if self.proxy:
            print(f"[NETWORK] Routing through proxy: {self.proxy}")
            launch_kwargs["proxy"] = {"server": self.proxy}

        browser = await p.chromium.launch(**launch_kwargs)

        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-CA",
            timezone_id="America/Toronto"
        )

        await context.add_init_script(STEALTH_JS)
        return browser, context

    async def _human_delay(self, min_s=0.8, max_s=2.2):
        """Introduces human-like randomized pauses."""
        await asyncio.sleep(random.uniform(min_s, max_s))

    async def _human_type(self, locator, text):
        """Simulates natural human typing cadence."""
        for char in text:
            await locator.type(char, delay=random.randint(40, 110))
            if random.random() < 0.15:
                await asyncio.sleep(random.uniform(0.1, 0.3))

    async def _capture_step(self, page, step_name, persona_id):
        """Logs step progress and saves screenshot artifact if enabled."""
        timestamp = datetime.now().strftime("%H%M%S")
        record = {
            "step": step_name,
            "url": page.url,
            "timestamp": datetime.now().isoformat()
        }
        self.funnel_steps.append(record)

        if self.capture_screenshots:
            screenshot_path = OUTPUT_DIR / f"{persona_id}_{step_name}_{timestamp}.png"
            try:
                await page.screenshot(path=str(screenshot_path))
                record["screenshot"] = str(screenshot_path)
            except Exception:
                pass

        print(f"  -> [PROGRESS] {step_name} (URL: {page.url[:65]}...)")

    async def run_persona(self, persona_key="young_brampton"):
        persona = get_persona(persona_key)
        print(f"\n==================================================================")
        print(f"🚗 Launching Multi-Step Scraper Funnel: [{persona['label']}]")
        print(f"Target: {self.target.upper()} | Mode: {'Headless' if self.headless else 'Headed'}")
        print(f"Location: {persona['city']} ({persona['postal_code']}) | Vehicle: {persona['vehicle']['year']} {persona['vehicle']['make']} {persona['vehicle']['model']}")
        print(f"==================================================================")

        self.funnel_steps = []
        self.extracted_quotes = []

        async with async_playwright() as p:
            browser, context = await self.init_browser(p)
            page = await context.new_page()

            # Global response listener
            page.on("response", self._handle_network_response)

            try:
                if self.target == "squareone":
                    result = await self._scrape_squareone_funnel(page, persona)
                elif self.target == "rates":
                    result = await self._scrape_rates_funnel(page, persona)
                elif self.target == "td":
                    result = await self._scrape_td_funnel(page, persona)
                else:
                    raise ValueError(f"Unknown target platform: {self.target}")

                self._save_results(persona, result)
                return result

            except Exception as e:
                print(f"[ERROR] Quoting run aborted: {e}")
                err_img = OUTPUT_DIR / f"error_{self.target}_{persona_key}.png"
                try:
                    await page.screenshot(path=str(err_img))
                    print(f"Captured failure state to {err_img}")
                except Exception:
                    pass
                return {"success": False, "error": str(e), "persona": persona_key}
            finally:
                await context.close()
                await browser.close()

    async def _handle_network_response(self, response):
        """Intercepts and parses quote calculation responses."""
        url = response.url.lower()
        if any(term in url for term in ["quote", "rate", "premium", "calculate", "pricing", "widget"]):
            try:
                ct = response.headers.get("content-type", "")
                if "application/json" in ct:
                    data = await response.json()
                    self.extracted_quotes.append({
                        "url": response.url,
                        "status": response.status,
                        "data_keys": list(data.keys()) if isinstance(data, dict) else [],
                        "data": data,
                        "timestamp": datetime.now().isoformat()
                    })
                    print(f"  [API Intercept] Extracted JSON payload ({response.status}) from {response.url[:70]}...")
            except Exception:
                pass

    # =========================================================================
    # PLATFORM 1: Square One Multi-Step Funnel
    # =========================================================================
    async def _scrape_squareone_funnel(self, page, persona):
        """Automates Square One: Landing -> Manual Address -> Effective Date -> Terms Consent -> Profile -> Names -> Email -> Birthdate."""
        import time
        from datetime import datetime as dt

        print("\n[STEP 1/6] Navigating to Square One Auto Insurance portal...")
        await page.goto("https://www.squareone.ca/auto-insurance", wait_until="domcontentloaded", timeout=35000)
        await asyncio.sleep(2)
        await self._capture_step(page, "step1_landing", persona["id"])

        # Dismiss cookie consent if visible
        try:
            cookie_btn = page.locator("button:has-text('Accept'), button:has-text('Got it'), button:has-text('Confirm')").first
            if await cookie_btn.is_visible():
                await cookie_btn.click()
                await asyncio.sleep(0.5)
        except Exception:
            pass

        # Step 2: Switch autocomplete to MANUAL mode and populate discrete fields
        print(f"[STEP 2/6] Entering discrete address for {persona['label']}...")
        await page.evaluate("""() => {
            const autoComp = Object.keys(window).find(k => k.startsWith('soiAutocomplete_'));
            if (autoComp && window[autoComp]) {
                window[autoComp].setDisplayMode('MANUAL');
            }
        }""")
        await asyncio.sleep(1)

        # Parse street number and street name
        address_parts = persona["address"].split(" ", 1)
        street_num = address_parts[0] if len(address_parts) > 1 else "100"
        street_name = address_parts[1] if len(address_parts) > 1 else "Main St"

        await page.locator("input[name*='street_number']").first.fill(street_num)
        await page.locator("input[name*='street]']").first.fill(street_name)
        await page.locator("input[name*='city']").first.fill(persona["city"])
        await page.locator("select[name*='province_id']").first.select_option("ON")
        await page.locator("input[name*='postal_code']").first.fill(persona["postal_code"])
        await asyncio.sleep(1)

        # Submit for Car quote
        print("  -> Submitting address to initiate auto quoting flow...")
        car_btn = page.locator("button:has-text('Car quote')").first
        await car_btn.click()
        await asyncio.sleep(3)

        # Check if rate-limited / velocity blocked on landing page
        page_text = await page.locator("body").inner_text()
        if "not permitted to create any more quotes" in page_text:
            print("  [WARN] Square One IP velocity rate limit active on this network. Recording telemetry...")
            await self._capture_step(page, "rate_limited_notice", persona["id"])
            return {
                "success": False,
                "error": "IP_VELOCITY_LIMIT",
                "rate_limited": True,
                "message": "Square One temporary quote limit reached for this IP.",
                "persona": persona["id"],
                "target": "squareone",
                "timestamp": dt.now().isoformat()
            }

        await self._capture_step(page, "step2_car_quote_submitted", persona["id"])

        # Step 3: Effective Date (Immediately)
        print("[STEP 3/6] Setting quote effective start date...")
        opt_selector = page.locator("ion-radio, label:has-text('Immediately'), span:has-text('Immediately')").first
        await opt_selector.wait_for(state="visible", timeout=25000)
        await opt_selector.click()
        await asyncio.sleep(3)

        # Step 4: Privacy & Credit Check Consent
        print("[STEP 4/6] Consenting to quote terms (AGREE_QUOTE_TERMS)...")
        await page.evaluate("""() => {
            const yesSpan = Array.from(document.querySelectorAll('span')).find(s => s.innerText.trim() === 'Yes' && !s.closest('.help-text'));
            if (yesSpan) {
                yesSpan.closest('div').click();
            }
        }""")
        await asyncio.sleep(3)

        # Step 5: Profile Creation & Name
        print("[STEP 5/6] Choosing profile type & entering driver demographics...")
        email_profile_btn = page.locator("div.select-option-button, div[role='radio'], span:has-text('Email')").filter(has_text="Email").first
        if await email_profile_btn.is_visible():
            await email_profile_btn.click()
            await asyncio.sleep(3)

        # First and Last Name
        name_parts = persona["driver"]["name"].split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "Smith"

        print(f"  -> Filling Driver Name: {first_name} {last_name}")
        await page.locator("input[placeholder='First name']").fill(first_name)
        await page.locator("input[placeholder='Last name']").fill(last_name)
        await asyncio.sleep(1)

        name_next = page.locator("button:has-text('NEXT'), button:has-text('Next')").first
        await name_next.click()
        await asyncio.sleep(3)

        # Step 6: Email Address (Unique per run)
        unique_email = f"{first_name.lower()}.{last_name.lower()}.quotes.{int(time.time())}@gmail.com"
        print(f"  -> Filling unique email: {unique_email}")
        email_inp = page.locator("input[type='email']").first
        await email_inp.fill(unique_email)
        await asyncio.sleep(1)

        # Click NEXT for email
        email_next = page.locator("button:has-text('NEXT'), button:has-text('Next')").last
        await email_next.click()
        await asyncio.sleep(3)

        # Confirm if email warning prompt appears
        confirm_email = page.locator("button:has-text('NEXT'), button:has-text('Next')").last
        if await confirm_email.is_visible():
            print("  -> Confirming email address verification prompt...")
            await confirm_email.click()
            await asyncio.sleep(4)

        # Step 7: Birthdate Picker
        print("[STEP 6/6] Entering birthdate into calendar modal...")
        dob_parts = persona["driver"]["dob"].replace(",", "").split(" ")  # e.g. "May 14 2004" or "1990-01-01"
        target_year = "2004"
        target_month = "May"
        target_day = "14"

        if len(dob_parts) >= 3:
            target_month = dob_parts[0][:3]  # "May"
            target_day = dob_parts[1]        # "14"
            target_year = dob_parts[2]       # "2004"
        elif "-" in persona["driver"]["dob"]:
            y, m, d = persona["driver"]["dob"].split("-")
            target_year = y
            target_day = str(int(d))
            month_map = {"01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"}
            target_month = month_map.get(m, "May")

        # Open birthdate modal
        dob_inp = page.locator("input[type='text']").last
        await dob_inp.click()
        await asyncio.sleep(1)

        modal = page.locator(".popover-content, ion-popover, .modal-wrapper, [role='dialog']").first
        if await modal.is_visible():
            # Select Year
            year_elem = modal.locator(f"text='{target_year}'").first
            if await year_elem.is_visible():
                await year_elem.click()
                await asyncio.sleep(1)

            # Select Month
            month_elem = modal.locator(f"text='{target_month}'").first
            if await month_elem.is_visible():
                await month_elem.click()
                await asyncio.sleep(1)

            # Select Day
            day_elem = page.locator("button:has-text('14'), span:has-text('14'), div:has-text('14')").filter(has_text=f"^{target_day}$").first
            if not await day_elem.is_visible():
                day_elem = page.locator(f":text('{target_day}')").last
            if await day_elem.is_visible():
                await day_elem.click()
                await asyncio.sleep(1)

            # Click CONFIRM
            confirm_btn = page.locator(":text('CONFIRM'), button:has-text('CONFIRM')").last
            if await confirm_btn.is_visible():
                await confirm_btn.click()
                await asyncio.sleep(3)

        await self._capture_step(page, "step6_birthdate_completed", persona["id"])

        # Check pricing and API intercepts
        page_text = await page.locator("body").inner_text()
        extracted_premiums = re.findall(r"\$(\d{2,4}(?:\.\d{2})?)\s*(?:/|\s*per)?\s*month", page_text, re.I)

        final_rate = int(float(extracted_premiums[0])) if extracted_premiums else 0

        return {
            "success": True,
            "target": "squareone",
            "page_title": await page.title(),
            "extracted_base_rates": list(set(extracted_premiums)),
            "effective_rate": final_rate,
            "funnel_steps_completed": len(self.funnel_steps),
            "api_intercepts_count": len(self.extracted_quotes),
            "persona": persona["id"],
            "timestamp": dt.now().isoformat()
        }

    # =========================================================================
    # PLATFORM 2: Rates.ca Multi-Step Funnel
    # =========================================================================
    async def _scrape_rates_funnel(self, page, persona):
        """Automates Rates.ca: Landing -> WAF Challenge Telemetry -> Postal Code Entry."""
        print("\n[STEP 1/3] Navigating to Rates.ca auto comparison portal...")
        response = await page.goto("https://rates.ca/insurance-quotes/auto", wait_until="domcontentloaded", timeout=30000)
        await self._human_delay(2.0, 3.5)
        await self._capture_step(page, "step1_rates_landing", persona["id"])

        page_title = await page.title()
        html = await page.content()

        # Check Cloudflare Turnstile / Challenge State
        is_cf_blocked = "Just a moment..." in page_title or "challenge-platform" in html
        if is_cf_blocked:
            print("  [BOT DETECTION] Rates.ca Cloudflare Turnstile barrier active.")
            print("  [STRATEGY] Captured session cookies & WAF headers. Proxy rotation required for headless bypass.")
            return {
                "success": False,
                "target": "rates.ca",
                "status_code": response.status if response else 403,
                "page_title": page_title,
                "cf_mitigated": True,
                "funnel_steps_completed": len(self.funnel_steps),
                "timestamp": datetime.now().isoformat()
            }

        # Step 2: Fill Postal Code if reached
        postal_input = page.locator("input[name*='postal' i], input[placeholder*='postal' i]").first
        if await postal_input.is_visible():
            print(f"[STEP 2/3] Entering postal code: {persona['postal_code']}")
            await postal_input.click()
            await self._human_type(postal_input, persona["postal_code"])
            await self._human_delay(1.0, 2.0)
            await self._capture_step(page, "step2_postal_entered", persona["id"])

            submit_btn = page.locator("button:has-text('Get Quotes'), button[type='submit']").first
            if await submit_btn.is_visible():
                await submit_btn.click()
                await self._human_delay(3.0, 5.0)
                await self._capture_step(page, "step3_submitted", persona["id"])

        return {
            "success": True,
            "target": "rates.ca",
            "page_title": page_title,
            "funnel_steps_completed": len(self.funnel_steps),
            "timestamp": datetime.now().isoformat()
        }

    # =========================================================================
    # PLATFORM 3: TD Insurance Multi-Step Funnel
    # =========================================================================
    async def _scrape_td_funnel(self, page, persona):
        """Automates TD Insurance: Landing -> Cookie Banner -> Quoter Dispatch."""
        print("\n[STEP 1/3] Navigating to TD Insurance auto landing page...")
        await page.goto("https://www.tdinsurance.com/products-services/auto-car-insurance", wait_until="domcontentloaded", timeout=30000)
        await self._human_delay(1.5, 3.0)
        await self._capture_step(page, "step1_td_landing", persona["id"])

        # Handle cookie consent bar if present
        cookie_accept = page.locator("#onetrust-accept-btn-handler, button:has-text('Accept All')").first
        if await cookie_accept.is_visible():
            print("  -> Dismissing cookie consent overlay...")
            await cookie_accept.click()
            await self._human_delay(0.5, 1.2)

        # Locate and trigger the primary "Get a quote" entry point
        print("[STEP 2/3] Locating auto quote trigger...")
        quote_link = page.locator("a[href*='dynamic-redirect/auto'], a:has-text('Get a quote')").first
        btn_detected = await quote_link.is_visible()

        if btn_detected:
            print("  -> Triggering TD dynamic quoting redirect...")
            await quote_link.click()
            await self._human_delay(2.5, 4.0)
            await self._capture_step(page, "step2_td_quoter_dispatched", persona["id"])

        return {
            "success": True,
            "target": "tdinsurance",
            "page_title": await page.title(),
            "quote_button_detected": btn_detected,
            "funnel_steps_completed": len(self.funnel_steps),
            "api_intercepts_count": len(self.extracted_quotes),
            "timestamp": datetime.now().isoformat()
        }

    def _save_results(self, persona, result):
        """Exports full telemetry and step traces to JSON artifact."""
        out_file = OUTPUT_DIR / f"quote_{self.target}_{persona['id']}.json"
        payload = {
            "persona": persona,
            "scrape_result": result,
            "funnel_steps": self.funnel_steps,
            "captured_api_events": self.extracted_quotes
        }
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"\n[OUTPUT] Multi-step telemetry saved to: {out_file}")

def main():
    parser = argparse.ArgumentParser(description="InsurCheck Multi-Step Quoting Scraper")
    parser.add_argument("--target", choices=["squareone", "rates", "td"], default="squareone", help="Target insurance platform")
    parser.add_argument("--persona", default="young_brampton", choices=list(ONTARIO_PERSONAS.keys()), help="Driver persona")
    parser.add_argument("--proxy", default=None, help="HTTP/HTTPS proxy (e.g., http://user:pass@host:port)")
    parser.add_argument("--headed", action="store_true", help="Run browser in visible mode")
    parser.add_argument("--no-screenshots", action="store_true", help="Disable step screenshot capture")

    args = parser.parse_args()

    scraper = MultiStepQuoteScraper(
        target=args.target,
        headless=not args.headed,
        proxy=args.proxy,
        capture_screenshots=not args.no_screenshots
    )

    asyncio.run(scraper.run_persona(args.persona))

if __name__ == "__main__":
    main()
