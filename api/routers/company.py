"""
Company Router
Endpoints for company profile analysis and filter suggestions
"""

import logging
from fastapi import APIRouter, HTTPException, Body

from ..models.company import (
    CompanyProfileRequest,
    CompanyProfileResponse,
)
from ..services.company_profiler import analyze_company

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/company", tags=["company"])

# Example requests for documentation
EXAMPLE_FINTECH = {
    "company_url": "https://stripe.com",
    "description": "We are a fintech company providing payment processing APIs. Our tech stack includes Python, Go, AWS, Kubernetes, and PostgreSQL. Our clients are e-commerce businesses and SaaS platforms. We're particularly concerned about PCI compliance, data breaches, and API security since we handle financial transactions."
}

EXAMPLE_AI_AGENCY = {
    "company_url": "https://www.textvalue.ai/",
    "description": "TextValue.ai is an AI/ML development agency specializing in NLP and LLM solutions. Tech stack: Python, TensorFlow, PyTorch, HuggingFace, LangChain, FastAPI, AWS, Azure. We build chatbots, RAG systems, and autonomous agents for businesses. Founder has 6+ years NLP experience. We want to stay updated on AI/ML news, LLM developments, and security threats to our tech stack."
}

EXAMPLE_SECURITY = {
    "company_url": "https://crowdstrike.com",
    "description": "We are a cybersecurity company providing endpoint protection and threat intelligence. We use Go, Python, Kafka, and run on AWS/GCP. Our clients include enterprises and government agencies. We need to monitor all security vulnerabilities, ransomware campaigns, APT groups, and zero-day exploits."
}


@router.post("/profile", response_model=CompanyProfileResponse)
async def create_company_profile(
    request: CompanyProfileRequest = Body(
        ...,
        openapi_examples={
            "ai_agency": {
                "summary": "AI/ML Agency (TextValue.ai)",
                "description": "An AI development agency specializing in NLP and LLM solutions",
                "value": EXAMPLE_AI_AGENCY
            },
            "fintech": {
                "summary": "Fintech Company",
                "description": "A payment processing company handling financial transactions",
                "value": EXAMPLE_FINTECH
            },
            "security": {
                "summary": "Cybersecurity Company",
                "description": "An endpoint protection and threat intelligence provider",
                "value": EXAMPLE_SECURITY
            }
        }
    )
):
    """
    Analyze a company and generate personalized news filter suggestions.
    
    This endpoint:
    1. **Scrapes** the company website using Firecrawl API
    2. **Combines** scraped content with user-provided description
    3. **Extracts** company profile (industry, tech stack, products, customers)
    4. **Generates** suggested news filters (categories, regions, threats, etc.)
    
    ## Use Cases
    - Set up personalized news monitoring for a company
    - Understand what security threats are relevant to a business
    - Identify technologies and companies to watch
    
    ## Required Environment Variables
    - `FIRECRAWL_API_KEY` - For website scraping
    - `OPENAI_API_KEY` - For AI analysis
    
    ## Response
    Returns a complete company profile with suggested filters for news personalization.
    """
    try:
        logger.info(f"Analyzing company: {request.company_url}")
        
        result = analyze_company(
            company_url=request.company_url,
            description=request.description
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error analyzing company: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/suggest-filters")
async def suggest_filters_only(
    request: CompanyProfileRequest = Body(
        ...,
        openapi_examples={
            "ai_agency": {
                "summary": "AI/ML Agency",
                "description": "Get filter suggestions for an AI development agency",
                "value": EXAMPLE_AI_AGENCY
            },
            "fintech": {
                "summary": "Fintech Company",
                "description": "Get filter suggestions for a payment processing company",
                "value": EXAMPLE_FINTECH
            }
        }
    )
):
    """
    Lightweight version that returns only the suggested filters.
    
    Same as `/profile` but returns just the `suggested_filters` portion
    for easier integration with existing systems.
    
    ## Response Format
    ```json
    {
        "company_name": "TextValue.ai",
        "filters": {
            "categories": ["ai_ml", "llm", "security"],
            "regions": ["global", "usa"],
            "threat_concerns": ["supply_chain", "api_security"],
            ...
        }
    }
    ```
    """
    try:
        result = analyze_company(
            company_url=request.company_url,
            description=request.description
        )
        
        return {
            "company_name": result.profile.name,
            "filters": result.suggested_filters.model_dump()
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error suggesting filters: {e}")
        raise HTTPException(status_code=500, detail=f"Suggestion failed: {str(e)}")


@router.get("/filter-options")
async def get_filter_options():
    """
    Get all available filter options and their values.
    
    Returns the complete taxonomy of available filters that can be
    used for news personalization. Use this to build filter UIs or
    validate filter selections.
    
    ## Filter Categories
    
    | Category | Description |
    |----------|-------------|
    | `categories` | News content categories (security, ai_ml, cloud, etc.) |
    | `priorities` | Article priority levels (critical, high, medium, low, info) |
    | `regions` | Geographic regions with flag emojis |
    | `industries` | Company industry sectors |
    | `company_sizes` | Company size classifications |
    | `target_audiences` | Who should see the content |
    | `threat_concerns` | Security threat types to monitor |
    | `technologies` | Tech stack components |
    
    ## Example Response
    ```json
    {
        "categories": [{"value": "security", "name": "SECURITY"}, ...],
        "regions": [{"value": "usa", "name": "USA", "flag": "🇺🇸"}, ...],
        ...
    }
    ```
    """
    from ..models.article import ContentCategory, Region, Priority
    from ..models.company import (
        Industry, CompanySize, TargetAudience, 
        ThreatConcern, TechnologyStack
    )
    
    return {
        "categories": [{"value": c.value, "name": c.name} for c in ContentCategory],
        "priorities": [{"value": p.value, "name": p.name} for p in Priority],
        "regions": [{"value": r.value, "name": r.name, "flag": r.flag} for r in Region],
        "industries": [{"value": i.value, "name": i.name} for i in Industry],
        "company_sizes": [{"value": s.value, "name": s.name} for s in CompanySize],
        "target_audiences": [{"value": a.value, "name": a.name} for a in TargetAudience],
        "threat_concerns": [{"value": t.value, "name": t.name} for t in ThreatConcern],
        "technologies": [{"value": t.value, "name": t.name} for t in TechnologyStack],
    }

