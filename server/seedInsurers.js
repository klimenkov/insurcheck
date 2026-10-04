import { db } from './db.js';
import { initialSubmissions, initialReviews, initialDiscussions, initialDiscussionReplies, initialFeedback, initialLeads } from './initialData.js';

export function ensureInsurersPopulated() {
  const insurers = [
    {
      id: 'intact',
      name: 'Intact Insurance',
      logo_color: '#e31b23',
      avg_monthly: 245,
      fy2025_revenue_cad: 16200000000,
      revenue_formatted: '$16.2B CAD',
      revenue_metric: 'Direct Written Premiums (Canada P&C)',
      revenue_source_url: 'https://www.intactfc.com/English/investors/financial-reports',
      revenue_date: 'FY2025',
      customer_count: 'Over 6.0 million policies in force',
      customer_count_scope: 'Canada-wide personal & commercial',
      customer_source_url: 'https://www.intact.ca/about-us',
      parent_group: 'Intact Financial Corporation',
      underwriting_entity: 'Intact Insurance Company',
      distribution_channel: 'Independent Broker Channel',
      editorial_score: 8.6,
      editorial_claims: 9.0,
      editorial_service: 8.5,
      editorial_coverage: 9.0,
      editorial_transparency: 7.5,
      editorial_digital: 8.0,
      verdict: "Canada's largest property & casualty carrier with top-tier claims response, broad collision repair centres, and unmatched financial backing, though base rates through brokers sit higher than direct discount providers.",
      who_should_consider: 'Drivers prioritizing guaranteed rapid claims handling, OEM collision replacement endorsements, multi-policy homeowners, and those working with established independent brokers.',
      who_should_avoid: 'Single-car budget commuters seeking the absolute lowest sticker price or instant direct digital policy purchase.',
      strengths: JSON.stringify([
        'Extensive network of Rely Network collision centres with lifetime repair guarantees',
        'Top financial stability and catastrophe response capability across Ontario',
        'My Drive telematics discount up to 25% for smooth driving habits'
      ]),
      limitations: JSON.stringify([
        'Premiums trend higher than direct-to-consumer digital alternatives',
        'Policy alterations and binding require broker interaction rather than instant web self-service',
        'Strict territory reassessments and higher comprehensive rates in GTA vehicle-theft hotspots'
      ]),
      claims_procedure: '24/7 dedicated intake via 1-866-464-2424 or through your independent broker. Priority collision assessment assigned within 4 to 24 hours with seamless Enterprise rental car coordination.',
      discounts_telematics: 'My Drive app (up to 25% tracked discount), multi-vehicle (up to 15%), home-auto bundle (up to 20%), winter tire (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Largest provider network in Canada, top-tier claims speed and reliable network of approved collision repair centres.',
      cons: 'Higher baseline rates than direct-only discount carriers; policies must be managed through independent brokers.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.intact.ca'
    },
    {
      id: 'desjardins',
      name: 'Desjardins Insurance',
      logo_color: '#00874e',
      avg_monthly: 232,
      fy2025_revenue_cad: 7400000000,
      revenue_formatted: '$7.4B CAD',
      revenue_metric: 'Direct Premiums Written (P&C Canada)',
      revenue_source_url: 'https://www.desjardins.com/ca/about-us/investor-relations',
      revenue_date: 'FY2025',
      customer_count: 'Over 3.4 million policies in force',
      customer_count_scope: 'Canada-wide personal lines',
      customer_source_url: 'https://www.desjardinsgeneralinsurance.com',
      parent_group: 'Desjardins Group (Cooperative)',
      underwriting_entity: 'Desjardins General Insurance Inc. (DGIG)',
      distribution_channel: 'Direct Online, Phone & Agent Offices',
      editorial_score: 8.4,
      editorial_claims: 8.5,
      editorial_service: 8.5,
      editorial_coverage: 8.5,
      editorial_transparency: 8.0,
      editorial_digital: 8.5,
      verdict: "A financially resilient cooperative providing competitive direct rates across Eastern and Northern Ontario, full bilingual support, and one of the market's most mature telematics apps (Ajusto).",
      who_should_consider: 'Drivers in Ottawa, Eastern and Northern Ontario, bilingual policyholders, and safe drivers willing to use telematics for up to 25% savings.',
      who_should_avoid: 'Drivers with frequent late-night commuting or aggressive braking habits that may negatively impact telematics scoring.',
      strengths: JSON.stringify([
        'Ajusto telematics app with proven tracked savings up to 25%',
        'Seamless digital self-service policy management and claims tracking',
        'Strong regional price competitiveness outside the GTA core'
      ]),
      limitations: JSON.stringify([
        'Telematics algorithm is sensitive to hard braking and late-night driving',
        'Higher rates in Western GTA high-claim postal codes (Brampton, Vaughan)'
      ]),
      claims_procedure: 'Direct 24/7 claims reporting via the Desjardins Insurance mobile app or by calling 1-888-775-5242. Quick video appraisal options available for minor cosmetic damage.',
      discounts_telematics: 'Ajusto app program (up to 25%), multi-vehicle, bundle with home/condo, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Ajusto app telematics discount, excellent bilingual English/French support, very competitive in Ottawa and Eastern Ontario.',
      cons: 'Ajusto app scoring can be sensitive to sudden braking and late-night commuting.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.desjardinsgeneralinsurance.com'
    },
    {
      id: 'aviva',
      name: 'Aviva Canada',
      logo_color: '#f59e0b',
      avg_monthly: 240,
      fy2025_revenue_cad: 6800000000,
      revenue_formatted: '$6.8B CAD',
      revenue_metric: 'Direct Premiums Written (Canada P&C)',
      revenue_source_url: 'https://www.aviva.com/investors/results-and-reports',
      revenue_date: 'FY2025',
      customer_count: 'Approximately 3.0 million customers',
      customer_count_scope: 'Canada-wide personal & commercial',
      customer_source_url: 'https://www.aviva.ca/en/about-us',
      parent_group: 'Aviva plc',
      underwriting_entity: 'Aviva Insurance Company of Canada',
      distribution_channel: 'Independent Broker Channel',
      editorial_score: 8.1,
      editorial_claims: 8.0,
      editorial_service: 8.0,
      editorial_coverage: 8.5,
      editorial_transparency: 7.5,
      editorial_digital: 8.0,
      verdict: 'Major national underwriter offering specialized endorsements including rideshare (Lyft/Uber) coverage and overland water, though renewal adjustments in high-theft GTA regions can be sharp.',
      who_should_consider: 'Rideshare and delivery drivers needing explicit platform coverage endorsements, and drivers bundling commercial or home coverage with an independent broker.',
      who_should_avoid: 'Drivers in theft-prone GTA zip codes expecting flat rate renewals without anti-theft tracking hardware.',
      strengths: JSON.stringify([
        'Pioneering official rideshare insurance endorsements in Ontario',
        'Aviva Journey telematics discount up to 20%',
        'Large national network of approved collision repair centres'
      ]),
      limitations: JSON.stringify([
        'Substantial territorial rate volatility in Peel Region (L6P/L6Y)',
        'Customer service wait times through broker desk during peak renewal cycles'
      ]),
      claims_procedure: '24/7 claims hotline via 1-866-692-8482 or Aviva Premier Claim branch network with on-site rental vehicle access.',
      discounts_telematics: 'Aviva Journey app (up to 20%), bundle discounts, retiree discounts, anti-theft tracking device rebates.',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Comprehensive rideshare (Lyft/Uber) coverage endorsements, broad broker availability across Ontario.',
      cons: 'Substantial renewal rate jumps in GTA high-claim postal codes; changes require broker assistance.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.aviva.ca'
    },
    {
      id: 'td',
      name: 'TD Insurance',
      logo_color: '#008a00',
      avg_monthly: 228,
      fy2025_revenue_cad: 5900000000,
      revenue_formatted: '$5.9B CAD',
      revenue_metric: 'Direct Written Premiums (Personal Lines Canada)',
      revenue_source_url: 'https://www.td.com/ca/en/about-td/investor-relations',
      revenue_date: 'FY2025',
      customer_count: 'Over 2.5 million customers insured',
      customer_count_scope: 'Canada-wide personal lines',
      customer_source_url: 'https://www.tdinsurance.com/about-us',
      parent_group: 'TD Bank Group',
      underwriting_entity: 'Security National Insurance Company / Primmum Insurance Company',
      distribution_channel: 'Direct Digital & Phone Agency',
      editorial_score: 8.0,
      editorial_claims: 7.5,
      editorial_service: 7.5,
      editorial_coverage: 8.0,
      editorial_transparency: 8.0,
      editorial_digital: 9.0,
      verdict: 'A direct digital powerhouse with outstanding alumni, university, and professional employer group discounts, offset by elevated phone wait times and strict renewal pricing adjustments.',
      who_should_consider: 'Alumni of Canadian universities (U of T, Waterloo, McMaster, etc.), eligible professional association members, and TD banking customers seeking bundling rebates.',
      who_should_avoid: 'Drivers without corporate/alumni affiliations seeking personalized broker assistance or bespoke classic car coverage.',
      strengths: JSON.stringify([
        'Unrivaled group rate discounts for hundreds of Canadian alumni & professional associations',
        'Full-featured mobile app with digital pink slip and claim filing',
        'TD MyAdvantage driving habit discount up to 25%'
      ]),
      limitations: JSON.stringify([
        'Call center hold times can be substantial in autumn storm seasons',
        'Automated renewal rate bumps often require policy review'
      ]),
      claims_procedure: 'Report 24/7 online via the TD Insurance mobile app or call 1-866-268-3729. TD Auto Centres provide on-site appraisal, repair, and car rental under one roof in major GTA cities.',
      discounts_telematics: 'TD MyAdvantage (up to 25%), Alumni & Professional Group affinity rates (up to 20%), Multi-car and Home/Auto bundle.',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Deep university alumni, professional association, and TD banking bundle discounts.',
      cons: 'Customer support wait times peak in fall/winter; strict automated rate increases on annual renewal.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.tdinsurance.com'
    },
    {
      id: 'wawanesa',
      name: 'Wawanesa Insurance',
      logo_color: '#0369a1',
      avg_monthly: 225,
      fy2025_revenue_cad: 4800000000,
      revenue_formatted: '$4.8B CAD',
      revenue_metric: 'Direct Premiums Written (Canada Property & Casualty)',
      revenue_source_url: 'https://www.wawanesa.com/canada/about-us/financial-performance',
      revenue_date: 'FY2025',
      customer_count: 'Over 2.0 million members and policyholders',
      customer_count_scope: 'Canada-wide total',
      customer_source_url: 'https://www.wawanesa.com/canada/about-us',
      parent_group: 'The Wawanesa Mutual Insurance Company',
      underwriting_entity: 'The Wawanesa Mutual Insurance Company',
      distribution_channel: 'Independent Insurance Brokers',
      editorial_score: 8.3,
      editorial_claims: 8.5,
      editorial_service: 8.0,
      editorial_coverage: 8.0,
      editorial_transparency: 8.5,
      editorial_digital: 7.5,
      verdict: 'A Canadian mutual insurer celebrated for ethical claim settlements and competitive rates for standard commuter vehicles, operating strictly through independent broker distribution.',
      who_should_consider: 'Families, mature drivers with clean records, and policyholders who value mutual governance and relationship-driven broker advice.',
      who_should_avoid: 'Tech-focused drivers seeking 100% online self-service policy changes without speaking to a broker.',
      strengths: JSON.stringify([
        'Consistently competitive baseline pricing for clean record drivers',
        'Mutual ethos returns value to policyholder stability rather than public equity shareholders',
        'Fair and measured claims settlement reputation'
      ]),
      limitations: JSON.stringify([
        'No direct purchase portal — must be bound through a licensed broker',
        'Online portal has limited self-serve configuration features'
      ]),
      claims_procedure: 'Report directly to your independent insurance broker or call the 24/7 dedicated claims emergency line at 1-844-929-2637.',
      discounts_telematics: 'Multi-product discount, mature driver discount, farm/fleet rates, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Consistently competitive baseline rates for clean-record drivers and families; mutual insurer model.',
      cons: 'Sold strictly via insurance brokers; online customer portal has fewer self-service features.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.wawanesa.com'
    },
    {
      id: 'cooperators',
      name: 'Co-operators',
      logo_color: '#ea580c',
      avg_monthly: 238,
      fy2025_revenue_cad: 4500000000,
      revenue_formatted: '$4.5B CAD',
      revenue_metric: 'Direct Premiums Written (P&C Canada)',
      revenue_source_url: 'https://www.cooperators.ca/en/about-us/financial-reports',
      revenue_date: 'FY2025',
      customer_count: 'Over 1.5 million clients across Canada',
      customer_count_scope: 'Canada-wide total',
      customer_source_url: 'https://www.cooperators.ca',
      parent_group: 'The Co-operators Group Limited',
      underwriting_entity: 'Co-operators General Insurance Company',
      distribution_channel: 'Exclusive Financial Advisor Network & Online',
      editorial_score: 8.5,
      editorial_claims: 8.5,
      editorial_service: 9.0,
      editorial_coverage: 8.5,
      editorial_transparency: 8.0,
      editorial_digital: 8.0,
      verdict: 'Exceptional personalized local service and cooperative customer alignment, with local brick-and-mortar financial advisor offices throughout small-town and suburban Ontario.',
      who_should_consider: 'Homeowners, small business owners, and rural/suburban Ontario drivers wanting a dedicated advisor who knows their portfolio.',
      who_should_avoid: 'Young solo renters looking strictly for the absolute lowest algorithmic sticker price.',
      strengths: JSON.stringify([
        'Dedicated local financial advisors across virtually every Ontario municipality',
        'Superior customer retention and community-first claims satisfaction',
        'Comprehensive multi-product bundling rebates'
      ]),
      limitations: JSON.stringify([
        'Standalone auto premiums slightly higher without multi-product bundle',
        'Online binding is limited for complex multi-driver households'
      ]),
      claims_procedure: '24/7 claims line at 1-877-682-5246 or directly through your dedicated local Co-operators financial advisor.',
      discounts_telematics: 'En-route Auto Program telematics, multi-product discount, student away at school discount.',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'High customer loyalty, dedicated local financial advisor offices across Ontario, fair claims settlement ethos.',
      cons: 'Slightly higher standalone auto premiums without home/commercial policy bundling.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.cooperators.ca'
    },
    {
      id: 'economical',
      name: 'Economical Insurance',
      logo_color: '#0284c7',
      avg_monthly: 235,
      fy2025_revenue_cad: 4400000000,
      revenue_formatted: '$4.4B CAD',
      revenue_metric: 'Gross Written Premiums (Definity Financial P&C)',
      revenue_source_url: 'https://www.definityfinancial.com/English/investors',
      revenue_date: 'FY2025',
      customer_count: 'Over 1.8 million policies managed across Definity group',
      customer_count_scope: 'Canada-wide personal & commercial',
      customer_source_url: 'https://www.economical.com',
      parent_group: 'Definity Financial Corporation',
      underwriting_entity: 'Economical Mutual Insurance Company / Definity Insurance',
      distribution_channel: 'Independent Broker Channel',
      editorial_score: 8.0,
      editorial_claims: 8.0,
      editorial_service: 8.0,
      editorial_coverage: 8.0,
      editorial_transparency: 8.0,
      editorial_digital: 7.5,
      verdict: 'The traditional broker arm of Definity Financial, offering well-balanced coverage packages and solid adjuster performance across Ontario commuter corridors.',
      who_should_consider: 'Drivers working with independent brokers seeking reliable claims backing and standard commuter coverage.',
      who_should_avoid: 'Self-directed buyers wanting an instant direct quote portal (who are better served by sister brand Sonnet).',
      strengths: JSON.stringify([
        'Strong established relationship with Ontario independent broker network',
        'Reliable adjusters and structured claims resolution protocol',
        'Comprehensive optional loss-of-use and accident forgiveness add-ons'
      ]),
      limitations: JSON.stringify([
        'Broker intermediary required for policy binding and changes',
        'Less prominent individual brand marketing following Definity demutualization'
      ]),
      claims_procedure: '24/7 emergency claims reporting at 1-800-607-2424 or contact your independent insurance broker directly.',
      discounts_telematics: 'Multi-vehicle discount, home-auto bundle, claims-free discount, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Part of Definity Financial Group; strong personal vehicle lines with reliable claims adjusters.',
      cons: 'Distributed through independent broker channel rather than a direct online purchase portal.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.economical.com'
    },
    {
      id: 'belairdirect',
      name: 'Belairdirect',
      logo_color: '#005691',
      avg_monthly: 215,
      fy2025_revenue_cad: 4200000000,
      revenue_formatted: 'Parent segment: $7.1B CAD',
      revenue_metric: 'Direct Written Premiums (Personal Lines - Intact Group)',
      revenue_source_url: 'https://www.intactfc.com/English/investors/financial-reports',
      revenue_date: 'FY2025',
      customer_count: 'Over 1.2 million direct personal lines policies',
      customer_count_scope: 'Canada-wide direct personal lines',
      customer_source_url: 'https://www.belairdirect.com/en/about-us',
      parent_group: 'Intact Financial Corporation',
      underwriting_entity: 'Belair Insurance Company Inc.',
      distribution_channel: '100% Direct Online & Mobile App',
      editorial_score: 8.2,
      editorial_claims: 8.0,
      editorial_service: 8.0,
      editorial_coverage: 8.0,
      editorial_transparency: 8.0,
      editorial_digital: 9.0,
      verdict: 'The streamlined direct digital subsidiary of Intact, providing 3-minute online quotes, an intuitive app, and aggressive introductory telematics pricing.',
      who_should_consider: 'Tech-savvy commuters, urban drivers, and cost-conscious vehicle owners wanting an immediate policy on their smartphone.',
      who_should_avoid: 'Drivers with complex commercial endorsements or drivers looking to keep the exact same rate indefinitely without annual shopping.',
      strengths: JSON.stringify([
        'Seamless 3-minute online quote and binding experience',
        'Automerit telematics program offering up to 25% driving habit savings',
        'Full Intact claims infrastructure and repair network backing'
      ]),
      limitations: JSON.stringify([
        'First-year promotional discounts can taper off at renewal',
        'Phone lines experience volume spikes during severe weather events'
      ]),
      claims_procedure: 'Report immediately via the Belairdirect mobile app or 24/7 claims hotline at 1-833-223-5247.',
      discounts_telematics: 'Automerit program (up to 25%), multi-car discount, home and auto bundle, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Modern mobile app, quick online quotes in 3 minutes, automerit telematics discount up to 25%.',
      cons: 'Introductory promotional discounts often taper off upon year-1 renewal; phone lines get busy.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.belairdirect.com'
    },
    {
      id: 'northbridge',
      name: 'Northbridge Insurance',
      logo_color: '#1e3a8a',
      avg_monthly: 255,
      fy2025_revenue_cad: 3200000000,
      revenue_formatted: '$3.2B CAD',
      revenue_metric: 'Gross Written Premiums (Canada Commercial & Specialty)',
      revenue_source_url: 'https://www.fairfax.ca/financials',
      revenue_date: 'FY2025',
      customer_count: 'Over 300,000 commercial & business policies',
      customer_count_scope: 'Canada-wide commercial focus',
      customer_source_url: 'https://www.nbins.com/about',
      parent_group: 'Fairfax Financial Holdings',
      underwriting_entity: 'Northbridge General Insurance Corporation',
      distribution_channel: 'Independent Broker Channel',
      editorial_score: 8.0,
      editorial_claims: 8.5,
      editorial_service: 8.0,
      editorial_coverage: 8.5,
      editorial_transparency: 7.5,
      editorial_digital: 7.0,
      verdict: 'Fairfax-owned industry powerhouse specializing in commercial fleets, work trucks, contractors, and tradespeople vehicles across Ontario.',
      who_should_consider: 'Tradespeople, commercial pickup drivers, contractors, and mixed business/personal vehicle owners.',
      who_should_avoid: 'Solo commuter passenger sedan owners looking for a standard cheap commuter policy.',
      strengths: JSON.stringify([
        'Premier coverage for commercial tools, trailers, cargo, and mixed-use work vehicles',
        'Exceptional commercial fleet risk engineering and adjuster expertise',
        'Solid Fairfax Financial balance sheet backing'
      ]),
      limitations: JSON.stringify([
        'Not cost-competitive for everyday consumer passenger automobiles',
        'Exclusively distributed via specialized commercial insurance brokers'
      ]),
      claims_procedure: '24/7 dedicated commercial claims service at 1-855-621-6262.',
      discounts_telematics: 'Fleet safety management discount, multi-vehicle commercial rebate, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Specialized in commercial vehicles, fleets, tradespeople and high-value vehicle policies.',
      cons: 'Seldom the most cost-effective for single personal daily drivers.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.nbins.com'
    },
    {
      id: 'travelers',
      name: 'Travelers Canada',
      logo_color: '#dc2626',
      avg_monthly: 242,
      fy2025_revenue_cad: 1900000000,
      revenue_formatted: '$1.9B CAD',
      revenue_metric: 'Gross Written Premiums (Canada P&C)',
      revenue_source_url: 'https://investor.travelers.com',
      revenue_date: 'FY2025',
      customer_count: 'Approximately 800,000 Canadian policies',
      customer_count_scope: 'Canada-wide personal & commercial',
      customer_source_url: 'https://www.travelerscanada.ca',
      parent_group: 'The Travelers Companies, Inc.',
      underwriting_entity: 'Travelers Insurance Company of Canada',
      distribution_channel: 'Independent Broker Channel',
      editorial_score: 8.1,
      editorial_claims: 8.5,
      editorial_service: 8.0,
      editorial_coverage: 8.5,
      editorial_transparency: 8.0,
      editorial_digital: 7.5,
      verdict: 'A stalwart international insurer with deep financial reserves, excellent bundled home-auto packages, and strong optional endorsements like IntelliDrive telematics.',
      who_should_consider: 'Homeowners with multiple vehicles, mature drivers with clean histories, and customers seeking high liability limits ($2M–$5M).',
      who_should_avoid: 'Young novice G2 drivers under 25 seeking standalone, entry-level auto insurance.',
      strengths: JSON.stringify([
        'IntelliDrive smartphone telematics up to 30% discount',
        'High liability coverage capacity and rich multi-car bundling',
        'Institutional claims reliability backed by Travelers Group'
      ]),
      limitations: JSON.stringify([
        'Broker-only distribution without direct online purchase',
        'Selective underwriting criteria for younger drivers'
      ]),
      claims_procedure: '24/7 claims response via 1-800-661-5522 or through licensed independent broker.',
      discounts_telematics: 'IntelliDrive app (up to 30%), multi-policy discount, hybrid/EV discount, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'IntelliDrive telematics discount, attractive bundle packages for multi-car homeowners.',
      cons: 'Less competitive pricing for novice G2 drivers under 25.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.travelerscanada.ca'
    },
    {
      id: 'allstate',
      name: 'Allstate Insurance',
      logo_color: '#1d4ed8',
      avg_monthly: 236,
      fy2025_revenue_cad: 1600000000,
      revenue_formatted: '$1.6B CAD',
      revenue_metric: 'Gross Written Premiums (Canada Personal Lines)',
      revenue_source_url: 'https://www.allstate.ca/about',
      revenue_date: 'FY2025',
      customer_count: 'Over 750,000 policies in force',
      customer_count_scope: 'Canada-wide personal lines',
      customer_source_url: 'https://www.allstate.ca',
      parent_group: 'The Allstate Corporation',
      underwriting_entity: 'Allstate Insurance Company of Canada',
      distribution_channel: 'Local Agency Network & Direct Online',
      editorial_score: 8.0,
      editorial_claims: 8.0,
      editorial_service: 8.0,
      editorial_coverage: 8.0,
      editorial_transparency: 8.0,
      editorial_digital: 8.0,
      verdict: 'Distinguished by its physical local agencies throughout Ontario shopping centres, Drivewise telematics program, and robust accident forgiveness guarantees.',
      who_should_consider: 'Drivers who value sitting down face-to-face with an agent in their neighbourhood while maintaining app access.',
      who_should_avoid: 'Drivers seeking long-term price predictability without aggressive annual renewal reassessments.',
      strengths: JSON.stringify([
        'Local Allstate agency offices in dozens of Ontario communities',
        'Drivewise telematics app offering up to 30% driving discount',
        'Take Two Advantage multi-policy savings'
      ]),
      limitations: JSON.stringify([
        'Promotional first-year discounts frequently jump upon annual renewal',
        'Direct online self-service portal has more limitations than Sonnet or Belairdirect'
      ]),
      claims_procedure: '24/7 claims hotline at 1-800-255-7828 or directly through your local neighborhood Allstate agency.',
      discounts_telematics: 'Drivewise mobile program (up to 30%), Claim Forgiveness, Take Two bundle, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Drivewise telematics up to 30% discount, Claim Forgiveness endorsement, local physical agencies.',
      cons: 'Renewal rates frequently jump after first-year discount expires.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.allstate.ca'
    },
    {
      id: 'caa',
      name: 'CAA Insurance',
      logo_color: '#002f6c',
      avg_monthly: 198,
      fy2025_revenue_cad: 1200000000,
      revenue_formatted: '$1.2B CAD',
      revenue_metric: 'Direct Premiums Written (Ontario & Regional P&C)',
      revenue_source_url: 'https://www.caasco.com/about/corporate-governance',
      revenue_date: 'FY2025',
      customer_count: 'Over 600,000 auto policies in Ontario',
      customer_count_scope: 'Ontario & regional auto lines',
      customer_source_url: 'https://www.caainsurance.ca/about-us',
      parent_group: 'CAA Club Group',
      underwriting_entity: 'CAA Insurance Company (Ontario)',
      distribution_channel: 'Direct Online, Phone & Broker Channel',
      editorial_score: 8.9,
      editorial_claims: 9.0,
      editorial_service: 9.0,
      editorial_coverage: 8.5,
      editorial_transparency: 9.0,
      editorial_digital: 8.5,
      verdict: 'A market leader in consumer trust and Ontario low-mileage auto insurance, featuring the groundbreaking CAA MyPace pay-per-kilometre program and superior customer ratings.',
      who_should_consider: 'Work-from-home commuters, drivers logging under 10,000 km/year, CAA Club members, and retirees.',
      who_should_avoid: 'High-mileage road trippers (>20,000 km/year) or newly licensed teen drivers where other carriers may price more aggressively.',
      strengths: JSON.stringify([
        'CAA MyPace pay-as-you-drive saves low-mileage drivers up to 60%',
        '15-20% exclusive discount for CAA Club Members',
        'Top-rated claims and renewal rate stability in Ontario'
      ]),
      limitations: JSON.stringify([
        'CAA MyPace requires plugging an OBD-II device into the diagnostic port',
        'Underwriting guidelines are conservative for drivers with multiple recent infractions'
      ]),
      claims_procedure: '24/7 claims hotline at 1-877-222-1717 or via online member portal. Direct repair network includes top collision facilities across South-Central Ontario.',
      discounts_telematics: 'CAA MyPace (pay-per-km), CAA Member Discount (up to 20%), Multi-vehicle discount, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'CAA MyPace pay-as-you-drive for low-mileage drivers, additional 15-20% membership discount, consistent rates.',
      cons: 'Pay-per-km requires OBD device tracking, conservative quoting for brand-new novice drivers.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.caainsurance.ca'
    },
    {
      id: 'facility',
      name: 'Facility Association',
      logo_color: '#64748b',
      avg_monthly: 680,
      fy2025_revenue_cad: 950000000,
      revenue_formatted: '$950M CAD',
      revenue_metric: 'Industry Pool Written Premiums (Ontario Residual Market)',
      revenue_source_url: 'https://www.facilityassociation.com/financials',
      revenue_date: 'FY2025',
      customer_count: 'Approximately 35,000 high-risk auto policies',
      customer_count_scope: 'Ontario residual auto pool',
      customer_source_url: 'https://www.facilityassociation.com',
      parent_group: 'Non-profit Association of all Canadian P&C Insurers',
      underwriting_entity: 'Facility Association Residual Market Pool',
      distribution_channel: 'Independent Brokers via Designated Servicing Carriers',
      editorial_score: 6.2,
      editorial_claims: 7.0,
      editorial_service: 6.0,
      editorial_coverage: 6.0,
      editorial_transparency: 8.0,
      editorial_digital: 5.0,
      verdict: 'The mandatory insurer of last resort in Ontario. It exists by law to guarantee insurance for high-risk drivers with multiple cancellations, DUI, or fraud convictions who cannot find coverage in the voluntary market.',
      who_should_consider: 'Drivers legally unable to obtain coverage from any standard voluntary insurance company due to severe driving history, non-payment cancellations, or lapses.',
      who_should_avoid: 'Any driver who qualifies for a standard voluntary market insurer.',
      strengths: JSON.stringify([
        'Guaranteed legal acceptance for all licensed Ontario drivers who do not qualify elsewhere',
        'Administered through reliable servicing carriers (Intact, Co-operators)',
        'Clear and transparent surcharges mandated and audited by FSRA'
      ]),
      limitations: JSON.stringify([
        'Dramatically higher premiums (frequently $5,000–$12,000+/year)',
        'Heavy mandatory surcharges and restrictions designed as a temporary transition mechanism'
      ]),
      claims_procedure: 'Handled through the designated servicing insurance carrier (e.g. Intact or Co-operators) assigned by your independent insurance broker.',
      discounts_telematics: 'No commercial telematics discounts available; strictly statutory minimum discounts apply.',
      is_residual_market: 1,
      last_reviewed_date: '2026-10',
      pros: 'Ontario insurer of last resort; legally guarantees coverage for high-risk drivers turned down by standard carriers.',
      cons: 'Mandatory high surcharges; expensive premiums designed as a temporary solution until driver record clears.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.facilityassociation.com'
    },
    {
      id: 'goremutual',
      name: 'Gore Mutual',
      logo_color: '#7e22ce',
      avg_monthly: 230,
      fy2025_revenue_cad: 720000000,
      revenue_formatted: '$720M CAD',
      revenue_metric: 'Direct Premiums Written (Personal & Commercial P&C)',
      revenue_source_url: 'https://www.goremutual.ca/about-us',
      revenue_date: 'FY2025',
      customer_count: 'Over 200,000 policyholders',
      customer_count_scope: 'Ontario & regional personal lines',
      customer_source_url: 'https://www.goremutual.ca',
      parent_group: 'Gore Mutual Insurance Company',
      underwriting_entity: 'Gore Mutual Insurance Company',
      distribution_channel: 'Independent Insurance Brokers',
      editorial_score: 8.2,
      editorial_claims: 8.5,
      editorial_service: 8.5,
      editorial_coverage: 8.0,
      editorial_transparency: 8.5,
      editorial_digital: 7.5,
      verdict: "Canada's oldest property & casualty mutual insurer, headquartered in Cambridge, ON, known for authentic community values and personalized claims adjusters.",
      who_should_consider: 'Southwestern and Central Ontario drivers seeking a regional mutual insurer with human-first customer service.',
      who_should_avoid: 'Drivers looking for a sleek Silicon Valley-style mobile app or instant online binding.',
      strengths: JSON.stringify([
        'Deep Ontario heritage with community-centric mutual alignment',
        'Attentive, non-bureaucratic claims adjusters',
        'Solid discounts for bundled auto and home policies'
      ]),
      limitations: JSON.stringify([
        'Relies on independent broker distribution',
        'Lower brand awareness compared to national corporate conglomerates'
      ]),
      claims_procedure: '24/7 claims hotline at 1-800-265-8600 or through your independent insurance broker.',
      discounts_telematics: 'Multi-vehicle, home & auto bundle, retiree discount, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Canada’s oldest property & casualty mutual; personalized claims handling and community focus.',
      cons: 'Smaller brand recognition and digital app presence compared to national giants.',
      direct_online: 0,
      broker_only: 1,
      website: 'https://www.goremutual.ca'
    },
    {
      id: 'sonnet',
      name: 'Sonnet Insurance',
      logo_color: '#475569',
      avg_monthly: 220,
      fy2025_revenue_cad: 480000000,
      revenue_formatted: '$480M CAD',
      revenue_metric: 'Direct Written Premiums (Digital Personal Lines)',
      revenue_source_url: 'https://www.definityfinancial.com/English/investors',
      revenue_date: 'FY2025',
      customer_count: 'Over 250,000 digital policies in force',
      customer_count_scope: 'Canada-wide digital direct lines',
      customer_source_url: 'https://www.sonnet.ca/about-us',
      parent_group: 'Definity Financial Corporation',
      underwriting_entity: 'Sonnet Insurance Company',
      distribution_channel: '100% Online Self-Serve',
      editorial_score: 7.9,
      editorial_claims: 7.5,
      editorial_service: 7.5,
      editorial_coverage: 8.0,
      editorial_transparency: 8.0,
      editorial_digital: 9.5,
      verdict: "Canada's first purely digital home and auto insurer, offering instant online policy binding in minutes without talking to a human, though customer support can feel distant during complex claims.",
      who_should_consider: 'Drivers wanting an immediate, frictionless online purchase experience without phone calls or broker paperwork.',
      who_should_avoid: 'Drivers involved in disputed fault collisions who prefer speaking directly with a dedicated personal claims adjuster.',
      strengths: JSON.stringify([
        'Zero-friction 5-minute online quote and instant credit card policy issue',
        'Clean web portal for updating vehicle, address, and coverage limits',
        'Sonnet Shift digital telematics with quarterly cash incentives'
      ]),
      limitations: JSON.stringify([
        'Digital-only customer service can make resolving nuanced disputes slower',
        'Second-year renewal rate increases have been cited by policyholders'
      ]),
      claims_procedure: 'Online claim filing through sonnet.ca account or 24/7 hotline at 1-844-766-6384.',
      discounts_telematics: 'Sonnet Shift telematics, bundle discount, university alumni & group partner rebates.',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: '100% digital self-serve experience; instant online quote and binding without speaking to an agent.',
      cons: 'Digital-first support can make resolving nuanced collision liability disputes slower.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.sonnet.ca'
    },
    {
      id: 'onlia',
      name: 'Onlia',
      logo_color: '#0284c7',
      avg_monthly: 218,
      fy2025_revenue_cad: 110000000,
      revenue_formatted: '$110M CAD',
      revenue_metric: 'Direct Premiums Written (Ontario Personal Lines)',
      revenue_source_url: 'https://www.onlia.ca/about',
      revenue_date: 'FY2025',
      customer_count: 'Over 60,000 digital policyholders',
      customer_count_scope: 'Ontario personal auto & property',
      customer_source_url: 'https://www.onlia.ca',
      parent_group: 'Joint venture of Fairfax Financial and Achmea',
      underwriting_entity: 'Verassure Insurance Company',
      distribution_channel: '100% Online & Mobile App',
      editorial_score: 8.0,
      editorial_claims: 7.5,
      editorial_service: 8.0,
      editorial_coverage: 8.0,
      editorial_transparency: 8.5,
      editorial_digital: 9.0,
      verdict: 'A dynamic Ontario-focused digital challenger offering safety cashback rewards via its Sense driving app, backed by European cooperative insurance titan Achmea and Fairfax.',
      who_should_consider: 'Ontario safe drivers who want cash rewards and gift cards for safe driving habits, and prefer 100% online policy administration.',
      who_should_avoid: 'Drivers who do not want a mobile telematics app monitoring driving metrics or drivers with severe infractions.',
      strengths: JSON.stringify([
        'Monthly cashback incentives up to $40/month via Onlia Sense app',
        'Fully digital monthly subscription-style policy payment',
        'Fairfax / Achmea joint corporate backing'
      ]),
      limitations: JSON.stringify([
        'Currently focused specifically on Ontario personal auto and home lines',
        'Customer support is digital-first (chat & email prioritized over phone)'
      ]),
      claims_procedure: '24/7 claims reporting via onlia.ca or by calling 1-844-472-7901.',
      discounts_telematics: 'Onlia Sense cashback rewards, multi-vehicle, bundle discount, winter tire discount (5%).',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: 'Onlia Sense safe-driving cash rewards, 100% digital self-serve policy management, flexible monthly payments.',
      cons: 'Customer support is digital-first with limited physical branch footprint.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.onlia.ca'
    },
    {
      id: 'squareone',
      name: 'Square One Insurance',
      logo_color: '#005596',
      avg_monthly: 195,
      fy2025_revenue_cad: null, // MGA / Brokerage: comparable direct insurer revenue not publicly disclosed
      revenue_formatted: 'Comparable revenue not publicly disclosed',
      revenue_metric: 'Sales & Service MGA / Brokerage (Policies underwritten by Zurich Canada)',
      revenue_source_url: 'https://www.squareone.ca/about',
      revenue_date: 'FY2025',
      customer_count: 'Over 150,000 Canadian policyholders across home & auto',
      customer_count_scope: 'Canada-wide home & auto policyholders',
      customer_source_url: 'https://www.squareone.ca',
      parent_group: 'Square One Insurance Services Inc. (MGA)',
      underwriting_entity: 'Zurich Insurance Company Ltd (Canadian Branch)',
      distribution_channel: '100% Direct Online & Phone',
      editorial_score: 8.5,
      editorial_claims: 8.0,
      editorial_service: 9.0,
      editorial_coverage: 8.5,
      editorial_transparency: 9.5,
      editorial_digital: 9.5,
      verdict: 'A consumer-favorite digital MGA renowned for transparent pricing and customizable deductibles, with auto policies fully underwritten by global giant Zurich Insurance.',
      who_should_consider: 'Ontario drivers who want to pick and choose exact coverage limits online in minutes without broker fees or pushy sales agents.',
      who_should_avoid: 'Drivers with specialized commercial fleets or those requiring in-person agent meetings.',
      strengths: JSON.stringify([
        'Pioneering customizable policy builder where you only pay for coverages you choose',
        'Industry-leading digital transparency with zero hidden cancellation penalties',
        'Policies backed by Zurich Insurance Company Ltd A+ balance sheet'
      ]),
      limitations: JSON.stringify([
        'Auto coverage in Ontario is more recent than their tenured home insurance lines',
        'More restrictive underwriting appetite for high-risk or exotic performance vehicles'
      ]),
      claims_procedure: '24/7 claims submission online at squareone.ca or via Zurich Canada claims desk at 1-855-331-6933.',
      discounts_telematics: 'Customizable deductible savings, multi-car discount, combined home/tenant & auto rebate.',
      is_residual_market: 0,
      last_reviewed_date: '2026-10',
      pros: '100% online customizable coverage, transparent digital policy management, no broker fees, high customer satisfaction.',
      cons: 'Auto coverage in Ontario is newer compared to their home insurance; underwriting restrictions on some commercial or specialty vehicles.',
      direct_online: 1,
      broker_only: 0,
      website: 'https://www.squareone.ca'
    }
  ];

  const upsertInsurer = db.prepare(`
    INSERT INTO insurers (
      id, name, logo_color, avg_monthly, claims_rating, support_rating, price_rating,
      rating_value, rating_claims, rating_support, rating_renewal, rating_ease, overall_rating,
      total_reviews, pros, cons, direct_online, broker_only, website,
      fy2025_revenue_cad, revenue_formatted, revenue_metric, revenue_source_url, revenue_date,
      customer_count, customer_count_scope, customer_source_url, parent_group,
      underwriting_entity, distribution_channel, editorial_score, editorial_claims,
      editorial_service, editorial_coverage, editorial_transparency, editorial_digital,
      verdict, who_should_consider, who_should_avoid, strengths, limitations,
      claims_procedure, discounts_telematics, is_residual_market, last_reviewed_date
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      NULL, NULL, NULL, NULL, NULL, NULL,
      0, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      logo_color=excluded.logo_color,
      avg_monthly=excluded.avg_monthly,
      pros=excluded.pros,
      cons=excluded.cons,
      direct_online=excluded.direct_online,
      broker_only=excluded.broker_only,
      website=excluded.website,
      fy2025_revenue_cad=excluded.fy2025_revenue_cad,
      revenue_formatted=excluded.revenue_formatted,
      revenue_metric=excluded.revenue_metric,
      revenue_source_url=excluded.revenue_source_url,
      revenue_date=excluded.revenue_date,
      customer_count=excluded.customer_count,
      customer_count_scope=excluded.customer_count_scope,
      customer_source_url=excluded.customer_source_url,
      parent_group=excluded.parent_group,
      underwriting_entity=excluded.underwriting_entity,
      distribution_channel=excluded.distribution_channel,
      editorial_score=excluded.editorial_score,
      editorial_claims=excluded.editorial_claims,
      editorial_service=excluded.editorial_service,
      editorial_coverage=excluded.editorial_coverage,
      editorial_transparency=excluded.editorial_transparency,
      editorial_digital=excluded.editorial_digital,
      verdict=excluded.verdict,
      who_should_consider=excluded.who_should_consider,
      who_should_avoid=excluded.who_should_avoid,
      strengths=excluded.strengths,
      limitations=excluded.limitations,
      claims_procedure=excluded.claims_procedure,
      discounts_telematics=excluded.discounts_telematics,
      is_residual_market=excluded.is_residual_market,
      last_reviewed_date=excluded.last_reviewed_date;
  `);

  for (const ins of insurers) {
    upsertInsurer.run(
      ins.id,
      ins.name,
      ins.logo_color,
      ins.avg_monthly,
      ins.editorial_claims,
      ins.editorial_service,
      ins.editorial_score,
      ins.pros,
      ins.cons,
      ins.direct_online,
      ins.broker_only,
      ins.website,
      ins.fy2025_revenue_cad,
      ins.revenue_formatted,
      ins.revenue_metric,
      ins.revenue_source_url,
      ins.revenue_date,
      ins.customer_count,
      ins.customer_count_scope,
      ins.customer_source_url,
      ins.parent_group,
      ins.underwriting_entity,
      ins.distribution_channel,
      ins.editorial_score,
      ins.editorial_claims,
      ins.editorial_service,
      ins.editorial_coverage,
      ins.editorial_transparency,
      ins.editorial_digital,
      ins.verdict,
      ins.who_should_consider,
      ins.who_should_avoid,
      ins.strengths,
      ins.limitations,
      ins.claims_procedure,
      ins.discounts_telematics,
      ins.is_residual_market,
      ins.last_reviewed_date
    );
  }

  db.prepare("UPDATE insurers SET slug = id WHERE slug IS NULL OR slug = ''").run();

  // Populate audited reviews
  ensureReviewsPopulated();

  // Populate community discussions
  ensureDiscussionsPopulated();

  console.log('17 Ontario insurers populated with verified FY2025 research and editorial profiles.');
}

export function ensureReviewsPopulated() {
  const insertReview = db.prepare(`
    INSERT OR REPLACE INTO reviews (
      id, insurer_id, created_at, rating, rating_value, rating_claims, rating_support, rating_renewal, rating_ease,
      title, body, had_accident, claims_experience, payout_speed, author_city, vehicle, monthly_premium,
      user_email, display_name, is_verified_email, status, helpful_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Delete duplicate/quarantined review id: 15 if present
  try {
    db.prepare('DELETE FROM reviews WHERE id = 15').run();
  } catch (err) {
    // Ignore
  }

  for (const rev of initialReviews) {
    insertReview.run(
      rev.id,
      rev.insurer_id,
      rev.created_at,
      rev.rating,
      rev.rating_value,
      rev.rating_claims,
      rev.rating_support,
      rev.rating_renewal,
      rev.rating_ease,
      rev.title,
      rev.body,
      rev.had_accident || 0,
      rev.claims_experience,
      rev.payout_speed,
      rev.author_city,
      rev.vehicle,
      rev.monthly_premium,
      rev.user_email || 'verified_driver@community.insurcheck.ca',
      rev.display_name || 'Ontario Driver',
      rev.is_verified_email || 1,
      rev.status || 'published',
      rev.helpful_count || 0
    );
  }

  // Recalculate true rating aggregates for each insurer
  const insurers = db.prepare('SELECT id FROM insurers').all();
  for (const ins of insurers) {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_overall,
        AVG(rating_value) as avg_value,
        AVG(CASE WHEN had_accident = 1 AND rating_claims IS NOT NULL THEN rating_claims END) as avg_claims,
        AVG(rating_support) as avg_support,
        AVG(rating_renewal) as avg_renewal,
        AVG(rating_ease) as avg_ease
      FROM reviews
      WHERE insurer_id = ? AND status = 'published'
    `).get(ins.id);

    if (stats && stats.total > 0) {
      db.prepare(`
        UPDATE insurers
        SET 
          total_reviews = ?,
          overall_rating = ?,
          rating_value = ?,
          rating_claims = ?,
          rating_support = ?,
          rating_renewal = ?,
          rating_ease = ?,
          claims_rating = ?,
          support_rating = ?
        WHERE id = ?
      `).run(
        stats.total,
        Math.round(stats.avg_overall * 10) / 10,
        stats.avg_value ? Math.round(stats.avg_value * 10) / 10 : null,
        stats.avg_claims ? Math.round(stats.avg_claims * 10) / 10 : null,
        stats.avg_support ? Math.round(stats.avg_support * 10) / 10 : null,
        stats.avg_renewal ? Math.round(stats.avg_renewal * 10) / 10 : null,
        stats.avg_ease ? Math.round(stats.avg_ease * 10) / 10 : null,
        stats.avg_claims ? Math.round(stats.avg_claims * 10) / 10 : (stats.avg_support ? Math.round(stats.avg_support * 10) / 10 : 4.0),
        stats.avg_support ? Math.round(stats.avg_support * 10) / 10 : 4.0,
        ins.id
      );
    } else {
      // 0 reviews: strictly reset to 0 and null
      db.prepare(`
        UPDATE insurers
        SET 
          total_reviews = 0,
          overall_rating = NULL,
          rating_value = NULL,
          rating_claims = NULL,
          rating_support = NULL,
          rating_renewal = NULL,
          rating_ease = NULL
        WHERE id = ?
      `).run(ins.id);
    }
  }
}

export function ensureDiscussionsPopulated() {
  const insertDisc = db.prepare(`
    INSERT OR REPLACE INTO insurer_discussions (
      id, insurer_id, created_at, user_email, display_name, title, body, helpful_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const disc of initialDiscussions) {
    insertDisc.run(
      disc.id,
      disc.insurer_id,
      disc.created_at,
      disc.user_email,
      disc.display_name,
      disc.title,
      disc.body,
      disc.helpful_count,
      disc.status
    );
  }

  const insertReply = db.prepare(`
    INSERT OR REPLACE INTO discussion_replies (
      id, discussion_id, created_at, user_email, display_name, body, is_staff, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const rep of initialDiscussionReplies) {
    insertReply.run(
      rep.id,
      rep.discussion_id,
      rep.created_at,
      rep.user_email,
      rep.display_name,
      rep.body,
      rep.is_staff,
      rep.status
    );
  }
}

export function ensureSubmissionsPopulated() {
  const insertSub = db.prepare(`
    INSERT OR IGNORE INTO submissions (
      id, created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year,
      driver_age, driver_profile, years_licensed, clean_record,
      provider_name, monthly_premium, coverage_type, comment,
      discounts, discount_status, other_discount_description,
      estimated_premium_before_discounts, normalization_status,
      calculation_version, applied_discount_factors
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const sub of initialSubmissions) {
    insertSub.run(
      sub.id,
      sub.created_at,
      sub.fsa,
      sub.city,
      sub.vehicle_make,
      sub.vehicle_model,
      sub.vehicle_year,
      sub.driver_age,
      sub.driver_profile,
      sub.years_licensed,
      sub.clean_record ? 1 : 0,
      sub.provider_name,
      sub.monthly_premium,
      sub.coverage_type,
      sub.comment,
      typeof sub.discounts === 'string' ? sub.discounts : JSON.stringify(sub.discounts || []),
      sub.discount_status || 'legacy_unknown',
      sub.other_discount_description || null,
      sub.estimated_premium_before_discounts !== undefined ? sub.estimated_premium_before_discounts : null,
      sub.normalization_status || 'legacy_assumed_base',
      sub.calculation_version || null,
      typeof sub.applied_discount_factors === 'string' ? sub.applied_discount_factors : (sub.applied_discount_factors ? JSON.stringify(sub.applied_discount_factors) : null)
    );
  }
  console.log(`Ensured all ${initialSubmissions.length} driver submissions exist.`);
}

export function ensureFeedbackPopulated() {
  if (!initialFeedback || initialFeedback.length === 0) return;
  const insertFb = db.prepare(`
    INSERT OR IGNORE INTO benchmark_feedback (
      id, created_at, rating, is_reasonable, matches_knowledge, use_before_renew,
      use_before_buy, trust_comment, postal_code, vehicle, benchmark_rate, current_premium
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const fb of initialFeedback) {
    insertFb.run(
      fb.id, fb.created_at, fb.rating, fb.is_reasonable, fb.matches_knowledge, fb.use_before_renew,
      fb.use_before_buy, fb.trust_comment, fb.postal_code, fb.vehicle, fb.benchmark_rate, fb.current_premium
    );
  }
  console.log(`Ensured all ${initialFeedback.length} benchmark feedback entries exist.`);
}

export function ensureLeadsPopulated() {
  if (!initialLeads || initialLeads.length === 0) return;
  const insertLead = db.prepare(`
    INSERT OR IGNORE INTO leads (
      id, created_at, name, email, phone, vehicle, postal_code,
      current_premium, estimated_savings, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const l of initialLeads) {
    insertLead.run(
      l.id, l.created_at, l.name, l.email, l.phone, l.vehicle, l.postal_code,
      l.current_premium, l.estimated_savings, l.status
    );
  }
  console.log(`Ensured all ${initialLeads.length} broker leads exist.`);
}

export function seedAll() {
  ensureInsurersPopulated();
  ensureReviewsPopulated();
  ensureDiscussionsPopulated();
  ensureSubmissionsPopulated();
  ensureFeedbackPopulated();
  ensureLeadsPopulated();
}

