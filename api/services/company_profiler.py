"""
Company Profiler Service
Scrapes company websites and generates filter suggestions using LLM
"""

import os
import logging
from typing import Optional

import requests
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_MODEL
from ..models.company import (
    CompanyProfile,
    SuggestedFilters,
    CompanyProfileResponse,
    Industry,
    CompanySize,
    TargetAudience,
    ThreatConcern,
    TechnologyStack
)
from ..models.article import ContentCategory, Region, Priority

logger = logging.getLogger(__name__)

# ============================================================================
# FIRECRAWL API
# ============================================================================

FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"


def scrape_company_website(url: str) -> str:
    """
    Scrape company website using Firecrawl REST API.
    Returns markdown content.
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        raise ValueError("FIRECRAWL_API_KEY must be set")
    
    try:
        # Scrape the main page
        payload = {
            "url": url,
            "formats": ["markdown"],
            "onlyMainContent": False,  # Get full page content for better context
        }
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"Scraping {url} with Firecrawl...")
        response = requests.post(FIRECRAWL_API_URL, json=payload, headers=headers, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract markdown from response
        content = ""
        if result.get("success") and result.get("data"):
            content = result["data"].get("markdown", "")
        
        logger.info(f"Scraped {len(content)} characters from {url}")
        return content[:30000]  # Limit to avoid token limits
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Firecrawl request error for {url}: {e}")
        return ""
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return ""


# ============================================================================
# LLM ANALYSIS
# ============================================================================

PROFILE_SYSTEM_PROMPT = """You are an expert business analyst. Analyze company information and extract a structured profile.

Based on the website content and user description, extract:
1. Company name, tagline, and industry
2. Estimated size and headquarters
3. Main products/services they offer
4. Target customers they serve
5. Technologies they use or mention

Be accurate and only include information you can infer from the content. Use the predefined enums where applicable."""


FILTERS_SYSTEM_PROMPT = """You are a news curation expert. Based on a company's profile, suggest the most relevant news filters.

Your job is to recommend:
1. **Categories**: Which news categories are most relevant (security, programming, cloud, etc.)
2. **Min Priority**: What priority level should be the cutoff (critical, high, medium, low, info)
3. **Regions**: Geographic areas relevant to their operations
4. **Target Audiences**: Who in the company should see these updates
5. **Threat Concerns**: Security threats they should monitor
6. **Technologies**: Tech stack they use that they'd want updates about
7. **Watch Lists**: Specific companies and products to monitor
8. **Keywords**: Additional filtering terms

Consider:
- Their industry and what threats are common there
- Their tech stack and dependencies
- Their geographic operations and regulatory requirements
- Their customers and what would affect them

Available categories: {categories}
Available regions: {regions}
Available priorities: {priorities}
Available audiences: {audiences}
Available industries: {industries}
Available threats: {threats}
Available tech stack options: {technologies}

Provide thoughtful, specific suggestions with clear reasoning."""


def get_profile_llm() -> ChatOpenAI:
    """Get LLM for company profile extraction"""
    return ChatOpenAI(
        model=OPENAI_MODEL or "gpt-4o-mini",
        temperature=0.2,
        api_key=OPENAI_API_KEY
    ).with_structured_output(CompanyProfile)


def get_filters_llm() -> ChatOpenAI:
    """Get LLM for filter suggestions"""
    return ChatOpenAI(
        model=OPENAI_MODEL or "gpt-4o-mini",
        temperature=0.3,
        api_key=OPENAI_API_KEY
    ).with_structured_output(SuggestedFilters)


def extract_company_profile(
    website_content: str,
    user_description: str,
    company_url: str
) -> CompanyProfile:
    """Extract company profile from website content and user description"""
    
    llm = get_profile_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", PROFILE_SYSTEM_PROMPT),
        ("human", """Analyze this company:

Website URL: {url}

Website Content:
{website_content}

User Description:
{user_description}

Extract a structured company profile.""")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "url": company_url,
        "website_content": website_content[:20000],
        "user_description": user_description
    })
    
    return result


def generate_filter_suggestions(
    profile: CompanyProfile,
    user_description: str
) -> SuggestedFilters:
    """Generate filter suggestions based on company profile"""
    
    llm = get_filters_llm()
    
    # Build enum lists for the prompt
    categories = ", ".join([c.value for c in ContentCategory])
    regions = ", ".join([r.value for r in Region])
    priorities = ", ".join([p.value for p in Priority])
    audiences = ", ".join([a.value for a in TargetAudience])
    industries = ", ".join([i.value for i in Industry])
    threats = ", ".join([t.value for t in ThreatConcern])
    technologies = ", ".join([t.value for t in TechnologyStack])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", FILTERS_SYSTEM_PROMPT),
        ("human", """Based on this company profile, suggest news filters:

Company Profile:
- Name: {name}
- Industry: {industry}
- Size: {size}
- Headquarters: {headquarters}
- Regions: {regions_of_operation}
- Products/Services: {products}
- Target Customers: {customers}
- Tech Stack: {tech_stack}

Additional User Context:
{user_description}

Generate comprehensive filter suggestions.""")
    ])
    
    chain = prompt | llm
    
    result = chain.invoke({
        "name": profile.name,
        "industry": profile.industry.value if profile.industry else "unknown",
        "size": profile.size.value if profile.size else "unknown",
        "headquarters": profile.headquarters or "unknown",
        "regions_of_operation": ", ".join([r.value for r in profile.regions_of_operation]) if profile.regions_of_operation else "global",
        "products": ", ".join(profile.products_services) if profile.products_services else "unknown",
        "customers": ", ".join(profile.target_customers) if profile.target_customers else "unknown",
        "tech_stack": ", ".join([t.value for t in profile.tech_stack]) if profile.tech_stack else "unknown",
        "user_description": user_description,
        "categories": categories,
        "regions": regions,
        "priorities": priorities,
        "audiences": audiences,
        "industries": industries,
        "threats": threats,
        "technologies": technologies
    })
    
    return result


# ============================================================================
# MAIN FUNCTION
# ============================================================================

def analyze_company(
    company_url: str,
    description: str
) -> CompanyProfileResponse:
    """
    Full pipeline: scrape website, extract profile, generate filters.
    """
    logger.info(f"Analyzing company: {company_url}")
    
    # Step 1: Scrape website
    logger.info("Step 1: Scraping website...")
    website_content = scrape_company_website(company_url)

    if not website_content:
        # Fall back to just using user description
        logger.warning("Website scraping failed, using only user description")
        website_content = "Website content unavailable."
    
    # Step 2: Extract profile
    logger.info("Step 2: Extracting company profile...")
    profile = extract_company_profile(
        website_content=website_content,
        user_description=description,
        company_url=company_url
    )
    
    # Step 3: Generate filter suggestions
    logger.info("Step 3: Generating filter suggestions...")
    filters = generate_filter_suggestions(
        profile=profile,
        user_description=description
    )
    
    logger.info(f"Analysis complete for {profile.name}")
    
    return CompanyProfileResponse(
        profile=profile,
        suggested_filters=filters,
        scraped_content_length=len(website_content)
    )

