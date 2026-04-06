# Fortuna Analytics Service

Python FastAPI microservice for CBM KPI calculations.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/calculate/kpis` | MPen, MMS, NS, SoM + DJ normalization |
| POST | `/calculate/mental-advantage` | Brand × CEP deviation matrix |
| POST | `/calculate/dj-curve` | Fit Double Jeopardy curve + scenario |
| POST | `/calculate/growth-potential` | Non-buyer MPen growth waterfall |

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000
```

Open docs: http://localhost:8000/docs

## Run Tests

```bash
pytest tests/ -v
```

## Formulas

### Mental Penetration (MPen)
```
MPen = max(CEP scores for brand) %
```
*When raw binary data isn't available, the highest CEP linkage score is a conservative proxy for MPen.*

### Mental Market Share (MMS)
```
MMS = (Brand's sum of all CEP scores) / (Grand total of all brand × CEP scores) × 100
```

### Network Score (NS)
```
NS = (Brand's sum of CEP scores) / MPen
```

### Share of Mind (SoM)
```
SoM = (MMS / MPen) × 100
```

### DJ Expected Score (Mental Advantage)
```
Expected(brand, CEP) = (Row Total × Column Total) / Grand Total
Deviation = Actual − Expected

DEFEND  ≥ +5pp
MAINTAIN  ±4pp
BUILD   ≤ −5pp
```

### DJ Curve (Forecast)
```
Frequency = a + b × ln(Penetration)   [log-linear fit]
```
