import os
import time
from playwright.sync_api import sync_playwright

def test_heatmap():
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

        # 1. Click Territory Heat Map Tab
        print("Clicking Territory Heat Map tab...")
        heatmap_btn = page.locator("button:has-text('Territory Heat Map')")
        heatmap_btn.click()
        page.wait_for_timeout(1500)

        # Screenshot 1: Full Heat Map Grid View
        grid_path = os.path.join(out_dir, "territory_heatmap_grid.png")
        page.screenshot(path=grid_path)
        print(f"Captured: {grid_path}")

        # 2. Search for Brampton "L6P"
        print("Searching for L6P...")
        search_box = page.locator("input[placeholder*='Search postal prefix']")
        search_box.fill("L6P")
        page.wait_for_timeout(800)

        search_path = os.path.join(out_dir, "territory_heatmap_search_l6p.png")
        page.screenshot(path=search_path)
        print(f"Captured: {search_path}")

        # 3. Click on the L6P card to open Modal
        print("Opening L6P modal...")
        card = page.locator("text=L6P").first
        card.click()
        page.wait_for_timeout(800)

        modal_path = os.path.join(out_dir, "territory_fsa_modal.png")
        page.screenshot(path=modal_path)
        print(f"Captured: {modal_path}")

        # Close Modal by clicking the close button
        modal_close = page.locator("div.fixed button").first
        modal_close.click()
        page.wait_for_timeout(600)

        # 4. Switch to City Rankings Leaderboard
        search_box.fill("")
        page.wait_for_timeout(400)
        print("Switching to City Rankings...")
        rankings_btn = page.locator("button:has-text('City Rankings')")
        rankings_btn.click()
        page.wait_for_timeout(1000)

        rankings_path = os.path.join(out_dir, "territory_city_rankings.png")
        page.screenshot(path=rankings_path)
        print(f"Captured: {rankings_path}")

        browser.close()
        print("All visual captures successfully completed!")

if __name__ == "__main__":
    test_heatmap()
