import os
import time
from playwright.sync_api import sync_playwright

def test_dynamics_and_fsra():
    out_dir = os.path.abspath("scrapers/output")
    os.makedirs(out_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            channel="msedge"
        )
        context = browser.new_context(viewport={"width": 1440, "height": 950})
        page = context.new_page()

        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1500)

        # 1. Click Community Rates tab
        print("Clicking Community Rates tab...")
        page.locator("button:has-text('Community Rates')").click()
        page.wait_for_timeout(1000)

        # 2. Switch to Market Watch (Automated Scraper) mode
        print("Switching to Market Watch mode...")
        page.locator("button:has-text('Market Watch')").click()
        page.wait_for_timeout(1500)

        # Capture Market Watch with Freshness Banner and 6-Month Trends Chart
        trends_path = os.path.join(out_dir, "historical_price_dynamics_chart.png")
        page.screenshot(path=trends_path)
        print(f"Captured: {trends_path}")

        # 3. Click "What is FSRA Fair Rate?" button
        print("Clicking What is FSRA Fair Rate? button...")
        page.locator("button:has-text('What is FSRA Fair Rate?')").click()
        page.wait_for_timeout(800)

        # Capture FSRA Explainer Modal - Formula Tab
        fsra_formula_path = os.path.join(out_dir, "fsra_explainer_formula.png")
        page.screenshot(path=fsra_formula_path)
        print(f"Captured: {fsra_formula_path}")

        # 4. Switch to Territory Multipliers tab in modal
        print("Switching to Territory Multipliers tab in modal...")
        page.locator("button:has-text('Territory Multipliers')").click()
        page.wait_for_timeout(600)

        fsra_territory_path = os.path.join(out_dir, "fsra_explainer_territory.png")
        page.screenshot(path=fsra_territory_path)
        print(f"Captured: {fsra_territory_path}")

        # 5. Switch to Vehicle Theft Index tab in modal
        print("Switching to Vehicle Theft Index tab in modal...")
        page.locator("button:has-text('Vehicle Theft Index')").click()
        page.wait_for_timeout(600)

        fsra_theft_path = os.path.join(out_dir, "fsra_explainer_theft.png")
        page.screenshot(path=fsra_theft_path)
        print(f"Captured: {fsra_theft_path}")

        # Close Modal
        page.locator("button:has-text('Got It')").click()
        page.wait_for_timeout(600)

        browser.close()
        print("All visual captures for Dynamics & FSRA Explainer completed successfully!")

if __name__ == "__main__":
    test_dynamics_and_fsra()
