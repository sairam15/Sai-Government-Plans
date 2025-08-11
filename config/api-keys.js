// API Configuration File
// Replace the placeholder values with your actual API keys

const API_CONFIG = {
    // Data.gov API Key (Required for regulations.gov and other data.gov APIs)
    // Get your free API key at: https://api.data.gov/signup/
    DATA_GOV_API_KEY: 'YOUR_DATA_GOV_API_KEY_HERE',
    
    // Census Bureau API (No key required, but rate limited)
    CENSUS_API_KEY: 'YOUR_CENSUS_API_KEY_HERE', // Optional, for higher rate limits
    
    // GitHub API (Optional, for higher rate limits)
    // Get your token at: https://github.com/settings/tokens
    GITHUB_API_TOKEN: 'YOUR_GITHUB_API_TOKEN_HERE',
    
    // Federal Reserve API (Optional, for economic data)
    // Get your key at: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED_API_KEY: 'YOUR_FRED_API_KEY_HERE',
    
    // Healthcare.gov API (No key required)
    HEALTHCARE_GOV_API_KEY: null,
    
    // Medicare.gov API (No key required)
    MEDICARE_GOV_API_KEY: null,
    
    // FDA API (No key required)
    FDA_API_KEY: null,
    
    // Rate limiting configuration
    RATE_LIMITS: {
        CONCURRENT_REQUESTS: 10, // Number of concurrent API requests
        DELAY_BETWEEN_BATCHES: 1000, // Milliseconds between batches
        MAX_RETRIES: 3,
        TIMEOUT: 15000 // 15 seconds
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
} else {
    window.API_CONFIG = API_CONFIG;
}
