// Test script to verify cache functionality
console.log('🔍 Testing Cache Functionality...');

// Test cache status
function testCacheStatus() {
    const cacheKey = 'medicare_medicaid_plans_cache';
    const cacheExpiryKey = 'medicare_medicaid_plans_cache_expiry';
    
    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = localStorage.getItem(cacheExpiryKey);
    
    console.log('📦 Cache Key:', cacheKey);
    console.log('⏰ Cache Expiry Key:', cacheExpiryKey);
    console.log('📄 Cached Data Exists:', !!cachedData);
    console.log('⏰ Cache Expiry Exists:', !!cacheExpiry);
    
    if (cachedData && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry);
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        const daysUntilExpiry = Math.ceil(timeUntilExpiry / (24 * 60 * 60 * 1000));
        
        console.log('⏰ Current Time:', new Date(currentTime).toLocaleString());
        console.log('⏰ Expiry Time:', new Date(expiryTime).toLocaleString());
        console.log('⏰ Time Until Expiry (ms):', timeUntilExpiry);
        console.log('⏰ Days Until Expiry:', daysUntilExpiry);
        console.log('❌ Is Expired:', currentTime >= expiryTime);
        
        if (currentTime < expiryTime) {
            try {
                const plans = JSON.parse(cachedData);
                console.log('✅ Cache is valid!');
                console.log('📊 Number of plans in cache:', plans.length);
                console.log('📅 Cache will expire in', daysUntilExpiry, 'days');
                
                // Show sample plan
                if (plans.length > 0) {
                    console.log('📋 Sample plan:', {
                        name: plans[0].name,
                        type: plans[0].type,
                        state: plans[0].state,
                        starRating: plans[0].starRating,
                        members: plans[0].members
                    });
                }
            } catch (error) {
                console.error('❌ Error parsing cached data:', error);
            }
        } else {
            console.log('❌ Cache has expired');
        }
    } else {
        console.log('❌ No cache found');
    }
}

// Test cache clearing
function testCacheClearing() {
    console.log('\n🗑️ Testing cache clearing...');
    
    const cacheKey = 'medicare_medicaid_plans_cache';
    const cacheExpiryKey = 'medicare_medicaid_plans_cache_expiry';
    
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(cacheExpiryKey);
    
    console.log('✅ Cache cleared');
    console.log('📄 Cached Data Exists:', !!localStorage.getItem(cacheKey));
    console.log('⏰ Cache Expiry Exists:', !!localStorage.getItem(cacheExpiryKey));
}

// Run tests
console.log('='.repeat(50));
testCacheStatus();
console.log('='.repeat(50));

// Uncomment the line below to test cache clearing
// testCacheClearing();
