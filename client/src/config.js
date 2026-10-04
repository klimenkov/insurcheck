/**
 * InsurCheck Global Feature Configuration (INS-64)
 */

export const FEATURES = {
  /**
   * Visibility flag governing public Community Rates (/rates) listing.
   * Section 14: Disabled for public launch of discount-aware pricing.
   * When false:
   * - Public nav links and CTAs leading to /rates are hidden.
   * - Homepage previews/sections for Community Rates listing are hidden.
   * - Direct visits to /rates redirect to homepage without rendering the listing.
   * - Submissions collection and admin access continue operating normally.
   */
  COMMUNITY_RATES_VISIBLE: false,

  /**
   * Section 14: Homepage usage counter presentation offset.
   * Calculation: displayed count = real sanity-check count + 1,000.
   * Example: 42 actual checks -> "Over 1,042 Ontario sanity checks performed".
   * Kept in one named configuration constant; applied exactly once.
   */
  DISPLAY_CHECKS_OFFSET: 1000
};
