"""
Standardized Ontario Driver Personas for Insurance Rate Scraping & Benchmarking.
Each persona provides realistic, consistent attributes matching Ontario FSRA categories.
"""

ONTARIO_PERSONAS = {
    "young_brampton": {
        "id": "young_brampton",
        "label": "Young Driver - Brampton (High Risk Territory)",
        "postal_code": "L6P 1A1",
        "city": "Brampton",
        "first_name": "Marcus",
        "last_name": "Singh",
        "gender": "male",
        "birthdate": "2004-05-14",
        "age": 22,
        "marital_status": "single",
        "license_class": "G2",
        "years_licensed": 2,
        "driver_training": True,
        "vehicle": {
            "year": 2021,
            "make": "Honda",
            "model": "Civic",
            "trim": "EX",
            "ownership": "financed",
            "annual_km": 18000,
            "commute_km": 15,
            "winter_tires": True
        },
        "history": {
            "clean_record": True,
            "at_fault_claims": 0,
            "convictions": 0,
            "cancellations": 0
        }
    },
    "experienced_toronto": {
        "id": "experienced_toronto",
        "label": "Experienced Professional - Downtown Toronto",
        "postal_code": "M5V 2T6",
        "city": "Toronto",
        "first_name": "Elena",
        "last_name": "Chen",
        "gender": "female",
        "birthdate": "1988-10-22",
        "age": 38,
        "marital_status": "married",
        "license_class": "G",
        "years_licensed": 20,
        "driver_training": True,
        "vehicle": {
            "year": 2023,
            "make": "Toyota",
            "model": "RAV4",
            "trim": "XLE",
            "ownership": "owned",
            "annual_km": 12000,
            "commute_km": 8,
            "winter_tires": True
        },
        "history": {
            "clean_record": True,
            "at_fault_claims": 0,
            "convictions": 0,
            "cancellations": 0
        }
    },
    "suburban_mississauga_theft": {
        "id": "suburban_mississauga_theft",
        "label": "Suburban Family - Mississauga (High-Theft SUV Profile)",
        "postal_code": "L5M 4T3",
        "city": "Mississauga",
        "first_name": "David",
        "last_name": "Kowalski",
        "gender": "male",
        "birthdate": "1980-03-11",
        "age": 46,
        "marital_status": "married",
        "license_class": "G",
        "years_licensed": 28,
        "driver_training": True,
        "vehicle": {
            "year": 2022,
            "make": "Lexus",
            "model": "RX 350",
            "trim": "AWD",
            "ownership": "financed",
            "annual_km": 20000,
            "commute_km": 25,
            "winter_tires": True
        },
        "history": {
            "clean_record": True,
            "at_fault_claims": 0,
            "convictions": 0,
            "cancellations": 0
        }
    },
    "senior_ottawa": {
        "id": "senior_ottawa",
        "label": "Senior Driver - Ottawa (Lower Risk Territory)",
        "postal_code": "K1P 1J1",
        "city": "Ottawa",
        "first_name": "Robert",
        "last_name": "Tremblay",
        "gender": "male",
        "birthdate": "1958-08-19",
        "age": 68,
        "marital_status": "married",
        "license_class": "G",
        "years_licensed": 50,
        "driver_training": True,
        "vehicle": {
            "year": 2020,
            "make": "Subaru",
            "model": "Forester",
            "trim": "Touring",
            "ownership": "owned",
            "annual_km": 8000,
            "commute_km": 0,
            "winter_tires": True
        },
        "history": {
            "clean_record": True,
            "at_fault_claims": 0,
            "convictions": 0,
            "cancellations": 0
        }
    }
}

def get_persona(persona_id: str):
    """Retrieve persona definition by key."""
    if persona_id not in ONTARIO_PERSONAS:
        raise ValueError(f"Unknown persona '{persona_id}'. Available: {list(ONTARIO_PERSONAS.keys())}")
    return ONTARIO_PERSONAS[persona_id]
