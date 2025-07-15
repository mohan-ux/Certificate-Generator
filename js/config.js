/**
 * Configuration file for API keys
 * 
 * Replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API key
 * If no API key is provided, the application will use mock data
 */
const CONFIG = {
    // Gemini API key
    GEMINI_API_KEY: '', // 'YOUR_GEMINI_API_KEY'
};

// If Gemini API key is provided, set it in the services
if (CONFIG.GEMINI_API_KEY) {
    geminiService.setApiKey(CONFIG.GEMINI_API_KEY);
    webScraperService.setApiKey(CONFIG.GEMINI_API_KEY);
} 