"""
Article Analysis Pydantic Models
Structured output schema for LLM analysis
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


# ============================================================================
# REGION FLAGS MAPPING
# ============================================================================

REGION_FLAGS = {
    # Global/Continents
    "global": "🌍",
    "north_america": "🌎",
    "south_america": "🌎",
    "europe": "🇪🇺",
    "asia": "🌏",
    "asia_pacific": "🌏",
    "middle_east": "🌍",
    "africa": "🌍",
    
    # Americas
    "usa": "🇺🇸",
    "canada": "🇨🇦",
    "mexico": "🇲🇽",
    "brazil": "🇧🇷",
    
    # Europe
    "uk": "🇬🇧",
    "germany": "🇩🇪",
    "france": "🇫🇷",
    "netherlands": "🇳🇱",
    "spain": "🇪🇸",
    "italy": "🇮🇹",
    "poland": "🇵🇱",
    "ukraine": "🇺🇦",
    "russia": "🇷🇺",
    
    # Asia
    "china": "🇨🇳",
    "japan": "🇯🇵",
    "south_korea": "🇰🇷",
    "north_korea": "🇰🇵",
    "india": "🇮🇳",
    "taiwan": "🇹🇼",
    "singapore": "🇸🇬",
    "vietnam": "🇻🇳",
    "indonesia": "🇮🇩",
    "philippines": "🇵🇭",
    
    # Middle East
    "israel": "🇮🇱",
    "iran": "🇮🇷",
    "uae": "🇦🇪",
    "saudi_arabia": "🇸🇦",
    
    # Oceania
    "australia": "🇦🇺",
    "new_zealand": "🇳🇿",
    
    # Central Asia
    "kazakhstan": "🇰🇿",
    "uzbekistan": "🇺🇿",
    "kyrgyzstan": "🇰🇬",
}


# ============================================================================
# ENUMS
# ============================================================================

class Priority(str, Enum):
    """How urgent/important is this news?"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ContentCategory(str, Enum):
    """Primary content categories"""
    # Security
    SECURITY = "security"
    VULNERABILITY = "vulnerability"
    MALWARE = "malware"
    DATA_BREACH = "data_breach"
    PRIVACY = "privacy"
    
    # Development
    PROGRAMMING = "programming"
    WEB_DEV = "web_dev"
    MOBILE_DEV = "mobile_dev"
    DEVOPS = "devops"
    OPEN_SOURCE = "open_source"
    
    # AI & Data
    AI_ML = "ai_ml"
    LLM = "llm"
    DATA_SCIENCE = "data_science"
    AUTOMATION = "automation"
    
    # Cloud & Infrastructure
    CLOUD = "cloud"
    INFRASTRUCTURE = "infrastructure"
    NETWORKING = "networking"
    DATABASE = "database"
    
    # Business & Industry
    STARTUP = "startup"
    ENTERPRISE = "enterprise"
    ACQUISITION = "acquisition"
    FUNDING = "funding"
    LAYOFFS = "layoffs"
    
    # Product & Releases
    PRODUCT_LAUNCH = "product_launch"
    UPDATE = "update"
    DEPRECATION = "deprecation"
    TOOL_RELEASE = "tool_release"
    
    # Learning & Resources
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    BEST_PRACTICES = "best_practices"
    CASE_STUDY = "case_study"
    
    # Research & Insights
    RESEARCH = "research"
    ANALYSIS = "analysis"
    TRENDS = "trends"
    OPINION = "opinion"
    
    # Regulatory & Policy
    REGULATION = "regulation"
    COMPLIANCE = "compliance"
    LEGAL = "legal"
    
    # Other
    HARDWARE = "hardware"
    GAMING = "gaming"
    CRYPTO = "crypto"
    OTHER = "other"


class ContentType(str, Enum):
    """What kind of article is this?"""
    BREAKING_NEWS = "breaking_news"
    NEWS = "news"
    TUTORIAL = "tutorial"
    GUIDE = "guide"
    REVIEW = "review"
    ANALYSIS = "analysis"
    OPINION = "opinion"
    ANNOUNCEMENT = "announcement"
    CASE_STUDY = "case_study"
    INTERVIEW = "interview"
    RESEARCH = "research"
    ROUNDUP = "roundup"
    SPONSORED = "sponsored"


class Region(str, Enum):
    """Geographic regions"""
    # Global
    GLOBAL = "global"
    
    # Continents
    NORTH_AMERICA = "north_america"
    SOUTH_AMERICA = "south_america"
    EUROPE = "europe"
    ASIA = "asia"
    ASIA_PACIFIC = "asia_pacific"
    MIDDLE_EAST = "middle_east"
    AFRICA = "africa"
    
    # Americas
    USA = "usa"
    CANADA = "canada"
    MEXICO = "mexico"
    BRAZIL = "brazil"
    
    # Europe
    UK = "uk"
    GERMANY = "germany"
    FRANCE = "france"
    NETHERLANDS = "netherlands"
    SPAIN = "spain"
    ITALY = "italy"
    POLAND = "poland"
    UKRAINE = "ukraine"
    RUSSIA = "russia"
    
    # Asia
    CHINA = "china"
    JAPAN = "japan"
    SOUTH_KOREA = "south_korea"
    NORTH_KOREA = "north_korea"
    INDIA = "india"
    TAIWAN = "taiwan"
    SINGAPORE = "singapore"
    VIETNAM = "vietnam"
    INDONESIA = "indonesia"
    PHILIPPINES = "philippines"
    
    # Middle East
    ISRAEL = "israel"
    IRAN = "iran"
    UAE = "uae"
    SAUDI_ARABIA = "saudi_arabia"
    
    # Oceania
    AUSTRALIA = "australia"
    NEW_ZEALAND = "new_zealand"
    
    # Central Asia
    KAZAKHSTAN = "kazakhstan"
    UZBEKISTAN = "uzbekistan"
    KYRGYZSTAN = "kyrgyzstan"
    
    @property
    def flag(self) -> str:
        """Get the flag emoji for this region"""
        return REGION_FLAGS.get(self.value, "🌐")
    
    @property
    def display(self) -> str:
        """Get display string with flag"""
        return f"{self.flag} {self.value.upper()}"


# ============================================================================
# SUB-MODELS
# ============================================================================

class RegionInfo(BaseModel):
    """Region with flag - LLM should output this"""
    region: Region
    flag: str = Field(description="Flag emoji for the region (e.g., 🇺🇸 for USA)")
    
    @classmethod
    def from_region(cls, region: Region) -> "RegionInfo":
        return cls(region=region, flag=REGION_FLAGS.get(region.value, "🌐"))


class AffectedEntity(BaseModel):
    """Who or what is affected/relevant to this news"""
    entity_type: Literal["company", "product", "technology", "platform", "industry", "users", "region"]
    name: str
    details: Optional[str] = None


class ActionItem(BaseModel):
    """Actionable recommendation from the article"""
    priority: Literal["immediate", "soon", "when_possible"]
    action: str
    target_audience: str


class KeyTakeaway(BaseModel):
    """Important point from the article"""
    point: str
    is_technical: bool = False
    highlight: bool = False


# ============================================================================
# MAIN ANALYSIS MODEL
# ============================================================================

class ArticleAnalysis(BaseModel):
    """Complete structured analysis of any news article"""
    
    # Core Summary
    headline: str = Field(description="Catchy 1-line summary, max 100 chars")
    tldr: str = Field(description="2-3 sentence executive summary for busy readers")
    
    # Classification
    priority: Priority = Field(description="How urgent/important is this?")
    categories: list[ContentCategory] = Field(max_length=3, description="Main topic categories")
    content_type: ContentType = Field(description="What kind of article is this?")
    
    # Key Information
    key_takeaways: list[KeyTakeaway] = Field(min_length=2, max_length=5)
    affected_entities: list[AffectedEntity] = Field(max_length=5)
    
    # Actionability
    action_items: list[ActionItem] = Field(max_length=3, default_factory=list)
    
    # Summaries
    short_summary: str = Field(description="1-2 sentence summary")
    long_summary: str = Field(description="3-5 sentence detailed summary")
    
    # Scores
    relevance_score: int = Field(ge=1, le=10, description="How relevant/useful is this, 1-10")
    confidence_score: int = Field(ge=1, le=10, description="Confidence in analysis accuracy, 1-10")
    
    # Flags
    is_breaking_news: bool = False
    is_sponsored: bool = False
    worth_full_read: bool = Field(description="Should user read the full article?")
    
    # Metadata
    read_time_minutes: int = Field(ge=1, le=30)
    related_topics: list[str] = Field(max_length=5, description="Related search terms/topics")
    
    # Technical details
    mentioned_technologies: list[str] = Field(default_factory=list, max_length=10)
    mentioned_companies: list[str] = Field(default_factory=list, max_length=10)
    
    # Geographic - LLM outputs region with flag
    regions: list[RegionInfo] = Field(
        default_factory=list, 
        max_length=5, 
        description="Geographic regions mentioned with their flag emoji (e.g., {region: 'usa', flag: '🇺🇸'})"
    )

