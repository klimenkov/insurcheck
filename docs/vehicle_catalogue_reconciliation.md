# Vehicle Catalogue Reconciliation Report: AutoTrader.ca Audit (INS-59)

**Date:** 2026-09-30  
**Status:** Completed & Verified  
**Linear Issue:** INS-59 [P0]  
**Audited Target:** AutoTrader.ca Canadian Vehicle Catalogue & FSRA Actuarial Benchmarks  

---

## 1. Executive Summary

Prior to this upgrade, InsurCheck supported 35 vehicle makes with a limited set of common modern models (e.g. 11 Audi models, omitting key flagship vehicles such as the Audi A8, S8, and comprehensive e-tron variants) and a static year range (2000–2026).

Following this reconciliation against AutoTrader.ca's Canadian market database and Transport Canada registries:
- **123 Canadian market makes** are fully indexed, alphabetized A–Z.
- **36 Popular brands** are curated and displayed in an expedited top section (A–Z), followed by the complete **All brands** catalogue (A–Z) with non-selectable section headers.
- **SearchableSelect** dynamically deduplicates matching brands across all sections during active search, ensuring each matching make appears exactly once.
- **Audi model catalogue** expanded from 11 to **55 models** (including Audi A8, S8, e-tron, e-tron GT, Q8 e-tron, SQ5, RS models, and historical models like Audi 100/5000/V8).
- **Source-backed model-year availability** generates valid model years dynamically (newest first), supporting pre-2000 classics and modern EV releases.
- **Dependent selection clearing** ensures selecting a new make clears model and year, and switching models validates and resets the year if invalid for the selected model.
- **Backend actuarial calibration** maps the new models to CLEAR loss factors and repair risk indices in `server/engine/ontarioData.js`.

---

## 2. Brand Architecture: Popular Brands vs. All Brands

### 2.1 Popular Brands (36 Makes, Sorted A–Z)
`Acura, Alfa Romeo, Audi, BMW, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ferrari, Ford, Genesis, GMC, Honda, Hyundai, Infiniti, Jaguar, Jeep, Kia, Lamborghini, Land Rover, Lexus, Lincoln, Maserati, Mazda, Mercedes-Benz, MINI, Mitsubishi, Nissan, Porsche, RAM, Subaru, Tesla, Toyota, Volkswagen, Volvo`

### 2.2 Complete Catalogue (123 Makes, Sorted A–Z)
1. AC
2. Acadian
3. Acura
4. Alfa Romeo
5. Allard
6. Alpina
7. Alvis
8. AM General
9. AMC
10. American Bantam
11. Amphicar
12. ASA
13. Aston Martin
14. Asuna
15. Auburn
16. Audi
17. Aurora
18. Austin
19. Austin-Healey
20. Bentley
21. BMW
22. BrightDrop
23. Bugatti
24. Buick
25. Cadillac
26. Chamonix
27. Chevrolet
28. Chrysler
29. Citroen
30. Clenet
31. Cord
32. Daewoo
33. Daihatsu
34. Datsun
35. De Tomaso
36. Dodge
37. Eagle
38. Excalibur
39. Factory Five Racing
40. Ferrari
41. Fiat
42. Fisker
43. Ford
44. Freightliner
45. Genesis
46. Geo
47. GMC
48. Hino
49. Honda
50. HUMMER
51. Hyundai
52. Ineos
53. Infiniti
54. International
55. Isuzu
56. Jaguar
57. Jeep
58. Jensen
59. Karma
60. Kia
61. Koenigsegg
62. Lada
63. Lamborghini
64. Lancia
65. Land Rover
66. Lexus
67. Lincoln
68. Lordstown
69. Lotus
70. Lucid
71. Maserati
72. Maybach
73. Mazda
74. McLaren
75. Mercedes-Benz
76. Mercury
77. Merkur
78. Meteor
79. MG
80. MINI
81. Mitsubishi
82. Monarch
83. Morgan
84. MV-1
85. Nissan
86. Oakland
87. Oldsmobile
88. Panoz
89. Peugeot
90. Pininfarina
91. Plymouth
92. Polestar
93. Pontiac
94. Porsche
95. RAM
96. Rambler
97. Renault
98. Rivian
99. Rolls-Royce
100. Rover
101. Saab
102. Saleen
103. Saturn
104. Scion
105. SEAT
106. Shelby
107. smart
108. Spyker
109. Sterling
110. Studebaker
111. Subaru
112. Sunbeam
113. Suzuki
114. Tesla
115. Toyota
116. Triumph
117. TVR
118. Vanderhall
119. VinFast
120. Volkswagen
121. Volvo
122. Willys
123. Yugo

---

## 3. Audi Model Catalogue (55 Models, Sorted A–Z)

Reconciled directly against AutoTrader.ca's Audi listings in Canada:

| Category | Models |
| :--- | :--- |
| **Sedans & Sportbacks** | 100, 200, 4000, 5000, 80, 90, A3, A4, A5, A6, A7, **A8**, S3, S4, S5, S6, S7, **S8**, RS3, RS4, RS5, RS6, RS7, V8 |
| **Allroad & Wagons** | A4 allroad, A6 allroad, Allroad |
| **SUVs & Crossovers** | Q3, Q5, Q7, Q8, Q9, SQ5, SQ7, SQ8, SQ9, RS Q8 |
| **EVs (e-tron series)** | e-tron, e-tron GT, A6 e-tron, Q4 e-tron, Q6 e-tron, Q8 e-tron, S e-tron GT, S6 e-tron, SQ6 e-tron, SQ8 e-tron, RS e-tron GT |
| **Coupes & Sports Cars** | Cabriolet, Coupe, QUATTRO, R8, TT, TT RS, TTS |

---

## 4. Model-Year Availability & Dependent Filtering

1. **Source-Backed Lifespans:**
   - Classic models (e.g. Audi 100: 1968–1994, Audi 5000: 1978–1988, Datsun 240Z: 1968–1984) dynamically display their actual production lifespans rather than forcing modern defaults.
   - Flagship long-running models (e.g. Audi A8: 1997–2026, Audi S8: 2001–2026, Honda Civic: 1980–2026) display all eligible model years.
   - Recent releases (e.g. Tesla Cybertruck: 2024–2026, Audi Q9: 2025–2026) only display valid contemporary years.
2. **Descending Order:**
   - All year dropdowns display the newest model year first (e.g. `2026, 2025, 2024...`).
3. **Selection Invalidation & Clearing:**
   - Changing the vehicle make immediately clears both the selected model and year.
   - Changing the vehicle model re-evaluates the currently selected year against `getYearsForModel(make, model)`. If the year is outside the valid range, it is automatically cleared to prevent impossible configurations.
   - The car year input remains disabled until a make is selected.

---

## 5. Actuarial Risk Matrix Integration

In `server/engine/ontarioData.js`, `VEHICLE_RISK_MAP` was updated to accurately price the expanded vehicle segments:

| Model | CLEAR Risk Factor | Category | High Theft | High Repair Cost |
| :--- | :---: | :--- | :---: | :---: |
| **Audi A3** | 1.24 | Entry Luxury Sedan | No | Yes |
| **Audi A4** | 1.30 | Luxury Sedan | No | Yes |
| **Audi A5** | 1.32 | Luxury Coupe / Sportback | No | Yes |
| **Audi A6** | 1.38 | Executive Sedan | No | Yes |
| **Audi A7** | 1.44 | Executive Sportback | No | Yes |
| **Audi A8** | 1.50 | Flagship Luxury Sedan | No | Yes |
| **Audi S8** | 1.55 | Performance Luxury Sedan | No | Yes |
| **Audi e-tron** | 1.42 | Luxury EV SUV | No | Yes |
| **Audi e-tron GT** | 1.52 | Luxury EV Sedan | No | Yes |
| **Audi Q3** | 1.26 | Subcompact Luxury SUV | No | Yes |
| **Audi Q5** | 1.32 | Luxury Compact SUV | No | Yes |
| **Audi SQ5** | 1.40 | Performance Luxury SUV | No | Yes |
| **Audi Q7** | 1.44 | Luxury 3-Row SUV | No | Yes |
| **Audi Q8** | 1.48 | Luxury Midsize SUV | No | Yes |
| **Audi R8** | 1.70 | Exotic Sports Car | No | Yes |

---

## 6. Verification and Automated Testing

Automated tests in `scripts/testIns59.js` verify:
1. `POPULAR_MAKES.length === 36` and sorted A–Z.
2. `ALL_MAKES.length === 123` and sorted A–Z, containing all 36 popular makes.
3. Audi catalogue contains all 55 models, sorted A–Z, including A8, S8, e-tron, SQ5, and classics.
4. Model-year ranges correctly return descending years, supporting pre-2000 years for historical models and contemporary ranges for recent models.
5. Search deduplication eliminates redundant entries across sections.
6. Backend `resolveVehicleInfo` properly calculates risk factors for Audi A8, S8, and e-tron.
