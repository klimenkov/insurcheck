## Objective

Fix the confirmed UI bugs and make public claims accurately describe InsurCheck’s model, community data, and current broker availability.

## Implementation boundaries

* Keep the existing pricing algorithm, baseline, indexes, and coverage calculations.
* Keep the existing **Discounts included / Discounts not included** section unchanged.
* Keep winter tires as the existing benchmark assumption.
* Keep the current visual identity.
* Do not publish raw scraped quotes or treat hypothetical driver profiles as community submissions.
* Do not fabricate sources, confidence calculations, reviews, savings, or broker relationships.
* Make only the changes specified below.

## 1. Fix calculator state persistence and stale results

**Observed bug**

After calculating an estimate, navigating to another section, and returning to Sanity Check, the form resets while the previous result remains visible.

**Required behaviour**

1. Preserve all calculator inputs, selected mode, and the corresponding result during same-tab navigation.
2. Store the input snapshot used to generate each result.
3. When an input affecting the calculation changes, replace the previous result with:
   **“Your details have changed. Recalculate to update your result.”**
4. Hide the outdated price, score, and result-specific actions until recalculation succeeds.
5. Switching calculator modes must also invalidate the previous result.
6. If a reset action exists, clear both the inputs and result.
7. Display a compact profile summary with each valid result: vehicle, FSA, coverage, age, licence experience, and driving-record selection.

**Acceptance criteria**

* Navigating away and back restores matching inputs and results.
* Editing an input never leaves an outdated result presented as current.
* Recalculation replaces both the result and its input snapshot.

## 2. Fix section URLs and browser navigation

**Observed bug**

Opening Privacy and then selecting Insurance Reviews or Sanity Check changes the content while the URL remains `/privacy`.

**Required behaviour**

* Use the existing router and existing routes where available.
* Give each main section a distinct route if it does not already have one.
* Every navigation action must update both the visible section and URL.
* Direct navigation and refresh must render the section identified by the URL.
* Browser Back and Forward must restore the correct section.
* Preserve calculator state during same-tab navigation between sections.

**Acceptance criteria**

Open Privacy → select Insurance Reviews → select Sanity Check → use Back and Forward. At every step, the URL must correspond to the displayed section.

## 3. Correct benchmark terminology and explain data sources

**Existing text to replace**

The estimate-mode explanation contains:

“We’ll compute the official Ontario actuarial benchmark…”

**Replacement**

“We’ll estimate an insurance benchmark for your vehicle, area, and driver profile using InsurCheck’s pricing model. Use it to compare quotes. Actual prices depend on the insurer and your circumstances.”

**Other terminology changes**

* Replace **“FSRA Fair Rate Benchmark”** with **“How InsurCheck calculates your benchmark.”**
* Replace **“The Pure Mathematical Cost of Risk”** with **“How the pricing model works.”**
* Replace **“FSRA Territorial Actuarial Matrix”** with **“InsurCheck Territorial Pricing Index.”**
* Replace references to an **“exact FSRA rating”** with **“InsurCheck territorial index.”**
* Retain factual FSRA references only where they describe an identifiable regulatory source rather than InsurCheck’s own output.

**Methodology explanation**

Explain these sources separately:

* **Model-building quotes:** insurer quotes generated for hypothetical driver profiles and used to develop pricing indexes.
* **Community submissions:** insurance rates voluntarily shared by users.
* **Reference inputs:** the documented regulatory or other reference data actually used by the implementation.

State that model-building quotes are not purchased policies or community submissions. Individual source quotes do not need to be displayed.

Inspect the repository’s data provenance before describing the $175 baseline or an index as FSRA-published. If the repository does not establish that attribution, describe it as the baseline or index used by InsurCheck’s model. Do not invent supporting citations.

Display the model’s update date only if an actual data/model update timestamp exists. Do not substitute the deployment date or current date.

## 4. Make the confidence metric explainable

**Observed labels**

* “FSRA Model Density”
* “98% Reliable”

**Implementation procedure**

Inspect the existing calculation and select the applicable behaviour:

| Existing implementation | Required presentation |
| -- | -- |
| Percentage measures data coverage or profile density | Label **“Model data coverage.”** Explain its numerator, denominator, and relevance to the profile. |
| Percentage is an internal confidence score | Label **“Model confidence score.”** Explain the actual factors used and state that it is not a measured percentage of accurate predictions. |
| Percentage measures performance on held-out quotes | Name the actual performance metric and disclose sample size and the error tolerance or evaluation definition. |
| Percentage is hardcoded or has no identifiable calculation | Hide the percentage and its reliability claim. |

* Remove “FSRA” from the name of an internally calculated metric.
* Preserve a meaningful existing calculation.
* Add an adjacent information control explaining the metric in plain language.
* Do not create a new confidence formula to satisfy this ticket.

## 5. Align homepage and result claims with their actual data source

**Replace homepage supporting text with**

“Compare your premium with InsurCheck’s Ontario insurance model and help build a community database of real driver rates.”

**Results**

* Label model-only results **“Model-based estimate.”**
* Display community comparison statistics only when real community records actually contribute to those statistics.
* Show the actual matching-record count whenever a community comparison is displayed.
* For model-only results, show:
  **“This estimate comes from InsurCheck’s pricing model, not a comparison of community submissions.”**
* Do not use total checks run as the number of community submissions or matching drivers.

**Unsupported superlative**

Remove the banner **“Ontario drivers pay Canada’s highest premiums.”** This ticket does not add a replacement ranking claim.

## 6. Make anonymous-sharing wording consistent with Community Rates

**Replace**

“Nothing is shared publicly.”

**With**

“Shared rate details may appear anonymously in Community Rates. Your name and contact details are not displayed with your rate.”

**Replace badge**

“Zero Personal Info” → **“No name or email needed”**

**Replace community-sharing consent text with**

“I agree to share my rate details anonymously in Community Rates and help improve InsurCheck’s benchmarks.”

Place the following explanation beside the consent:

“Shared details can include your vehicle, postal-code prefix, age, licence experience, insurer, coverage, premium, and driving-record category.”

**Data behaviour**

* Keep consent required for the existing community-sharing submission flow.
* Keep estimate mode separate from community rate submission.
* Public records must expose only the three-character FSA, not a full postal code.
* Public rate responses must exclude names, emails, phone numbers, and private contact-record identifiers.
* Update contradictory privacy-policy wording to match the actual anonymous display behaviour.
* Remove absolute “zero personal data saved” claims where they conflict with technical or contact-data collection.

## 7. Replace unavailable broker quoting with a launch-notification flow

There is currently no operational broker partner. The future service may have multiple partners.

**Replace the result CTA**

* Heading: **“Interested in help finding insurance?”**
* Description: **“Broker matching is coming soon. Get notified when it becomes available.”**
* Button: **“Notify me at launch”**

**Replace the broker-request modal**

* Title: **“Get notified when broker matching launches”**
* Description: **“Leave your email and we’ll notify you when the service becomes available. This does not request insurance quotes.”**
* Required field: **Email address**
* Submit button: **“Notify me at launch”**
* Success message: **“You’re on the list. We’ll email you when broker matching becomes available.”**

**Behaviour**

* Store registrations separately from quote requests, or use an explicit `broker_launch_waitlist` record type.
* Do not attach the calculator profile to the registration.
* Do not send registrations to brokers or trigger quote-request workflows.
* Preserve existing historical lead records.
* Prevent duplicate registrations for the same normalized email.
* On failure, retain the email and show a retryable error; do not display success.

Remove current-service claims from this flow, including:

* “Verified Ontario broker match”
* “Lock In Your Best Insurance Price”
* “Compares 30+ insurers”
* “Get Official Quotes”

Update associated privacy wording to describe launch notifications accurately.

## 8. Resolve coverage-description inconsistencies

**Observed discrepancy**

* Standard result: $1M liability.
* Methodology baseline description: $2M liability.

**Required changes**

1. Inspect the actual coverage configuration used by the calculation.
2. Make form details, result descriptions, and methodology text match that configuration.
3. If reference baseline coverage differs from Standard coverage intentionally, describe the two separately and explain the existing adjustment.
4. Use shared coverage definitions rather than duplicated text.
5. Do not change pricing or coverage assumptions merely to make the text agree.
6. Replace **“Ontario Market Range”** with **“Estimated prices by coverage level”** wherever the displayed range spans Basic through Full.

## 9. Fix heat-map counts

**Observed discrepancy**

The map advertises 142 FSAs, while category counts total 143:

17 + 66 + 39 + 21.

**Required changes**

* Derive the headline, navigation badge, and category totals from the same unique-FSA dataset.
* Ensure every included FSA belongs to exactly one category.
* Resolve duplicate records or overlapping category conditions.
* Use the actual computed total; do not hardcode either 142 or 143.
* Preserve existing territory index values.

**Acceptance criteria**

The four category counts sum to the displayed total, and that total equals the number of unique FSAs represented.

## 10. Resolve insurer-review score ambiguity

**Observed discrepancy**

CAA displays 4.9 overall, while its category scores range from 4.0 to 4.5.

**Implementation procedure**

* If overall ratings are collected independently, label the score **“Overall rating”** and explain that users submit it separately from category ratings.
* If overall ratings are derived from categories, fix the aggregation to match the intended calculation.
* Derive counts and scores from the underlying review records.
* Exclude demonstration/seed reviews from production community totals and averages.
* If external ratings exist, label their source separately from InsurCheck community reviews.
* If no real ratings exist, show **“No ratings yet.”**
* Use singular **“1 review”** and plural **“2 reviews.”**

Do not force an independently collected overall rating to equal the category average.

## 11. Simplify entry into the calculator and result presentation

**Mode selection**

Place these two controls above the calculator fields:

* **Check my current premium**
* **Estimate insurance for a car**

Default to the current-premium mode. Use these controls to drive the existing mode logic and remove the duplicate estimate-mode checkbox.

**Homepage**

* Replace all “5 basic questions” / “5 basic inputs” wording with **“a few details.”**
* Remove the header savings counter and statistics cards that display “TBD.”
* Keep the checks-run count secondary, outside the main hero/form entry area.
* Reduce oversized vertical gaps above the form.
* At a desktop viewport of approximately 1366 × 900, show the mode controls and the start of the form without scrolling.

**Results**

* Show one prominent selected benchmark price.
* Remove duplicate cards repeating the same selected price.
* Preserve annual cost and the comparison across coverage tiers.
* Keep coverage, profile summary, model/community basis, and existing discount breakdown accessible.
* Add **“Edit details”** to move focus to the calculator.
* On mobile, successful calculation must bring the result heading into view.

## Verification and delivery

Use staging or an existing test-data exclusion mechanism. Do not create fictional production community rates, reviews, or broker leads.

Verify:

* Both calculator modes and required-field validation.
* Same-tab state persistence, mode switching, edits, and recalculation.
* Matching URLs, direct loads, refresh, and Back/Forward.
* Source labels and confidence explanations match the implementation.
* Anonymous public records exclude private contact fields.
* Waitlist success, duplicate handling, and failure states.
* Coverage descriptions match the existing model configuration.
* Map totals match unique FSAs.
* Review scores and counts match their actual source records.
* Desktop and mobile layouts and keyboard operation.

In the implementation summary, report:

* The changes completed.
* What the existing confidence percentage actually measures.
* How the baseline’s attribution was resolved.
* Whether the overall review score is independent or derived.
* Verification performed and any concrete blockers.

Do not describe unverified behaviour as tested.