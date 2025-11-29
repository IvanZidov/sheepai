"""
Company Profile Models
Structured output for company-to-filter suggestions
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from enum import Enum

from .article import ContentCategory, Region, Priority


class Industry(str, Enum):
    """Company industry/sector"""
    TECHNOLOGY = "technology"
    CYBERSECURITY = "cybersecurity"
    FINTECH = "fintech"
    HEALTHCARE = "healthcare"
    ECOMMERCE = "ecommerce"
    SAAS = "saas"
    AI_ML = "ai_ml"
    CLOUD = "cloud"
    GAMING = "gaming"
    MEDIA = "media"
    EDUCATION = "education"
    MANUFACTURING = "manufacturing"
    ENERGY = "energy"
    RETAIL = "retail"
    TELECOM = "telecom"
    GOVERNMENT = "government"
    NONPROFIT = "nonprofit"
    CONSULTING = "consulting"
    LEGAL = "legal"
    OTHER = "other"


class CompanySize(str, Enum):
    """Company size by employees"""
    STARTUP = "startup"  # 1-50
    SMALL = "small"  # 51-200
    MEDIUM = "medium"  # 201-1000
    LARGE = "large"  # 1001-5000
    ENTERPRISE = "enterprise"  # 5000+


class TargetAudience(str, Enum):
    """Who should see this content"""
    DEVELOPERS = "developers"
    SECURITY_TEAMS = "security_teams"
    DEVOPS = "devops"
    IT_ADMINS = "it_admins"
    CISO = "ciso"
    CTO = "cto"
    EXECUTIVES = "executives"
    PRODUCT_MANAGERS = "product_managers"
    DATA_SCIENTISTS = "data_scientists"
    RESEARCHERS = "researchers"
    STUDENTS = "students"
    GENERAL_TECH = "general_tech"
    BUSINESS = "business"


class ThreatConcern(str, Enum):
    """Security threat types company cares about"""
    RANSOMWARE = "ransomware"
    PHISHING = "phishing"
    DATA_BREACH = "data_breach"
    APT = "apt"
    SUPPLY_CHAIN = "supply_chain"
    INSIDER_THREAT = "insider_threat"
    DDOS = "ddos"
    ZERO_DAY = "zero_day"
    MALWARE = "malware"
    SOCIAL_ENGINEERING = "social_engineering"
    CLOUD_SECURITY = "cloud_security"
    API_SECURITY = "api_security"
    IOT_SECURITY = "iot_security"
    IDENTITY_THEFT = "identity_theft"


class TechnologyStack(str, Enum):
    """Common technology stacks"""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    KUBERNETES = "kubernetes"
    DOCKER = "docker"
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    GO = "go"
    RUST = "rust"
    REACT = "react"
    NODE = "node"
    POSTGRES = "postgres"
    MYSQL = "mysql"
    MONGODB = "mongodb"
    REDIS = "redis"
    ELASTICSEARCH = "elasticsearch"
    KAFKA = "kafka"
    TERRAFORM = "terraform"
    LINUX = "linux"
    WINDOWS = "windows"
    MACOS = "macos"
    ANDROID = "android"
    IOS = "ios"
    SALESFORCE = "salesforce"
    MICROSOFT_365 = "microsoft_365"
    SLACK = "slack"
    GITHUB = "github"


# ============================================================================
# REQUEST MODELS
# ============================================================================

class CompanyProfileRequest(BaseModel):
    """Request to generate filter suggestions for a company"""
    company_url: str = Field(description="Company website URL to scrape")
    description: str = Field(description="User-provided description of the company, tools, mission, clients")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "company_url": "https://acme-security.com",
                "description": "We are a mid-size fintech company based in New York. We use AWS, Kubernetes, and Python for our backend. Our main clients are banks and insurance companies. We're particularly concerned about data breaches and API security since we handle financial transactions."
            }
        }
    )


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class SuggestedFilters(BaseModel):
    """AI-suggested filters based on company profile"""
    
    # Core categories to follow
    categories: list[ContentCategory] = Field(
        max_length=10,
        description="Content categories most relevant to this company"
    )
    
    # Priority levels to focus on
    min_priority: Priority = Field(
        description="Minimum priority level worth showing"
    )
    
    # Geographic relevance
    regions: list[Region] = Field(
        max_length=10,
        description="Geographic regions relevant to this company"
    )
    
    # Audience
    target_audiences: list[TargetAudience] = Field(
        max_length=5,
        description="Who in this company should see these updates"
    )
    
    # Industry context
    industries: list[Industry] = Field(
        max_length=3,
        description="Industries this company operates in"
    )
    
    # Security concerns
    threat_concerns: list[ThreatConcern] = Field(
        max_length=8,
        description="Security threats this company should monitor"
    )
    
    # Tech stack
    technologies: list[TechnologyStack] = Field(
        max_length=15,
        description="Technologies mentioned or inferred"
    )
    
    # Free-form entities
    watch_companies: list[str] = Field(
        max_length=10,
        description="Specific companies to monitor news about"
    )
    
    watch_products: list[str] = Field(
        max_length=10,
        description="Specific products/tools to monitor"
    )
    
    keywords: list[str] = Field(
        max_length=15,
        description="Keywords and terms for additional filtering"
    )
    
    # Reasoning
    reasoning: str = Field(
        description="Brief explanation of why these filters were suggested"
    )


class CompanyProfile(BaseModel):
    """Extracted company profile from website + description"""
    
    name: str = Field(description="Company name")
    tagline: Optional[str] = Field(default=None, description="Company tagline/slogan")
    industry: Industry = Field(description="Primary industry")
    size: Optional[CompanySize] = Field(default=None, description="Estimated company size")
    
    # Location
    headquarters: Optional[str] = Field(default=None, description="HQ location")
    regions_of_operation: list[Region] = Field(
        default_factory=list,
        max_length=5,
        description="Where they operate"
    )
    
    # What they do
    products_services: list[str] = Field(
        max_length=5,
        description="Main products/services"
    )
    
    # Who they serve
    target_customers: list[str] = Field(
        max_length=5,
        description="Types of customers they serve"
    )
    
    # Tech
    tech_stack: list[TechnologyStack] = Field(
        default_factory=list,
        max_length=10,
        description="Technologies they use"
    )


class CompanyProfileResponse(BaseModel):
    """Complete response with profile and suggested filters"""
    
    profile: CompanyProfile = Field(description="Extracted company profile")
    suggested_filters: SuggestedFilters = Field(description="AI-suggested news filters")
    scraped_content_length: int = Field(description="Characters scraped from website")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "profile": {
                    "name": "Acme Security",
                    "tagline": "Securing the future of finance",
                    "industry": "fintech",
                    "size": "medium",
                    "headquarters": "New York, USA",
                    "regions_of_operation": ["usa", "europe"],
                    "products_services": ["Payment processing", "Fraud detection", "API security"],
                    "target_customers": ["Banks", "Insurance companies", "Financial institutions"],
                    "tech_stack": ["aws", "kubernetes", "python", "postgres"]
                },
                "suggested_filters": {
                    "categories": ["security", "data_breach", "vulnerability", "cloud", "ai_ml", "regulation"],
                    "min_priority": "medium",
                    "regions": ["usa", "europe", "global"],
                    "target_audiences": ["security_teams", "developers", "ciso"],
                    "industries": ["fintech", "cybersecurity"],
                    "threat_concerns": ["data_breach", "api_security", "ransomware", "phishing"],
                    "technologies": ["aws", "kubernetes", "python", "postgres"],
                    "watch_companies": ["AWS", "Stripe", "Plaid"],
                    "watch_products": ["Kubernetes", "PostgreSQL", "PCI DSS"],
                    "keywords": ["PCI compliance", "SOC 2", "financial data", "payment security"],
                    "reasoning": "As a fintech company handling financial transactions, you need to monitor data breaches, API vulnerabilities, and regulatory changes. Your AWS/Kubernetes stack means cloud security news is critical."
                },
                "scraped_content_length": 15234
            }
        }
    )

