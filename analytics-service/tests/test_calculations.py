"""
Tests for CBM KPI calculations.
Run: pytest analytics-service/tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app

client = TestClient(app)

# Sample linkage data — Indonesian Credit Cards, Q4 2024
SAMPLE_LINKAGES = [
    {"brand_name": "BCA",     "cep_name": "Trusted daily use",  "score": 70.0},
    {"brand_name": "BCA",     "cep_name": "Emergency cash",     "score": 65.0},
    {"brand_name": "BCA",     "cep_name": "Online shopping",    "score": 68.0},
    {"brand_name": "BCA",     "cep_name": "Contactless pay",    "score": 72.0},
    {"brand_name": "Mandiri", "cep_name": "Trusted daily use",  "score": 68.0},
    {"brand_name": "Mandiri", "cep_name": "Emergency cash",     "score": 60.0},
    {"brand_name": "Mandiri", "cep_name": "Online shopping",    "score": 62.0},
    {"brand_name": "Mandiri", "cep_name": "Contactless pay",    "score": 60.0},
    {"brand_name": "BNI",     "cep_name": "Trusted daily use",  "score": 50.0},
    {"brand_name": "BNI",     "cep_name": "Emergency cash",     "score": 54.0},
    {"brand_name": "BNI",     "cep_name": "Online shopping",    "score": 55.0},
    {"brand_name": "BNI",     "cep_name": "Contactless pay",    "score": 48.0},
]


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_calculate_kpis_basic():
    response = client.post("/calculate/kpis", json={
        "linkages": SAMPLE_LINKAGES,
        "segment": "NON_LIGHT",
    })
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert len(data["kpis"]) == 3  # BCA, BNI, Mandiri
    assert data["total_ceps"] == 4
    assert data["total_brands"] == 3

    # BCA should have highest MMS (most links)
    kpis = {k["brand_name"]: k for k in data["kpis"]}
    assert kpis["BCA"]["mms"] > kpis["BNI"]["mms"]
    assert kpis["Mandiri"]["mms"] > kpis["BNI"]["mms"]


def test_calculate_kpis_mms_sums_to_100():
    response = client.post("/calculate/kpis", json={
        "linkages": SAMPLE_LINKAGES,
        "segment": "NON_LIGHT",
    })
    data = response.json()
    total_mms = sum(k["mms"] for k in data["kpis"])
    assert abs(total_mms - 100.0) < 0.1  # MMS should sum to ~100%


def test_mental_advantage_matrix():
    linkages = [{"brand": l["brand_name"], "cep": l["cep_name"], "score": l["score"]}
                for l in SAMPLE_LINKAGES]
    response = client.post("/calculate/mental-advantage", json={"linkages": linkages})
    assert response.status_code == 200
    data = response.json()
    assert "matrix" in data
    assert "brands" in data
    assert "ceps" in data
    assert len(data["brands"]) == 3
    assert len(data["ceps"]) == 4
    assert len(data["matrix"]) == 12  # 3 brands × 4 CEPs

    # Validate signals
    for cell in data["matrix"]:
        assert cell["signal"] in ["DEFEND", "MAINTAIN", "BUILD"]
        assert cell["deviation"] == round(cell["actual"] - cell["expected"], 2)


def test_mental_advantage_defend_threshold():
    """DEFEND threshold: deviation ≥ +5pp"""
    linkages = [{"brand": l["brand_name"], "cep": l["cep_name"], "score": l["score"]}
                for l in SAMPLE_LINKAGES]
    response = client.post("/calculate/mental-advantage", json={"linkages": linkages})
    data = response.json()
    for cell in data["matrix"]:
        if cell["signal"] == "DEFEND":
            assert cell["deviation"] >= 5.0
        if cell["signal"] == "BUILD":
            assert cell["deviation"] <= -5.0


def test_dj_curve_fitting():
    response = client.post("/calculate/dj-curve", json={
        "brands": [
            {"name": "BCA",     "penetration": 62, "frequency": 5.1},
            {"name": "Mandiri", "penetration": 71, "frequency": 5.8},
            {"name": "BNI",     "penetration": 44, "frequency": 4.3},
            {"name": "CIMB",    "penetration": 31, "frequency": 3.8},
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "curve" in data
    assert "fitted_params" in data
    assert len(data["curve"]) > 0
    assert data["fitted_params"]["r_squared"] > 0


def test_dj_curve_requires_min_brands():
    response = client.post("/calculate/dj-curve", json={
        "brands": [{"name": "BCA", "penetration": 62, "frequency": 5.1}]
    })
    assert response.status_code == 422


def test_growth_potential():
    response = client.post("/calculate/growth-potential", json={
        "segments": [
            {"segment": "NON_LIGHT", "mpen": 41.0, "size_pct": 38.0},
            {"segment": "HEAVY",     "mpen": 94.0, "size_pct": 38.0},
            {"segment": "LIGHT",     "mpen": 71.0, "size_pct": 24.0},
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "current_mpen" in data
    assert "growth_headroom" in data
    assert data["growth_headroom"] >= 0


def test_empty_linkages_raises():
    response = client.post("/calculate/kpis", json={"linkages": []})
    assert response.status_code == 422
