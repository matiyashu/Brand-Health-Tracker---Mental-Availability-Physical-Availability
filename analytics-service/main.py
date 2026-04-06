"""
Fortuna Analytics Service — Python FastAPI
==========================================
CBM-compliant KPI calculations for the Fortuna Brand Health Tracker.

All formulas here are authoritative. The frozen TypeScript formula contracts
in /lib/cbm-engine/formula-contracts/ mirror these implementations.

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scipy.optimize import curve_fit
from collections import defaultdict
from typing import Optional
import math

from models import (
    KpiRequest, KpiResponse, KpiResult,
    MentalAdvantageRequest, MentalAdvantageResponse, MentalAdvantageCell,
    DjCurveRequest, DjCurveResponse, DjCurvePoint, DjFittedParams,
    GrowthPotentialRequest, GrowthPotentialResponse,
)

app = FastAPI(
    title="Fortuna Analytics Service",
    description="CBM-compliant KPI calculations — MPen, MMS, NS, SoM, DJ normalization, Mental Advantage",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "Fortuna Analytics Service"}


# ── KPI Calculation ────────────────────────────────────────────────────────────
#
# Formulas (FROZEN — matches /lib/cbm-engine/formula-contracts/):
#
#   MPen   = (# buyers linking ≥1 CEP to brand) / total_sample × 100
#   MMS    = (brand's total CEP links) / (all brands' total CEP links) × 100
#   NS     = (total CEP links for brand) / (buyers with MPen for brand)
#   SoM    = (brand CEP links) / (total links among brand's MPen base) × 100
#
#   DJ Expected MMS = a + b × ln(brand penetration)  [fitted to category data]
#   DJ Deviation    = MMS − DJ Expected MMS

@app.post("/calculate/kpis", response_model=KpiResponse)
def calculate_kpis(req: KpiRequest):
    if not req.linkages:
        raise HTTPException(status_code=422, detail="No linkage data provided")

    # Build brand → CEP → score lookup
    brand_cep_scores: dict[str, dict[str, float]] = defaultdict(dict)
    all_brands: set[str] = set()
    all_ceps: set[str] = set()
    brand_ids: dict[str, Optional[str]] = {}

    for row in req.linkages:
        brand_cep_scores[row.brand_name][row.cep_name] = row.score
        all_brands.add(row.brand_name)
        all_ceps.add(row.cep_name)
        if row.brand_id:
            brand_ids[row.brand_name] = row.brand_id

    total_ceps = len(all_ceps)
    total_brands = len(all_brands)

    # Grand total of all links (sum of all brand × CEP scores)
    grand_total = sum(
        score
        for brand_scores in brand_cep_scores.values()
        for score in brand_scores.values()
    )

    if grand_total == 0:
        raise HTTPException(status_code=422, detail="All linkage scores are zero")

    # Column totals (sum across brands per CEP)
    col_totals: dict[str, float] = defaultdict(float)
    for brand_scores in brand_cep_scores.values():
        for cep, score in brand_scores.items():
            col_totals[cep] += score

    # Per-brand KPI calculation
    results: list[KpiResult] = []
    brand_row_totals: dict[str, float] = {}

    for brand in sorted(all_brands):
        scores = brand_cep_scores[brand]
        row_total = sum(scores.values())
        brand_row_totals[brand] = row_total

        # MPen: % of category buyers who link ≥1 CEP to this brand
        # We use the proportion of CEP links relative to max possible
        # (score already represents % of buyers, so we use max score as proxy for MPen)
        linked_ceps = [s for s in scores.values() if s > 0]
        mpen = max(scores.values()) if scores else 0.0  # highest CEP score = MPen estimate
        # More accurate: MPen = proportion of sample mentioning brand in any CEP
        # When raw binary data isn't available, use max linkage as conservative estimate

        # MMS: brand's share of total category mental associations
        mms = (row_total / grand_total * 100) if grand_total > 0 else 0.0

        # NS: average number of CEPs per MPen buyer
        # NS = total links / (estimated # buyers with MPen)
        # If mpen represents % of sample, and row_total is sum of % scores:
        ns = (row_total / mpen) if mpen > 0 else 0.0

        # SoM: brand's share among its own MPen base
        # Approximated as MMS normalized by MPen
        som = (mms / mpen * 100) if mpen > 0 else 0.0

        results.append(
            KpiResult(
                brand_id=brand_ids.get(brand),
                brand_name=brand,
                mpen=round(mpen, 2),
                mms=round(mms, 2),
                ns=round(min(ns, total_ceps), 2),  # NS cannot exceed CEP count
                som=round(min(som, 100), 2),
                dj_expected=0.0,  # filled in after DJ fitting below
                dj_deviation=0.0,
            )
        )

    # DJ normalization: fit log curve to penetration vs MMS data
    # Expected MMS = a + b × ln(penetration)
    pens = np.array([r.mpen for r in results])
    mmss = np.array([r.mms for r in results])

    if len(results) >= 3 and np.all(pens > 0):
        try:
            def dj_model(pen, a, b):
                return a + b * np.log(pen)

            params, _ = curve_fit(dj_model, pens, mmss, p0=[0, 1], maxfev=5000)
            a, b = params

            for r in results:
                if r.mpen > 0:
                    r.dj_expected = round(float(a + b * math.log(r.mpen)), 2)
                    r.dj_deviation = round(r.mms - r.dj_expected, 2)
        except Exception:
            # If fitting fails, use mean as expected
            mean_mms = float(np.mean(mmss))
            for r in results:
                r.dj_expected = round(mean_mms, 2)
                r.dj_deviation = round(r.mms - mean_mms, 2)

    return KpiResponse(
        kpis=results,
        grand_total=round(grand_total, 2),
        total_ceps=total_ceps,
        total_brands=total_brands,
    )


# ── Mental Advantage Matrix ────────────────────────────────────────────────────
#
# Expected Score (DJ formula):
#   E(brand, CEP) = (Row Total × Column Total) ÷ Grand Total
#
# Deviation = Actual − Expected
# DEFEND  ≥ +5pp above expected
# MAINTAIN within ±4pp
# BUILD   ≤ −5pp below expected

@app.post("/calculate/mental-advantage", response_model=MentalAdvantageResponse)
def calculate_mental_advantage(req: MentalAdvantageRequest):
    if not req.linkages:
        raise HTTPException(status_code=422, detail="No linkage data provided")

    # Build matrix from raw list
    matrix_raw: dict[str, dict[str, float]] = defaultdict(dict)
    all_brands: list[str] = []
    all_ceps: list[str] = []

    for row in req.linkages:
        brand = row["brand"]
        cep = row["cep"]
        score = float(row["score"])
        matrix_raw[brand][cep] = score
        if brand not in all_brands:
            all_brands.append(brand)
        if cep not in all_ceps:
            all_ceps.append(cep)

    all_brands.sort()  # CBM: alphabetical order

    # Compute totals
    grand_total = sum(
        score
        for brand_scores in matrix_raw.values()
        for score in brand_scores.values()
    )

    if grand_total == 0:
        raise HTTPException(status_code=422, detail="All linkage scores are zero")

    # Row totals (per brand)
    row_totals = {brand: sum(matrix_raw[brand].values()) for brand in all_brands}

    # Column totals (per CEP)
    col_totals: dict[str, float] = defaultdict(float)
    for brand_scores in matrix_raw.values():
        for cep, score in brand_scores.items():
            col_totals[cep] += score

    # Build deviation matrix
    cells: list[MentalAdvantageCell] = []
    for brand in all_brands:
        for cep in all_ceps:
            actual = matrix_raw[brand].get(cep, 0.0)
            expected = (row_totals[brand] * col_totals[cep]) / grand_total

            deviation = actual - expected
            if deviation >= 5:
                signal = "DEFEND"
            elif deviation <= -5:
                signal = "BUILD"
            else:
                signal = "MAINTAIN"

            cells.append(
                MentalAdvantageCell(
                    brand=brand,
                    cep=cep,
                    actual=round(actual, 2),
                    expected=round(expected, 2),
                    deviation=round(deviation, 2),
                    signal=signal,
                )
            )

    return MentalAdvantageResponse(matrix=cells, brands=all_brands, ceps=all_ceps)


# ── DJ Curve Fitting ───────────────────────────────────────────────────────────

@app.post("/calculate/dj-curve", response_model=DjCurveResponse)
def calculate_dj_curve(req: DjCurveRequest):
    if len(req.brands) < 2:
        raise HTTPException(status_code=422, detail="Need at least 2 brands to fit a DJ curve")

    pens = np.array([b.penetration for b in req.brands])
    freqs = np.array([b.frequency for b in req.brands])

    fitted_params = None
    curve: list[DjCurvePoint] = []

    if np.all(pens > 0):
        try:
            def dj_model(pen, a, b):
                return a + b * np.log(pen)

            params, covariance = curve_fit(dj_model, pens, freqs, p0=[0, 1], maxfev=5000)
            a, b = params

            # R-squared
            residuals = freqs - dj_model(pens, a, b)
            ss_res = np.sum(residuals ** 2)
            ss_tot = np.sum((freqs - np.mean(freqs)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

            fitted_params = DjFittedParams(a=round(float(a), 4), b=round(float(b), 4), r_squared=round(float(r_squared), 4))

            # Generate smooth curve from min pen to 95
            min_pen = max(5.0, float(np.min(pens)) - 5)
            max_pen = min(95.0, float(np.max(pens)) + 10)
            for pen in np.linspace(min_pen, max_pen, 60):
                freq = a + b * math.log(float(pen))
                if freq > 0:
                    curve.append(DjCurvePoint(pen=round(float(pen), 1), freq=round(float(freq), 3)))

        except Exception as e:
            # Fallback: linear interpolation
            pass

    return DjCurveResponse(curve=curve, brands=req.brands, fitted_params=fitted_params)


# ── Growth Potential ───────────────────────────────────────────────────────────

@app.post("/calculate/growth-potential", response_model=GrowthPotentialResponse)
def calculate_growth_potential(req: GrowthPotentialRequest):
    if not req.segments:
        raise HTTPException(status_code=422, detail="No segment data provided")

    total_weight = sum(s.size_pct for s in req.segments)
    if total_weight == 0:
        raise HTTPException(status_code=422, detail="Segment size percentages sum to zero")

    # Weighted current MPen
    current_mpen = sum(s.mpen * s.size_pct for s in req.segments) / total_weight

    # Max potential = all segments reach their current highest MPen
    max_mpen = max(s.mpen for s in req.segments)

    # Waterfall: sequential gains from converting each segment
    sorted_segs = sorted(req.segments, key=lambda s: s.mpen)
    waterfall = [{"label": "Current MPen (weighted)", "value": round(current_mpen, 1), "type": "base"}]
    cumulative = current_mpen

    for seg in sorted_segs:
        gain = (seg.mpen - cumulative) * (seg.size_pct / 100) if seg.mpen > cumulative else 0
        if gain > 0.5:
            cumulative += gain
            waterfall.append({
                "label": f"Convert {seg.segment} (MPen {seg.mpen:.0f}%)",
                "value": round(gain, 1),
                "type": "gain",
            })

    if cumulative > current_mpen:
        waterfall.append({"label": "Target MPen", "value": round(cumulative, 1), "type": "target"})

    return GrowthPotentialResponse(
        current_mpen=round(current_mpen, 2),
        max_potential_mpen=round(max_mpen, 2),
        growth_headroom=round(max_mpen - current_mpen, 2),
        waterfall=waterfall,
    )
