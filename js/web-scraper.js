/**
 * Web Scraper Service for Certificate Generator
 * This service uses the Gemini API to simulate web scraping and gather certificate designs,
 * seals, logos, and signatures based on the certificate name and industry.
 */
class WebScraperService {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.cachedResults = new Map();
        this.certificateTemplates = {
            'PrepInsta': {
                colors: {
                    primary: '#0052cc',
                    secondary: '#00a3bf',
                    accent: '#ff5630'
                },
                fonts: {
                    primary: 'Roboto',
                    secondary: 'Open Sans'
                },
                style: 'modern',
                pattern: 'geometric',
                border: 'rounded',
                layout: 'centered',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-tech-certificate-template_53876-117845.jpg'
            },
            'Coursera': {
                colors: {
                    primary: '#0056D2',
                    secondary: '#2A73CC',
                    accent: '#7D89B0'
                },
                fonts: {
                    primary: 'Source Sans Pro',
                    secondary: 'Merriweather'
                },
                style: 'professional',
                pattern: 'waves',
                border: 'thin-line',
                layout: 'horizontal',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-wavy-certificate-template_53876-117841.jpg'
            },
            'Udemy': {
                colors: {
                    primary: '#A435F0',
                    secondary: '#6A0DAD',
                    accent: '#EB4E5F'
                },
                fonts: {
                    primary: 'SuisseWorks',
                    secondary: 'Udemy Sans'
                },
                style: 'modern',
                pattern: 'minimal',
                border: 'thick-corners',
                layout: 'asymmetric',
                backgroundUrl: 'https://img.freepik.com/free-vector/purple-certificate-with-geometric-pattern_53876-116234.jpg'
            },
            'edX': {
                colors: {
                    primary: '#02262B',
                    secondary: '#76CBC1',
                    accent: '#FF6F00'
                },
                fonts: {
                    primary: 'Inter',
                    secondary: 'Playfair Display'
                },
                style: 'academic',
                pattern: 'dots',
                border: 'double-line',
                layout: 'traditional',
                backgroundUrl: 'https://img.freepik.com/free-vector/elegant-certificate-template-with-frame_23-2147697211.jpg'
            },
            'Google': {
                colors: {
                    primary: '#4285F4',
                    secondary: '#34A853',
                    accent: '#FBBC05'
                },
                fonts: {
                    primary: 'Google Sans',
                    secondary: 'Roboto'
                },
                style: 'modern',
                pattern: 'material',
                border: 'shadow',
                layout: 'grid',
                backgroundUrl: 'https://img.freepik.com/free-vector/colorful-abstract-certificate-template_52683-69401.jpg'
            },
            'Microsoft': {
                colors: {
                    primary: '#0078D4',
                    secondary: '#50E6FF',
                    accent: '#FFB900'
                },
                fonts: {
                    primary: 'Segoe UI',
                    secondary: 'Arial'
                },
                style: 'corporate',
                pattern: 'squares',
                border: 'gradient',
                layout: 'fluent',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-white-certificate-template_53876-115916.jpg'
            },
            'AWS': {
                colors: {
                    primary: '#232F3E',
                    secondary: '#FF9900',
                    accent: '#FFFFFF'
                },
                fonts: {
                    primary: 'Amazon Ember',
                    secondary: 'Amazon Ember Display'
                },
                style: 'technical',
                pattern: 'circuit',
                border: 'solid',
                layout: 'structured',
                backgroundUrl: 'https://img.freepik.com/free-vector/orange-black-certificate-template_53876-116235.jpg'
            },
            'IBM': {
                colors: {
                    primary: '#0F62FE',
                    secondary: '#393939',
                    accent: '#6929C4'
                },
                fonts: {
                    primary: 'IBM Plex Sans',
                    secondary: 'IBM Plex Serif'
                },
                style: 'corporate',
                pattern: 'grid',
                border: 'thick',
                layout: 'balanced',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-professional-certificate-template_53876-115919.jpg'
            },
            'Oracle': {
                colors: {
                    primary: '#C74634',
                    secondary: '#123262',
                    accent: '#2F496E'
                },
                fonts: {
                    primary: 'Oracle Sans',
                    secondary: 'Georgia'
                },
                style: 'enterprise',
                pattern: 'subtle',
                border: 'classic',
                layout: 'formal',
                backgroundUrl: 'https://img.freepik.com/free-vector/red-elegant-certificate-template_53876-117847.jpg'
            },
            'Salesforce': {
                colors: {
                    primary: '#00A1E0',
                    secondary: '#16325C',
                    accent: '#FFB03B'
                },
                fonts: {
                    primary: 'Salesforce Sans',
                    secondary: 'Lato'
                },
                style: 'cloud',
                pattern: 'dynamic',
                border: 'rounded-corners',
                layout: 'modern',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-abstract-certificate-template_53876-116232.jpg'
            }
        };
        
        // Default template for generic certificates
        this.defaultTemplate = {
            colors: {
                primary: '#1a5276',
                secondary: '#3498db',
                accent: '#f1c40f'
            },
            fonts: {
                primary: 'Montserrat',
                secondary: 'Playfair Display'
            },
            style: 'professional',
            pattern: 'classic',
            border: 'ornate',
            layout: 'traditional',
            backgroundUrl: 'https://img.freepik.com/free-vector/certificate-template-with-luxury-golden-frame_1017-32298.jpg'
        };
        
        // Templates for different industries
        this.industryTemplates = {
            'Technology': {
                colors: {
                    primary: '#2C3E50',
                    secondary: '#3498DB',
                    accent: '#E74C3C'
                },
                fonts: {
                    primary: 'Roboto',
                    secondary: 'Source Code Pro'
                },
                style: 'modern',
                pattern: 'tech',
                border: 'minimal',
                backgroundUrl: 'https://img.freepik.com/free-vector/blue-tech-certificate-template_53876-117845.jpg'
            },
            'Healthcare': {
                colors: {
                    primary: '#27AE60',
                    secondary: '#2980B9',
                    accent: '#ECF0F1'
                },
                fonts: {
                    primary: 'Lato',
                    secondary: 'Merriweather'
                },
                style: 'clean',
                pattern: 'medical',
                border: 'rounded',
                backgroundUrl: 'https://img.freepik.com/free-vector/green-medical-certificate-template_53876-116236.jpg'
            },
            'Finance': {
                colors: {
                    primary: '#2C3E50',
                    secondary: '#34495E',
                    accent: '#F1C40F'
                },
                fonts: {
                    primary: 'Libre Baskerville',
                    secondary: 'Open Sans'
                },
                style: 'corporate',
                pattern: 'secure',
                border: 'double',
                backgroundUrl: 'https://img.freepik.com/free-vector/elegant-certificate-template-with-golden-frame_23-2147697210.jpg'
            },
            'Education': {
                colors: {
                    primary: '#8E44AD',
                    secondary: '#9B59B6',
                    accent: '#F39C12'
                },
                fonts: {
                    primary: 'Garamond',
                    secondary: 'Raleway'
                },
                style: 'academic',
                pattern: 'scholarly',
                border: 'classic',
                backgroundUrl: 'https://img.freepik.com/free-vector/elegant-certificate-template_1017-17599.jpg'
            },
            'Design': {
                colors: {
                    primary: '#2C3E50',
                    secondary: '#E74C3C',
                    accent: '#3498DB'
                },
                fonts: {
                    primary: 'Montserrat',
                    secondary: 'Playfair Display'
                },
                style: 'creative',
                pattern: 'artistic',
                border: 'frame',
                backgroundUrl: 'https://img.freepik.com/free-vector/colorful-certificate-template-with-geometric-pattern_53876-117843.jpg'
            }
        };
    }

    /**
     * Set the API key
     * @param {string} apiKey - Gemini API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Fetch certificate design resources based on certificate name and industry
     * @param {string} certificateName - Name of the certificate
     * @param {string} industry - Industry or category of the certificate
     * @returns {Promise<Object>} - Object containing certificate design resources
     */
    async fetchCertificateResources(certificateName, industry = '') {
        // Create a cache key based on certificate name and industry
        const cacheKey = `${certificateName.toLowerCase()}-${industry.toLowerCase()}`;
        
        // Check if we have cached results
        if (this.cachedResults.has(cacheKey)) {
            return this.cachedResults.get(cacheKey);
        }
        
        if (!this.apiKey) {
            // Return mock data if no API key is provided
            return this.getMockCertificateResources(certificateName, industry);
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
                                    text: `Research and provide detailed information about "${certificateName}" certificates${industry ? ' in the ' + industry + ' industry' : ''}.

                                    Return a JSON object with the following information:
                                    
                                    1. "name": The official name of the certificate
                                    2. "organization": The organization that issues this certificate
                                    3. "description": A brief description of what this certificate represents
                                    4. "design": {
                                        "primaryColor": Primary color in hex code,
                                        "secondaryColor": Secondary color in hex code,
                                        "accentColor": Accent color in hex code,
                                        "primaryFont": Primary font name,
                                        "secondaryFont": Secondary font name,
                                        "style": Design style (modern, traditional, corporate, academic, etc.)
                                    }
                                    5. "logoUrl": URL to the organization's logo image
                                    6. "sealUrl": URL to an official seal or badge image
                                    7. "signatureUrls": Array of URLs to signature images of officials
                                    8. "backgroundUrl": URL to a certificate background image
                                    9. "officials": Array of objects with "name" and "title" of signing officials
                                    10. "language": Formal language used on the certificate
                                    
                                    Make sure all URLs are valid and accessible public images.
                                    If you can't find specific information, provide the most realistic and professional alternative.`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2000
                    }
                })
            });

            const data = await response.json();
            
            if (data.error) {
                console.error('Gemini API Error:', data.error);
                return this.getMockCertificateResources(certificateName, industry);
            }

            // Parse the response to extract certificate resources
            const content = data.candidates[0].content.parts[0].text;
            try {
                // Try to parse as JSON directly
                const resources = JSON.parse(content);
                
                // Cache the results
                this.cachedResults.set(cacheKey, resources);
                
                return resources;
            } catch (e) {
                console.error('Error parsing Gemini response:', e);
                // If parsing fails, extract JSON from text
                return this.extractResourcesFromText(content, certificateName, industry);
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return this.getMockCertificateResources(certificateName, industry);
        }
    }

    /**
     * Extract certificate resources from text response
     * @param {string} text - Response text from Gemini
     * @param {string} certificateName - Name of the certificate
     * @param {string} industry - Industry or category of the certificate
     * @returns {Object} - Certificate resources object
     */
    extractResourcesFromText(text, certificateName, industry) {
        // Try to find JSON object in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const resources = JSON.parse(jsonMatch[0]);
                
                // Cache the results
                const cacheKey = `${certificateName.toLowerCase()}-${industry.toLowerCase()}`;
                this.cachedResults.set(cacheKey, resources);
                
                return resources;
            } catch (e) {
                console.error('Error parsing extracted JSON:', e);
            }
        }
        
        // If no valid JSON found, return mock data
        return this.getMockCertificateResources(certificateName, industry);
    }

    /**
     * Get mock certificate resources for demo purposes
     * @param {string} certificateName - Name of the certificate
     * @param {string} industry - Industry or category of the certificate
     * @returns {Object} - Mock certificate resources object
     */
    getMockCertificateResources(certificateName, industry) {
        // Create organization name based on certificate name
        let organizationName = '';
        let template = null;
        
        // Check if the certificate name contains a known organization
        for (const org of Object.keys(this.certificateTemplates)) {
            if (certificateName.toLowerCase().includes(org.toLowerCase())) {
                organizationName = org;
                template = this.certificateTemplates[org];
                break;
            }
        }
        
        // If no specific organization was found, generate a professional-sounding name
        if (!organizationName) {
            const prefixes = ['International', 'Global', 'Advanced', 'Professional', 'Certified'];
            const suffixes = ['Institute', 'Academy', 'Association', 'Council', 'Board'];
            
            // Use industry if provided, otherwise extract from certificate name
            let fieldName = industry || certificateName.split(' ')[0];
            
            // Clean up the field name
            fieldName = fieldName.replace(/certificate|certification|certified|professional/gi, '').trim();
            
            if (!fieldName) {
                fieldName = 'Professional';
            }
            
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            
            organizationName = `${prefix} ${fieldName} ${suffix}`;
            
            // Check if we have a template for this industry
            if (industry && this.industryTemplates[industry]) {
                template = this.industryTemplates[industry];
            } else {
                // Use default template
                template = this.defaultTemplate;
            }
        }
        
        // Extract design elements from template
        const colors = template.colors;
        const fonts = template.fonts;
        const designStyle = template.style;
        const pattern = template.pattern;
        const border = template.border;
        const layout = template.layout || 'traditional';
        const backgroundUrl = template.backgroundUrl;
        
        // Generate additional design elements based on pattern and border
        const designElements = this.generateDesignElements(pattern, border, layout);
        
        // Generate mock resources
        return {
            name: certificateName,
            organization: organizationName,
            description: `This certificate validates expertise and knowledge in ${industry || certificateName.replace(/certificate|certification/gi, '').trim()}.`,
            design: {
                primaryColor: colors.primary,
                secondaryColor: colors.secondary,
                accentColor: colors.accent,
                primaryFont: fonts.primary,
                secondaryFont: fonts.secondary,
                style: designStyle,
                pattern: pattern,
                border: border,
                layout: layout,
                designElements: designElements
            },
            logoUrl: this.getLogoUrl(organizationName),
            sealUrl: this.getSealUrl(organizationName),
            signatureUrls: this.getSignatureUrls(organizationName),
            backgroundUrl: backgroundUrl,
            officials: this.getOfficials(organizationName),
            language: this.getCertificateLanguage(certificateName, organizationName, industry)
        };
    }
    
    /**
     * Generate additional design elements based on pattern and border
     * @param {string} pattern - Design pattern
     * @param {string} border - Border style
     * @param {string} layout - Layout style
     * @returns {Object} - Design elements
     */
    generateDesignElements(pattern, border, layout) {
        const elements = {
            watermark: false,
            cornerIcons: false,
            ribbons: false,
            gradients: false,
            textures: false
        };
        
        // Add design elements based on pattern
        switch (pattern) {
            case 'geometric':
                elements.textures = 'geometric';
                elements.gradients = true;
                break;
            case 'waves':
                elements.textures = 'waves';
                elements.gradients = true;
                break;
            case 'minimal':
                elements.cornerIcons = true;
                break;
            case 'material':
                elements.shadows = true;
                elements.gradients = true;
                break;
            case 'tech':
                elements.textures = 'circuit';
                elements.watermark = true;
                break;
            case 'classic':
            case 'traditional':
                elements.watermark = true;
                elements.ribbons = true;
                break;
            case 'scholarly':
                elements.watermark = true;
                elements.ribbons = true;
                elements.cornerIcons = true;
                break;
            case 'artistic':
                elements.textures = 'artistic';
                elements.gradients = true;
                break;
        }
        
        // Add design elements based on border
        switch (border) {
            case 'ornate':
                elements.borderStyle = 'ornate';
                elements.cornerIcons = true;
                break;
            case 'rounded':
                elements.borderStyle = 'rounded';
                break;
            case 'double-line':
                elements.borderStyle = 'double-line';
                break;
            case 'thick-corners':
                elements.borderStyle = 'thick-corners';
                break;
            case 'gradient':
                elements.borderStyle = 'gradient';
                elements.gradients = true;
                break;
            case 'frame':
                elements.borderStyle = 'frame';
                elements.cornerIcons = true;
                break;
        }
        
        return elements;
    }
    
    /**
     * Get signature URLs based on organization
     * @param {string} organizationName - Name of the organization
     * @returns {Array} - Array of signature URLs
     */
    getSignatureUrls(organizationName) {
        const signatures = {
            'PrepInsta': [
                'https://www.pngkey.com/png/full/147-1472304_signature-png-transparent-background-signature-png.png',
                'https://www.pngkey.com/png/full/110-1102826_signature-png-transparent-image-transparent-background-signature-png.png'
            ],
            'Coursera': [
                'https://www.pngkey.com/png/full/115-1150342_signature-png-signature-png-for-certificate.png',
                'https://www.pngkey.com/png/full/361-3618744_signature-png-image-transparent-background-signature-png.png'
            ],
            'Google': [
                'https://www.pngkey.com/png/full/110-1102775_signature-png-transparent-background-ceo-signature-png.png',
                'https://www.pngkey.com/png/full/361-3618744_signature-png-image-transparent-background-signature-png.png'
            ],
            'Microsoft': [
                'https://www.pngkey.com/png/full/156-1568518_signature-png-image-bill-gates-signature-png.png',
                'https://www.pngkey.com/png/full/110-1102775_signature-png-transparent-background-ceo-signature-png.png'
            ]
        };
        
        // Return specific signatures if available
        if (signatures[organizationName]) {
            return signatures[organizationName];
        }
        
        // Default signatures
        return [
            'https://www.pngkey.com/png/full/147-1472304_signature-png-transparent-background-signature-png.png',
            'https://www.pngkey.com/png/full/110-1102826_signature-png-transparent-image-transparent-background-signature-png.png'
        ];
    }
    
    /**
     * Get officials for the certificate
     * @param {string} organizationName - Name of the organization
     * @returns {Array} - Array of officials
     */
    getOfficials(organizationName) {
        const knownOfficials = {
            'Google': [
                { name: 'Sundar Pichai', title: 'Chief Executive Officer' },
                { name: 'Kent Walker', title: 'President, Global Affairs' }
            ],
            'Microsoft': [
                { name: 'Satya Nadella', title: 'Chairman and Chief Executive Officer' },
                { name: 'Brad Smith', title: 'Vice Chair and President' }
            ],
            'AWS': [
                { name: 'Adam Selipsky', title: 'Chief Executive Officer, AWS' },
                { name: 'Matt Garman', title: 'Senior Vice President, AWS' }
            ],
            'IBM': [
                { name: 'Arvind Krishna', title: 'Chairman and Chief Executive Officer' },
                { name: 'Gary D. Cohn', title: 'Vice Chairman' }
            ],
            'Coursera': [
                { name: 'Jeff Maggioncalda', title: 'Chief Executive Officer' },
                { name: 'Betty Vandenbosch', title: 'Chief Content Officer' }
            ],
            'Udemy': [
                { name: 'Gregg Coccari', title: 'Chief Executive Officer' },
                { name: 'Llibert Argerich', title: 'Chief Marketing Officer' }
            ],
            'edX': [
                { name: 'Anant Agarwal', title: 'Founder and Chief Open Education Officer' },
                { name: 'Nina Huntemann', title: 'Chief Academic Officer' }
            ]
        };
        
        // Return known officials if available
        if (knownOfficials[organizationName]) {
            return knownOfficials[organizationName];
        }
        
        // Generate random officials
        return [
            {
                name: this.getRandomName(),
                title: 'Director of Certification'
            },
            {
                name: this.getRandomName(),
                title: 'Program Chair'
            }
        ];
    }
    
    /**
     * Get certificate language based on certificate name and organization
     * @param {string} certificateName - Name of the certificate
     * @param {string} organizationName - Name of the organization
     * @param {string} industry - Industry or category
     * @returns {string} - Certificate language
     */
    getCertificateLanguage(certificateName, organizationName, industry) {
        const languages = {
            'Google': `This is to certify that the recipient has successfully completed the ${certificateName} program, demonstrating proficiency in all required competencies as defined by Google.`,
            'Microsoft': `This certifies that the recipient has successfully completed the requirements for the ${certificateName} and is recognized by Microsoft as having demonstrated the skills and knowledge measured by this assessment.`,
            'AWS': `Amazon Web Services certifies that the recipient has demonstrated the knowledge and skills required to be recognized as an AWS ${certificateName.replace('AWS', '').trim()} professional.`,
            'IBM': `This certificate is awarded in recognition of the recipient's successful completion of the ${certificateName} program and demonstration of technical proficiency in accordance with IBM's standards.`,
            'Coursera': `This is to certify that the recipient has successfully completed all required coursework and assessments for the ${certificateName} on Coursera.`,
            'Udemy': `This certificate is presented to the recipient for successfully completing the ${certificateName} course on Udemy.`,
            'edX': `This is to certify that the recipient has successfully completed and received a passing grade in the ${certificateName} course.`,
            'PrepInsta': `This certificate is awarded to the recipient for successfully completing the ${certificateName} program with PrepInsta.`
        };
        
        // Return specific language if available
        if (languages[organizationName]) {
            return languages[organizationName];
        }
        
        // Generate language based on industry
        if (industry) {
            return `This is to certify that the recipient has successfully completed all requirements for the ${certificateName} as prescribed by the ${organizationName}, demonstrating expertise in the field of ${industry}.`;
        }
        
        // Default language
        return `This is to certify that the recipient has successfully completed all requirements for the ${certificateName} as prescribed by the ${organizationName}.`;
    }
    
    /**
     * Get a logo URL based on organization name
     * @param {string} organizationName - Name of the organization
     * @returns {string} - URL to logo image
     */
    getLogoUrl(organizationName) {
        const logos = {
            'PrepInsta': 'https://prepinsta.com/wp-content/uploads/2020/08/logo-1.webp',
            'Coursera': 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png',
            'Udemy': 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg',
            'edX': 'https://www.edx.org/images/logos/edx-logo-elm.svg',
            'Google': 'https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
            'Microsoft': 'https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31',
            'AWS': 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png',
            'IBM': 'https://www.ibm.com/brand/experience-guides/developer/8f4e3cc2b5d52354a6d43c8edba1e3c9/01_8-bar-positive.svg',
            'Oracle': 'https://www.oracle.com/a/ocom/img/oracle-logo.svg',
            'Salesforce': 'https://www.salesforce.com/content/dam/web/en_us/www/images/home/logo-salesforce.svg'
        };
        
        // Check if we have a predefined logo for this organization
        for (const [key, url] of Object.entries(logos)) {
            if (organizationName.includes(key)) {
                return url;
            }
        }
        
        // Return a generic certificate seal if no match
        return 'https://www.svgrepo.com/show/491978/medal.svg';
    }
    
    /**
     * Get a seal URL based on organization name
     * @param {string} organizationName - Name of the organization
     * @returns {string} - URL to seal image
     */
    getSealUrl(organizationName) {
        const seals = {
            'PrepInsta': 'https://www.svgrepo.com/show/491980/medal-2.svg',
            'Coursera': 'https://www.svgrepo.com/show/491979/medal-1.svg',
            'Udemy': 'https://www.svgrepo.com/show/491981/medal-3.svg',
            'edX': 'https://www.svgrepo.com/show/491982/medal-4.svg',
            'Google': 'https://www.svgrepo.com/show/491978/medal.svg',
            'Microsoft': 'https://www.svgrepo.com/show/491980/medal-2.svg',
            'AWS': 'https://www.svgrepo.com/show/491979/medal-1.svg',
            'IBM': 'https://www.svgrepo.com/show/491981/medal-3.svg',
            'Oracle': 'https://www.svgrepo.com/show/491982/medal-4.svg',
            'Salesforce': 'https://www.svgrepo.com/show/491978/medal.svg'
        };
        
        // Check if we have a predefined seal for this organization
        for (const [key, url] of Object.entries(seals)) {
            if (organizationName.includes(key)) {
                return url;
            }
        }
        
        // Return a generic certificate seal if no match
        return 'https://www.svgrepo.com/show/491978/medal.svg';
    }
    
    /**
     * Get a random name for officials
     * @returns {string} - Random name
     */
    getRandomName() {
        const firstNames = [
            'James', 'John', 'Robert', 'Michael', 'William', 
            'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth',
            'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
        ];
        
        const lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
            'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
}

// Export the web scraper service
const webScraperService = new WebScraperService(); 