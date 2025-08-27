import requests
from pymongo import MongoClient
import re
import time
import random
from bs4 import BeautifulSoup
from datetime import datetime
import logging
from typing import Dict, List, Optional
import sys

# Fix Windows console encoding
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# ==== CONFIG ====
GITHUB_TOKEN = "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"
LOCATIONS = ["karnataka", "mysuru", "dharwad", "bengaluru", "bangalore", "mangalore", "hubli"]
DOMAINS = {
    "frontend developer": {
        "bio_keywords": ["frontend", "react", "angular", "vue", "svelte", "iit", "nit", "front-end"],
        "repo_keywords": ["react", "angular", "vue", "svelte", "nextjs", "nuxt"],
        "languages": ["JavaScript", "TypeScript", "HTML", "CSS"]
    },
    "backend developer": {
        "bio_keywords": ["backend", "node", "django", "spring", "express", "flask", "iit", "nit", "back-end"],
        "repo_keywords": ["node", "django", "spring", "express", "flask", "fastapi", "laravel"],
        "languages": ["Python", "Java", "Go", "PHP", "Ruby", "C#", "Node.js"]
    },
    "software engineer": {
        "bio_keywords": ["software engineer", "developer", "programmer", "engineer", "iit", "nit", "sde"],
        "repo_keywords": ["algorithm", "data-structure", "competitive-programming"],
        "languages": ["Python", "Java", "C++", "JavaScript", "Go"]
    },
    "full stack developer": {
        "bio_keywords": ["full stack", "mern", "mean", "lamp", "developer", "iit", "nit", "fullstack"],
        "repo_keywords": ["mern", "mean", "lamp", "full-stack", "portfolio"],
        "languages": ["JavaScript", "TypeScript", "Java", "Python", "PHP"]
    },
    "ui/ux designer": {
        "bio_keywords": ["ui", "ux", "user interface", "user experience", "designer", "iit", "nit", "product designer"],
        "repo_keywords": ["ui", "ux", "design", "figma", "prototype"],
        "languages": ["JavaScript", "CSS", "HTML", "Dart"]
    },
    "artificial intelligence": {
        "bio_keywords": ["ai", "artificial intelligence", "ml", "machine learning", "deep learning", "iit", "nit", "nlp"],
        "repo_keywords": ["tensorflow", "pytorch", "scikit-learn", "machine-learning", "neural-network"],
        "languages": ["Python", "R", "Julia", "MATLAB"]
    },
    "devops engineer": {
        "bio_keywords": ["devops", "infrastructure", "automation", "kubernetes", "docker", "ci/cd", "iit", "nit", "sre"],
        "repo_keywords": ["devops", "infrastructure", "kubernetes", "docker", "terraform", "ansible"],
        "languages": ["Shell", "Python", "Go", "YAML"]
    },
    "machine learning": {
        "bio_keywords": ["machine learning", "ml", "deep learning", "ai", "data science", "iit", "nit", "computer vision"],
        "repo_keywords": ["machine-learning", "tensorflow", "pytorch", "scikit-learn", "keras"],
        "languages": ["Python", "R", "Julia", "C++"]
    },
    "data scientist": {
        "bio_keywords": ["data scientist", "data science", "analytics", "data analyst", "iit", "nit", "statistician"],
        "repo_keywords": ["data-science", "pandas", "numpy", "scikit-learn", "jupyter"],
        "languages": ["Python", "R", "SQL", "Scala"]
    },
    "cloud engineer": {
        "bio_keywords": ["cloud", "aws", "azure", "gcp", "devops", "iit", "nit", "cloud architect"],
        "repo_keywords": ["aws", "azure", "gcp", "cloud", "serverless"],
        "languages": ["Python", "Go", "Java", "JavaScript"]
    },
    "mobile developer": {
        "bio_keywords": ["mobile", "android", "ios", "flutter", "react native", "iit", "nit", "app developer"],
        "repo_keywords": ["android", "ios", "flutter", "react-native", "mobile-app"],
        "languages": ["Java", "Kotlin", "Swift", "Dart", "JavaScript"]
    },
    "cybersecurity": {
        "bio_keywords": ["cybersecurity", "security", "ethical hacking", "penetration testing", "iit", "nit", "infosec"],
        "repo_keywords": ["security", "penetration-testing", "vulnerability", "encryption"],
        "languages": ["Python", "C", "JavaScript", "Go"]
    }
}

# Enhanced Configuration
MAX_TOTAL = 120
MAX_PER_DOMAIN = 10
LINKEDIN_DOMAIN_MAX = 8
MIN_FOLLOWERS = 5
MIN_PUBLIC_REPOS = 10
MAX_PROFILES_TO_CHECK = 80  # Reduced for faster execution
PROFILES_PER_PAGE = 30
MAX_PAGES_PER_SEARCH = 3  # Reduced for faster execution

# Rate limiting
RATE_LIMIT_DELAY = 1.5
MAX_REQUESTS_PER_MINUTE = 40

# ==== LOGGING SETUP ====
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('github_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ==== MONGO CONNECT ====
MONGODB_URI = "mongodb+srv://mokesh:test1234@cluster0.ixvtb9y.mongodb.net/domain?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGODB_URI)
db = client["domain"]
experts = db["experts"]

# Enhanced headers with rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

HEADERS_API = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "User-Agent": random.choice(USER_AGENTS)
}

def get_random_headers():
    return {"User-Agent": random.choice(USER_AGENTS)}

class RateLimiter:
    def __init__(self, max_requests=MAX_REQUESTS_PER_MINUTE, time_window=60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
    
    def wait_if_needed(self):
        now = time.time()
        # Remove old requests
        self.requests = [req_time for req_time in self.requests if now - req_time < self.time_window]
        
        if len(self.requests) >= self.max_requests:
            sleep_time = self.time_window - (now - self.requests[0]) + 1
            logger.info(f"Rate limit reached. Sleeping for {sleep_time:.1f} seconds...")
            time.sleep(sleep_time)
        
        self.requests.append(now)
        time.sleep(RATE_LIMIT_DELAY)

rate_limiter = RateLimiter()

def extract_linkedin_regex(text: str) -> str:
    """Enhanced LinkedIn URL extraction with better regex"""
    if not text:
        return ""
    
    patterns = [
        r'https?://(www\.)?linkedin\.com/in/[A-Za-z0-9\-\_/%]+',
        r'linkedin\.com/in/[A-Za-z0-9\-\_/%]+',
        r'https?://linkedin\.com/in/[A-Za-z0-9\-\_/%]+'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith('http'):
                url = 'https://' + url
            return url
    return ""

def extract_linkedin_from_html(username: str) -> str:
    """Extract LinkedIn URL from GitHub profile page with error handling"""
    try:
        url = f"https://github.com/{username}"
        headers = get_random_headers()
        res = requests.get(url, headers=headers, timeout=10)
        
        if res.status_code != 200:
            return ""
        
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Check multiple locations for LinkedIn
        selectors = [
            'a[href*="linkedin.com/in/"]',
            '.Link--primary[href*="linkedin.com"]',
            '.user-profile-link[href*="linkedin.com"]'
        ]
        
        for selector in selectors:
            links = soup.select(selector)
            if links:
                return links[0].get('href', '')
        
        # Also check in bio/readme content
        readme_content = soup.find('div', {'class': 'Box-body'})
        if readme_content:
            linkedin_url = extract_linkedin_regex(readme_content.get_text())
            if linkedin_url:
                return linkedin_url
                
    except Exception as e:
        logger.debug(f"Error extracting LinkedIn for {username}: {str(e)}")
    
    return ""

def check_domain_relevance(user_data: dict, domain: str) -> bool:
    """Check if user is relevant to the domain based on bio"""
    domain_config = DOMAINS.get(domain, {})
    bio = (user_data.get('bio') or '').lower()
    
    # Check bio keywords
    bio_keywords = domain_config.get('bio_keywords', [])
    bio_match = any(keyword.lower() in bio for keyword in bio_keywords)
    
    return bio_match

def search_users_enhanced(location: str, domain: str, page: int = 1, per_page: int = PROFILES_PER_PAGE) -> List[dict]:
    """Enhanced user search with better query building"""
    domain_keywords = DOMAINS.get(domain, {}).get('bio_keywords', [])[:3]
    
    queries = [
        f"location:{location} {domain}",
    ]
    
    # Add keyword-based query if we have keywords
    if domain_keywords:
        keyword_query = f"location:{location} {' OR '.join(domain_keywords[:2])}"
        queries.append(keyword_query)
    
    all_users = []
    
    for query in queries:
        try:
            url = f"https://api.github.com/search/users?q={query}&per_page={per_page}&page={page}&sort=followers"
            rate_limiter.wait_if_needed()
            
            r = requests.get(url, headers=HEADERS_API, timeout=15)
            if r.status_code == 200:
                users = r.json().get("items", [])
                all_users.extend(users)
                logger.info(f"Found {len(users)} users for query: {query}")
            elif r.status_code == 403:
                logger.warning("Rate limit hit, waiting longer...")
                time.sleep(60)
                return []
            elif r.status_code == 422:
                logger.warning(f"Invalid query: {query}")
                continue
            else:
                logger.warning(f"Search failed {domain} @ {location}: {r.status_code}")
                
        except Exception as e:
            logger.error(f"Error searching users: {str(e)}")
            time.sleep(5)
    
    # Remove duplicates based on login
    seen = set()
    unique_users = []
    for user in all_users:
        if user['login'] not in seen:
            seen.add(user['login'])
            unique_users.append(user)
    
    return unique_users

def get_user_details(username: str) -> Optional[dict]:
    """Get user details with enhanced error handling"""
    try:
        url = f"https://api.github.com/users/{username}"
        rate_limiter.wait_if_needed()
        
        r = requests.get(url, headers=HEADERS_API, timeout=15)
        if r.status_code == 200:
            return r.json()
        elif r.status_code == 404:
            logger.debug(f"User {username} not found (404)")
        elif r.status_code == 403:
            logger.warning("Rate limit hit while getting user details")
            time.sleep(60)
        else:
            logger.debug(f"Failed to get details for {username}: {r.status_code}")
    except Exception as e:
        logger.debug(f"Error getting user details for {username}: {str(e)}")
    
    return None

def calculate_user_score(user_details: dict, domain: str) -> int:
    """Calculate relevance score for user based on multiple factors"""
    score = 0
    
    # Follower score (0-30 points)
    followers = user_details.get('followers', 0)
    if followers >= 100:
        score += 30
    elif followers >= 50:
        score += 25
    elif followers >= 20:
        score += 20
    elif followers >= 10:
        score += 15
    elif followers >= 5:
        score += 10
    
    # Repository score (0-25 points)
    repos = user_details.get('public_repos', 0)
    if repos >= 50:
        score += 25
    elif repos >= 30:
        score += 20
    elif repos >= 20:
        score += 15
    elif repos >= 10:
        score += 10
    
    # Bio relevance (0-25 points)
    bio = (user_details.get('bio') or '').lower()
    domain_keywords = DOMAINS.get(domain, {}).get('bio_keywords', [])
    matches = sum(1 for keyword in domain_keywords if keyword.lower() in bio)
    score += min(matches * 5, 25)
    
    # Profile completeness (0-20 points)
    if user_details.get('name'):
        score += 5
    if user_details.get('bio'):
        score += 5
    if user_details.get('location'):
        score += 5
    if user_details.get('blog'):
        score += 5
    
    return score

def main():
    logger.info("Starting GitHub Expert Scraper...")
    logger.info(f"Target: {MAX_TOTAL} total profiles, {MAX_PER_DOMAIN} per domain")
    logger.info(f"Filters: Min {MIN_FOLLOWERS} followers, {MIN_PUBLIC_REPOS} repos")
    
    seen_usernames = set()
    total_saved = 0
    domain_stats = {}
    
    for domain in DOMAINS.keys():  # Process all domains
        if total_saved >= MAX_TOTAL:
            break
            
        logger.info(f"\n[DOMAIN] Processing: {domain}")
        linkedin_count = 0
        github_count = 0
        profiles_checked = 0
        domain_stats[domain] = {'checked': 0, 'saved': 0, 'linkedin': 0, 'github_only': 0}
        
        # Shuffle locations for variety
        locations_shuffled = LOCATIONS[:]
        random.shuffle(locations_shuffled)
        
        # Search across multiple pages and locations
        all_candidates = []
        
        for location in locations_shuffled:
            if profiles_checked >= MAX_PROFILES_TO_CHECK:
                break
                
            logger.info(f"[SEARCH] Searching in {location} for {domain}...")
            
            # Search multiple pages
            for page in range(1, MAX_PAGES_PER_SEARCH + 1):
                if profiles_checked >= MAX_PROFILES_TO_CHECK:
                    break
                    
                users = search_users_enhanced(location, domain, page)
                if not users:
                    logger.info(f"No more users found on page {page}")
                    break
                    
                logger.info(f"Processing {len(users)} users from page {page}...")
                
                # Score and filter users
                for user in users:
                    if profiles_checked >= MAX_PROFILES_TO_CHECK:
                        break
                        
                    login = user["login"]
                    if login in seen_usernames or experts.find_one({"username": login}):
                        continue
                    
                    details = get_user_details(login)
                    profiles_checked += 1
                    domain_stats[domain]['checked'] += 1
                    
                    if not details:
                        continue
                    
                    # Apply activity filters
                    followers = details.get("followers", 0)
                    public_repos = details.get("public_repos", 0)
                    
                    if followers < MIN_FOLLOWERS or public_repos < MIN_PUBLIC_REPOS:
                        logger.debug(f"[SKIP] {login}: {followers} followers, {public_repos} repos")
                        continue
                    
                    # Calculate relevance score
                    score = calculate_user_score(details, domain)
                    
                    # Check domain relevance (relaxed for testing)
                    if not check_domain_relevance(details, domain) and score < 25:
                        logger.debug(f"[SKIP] {login}: Not relevant to {domain} (Score: {score})")
                        continue
                    
                    all_candidates.append({
                        'user': user,
                        'details': details,
                        'score': score,
                        'location': location
                    })
                    
                    logger.info(f"[CANDIDATE] {login} - Score: {score}, Followers: {followers}, Repos: {public_repos}")
        
        logger.info(f"[RESULTS] Found {len(all_candidates)} candidates for {domain}")
        
        # Sort candidates by score (highest first)
        all_candidates.sort(key=lambda x: x['score'], reverse=True)
        
        # Process top candidates
        for candidate in all_candidates:
            if linkedin_count + github_count >= MAX_PER_DOMAIN or total_saved >= MAX_TOTAL:
                break
                
            user = candidate['user']
            details = candidate['details']
            login = user["login"]
            location = candidate['location']
            
            # Check for LinkedIn URL
            linkedin_url = ""
            blog = details.get("blog") or ""
            
            if "linkedin.com" in blog.lower():
                linkedin_url = blog.strip()
            else:
                # Skip HTML extraction for now to speed up testing
                pass
            
            # Create expert entry
            expert_data = {
                "name": details.get("name") or login,
                "username": login,
                "location": details.get("location") or location,
                "profile_url": details.get("html_url"),
                "avatar": details.get("avatar_url"),
                "domain": domain,
                "linkedin_url": linkedin_url,
                "about": details.get("bio") or "",
                "followers": details.get("followers", 0),
                "public_repos": details.get("public_repos", 0),
                "score": candidate['score'],
                "scraped_at": datetime.utcnow(),
                "has_linkedin": bool(linkedin_url)
            }
            
            experts.update_one(
                {"username": login},
                {"$set": expert_data},
                upsert=True
            )
            
            if linkedin_url:
                logger.info(f"[SAVED] LinkedIn: {login} (Score: {candidate['score']}) @ {location}")
                linkedin_count += 1
                domain_stats[domain]['linkedin'] += 1
            else:
                logger.info(f"[SAVED] GitHub-only: {login} (Score: {candidate['score']}) @ {location}")
                github_count += 1
                domain_stats[domain]['github_only'] += 1
            
            seen_usernames.add(login)
            total_saved += 1
            domain_stats[domain]['saved'] += 1
        
        logger.info(f"[SUMMARY] {domain}: {linkedin_count} LinkedIn, {github_count} GitHub-only (Checked: {profiles_checked})")
    
    # Final statistics
    logger.info(f"\n[COMPLETE] Scraping Complete!")
    logger.info(f"Total profiles saved: {total_saved}")
    logger.info("\n[STATS] Domain Statistics:")
    
    for domain, stats in domain_stats.items():
        logger.info(f"{domain}: {stats['saved']}/{stats['checked']} saved (LinkedIn: {stats['linkedin']}, GitHub: {stats['github_only']})")

def create_indexes():
    """Create database indexes for better performance"""
    try:
        experts.create_index("username", unique=True)
        experts.create_index("domain")
        experts.create_index("location")
        experts.create_index("score")
        experts.create_index("has_linkedin")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Error creating indexes: {str(e)}")

if __name__ == "__main__":
    try:
        create_indexes()
        main()
    except KeyboardInterrupt:
        logger.info("\n[INTERRUPTED] Scraping interrupted by user")
    except Exception as e:
        logger.error(f"[ERROR] Unexpected error: {str(e)}")
