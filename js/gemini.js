/**
 * Gemini API integration for certificate generation
 */
class GeminiService {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    /**
     * Set the API key
     * @param {string} apiKey - Gemini API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Generate certificate designs based on category name
     * @param {string} categoryName - Certificate category name
     * @returns {Promise<Array>} - Array of certificate design descriptions
     */
    async generateCertificateDesigns(categoryName) {
        if (!this.apiKey) {
            // For demo purposes, return mock data if no API key is provided
            return this.getMockCertificateDesigns(categoryName);
        }

        try {
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Create 5 different professional certificate designs for the category: "${categoryName}".
                                    
                                    Research and base your designs on high-quality certificates like those from PrePinsta, Coursera, edX, and other professional certification platforms.
                                    
                                    For each design, provide:
                                    1. A professional title for the certificate
                                    2. A detailed description of the visual layout (make it look authentic and professional)
                                    3. Color scheme (primary, secondary, accent colors in hex codes) - use professional color combinations
                                    4. Font suggestions (use professional fonts commonly found in certificates)
                                    5. Decorative elements or icons to include (seals, emblems, signatures, etc.)
                                    6. Text placement and content suggestions (including official-looking language)
                                    
                                    Format each design as a JSON object with these properties.
                                    
                                    Make the designs look as authentic and professional as possible, similar to real certificates from reputable organizations.`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000
                    }
                })
            });

            const data = await response.json();
            
            if (data.error) {
                console.error('Gemini API Error:', data.error);
                return this.getMockCertificateDesigns(categoryName);
            }

            // Parse the response to extract certificate designs
            const content = data.candidates[0].content.parts[0].text;
            try {
                // Try to parse as JSON array directly
                const designs = JSON.parse(content);
                return Array.isArray(designs) ? designs : this.extractDesignsFromText(content, categoryName);
            } catch (e) {
                // If direct parsing fails, try to extract JSON objects from text
                return this.extractDesignsFromText(content, categoryName);
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return this.getMockCertificateDesigns(categoryName);
        }
    }

    /**
     * Extract certificate designs from text response
     * @param {string} text - Response text from Gemini
     * @param {string} categoryName - Certificate category name
     * @returns {Array} - Array of certificate design objects
     */
    extractDesignsFromText(text, categoryName) {
        // Try to find JSON objects in the text
        const jsonPattern = /\{[\s\S]*?\}/g;
        const jsonMatches = text.match(jsonPattern);
        
        if (jsonMatches && jsonMatches.length > 0) {
            return jsonMatches.map(jsonStr => {
                try {
                    return JSON.parse(jsonStr);
                } catch (e) {
                    return null;
                }
            }).filter(design => design !== null);
        }
        
        // If no JSON objects found, create structured objects from text
        const designs = [];
        const designSections = text.split(/Design \d+:|Certificate \d+:/);
        
        for (let i = 1; i < designSections.length && designs.length < 5; i++) {
            const section = designSections[i].trim();
            if (section) {
                const titleMatch = section.match(/Title:?\s*([^\n]+)/i);
                const colorMatch = section.match(/Colors?:?\s*([^\n]+)/i);
                const fontMatch = section.match(/Fonts?:?\s*([^\n]+)/i);
                const elementsMatch = section.match(/Elements:?\s*([^\n]+)/i);
                
                designs.push({
                    title: titleMatch ? titleMatch[1].trim() : `Professional ${categoryName} Certificate`,
                    description: section.substring(0, 200) + '...',
                    colors: colorMatch ? colorMatch[1].trim() : '#1a5276,#3498db,#f1c40f',
                    fonts: fontMatch ? fontMatch[1].trim() : 'Arial, Times New Roman',
                    elements: elementsMatch ? elementsMatch[1].trim() : 'Borders, Seal, Ribbon'
                });
            }
        }
        
        // If still no designs, create default ones
        if (designs.length === 0) {
            return this.getMockCertificateDesigns(categoryName);
        }
        
        return designs;
    }

    /**
     * Get mock certificate designs for demo purposes
     * @param {string} categoryName - Certificate category name
     * @returns {Array} - Array of mock certificate design objects
     */
    getMockCertificateDesigns(categoryName) {
        return [
            {
                title: `Certificate of Professional Achievement in ${categoryName}`,
                description: 'A premium certificate with gold accents and an official seal, featuring a clean modern layout with a subtle gradient background.',
                colors: '#14213d,#fca311,#e5e5e5',
                fonts: 'Montserrat, Playfair Display',
                elements: 'Gold embossed seal, laurel wreath, signature lines, official watermark'
            },
            {
                title: `${categoryName} Professional Certification`,
                description: 'An elegant certificate with a minimalist design, featuring a distinctive header and professional typography with a border inspired by academic credentials.',
                colors: '#1d3557,#457b9d,#a8dadc',
                fonts: 'Raleway, Lato',
                elements: 'University-style emblem, ribbon banner, authorized signatures, holographic corner mark'
            },
            {
                title: `Advanced ${categoryName} Certification`,
                description: 'A modern corporate-style certificate with clean lines and professional branding, suitable for technical achievements and industry recognition.',
                colors: '#2b2d42,#8d99ae,#edf2f4',
                fonts: 'Roboto, Open Sans',
                elements: 'Corporate logo placement, QR code verification, executive signatures, embossed border'
            },
            {
                title: `${categoryName} - Certificate of Excellence`,
                description: 'A traditional certificate with classic styling reminiscent of academic diplomas, featuring ornate borders and formal language with a parchment-like background.',
                colors: '#5e503f,#c6ac8f,#eae0d5',
                fonts: 'Garamond, Georgia',
                elements: 'Wax seal effect, scrollwork, calligraphic details, institution crest'
            },
            {
                title: `Executive ${categoryName} Mastery Certificate`,
                description: 'A premium executive-level certificate with luxury styling, featuring metallic accents and a sophisticated color scheme suitable for leadership achievements.',
                colors: '#0b090a,#660708,#e5e5e5',
                fonts: 'Cinzel, Cormorant Garamond',
                elements: 'Gold foil effect, executive seal, premium textured background, hand-signed by program director'
            }
        ];
    }
}

// Export the Gemini service
const geminiService = new GeminiService(); 