# Example Configurations

Example configurations for **SnapSite**—different crawling scenarios and recommended settings.

## Configuration Options Reference

```javascript
{
  maxPages: 50,           // Maximum number of pages to crawl (1-1000)
  maxDepth: 10,           // How many levels deep to crawl (1-50)
  delay: 2000,            // Milliseconds between page requests (500-10000)
  waitForLoad: 3000,      // Milliseconds to wait for page load (1000-15000)
  excludePatterns: [],    // URL patterns to exclude (array of strings)
  followSubdomains: false,// Whether to include subdomains
  ignoreQueryParams: true // Treat URLs with different params as same page
}
```

---

## Use Case Examples

### 1. Small Portfolio/Blog Site (< 20 pages)

**Scenario:** Personal blog with a few posts and pages

```javascript
{
  maxPages: 25,
  maxDepth: 5,
  delay: 1000,
  waitForLoad: 2000,
  excludePatterns: [],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

---

### 2. Medium Business Website (20-100 pages)

**Scenario:** Company website with services, about, contact, blog

```javascript
{
  maxPages: 100,
  maxDepth: 8,
  delay: 2000,
  waitForLoad: 3000,
  excludePatterns: ['/search', '/tag/', '/category/'],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

---

### 3. Large E-commerce Site (100+ pages)

**Scenario:** Online store with products, categories, reviews

```javascript
{
  maxPages: 200,
  maxDepth: 10,
  delay: 3000,
  waitForLoad: 4000,
  excludePatterns: [
    '/cart',
    '/checkout',
    '/account',
    '/search',
    '/compare',
    '?page=',
    '?sort='
  ],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

**Note:** For e-commerce sites, consider:
- Excluding cart/checkout to avoid triggering analytics
- Ignoring sorting/filtering parameters
- Higher delays to be respectful of server load

---

### 4. Documentation Site

**Scenario:** Technical documentation with multiple sections

```javascript
{
  maxPages: 150,
  maxDepth: 15,
  delay: 1500,
  waitForLoad: 2500,
  excludePatterns: ['/api-reference/', '/changelog/'],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

---

### 5. Multi-subdomain Organization

**Scenario:** Organization with blog.example.com, shop.example.com, etc.

```javascript
{
  maxPages: 200,
  maxDepth: 8,
  delay: 2500,
  waitForLoad: 3500,
  excludePatterns: ['/admin/', '/api/'],
  followSubdomains: true,  // Enable subdomain crawling
  ignoreQueryParams: true
}
```

**Important:** With `followSubdomains: true`, all subdomains will be crawled:
- example.com
- blog.example.com
- shop.example.com
- docs.example.com

---

### 6. News/Magazine Site

**Scenario:** News site with articles, categories, archives

```javascript
{
  maxPages: 150,
  maxDepth: 6,
  delay: 2000,
  waitForLoad: 3000,
  excludePatterns: [
    '/author/',
    '/tag/',
    '/search',
    '/archive/',
    '/page/'
  ],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

**Reasoning:**
- Exclude author/tag pages to focus on actual articles
- Ignore pagination to avoid duplicate content
- Moderate depth since articles link to many other articles

---

### 7. Single-Page Application (SPA)

**Scenario:** React/Vue/Angular app with hash routing

```javascript
{
  maxPages: 50,
  maxDepth: 8,
  delay: 2000,
  waitForLoad: 5000,  // SPAs need more time to load
  excludePatterns: [],
  followSubdomains: false,
  ignoreQueryParams: false  // Params might be important for SPAs
}
```

**Note:** SPAs may need:
- Longer wait times for JavaScript execution
- Different handling of URL parameters
- May need to keep query params for routing

---

### 8. Government/Institutional Site

**Scenario:** Large government website with many departments

```javascript
{
  maxPages: 300,
  maxDepth: 12,
  delay: 3000,  // Be extra respectful
  waitForLoad: 4000,
  excludePatterns: [
    '/login',
    '/register',
    '/download/',
    '.pdf',
    '.doc',
    '.xls'
  ],
  followSubdomains: true,
  ignoreQueryParams: true
}
```

**Important:**
- Higher delays for public infrastructure
- Exclude login/registration pages
- Skip direct file downloads

---

### 9. Wiki/Knowledge Base

**Scenario:** Wikipedia-like site with interconnected pages

```javascript
{
  maxPages: 100,
  maxDepth: 5,  // Keep depth low or it will crawl forever
  delay: 2000,
  waitForLoad: 2500,
  excludePatterns: [
    '/Special:',
    '/Talk:',
    '/User:',
    '/edit',
    '/history'
  ],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

**Caution:** 
- Wikis link to everything, depth control is critical
- Exclude meta/admin pages
- Consider using lower maxPages

---

### 10. Photography/Portfolio Site

**Scenario:** Visual portfolio with galleries and projects

```javascript
{
  maxPages: 75,
  maxDepth: 6,
  delay: 2500,  // Images take time to load
  waitForLoad: 5000,  // Wait for lazy-loaded images
  excludePatterns: [],
  followSubdomains: false,
  ignoreQueryParams: true
}
```

**Tips:**
- Longer wait times for image-heavy sites
- May want to review screenshots to ensure images loaded
- Consider higher delays if images are large

---

## Exclude Pattern Examples

### Common Patterns to Exclude

```javascript
// Pagination
excludePatterns: ['/page/', '?page=', '&page=']

// Admin/Auth
excludePatterns: ['/admin/', '/login', '/logout', '/register', '/account']

// Downloads
excludePatterns: ['.pdf', '.zip', '.doc', '.xls', '/download/']

// Search/Filter
excludePatterns: ['/search', '?q=', '?filter=', '?sort=']

// Archives/Tags
excludePatterns: ['/archive/', '/tag/', '/category/', '/author/']

// API endpoints
excludePatterns: ['/api/', '/ajax/', '/json/']

// Tracking/Analytics
excludePatterns: ['?utm_', '?ref=', '?source=']
```

---

## Performance Tips

### For Slow Sites
- Increase `waitForLoad` to 5000-7000ms
- Increase `delay` to 3000-4000ms
- Reduce `maxPages` for initial testing

### For Fast Sites
- Reduce `delay` to 1000-1500ms
- Reduce `waitForLoad` to 2000ms
- Can increase `maxPages` safely

### For Dynamic Content
- Increase `waitForLoad` to 4000-6000ms
- Monitor first few screenshots to verify content loads
- Consider excluding JavaScript-heavy sections

---

## Testing Strategy

1. **Start Small:** Use maxPages: 5-10 for initial test
2. **Review Screenshots:** Check if pages are fully loaded
3. **Adjust Timing:** Increase waitForLoad if content missing
4. **Add Exclusions:** Identify and exclude unnecessary pages
5. **Scale Up:** Gradually increase maxPages after successful test

---

## Respectful Crawling Guidelines

- **Public Sites:** 2-3 second delays minimum
- **Own Sites:** Can use faster delays (1-2 seconds)
- **Large Sites:** Never exceed 200 pages per session
- **Server Load:** Monitor for 429/503 errors and stop if seen
- **Rate Limiting:** If blocked, increase delays significantly

---

**Remember:** When in doubt, use conservative settings (higher delays, lower page counts)
