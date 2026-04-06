"""
Pydantic models for the Fortuna Analytics Service.
All CBM formula contracts are enforced at the calculation layer (main.py).
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Segment(str, Enum):
    NON_LIGHT = "NON_LIGHT"
    HEAVY = "HEAVY"
    OVERALL = "OVERALL"


# ── Linkage input ─────────────────────────────────────────────────────────────

class LinkageRow(BaseModel):
    """A single brand × CEP linkage score."""
    brand_id: Optional[str] = None
    brand_name: str
    cep_id: Optional[str] = None
    cep_name: str
    score: float = Field(..., ge=0, le=100, description="% of buyers linking brand to CEP")


# ── KPI calculation ────────────────────────────────────────────────────────────

class KpiRequest(BaseModel):
    linkages: list[LinkageRow]
    segment: Segment = Segment.NON_LIGHT


class KpiResult(BaseModel):
    brand_id: Optional[str] = None
    brand_name: str
    mpen: float = Field(description="Mental Penetration % — buyers linking ≥1 CEP to brand")
    mms: float = Field(description="Mental Market Share % — brand's share of all CEP links")
    ns: float = Field(description="Network Score — avg CEPs per MPen buyer")
    som: float = Field(description="Share of Mind % — brand's share among its MPen base")
    dj_expected: float = Field(description="DJ-expected MMS based on penetration")
    dj_deviation: float = Field(description="MMS minus DJ-expected (positive = advantage)")


class KpiResponse(BaseModel):
    kpis: list[KpiResult]
    grand_total: float
    total_ceps: int
    total_brands: int


# ── Mental Advantage ──────────────────────────────────────────────────────────

class MentalAdvantageRequest(BaseModel):
    linkages: list[dict]  # {brand: str, cep: str, score: float}


class MentalAdvantageCell(BaseModel):
    brand: str
    cep: str
    actual: float
    expected: float
    deviation: float
    signal: str  # DEFEND | MAINTAIN | BUILD


class MentalAdvantageResponse(BaseModel):
    matrix: list[MentalAdvantageCell]
    brands: list[str]
    ceps: list[str]


# ── DJ Curve ─────────────────────────────────────────────────────────────────

class DjBrand(BaseModel):
    name: str
    penetration: float = Field(..., ge=0, le=100)
    frequency: float = Field(..., ge=0)
    is_focal: bool = False


class DjCurveRequest(BaseModel):
    brands: list[DjBrand]


class DjCurvePoint(BaseModel):
    pen: float
    freq: float


class DjFittedParams(BaseModel):
    a: float
    b: float
    r_squared: float


class DjCurveResponse(BaseModel):
    curve: list[DjCurvePoint]
    brands: list[DjBrand]
    fitted_params: Optional[DjFittedParams] = None


# ── Growth Potential ──────────────────────────────────────────────────────────

class SegmentMpen(BaseModel):
    segment: str
    mpen: float
    size_pct: float  # % of total sample


class GrowthPotentialRequest(BaseModel):
    segments: list[SegmentMpen]
    target_penetration: Optional[float] = None


class GrowthPotentialResponse(BaseModel):
    current_mpen: float
    max_potential_mpen: float
    growth_headroom: float
    waterfall: list[dict]
