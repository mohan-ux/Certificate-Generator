/**
 * Certificate Generator using Canvas.js
 */
class CertificateGenerator {
    constructor() {
        // Base canvas dimensions
        this.width = 1000;
        this.height = 700;
        
        // Background images preload
        this.backgroundImages = [];
        this.loadBackgroundImages();
        
        // Icon/decorative elements preload
        this.decorativeElements = [];
        this.loadDecorativeElements();
        
        // Signature images preload
        this.signatureImages = [];
        this.loadSignatureImages();
        
        // Cache for certificate resources
        this.resourcesCache = new Map();
    }

    /**
     * Load background images
     */
    loadBackgroundImages() {
        // URLs for certificate backgrounds (could be local or remote)
        const backgroundUrls = [
            'https://img.freepik.com/free-vector/certificate-template-with-luxury-golden-frame_1017-32298.jpg',
            'https://img.freepik.com/free-vector/elegant-certificate-template-with-frame_23-2147697211.jpg',
            'https://img.freepik.com/free-vector/certificate-template-with-luxury-golden-decoration_1017-32328.jpg',
            'https://img.freepik.com/free-vector/elegant-certificate-template_1017-17599.jpg',
            'https://img.freepik.com/free-vector/golden-certificate-appreciation-template_1017-32459.jpg'
        ];
        
        // Preload images
        backgroundUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = 'Anonymous'; // Handle CORS for remote images
            this.backgroundImages.push(img);
        });
    }

    /**
     * Load decorative elements
     */
    loadDecorativeElements() {
        // URLs for decorative elements (could be local or remote)
        const elementUrls = [
            'https://www.svgrepo.com/show/491978/medal.svg',
            'https://www.svgrepo.com/show/491979/medal-1.svg',
            'https://www.svgrepo.com/show/491980/medal-2.svg',
            'https://www.svgrepo.com/show/491981/medal-3.svg',
            'https://www.svgrepo.com/show/491982/medal-4.svg'
        ];
        
        // Preload images
        elementUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = 'Anonymous'; // Handle CORS for remote images
            this.decorativeElements.push(img);
        });
    }
    
    /**
     * Load signature images
     */
    loadSignatureImages() {
        // URLs for signature images (could be local or remote)
        const signatureUrls = [
            'https://www.pngkey.com/png/full/147-1472304_signature-png-transparent-background-signature-png.png',
            'https://www.pngkey.com/png/full/110-1102826_signature-png-transparent-image-transparent-background-signature-png.png',
            'https://www.pngkey.com/png/full/429-4290330_signature-png-transparent-signature-png.png',
            'https://www.pngkey.com/png/full/115-1150774_signature-png.png',
            'https://www.pngkey.com/png/full/361-3619213_ceo-signature-png-transparent-background-signature-png.png'
        ];
        
        // Preload images
        signatureUrls.forEach(url => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = 'Anonymous'; // Handle CORS for remote images
            this.signatureImages.push(img);
        });
    }

    /**
     * Load custom image from URL
     * @param {string} url - Image URL
     * @returns {Promise<HTMLImageElement>} - Promise resolving to loaded image
     */
    loadCustomImage(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('No URL provided'));
                return;
            }
            
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            
            img.src = url;
        });
    }

    /**
     * Generate certificates based on certificate name and designs
     * @param {Array} designs - Array of certificate design objects
     * @param {string} recipientName - Name of the certificate recipient
     * @param {string} certificateName - Name of the certificate (e.g., "PrepInsta Certificate")
     * @param {string} industry - Optional industry category
     * @returns {Promise<Array>} - Promise resolving to array of certificate objects with canvas and code
     */
    async generateCertificates(designs, recipientName = '[Recipient Name]', certificateName = '', industry = '') {
        // Create certificates array to store results
        const certificates = [];
        
        // Process each design
        for (let i = 0; i < designs.length; i++) {
            const design = designs[i];
            
            try {
                // Fetch certificate resources based on certificate name and industry
                // Use cached resources if available for this design
                const cacheKey = `${certificateName}-${industry}-${i}`;
                
                let resources;
                if (this.resourcesCache.has(cacheKey)) {
                    resources = this.resourcesCache.get(cacheKey);
                } else {
                    // Fetch resources from web scraper
                    resources = await webScraperService.fetchCertificateResources(
                        certificateName || design.title, 
                        industry
                    );
                    
                    // Cache the resources
                    this.resourcesCache.set(cacheKey, resources);
                }
                
                // Create canvas element
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                canvas.className = 'certificate-canvas';
                
                // Generate certificate on canvas using the resources
                const code = await this.renderCertificateWithResources(
                    canvas, 
                    design, 
                    i, 
                    recipientName,
                    resources
                );
                
                // Add to certificates array
                certificates.push({
                    canvas,
                    code,
                    design: {
                        ...design,
                        organization: resources.organization,
                        officials: resources.officials
                    }
                });
            } catch (error) {
                console.error('Error generating certificate:', error);
                
                // Create canvas element for fallback
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                canvas.className = 'certificate-canvas';
                
                // Generate fallback certificate
                const code = this.renderCertificate(canvas, design, i, recipientName);
                
                // Add to certificates array
                certificates.push({
                    canvas,
                    code,
                    design
                });
            }
        }
        
        return certificates;
    }

    /**
     * Render certificate on canvas with web-scraped resources
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} design - Certificate design object
     * @param {number} index - Design index
     * @param {string} recipientName - Name of the certificate recipient
     * @param {Object} resources - Certificate resources from web scraper
     * @returns {Promise<string>} - Promise resolving to Canvas.js code used to generate the certificate
     */
    async renderCertificateWithResources(canvas, design, index, recipientName, resources) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Extract design properties and merge with resources
        const title = resources.name || design.title;
        const description = resources.description || design.description;
        
        // Extract colors from resources or design
        const primaryColor = resources.design?.primaryColor || design.colors.split(',')[0].trim() || '#1a5276';
        const secondaryColor = resources.design?.secondaryColor || design.colors.split(',')[1]?.trim() || '#3498db';
        const accentColor = resources.design?.accentColor || design.colors.split(',')[2]?.trim() || '#f1c40f';
        
        // Extract fonts from resources or design
        const primaryFont = resources.design?.primaryFont || design.fonts.split(',')[0].trim() || 'Arial';
        const secondaryFont = resources.design?.secondaryFont || design.fonts.split(',')[1]?.trim() || 'Times New Roman';
        
        // Extract design style and pattern
        const designStyle = resources.design?.style || 'professional';
        const pattern = resources.design?.pattern || 'classic';
        const border = resources.design?.border || 'ornate';
        const layout = resources.design?.layout || 'traditional';
        const designElements = resources.design?.designElements || {};
        
        // Generate code string to display
        let codeString = '';
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        try {
            // Try to load custom background image from resources
            if (resources.backgroundUrl) {
                const backgroundImg = await this.loadCustomImage(resources.backgroundUrl).catch(() => null);
                if (backgroundImg) {
                    // Draw custom background
                    ctx.drawImage(backgroundImg, 0, 0, width, height);
                    codeString += `// Draw custom background\nctx.drawImage(backgroundImage, 0, 0, ${width}, ${height});\n`;
                } else {
                    // Fallback to default background
                    codeString += this.drawBackground(ctx, index, width, height);
                }
            } else {
                // Use default background
                codeString += this.drawBackground(ctx, index, width, height);
            }
        } catch (error) {
            console.error('Error loading background image:', error);
            // Fallback to default background
            codeString += this.drawBackground(ctx, index, width, height);
        }
        
        // Apply custom border based on border style
        if (border) {
            codeString += this.drawCustomBorder(ctx, primaryColor, secondaryColor, accentColor, width, height, border);
        } else {
            // Draw default border
            codeString += this.drawBorder(ctx, primaryColor, secondaryColor, width, height);
        }
        
        // Draw header with organization name if available
        const headerText = resources.organization || title;
        codeString += this.drawHeader(ctx, headerText, primaryFont, primaryColor, width);
        
        try {
            // Try to load logo if available
            if (resources.logoUrl) {
                const logoImg = await this.loadCustomImage(resources.logoUrl).catch(() => null);
                if (logoImg) {
                    // Adjust logo position based on layout
                    let logoWidth = 100;
                    let logoHeight = 100;
                    let logoX = width / 2 - logoWidth / 2;
                    let logoY = 30;
                    
                    // Adjust logo position based on layout
                    if (layout === 'centered') {
                        logoX = width / 2 - logoWidth / 2;
                        logoY = 30;
                    } else if (layout === 'horizontal') {
                        logoWidth = 80;
                        logoHeight = 80;
                        logoX = 50;
                        logoY = 50;
                    } else if (layout === 'asymmetric') {
                        logoWidth = 90;
                        logoHeight = 90;
                        logoX = width - logoWidth - 50;
                        logoY = 40;
                    } else if (layout === 'grid') {
                        logoWidth = 70;
                        logoHeight = 70;
                        logoX = 50;
                        logoY = 50;
                    } else if (layout === 'fluent') {
                        logoWidth = 110;
                        logoHeight = 60;
                        logoX = width / 2 - logoWidth / 2;
                        logoY = 40;
                    }
                    
                    ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                    codeString += `// Draw organization logo\nctx.drawImage(logoImage, ${logoX}, ${logoY}, ${logoWidth}, ${logoHeight});\n`;
                }
            }
        } catch (error) {
            console.error('Error loading logo:', error);
        }
        
        // Apply watermark if specified in design elements
        if (designElements?.watermark) {
            codeString += this.drawWatermark(ctx, headerText, width, height, primaryColor);
        }
        
        try {
            // Try to load seal if available
            if (resources.sealUrl) {
                const sealImg = await this.loadCustomImage(resources.sealUrl).catch(() => null);
                if (sealImg) {
                    // Adjust seal position based on layout
                    let sealWidth = 80;
                    let sealHeight = 80;
                    let sealX = 100;
                    let sealY = height - 150;
                    
                    // Adjust seal position based on layout
                    if (layout === 'centered') {
                        sealX = width / 2 - 150;
                        sealY = height - 150;
                    } else if (layout === 'horizontal') {
                        sealX = width - sealWidth - 100;
                        sealY = height - 150;
                    } else if (layout === 'asymmetric') {
                        sealX = 80;
                        sealY = height - 150;
                    } else if (layout === 'grid') {
                        sealWidth = 60;
                        sealHeight = 60;
                        sealX = width - sealWidth - 60;
                        sealY = 60;
                    }
                    
                    ctx.drawImage(sealImg, sealX, sealY, sealWidth, sealHeight);
                    codeString += `// Draw certificate seal\nctx.drawImage(sealImage, ${sealX}, ${sealY}, ${sealWidth}, ${sealHeight});\n`;
                } else {
                    // Fallback to drawing decorative elements
                    codeString += this.drawDecorativeElements(ctx, design.elements, index, width, height, accentColor);
                }
            } else {
                // Fallback to drawing decorative elements
                codeString += this.drawDecorativeElements(ctx, design.elements, index, width, height, accentColor);
            }
        } catch (error) {
            console.error('Error loading seal:', error);
            // Fallback to drawing decorative elements
            codeString += this.drawDecorativeElements(ctx, design.elements, index, width, height, accentColor);
        }
        
        // Add corner icons if specified in design elements
        if (designElements?.cornerIcons) {
            codeString += this.drawCornerIcons(ctx, primaryColor, secondaryColor, accentColor, width, height);
        }
        
        // Add ribbon if specified in design elements
        if (designElements?.ribbons) {
            codeString += this.drawRibbon(ctx, accentColor, width, height);
        }
        
        // Add texture if specified in design elements
        if (designElements?.textures) {
            codeString += this.drawTexture(ctx, designElements.textures, width, height, primaryColor, secondaryColor);
        }
        
        // Draw certificate content with recipient name and custom language if available
        const customLanguage = resources.language || '';
        
        // Adjust content positioning based on layout
        let contentYOffset = 0;
        if (layout === 'centered') {
            contentYOffset = 20;
        } else if (layout === 'horizontal') {
            contentYOffset = -30;
        } else if (layout === 'asymmetric') {
            contentYOffset = 40;
        } else if (layout === 'grid') {
            contentYOffset = -20;
        } else if (layout === 'fluent') {
            contentYOffset = 10;
        }
        
        codeString += this.drawContentWithCustomLanguage(
            ctx, 
            title, 
            primaryFont, 
            secondaryFont, 
            primaryColor, 
            secondaryColor, 
            width, 
            height + contentYOffset, 
            recipientName,
            customLanguage
        );
        
        // Draw signature lines with custom officials if available
        const officials = resources.officials || [
            { name: 'Dr. James Wilson', title: 'Director' },
            { name: 'Prof. Sarah Johnson', title: 'Program Chair' }
        ];
        
        try {
            // Try to load custom signatures if available
            let signatureImages = [];
            
            if (resources.signatureUrls && resources.signatureUrls.length > 0) {
                // Load custom signatures
                for (const url of resources.signatureUrls.slice(0, 2)) {
                    try {
                        const img = await this.loadCustomImage(url).catch(() => null);
                        if (img) {
                            signatureImages.push(img);
                        }
                    } catch (e) {
                        console.error('Error loading signature image:', e);
                    }
                }
            }
            
            // If we couldn't load custom signatures, use default ones
            if (signatureImages.length < 2) {
                const defaultSignatures = [
                    this.signatureImages[index % this.signatureImages.length],
                    this.signatureImages[(index + 1) % this.signatureImages.length]
                ];
                
                // Fill in any missing signatures
                while (signatureImages.length < 2) {
                    signatureImages.push(defaultSignatures[signatureImages.length]);
                }
            }
            
            // Draw signature lines with custom signatures and officials
            codeString += this.drawSignatureLinesWithCustom(
                ctx, 
                secondaryColor, 
                width, 
                height, 
                signatureImages,
                officials
            );
        } catch (error) {
            console.error('Error drawing signatures:', error);
            // Fallback to default signature lines
            codeString += this.drawSignatureLines(ctx, secondaryColor, width, height, index);
        }
        
        return codeString;
    }

    /**
     * Draw certificate content with custom language
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} title - Certificate title
     * @param {string} primaryFont - Primary font
     * @param {string} secondaryFont - Secondary font
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} recipientName - Name of the certificate recipient
     * @param {string} customLanguage - Custom certificate language
     * @returns {string} - Code used for content
     */
    drawContentWithCustomLanguage(ctx, title, primaryFont, secondaryFont, primaryColor, secondaryColor, width, height, recipientName, customLanguage) {
        // Certificate text
        ctx.textAlign = 'center';
        ctx.fillStyle = primaryColor;
        
        // This is to certify that (or custom intro)
        const introText = customLanguage ? 
            customLanguage.split(' ').slice(0, 5).join(' ') : 
            'This is to certify that';
            
        ctx.font = `italic 24px ${secondaryFont}`;
        ctx.fillText(introText, width / 2, 180);
        
        // Recipient name
        ctx.font = `bold 40px ${primaryFont}`;
        ctx.fillText(recipientName, width / 2, 250);
        
        // Has successfully completed (or custom middle text)
        const middleText = customLanguage ?
            customLanguage.split(' ').slice(5, 10).join(' ') :
            'has successfully completed';
            
        ctx.font = `24px ${secondaryFont}`;
        ctx.fillText(middleText, width / 2, 300);
        
        // Course/Achievement name
        ctx.font = `bold 32px ${primaryFont}`;
        ctx.fillStyle = secondaryColor;
        ctx.fillText(title.replace(/Certificate of|Certificate for|Certificate/i, '').trim() || '[Course Name]', width / 2, 350);
        
        // Additional text
        ctx.fillStyle = primaryColor;
        ctx.font = `18px ${secondaryFont}`;
        
        const additionalText = customLanguage ?
            customLanguage.split(' ').slice(10, 20).join(' ') :
            'with excellence and is awarded this certificate';
            
        ctx.fillText(additionalText, width / 2, 400);
        
        // Date
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        ctx.font = `20px ${secondaryFont}`;
        ctx.fillText(`Issued on: ${formattedDate}`, width / 2, 450);
        
        // Certificate ID
        ctx.font = `14px ${secondaryFont}`;
        const certId = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        ctx.fillText(`Certificate ID: ${certId}`, width / 2, height - 50);
        
        return `// Draw certificate content
ctx.textAlign = 'center';
ctx.fillStyle = '${primaryColor}';

// Introduction text
ctx.font = 'italic 24px ${secondaryFont}';
ctx.fillText('${introText}', ${width / 2}, 180);

// Recipient name
ctx.font = 'bold 40px ${primaryFont}';
ctx.fillText('${recipientName}', ${width / 2}, 250);

// Middle text
ctx.font = '24px ${secondaryFont}';
ctx.fillText('${middleText}', ${width / 2}, 300);

// Course/Achievement name
ctx.font = 'bold 32px ${primaryFont}';
ctx.fillStyle = '${secondaryColor}';
ctx.fillText('${title.replace(/Certificate of|Certificate for|Certificate/i, '').trim() || '[Course Name]'}', ${width / 2}, 350);

// Additional text
ctx.fillStyle = '${primaryColor}';
ctx.font = '18px ${secondaryFont}';
ctx.fillText('${additionalText}', ${width / 2}, 400);

// Date
ctx.font = '20px ${secondaryFont}';
ctx.fillText('Issued on: ${formattedDate}', ${width / 2}, 450);

// Certificate ID
ctx.font = '14px ${secondaryFont}';
ctx.fillText('Certificate ID: ${certId}', ${width / 2}, ${height - 50});\n`;
    }

    /**
     * Draw signature lines with custom signatures and officials
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Line color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Array<HTMLImageElement>} signatureImages - Array of signature images
     * @param {Array<Object>} officials - Array of official objects with name and title
     * @returns {string} - Code used for signature lines
     */
    drawSignatureLinesWithCustom(ctx, color, width, height, signatureImages, officials) {
        const lineY = height - 120;
        const lineWidth = 200;
        const textY = lineY + 30;
        
        // Left signature line
        ctx.beginPath();
        ctx.moveTo(width / 4 - lineWidth / 2, lineY);
        ctx.lineTo(width / 4 + lineWidth / 2, lineY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Right signature line
        ctx.beginPath();
        ctx.moveTo(width * 3 / 4 - lineWidth / 2, lineY);
        ctx.lineTo(width * 3 / 4 + lineWidth / 2, lineY);
        ctx.stroke();
        
        let code = `// Draw signature lines
ctx.beginPath();
ctx.moveTo(${width / 4 - lineWidth / 2}, ${lineY});
ctx.lineTo(${width / 4 + lineWidth / 2}, ${lineY});
ctx.strokeStyle = '${color}';
ctx.lineWidth = 1;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(${width * 3 / 4 - lineWidth / 2}, ${lineY});
ctx.lineTo(${width * 3 / 4 + lineWidth / 2}, ${lineY});
ctx.stroke();\n`;
        
        // Draw first signature if available
        if (signatureImages[0]) {
            try {
                const sigWidth = 100;
                const sigHeight = 50;
                const sigX = width / 4 - sigWidth / 2;
                const sigY = lineY - 40;
                
                ctx.drawImage(signatureImages[0], sigX, sigY, sigWidth, sigHeight);
                code += `// Draw first signature
ctx.drawImage(signature1, ${sigX}, ${sigY}, ${sigWidth}, ${sigHeight});\n`;
            } catch (e) {
                console.error('Error drawing first signature:', e);
            }
        }
        
        // Draw second signature if available
        if (signatureImages[1]) {
            try {
                const sigWidth = 100;
                const sigHeight = 50;
                const sigX = width * 3 / 4 - sigWidth / 2;
                const sigY = lineY - 40;
                
                ctx.drawImage(signatureImages[1], sigX, sigY, sigWidth, sigHeight);
                code += `// Draw second signature
ctx.drawImage(signature2, ${sigX}, ${sigY}, ${sigWidth}, ${sigHeight});\n`;
            } catch (e) {
                console.error('Error drawing second signature:', e);
            }
        }
        
        // Signature titles
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        
        // Get official names and titles
        const firstOfficial = officials[0] || { name: 'Dr. James Wilson', title: 'Director' };
        const secondOfficial = officials[1] || { name: 'Prof. Sarah Johnson', title: 'Program Chair' };
        
        ctx.fillText(firstOfficial.name, width / 4, textY);
        ctx.fillText(secondOfficial.name, width * 3 / 4, textY);
        
        ctx.font = '14px Arial';
        ctx.fillText(firstOfficial.title, width / 4, textY + 20);
        ctx.fillText(secondOfficial.title, width * 3 / 4, textY + 20);
        
        code += `// Draw signature texts
ctx.fillStyle = '${color}';
ctx.font = '16px Arial';
ctx.textAlign = 'center';
ctx.fillText('${firstOfficial.name}', ${width / 4}, ${textY});
ctx.fillText('${secondOfficial.name}', ${width * 3 / 4}, ${textY});

ctx.font = '14px Arial';
ctx.fillText('${firstOfficial.title}', ${width / 4}, ${textY + 20});
ctx.fillText('${secondOfficial.title}', ${width * 3 / 4}, ${textY + 20});\n`;
        
        return code;
    }

    /**
     * Render certificate on canvas
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Object} design - Certificate design object
     * @param {number} index - Design index
     * @param {string} recipientName - Name of the certificate recipient
     * @returns {string} - Canvas.js code used to generate the certificate
     */
    renderCertificate(canvas, design, index, recipientName) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Extract design properties
        const { title, description, colors, fonts, elements } = design;
        
        // Parse colors
        const colorArray = colors.split(',').map(c => c.trim());
        const primaryColor = colorArray[0] || '#1a5276';
        const secondaryColor = colorArray[1] || '#3498db';
        const accentColor = colorArray[2] || '#f1c40f';
        
        // Parse fonts
        const fontArray = fonts.split(',').map(f => f.trim());
        const primaryFont = fontArray[0] || 'Arial';
        const secondaryFont = fontArray[1] || 'Times New Roman';
        
        // Generate code string to display
        let codeString = '';
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        codeString += this.drawBackground(ctx, index, width, height);
        
        // Draw border
        codeString += this.drawBorder(ctx, primaryColor, secondaryColor, width, height);
        
        // Draw header
        codeString += this.drawHeader(ctx, title, primaryFont, primaryColor, width);
        
        // Draw decorative elements based on design
        codeString += this.drawDecorativeElements(ctx, elements, index, width, height, accentColor);
        
        // Draw certificate content with recipient name
        codeString += this.drawContent(ctx, design, primaryFont, secondaryFont, primaryColor, secondaryColor, width, height, recipientName);
        
        // Draw signature lines with actual signatures
        codeString += this.drawSignatureLines(ctx, secondaryColor, width, height, index);
        
        return codeString;
    }

    /**
     * Draw certificate background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} index - Design index
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {string} - Code used for background
     */
    drawBackground(ctx, index, width, height) {
        // Use background image if loaded, otherwise draw gradient
        const bgIndex = index % this.backgroundImages.length;
        const img = this.backgroundImages[bgIndex];
        
        let code = `// Draw background\n`;
        
        if (img && img.complete) {
            try {
                ctx.drawImage(img, 0, 0, width, height);
                code += `ctx.drawImage(backgroundImage, 0, 0, ${width}, ${height});\n`;
            } catch (e) {
                // Fallback to gradient if image fails
                this.drawGradientBackground(ctx, index, width, height);
                code += this.getGradientCode(index, width, height);
            }
        } else {
            // Fallback to gradient
            this.drawGradientBackground(ctx, index, width, height);
            code += this.getGradientCode(index, width, height);
        }
        
        return code;
    }

    /**
     * Draw gradient background
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} index - Design index
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    drawGradientBackground(ctx, index, width, height) {
        // Different gradient styles based on index
        const gradientStyles = [
            { start: '#f5f7fa', end: '#c3cfe2' }, // Light blue
            { start: '#e6e9f0', end: '#eef1f5' }, // Light gray
            { start: '#fff1eb', end: '#ace0f9' }, // Light orange to blue
            { start: '#f3e7e9', end: '#e3eeff' }, // Pink to blue
            { start: '#f5f7fa', end: '#b8c6db' }  // Light to dark blue
        ];
        
        const style = gradientStyles[index % gradientStyles.length];
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, style.start);
        gradient.addColorStop(1, style.end);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Get gradient background code
     * @param {number} index - Design index
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {string} - Code for gradient background
     */
    getGradientCode(index, width, height) {
        const gradientStyles = [
            { start: '#f5f7fa', end: '#c3cfe2' },
            { start: '#e6e9f0', end: '#eef1f5' },
            { start: '#fff1eb', end: '#ace0f9' },
            { start: '#f3e7e9', end: '#e3eeff' },
            { start: '#f5f7fa', end: '#b8c6db' }
        ];
        
        const style = gradientStyles[index % gradientStyles.length];
        
        return `const gradient = ctx.createLinearGradient(0, 0, ${width}, ${height});
gradient.addColorStop(0, '${style.start}');
gradient.addColorStop(1, '${style.end}');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, ${width}, ${height});\n`;
    }

    /**
     * Draw certificate border
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {string} - Code used for border
     */
    drawBorder(ctx, primaryColor, secondaryColor, width, height) {
        const borderWidth = 15;
        const margin = 20;
        
        // Outer border
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
        
        // Inner border
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(margin + borderWidth + 5, margin + borderWidth + 5, 
                      width - (margin + borderWidth + 5) * 2, height - (margin + borderWidth + 5) * 2);
        
        return `// Draw borders
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = ${borderWidth};
ctx.strokeRect(${margin}, ${margin}, ${width - margin * 2}, ${height - margin * 2});

ctx.strokeStyle = '${secondaryColor}';
ctx.lineWidth = 2;
ctx.strokeRect(${margin + borderWidth + 5}, ${margin + borderWidth + 5}, 
              ${width - (margin + borderWidth + 5) * 2}, ${height - (margin + borderWidth + 5) * 2});\n`;
    }

    /**
     * Draw certificate header
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} title - Certificate title
     * @param {string} font - Font family
     * @param {string} color - Text color
     * @param {number} width - Canvas width
     * @returns {string} - Code used for header
     */
    drawHeader(ctx, title, font, color, width) {
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.font = `bold 36px ${font}`;
        ctx.fillText(title, width / 2, 120);
        
        return `// Draw header
ctx.textAlign = 'center';
ctx.fillStyle = '${color}';
ctx.font = 'bold 36px ${font}';
ctx.fillText('${title}', ${width / 2}, 120);\n`;
    }

    /**
     * Draw decorative elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} elements - Elements description
     * @param {number} index - Design index
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} accentColor - Accent color
     * @returns {string} - Code used for decorative elements
     */
    drawDecorativeElements(ctx, elements, index, width, height, accentColor) {
        let code = `// Draw decorative elements\n`;
        
        // Draw decorative element from preloaded images
        const elementIndex = index % this.decorativeElements.length;
        const img = this.decorativeElements[elementIndex];
        
        if (img && img.complete) {
            try {
                // Draw at top center
                const imgWidth = 80;
                const imgHeight = 80;
                ctx.drawImage(img, width / 2 - imgWidth / 2, 30, imgWidth, imgHeight);
                code += `ctx.drawImage(decorativeElement, ${width / 2 - imgWidth / 2}, 30, ${imgWidth}, ${imgHeight});\n`;
            } catch (e) {
                // Fallback to drawing a seal
                this.drawSeal(ctx, width / 2, 200, 50, accentColor);
                code += this.getSealCode(width / 2, 200, 50, accentColor);
            }
        } else {
            // Fallback to drawing a seal
            this.drawSeal(ctx, width / 2, 200, 50, accentColor);
            code += this.getSealCode(width / 2, 200, 50, accentColor);
        }
        
        // Draw corner ornaments
        this.drawCornerOrnament(ctx, 50, 50, accentColor);
        this.drawCornerOrnament(ctx, width - 50, 50, accentColor);
        this.drawCornerOrnament(ctx, 50, height - 50, accentColor);
        this.drawCornerOrnament(ctx, width - 50, height - 50, accentColor);
        
        code += `// Draw corner ornaments
this.drawCornerOrnament(ctx, 50, 50, '${accentColor}');
this.drawCornerOrnament(ctx, ${width - 50}, 50, '${accentColor}');
this.drawCornerOrnament(ctx, 50, ${height - 50}, '${accentColor}');
this.drawCornerOrnament(ctx, ${width - 50}, ${height - 50}, '${accentColor}');\n`;
        
        return code;
    }

    /**
     * Draw a decorative seal
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Seal radius
     * @param {string} color - Seal color
     */
    drawSeal(ctx, x, y, radius, color) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rays
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2) * (i / 16);
            const innerRadius = radius * 0.8;
            const outerRadius = radius * 0.95;
            
            ctx.beginPath();
            ctx.moveTo(
                x + innerRadius * Math.cos(angle),
                y + innerRadius * Math.sin(angle)
            );
            ctx.lineTo(
                x + outerRadius * Math.cos(angle),
                y + outerRadius * Math.sin(angle)
            );
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Get seal drawing code
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Seal radius
     * @param {string} color - Seal color
     * @returns {string} - Code for drawing seal
     */
    getSealCode(x, y, radius, color) {
        return `// Draw seal
ctx.save();
ctx.beginPath();
ctx.arc(${x}, ${y}, ${radius}, 0, Math.PI * 2);
ctx.strokeStyle = '${color}';
ctx.lineWidth = 3;
ctx.stroke();

// Inner circle
ctx.beginPath();
ctx.arc(${x}, ${y}, ${radius * 0.8}, 0, Math.PI * 2);
ctx.stroke();

// Rays
for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2) * (i / 16);
    const innerRadius = ${radius * 0.8};
    const outerRadius = ${radius * 0.95};
    
    ctx.beginPath();
    ctx.moveTo(
        ${x} + innerRadius * Math.cos(angle),
        ${y} + innerRadius * Math.sin(angle)
    );
    ctx.lineTo(
        ${x} + outerRadius * Math.cos(angle),
        ${y} + outerRadius * Math.sin(angle)
    );
    ctx.stroke();
}
ctx.restore();\n`;
    }

    /**
     * Draw corner ornament
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Ornament color
     */
    drawCornerOrnament(ctx, x, y, color) {
        const size = 20;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner diamond
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
        
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw certificate content
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} design - Certificate design
     * @param {string} primaryFont - Primary font
     * @param {string} secondaryFont - Secondary font
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} recipientName - Name of the certificate recipient
     * @returns {string} - Code used for content
     */
    drawContent(ctx, design, primaryFont, secondaryFont, primaryColor, secondaryColor, width, height, recipientName) {
        const title = design.title;
        
        // Certificate text
        ctx.textAlign = 'center';
        ctx.fillStyle = primaryColor;
        
        // This is to certify that
        ctx.font = `italic 24px ${secondaryFont}`;
        ctx.fillText('This is to certify that', width / 2, 180);
        
        // Recipient name
        ctx.font = `bold 40px ${primaryFont}`;
        ctx.fillText(recipientName, width / 2, 250);
        
        // Has successfully completed
        ctx.font = `24px ${secondaryFont}`;
        ctx.fillText('has successfully completed', width / 2, 300);
        
        // Course/Achievement name
        ctx.font = `bold 32px ${primaryFont}`;
        ctx.fillStyle = secondaryColor;
        ctx.fillText(title.replace(/Certificate of|Certificate for|Certificate/i, '').trim() || '[Course Name]', width / 2, 350);
        
        // Additional text
        ctx.fillStyle = primaryColor;
        ctx.font = `18px ${secondaryFont}`;
        ctx.fillText('with excellence and is awarded this certificate', width / 2, 400);
        
        // Date
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        ctx.font = `20px ${secondaryFont}`;
        ctx.fillText(`Issued on: ${formattedDate}`, width / 2, 450);
        
        // Certificate ID
        ctx.font = `14px ${secondaryFont}`;
        const certId = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        ctx.fillText(`Certificate ID: ${certId}`, width / 2, height - 50);
        
        return `// Draw certificate content
ctx.textAlign = 'center';
ctx.fillStyle = '${primaryColor}';

// This is to certify that
ctx.font = 'italic 24px ${secondaryFont}';
ctx.fillText('This is to certify that', ${width / 2}, 180);

// Recipient name
ctx.font = 'bold 40px ${primaryFont}';
ctx.fillText('${recipientName}', ${width / 2}, 250);

// Has successfully completed
ctx.font = '24px ${secondaryFont}';
ctx.fillText('has successfully completed', ${width / 2}, 300);

// Course/Achievement name
ctx.font = 'bold 32px ${primaryFont}';
ctx.fillStyle = '${secondaryColor}';
ctx.fillText('${title.replace(/Certificate of|Certificate for|Certificate/i, '').trim() || '[Course Name]'}', ${width / 2}, 350);

// Additional text
ctx.fillStyle = '${primaryColor}';
ctx.font = '18px ${secondaryFont}';
ctx.fillText('with excellence and is awarded this certificate', ${width / 2}, 400);

// Date
ctx.font = '20px ${secondaryFont}';
ctx.fillText('Issued on: ${formattedDate}', ${width / 2}, 450);

// Certificate ID
ctx.font = '14px ${secondaryFont}';
ctx.fillText('Certificate ID: ${certId}', ${width / 2}, ${height - 50});\n`;
    }

    /**
     * Draw signature lines
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Line color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} index - Design index
     * @returns {string} - Code used for signature lines
     */
    drawSignatureLines(ctx, color, width, height, index) {
        const lineY = height - 120;
        const lineWidth = 200;
        const textY = lineY + 30;
        
        // Left signature line
        ctx.beginPath();
        ctx.moveTo(width / 4 - lineWidth / 2, lineY);
        ctx.lineTo(width / 4 + lineWidth / 2, lineY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Right signature line
        ctx.beginPath();
        ctx.moveTo(width * 3 / 4 - lineWidth / 2, lineY);
        ctx.lineTo(width * 3 / 4 + lineWidth / 2, lineY);
        ctx.stroke();
        
        // Draw signatures if available
        const signatureIndex1 = index % this.signatureImages.length;
        const signatureIndex2 = (index + 1) % this.signatureImages.length;
        
        const sig1 = this.signatureImages[signatureIndex1];
        const sig2 = this.signatureImages[signatureIndex2];
        
        let code = `// Draw signature lines
ctx.beginPath();
ctx.moveTo(${width / 4 - lineWidth / 2}, ${lineY});
ctx.lineTo(${width / 4 + lineWidth / 2}, ${lineY});
ctx.strokeStyle = '${color}';
ctx.lineWidth = 1;
ctx.stroke();

ctx.beginPath();
ctx.moveTo(${width * 3 / 4 - lineWidth / 2}, ${lineY});
ctx.lineTo(${width * 3 / 4 + lineWidth / 2}, ${lineY});
ctx.stroke();\n`;
        
        // Draw instructor signature
        if (sig1 && sig1.complete) {
            try {
                const sigWidth = 100;
                const sigHeight = 50;
                const sigX = width / 4 - sigWidth / 2;
                const sigY = lineY - 40;
                
                ctx.drawImage(sig1, sigX, sigY, sigWidth, sigHeight);
                code += `// Draw instructor signature
ctx.drawImage(instructorSignature, ${sigX}, ${sigY}, ${sigWidth}, ${sigHeight});\n`;
            } catch (e) {
                console.error('Error drawing instructor signature:', e);
            }
        }
        
        // Draw director signature
        if (sig2 && sig2.complete) {
            try {
                const sigWidth = 100;
                const sigHeight = 50;
                const sigX = width * 3 / 4 - sigWidth / 2;
                const sigY = lineY - 40;
                
                ctx.drawImage(sig2, sigX, sigY, sigWidth, sigHeight);
                code += `// Draw director signature
ctx.drawImage(directorSignature, ${sigX}, ${sigY}, ${sigWidth}, ${sigHeight});\n`;
            } catch (e) {
                console.error('Error drawing director signature:', e);
            }
        }
        
        // Signature titles
        ctx.fillStyle = color;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        
        // Get random instructor name
        const instructors = [
            'Dr. James Wilson',
            'Prof. Sarah Johnson',
            'Dr. Michael Chen',
            'Prof. Emily Rodriguez',
            'Dr. Robert Taylor'
        ];
        
        // Get random director name
        const directors = [
            'Dr. Jennifer Adams',
            'Prof. David Miller',
            'Dr. Lisa Wang',
            'Prof. Thomas Brown',
            'Dr. Patricia Garcia'
        ];
        
        const instructor = instructors[index % instructors.length];
        const director = directors[index % directors.length];
        
        ctx.fillText(instructor, width / 4, textY);
        ctx.fillText(director, width * 3 / 4, textY);
        
        ctx.font = '14px Arial';
        ctx.fillText('Instructor', width / 4, textY + 20);
        ctx.fillText('Director', width * 3 / 4, textY + 20);
        
        code += `// Draw signature texts
ctx.fillStyle = '${color}';
ctx.font = '16px Arial';
ctx.textAlign = 'center';
ctx.fillText('${instructor}', ${width / 4}, ${textY});
ctx.fillText('${director}', ${width * 3 / 4}, ${textY});

ctx.font = '14px Arial';
ctx.fillText('Instructor', ${width / 4}, ${textY + 20});
ctx.fillText('Director', ${width * 3 / 4}, ${textY + 20});\n`;
        
        return code;
    }

    /**
     * Draw a custom border based on the border style
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @param {string} accentColor - Accent color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} borderStyle - Border style
     * @returns {string} - Code used for border
     */
    drawCustomBorder(ctx, primaryColor, secondaryColor, accentColor, width, height, borderStyle) {
        const padding = 20;
        let codeString = '';
        
        switch (borderStyle) {
            case 'ornate':
                // Draw ornate border with decorative corners
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 3;
                ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
                
                // Inner border
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(padding + 5, padding + 5, width - 2 * (padding + 5), height - 2 * (padding + 5));
                
                // Draw ornate corners
                this.drawCornerOrnament(ctx, padding, padding, accentColor);
                this.drawCornerOrnament(ctx, width - padding, padding, accentColor);
                this.drawCornerOrnament(ctx, padding, height - padding, accentColor);
                this.drawCornerOrnament(ctx, width - padding, height - padding, accentColor);
                
                codeString = `// Draw ornate border
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 3;
ctx.strokeRect(${padding}, ${padding}, ${width - 2 * padding}, ${height - 2 * padding});

// Inner border
ctx.strokeStyle = '${secondaryColor}';
ctx.lineWidth = 1;
ctx.strokeRect(${padding + 5}, ${padding + 5}, ${width - 2 * (padding + 5)}, ${height - 2 * (padding + 5)});

// Draw ornate corners
${this.getCornerOrnamentCode(padding, padding, accentColor)}
${this.getCornerOrnamentCode(width - padding, padding, accentColor)}
${this.getCornerOrnamentCode(padding, height - padding, accentColor)}
${this.getCornerOrnamentCode(width - padding, height - padding, accentColor)}\n`;
                break;
                
            case 'rounded':
                // Draw rounded border
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(padding, padding, width - 2 * padding, height - 2 * padding, 20);
                ctx.stroke();
                
                // Inner rounded border
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(padding + 5, padding + 5, width - 2 * (padding + 5), height - 2 * (padding + 5), 15);
                ctx.stroke();
                
                codeString = `// Draw rounded border
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.roundRect(${padding}, ${padding}, ${width - 2 * padding}, ${height - 2 * padding}, 20);
ctx.stroke();

// Inner rounded border
ctx.strokeStyle = '${secondaryColor}';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.roundRect(${padding + 5}, ${padding + 5}, ${width - 2 * (padding + 5)}, ${height - 2 * (padding + 5)}, 15);
ctx.stroke();\n`;
                break;
                
            case 'double-line':
                // Draw double-line border
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
                
                // Inner border with larger gap
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(padding + 10, padding + 10, width - 2 * (padding + 10), height - 2 * (padding + 10));
                
                codeString = `// Draw double-line border
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 2;
ctx.strokeRect(${padding}, ${padding}, ${width - 2 * padding}, ${height - 2 * padding});

// Inner border with larger gap
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 2;
ctx.strokeRect(${padding + 10}, ${padding + 10}, ${width - 2 * (padding + 10)}, ${height - 2 * (padding + 10)});\n`;
                break;
                
            case 'thick-corners':
                // Draw border with thick corners
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
                
                // Draw thick corners
                const cornerSize = 40;
                ctx.lineWidth = 5;
                
                // Top-left corner
                ctx.beginPath();
                ctx.moveTo(padding, padding + cornerSize);
                ctx.lineTo(padding, padding);
                ctx.lineTo(padding + cornerSize, padding);
                ctx.stroke();
                
                // Top-right corner
                ctx.beginPath();
                ctx.moveTo(width - padding - cornerSize, padding);
                ctx.lineTo(width - padding, padding);
                ctx.lineTo(width - padding, padding + cornerSize);
                ctx.stroke();
                
                // Bottom-left corner
                ctx.beginPath();
                ctx.moveTo(padding, height - padding - cornerSize);
                ctx.lineTo(padding, height - padding);
                ctx.lineTo(padding + cornerSize, height - padding);
                ctx.stroke();
                
                // Bottom-right corner
                ctx.beginPath();
                ctx.moveTo(width - padding - cornerSize, height - padding);
                ctx.lineTo(width - padding, height - padding);
                ctx.lineTo(width - padding, height - padding - cornerSize);
                ctx.stroke();
                
                codeString = `// Draw border with thick corners
ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 1;
ctx.strokeRect(${padding}, ${padding}, ${width - 2 * padding}, ${height - 2 * padding});

// Draw thick corners
const cornerSize = 40;
ctx.lineWidth = 5;

// Top-left corner
ctx.beginPath();
ctx.moveTo(${padding}, ${padding + cornerSize});
ctx.lineTo(${padding}, ${padding});
ctx.lineTo(${padding + cornerSize}, ${padding});
ctx.stroke();

// Top-right corner
ctx.beginPath();
ctx.moveTo(${width - padding - cornerSize}, ${padding});
ctx.lineTo(${width - padding}, ${padding});
ctx.lineTo(${width - padding}, ${padding + cornerSize});
ctx.stroke();

// Bottom-left corner
ctx.beginPath();
ctx.moveTo(${padding}, ${height - padding - cornerSize});
ctx.lineTo(${padding}, ${height - padding});
ctx.lineTo(${padding + cornerSize}, ${height - padding});
ctx.stroke();

// Bottom-right corner
ctx.beginPath();
ctx.moveTo(${width - padding - cornerSize}, ${height - padding});
ctx.lineTo(${width - padding}, ${height - padding});
ctx.lineTo(${width - padding}, ${height - padding - cornerSize});
ctx.stroke();\n`;
                break;
                
            case 'gradient':
                // Draw gradient border
                const gradient = ctx.createLinearGradient(0, 0, width, height);
                gradient.addColorStop(0, primaryColor);
                gradient.addColorStop(0.5, secondaryColor);
                gradient.addColorStop(1, accentColor);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 8;
                ctx.strokeRect(padding, padding, width - 2 * padding, height - 2 * padding);
                
                codeString = `// Draw gradient border
const gradient = ctx.createLinearGradient(0, 0, ${width}, ${height});
gradient.addColorStop(0, '${primaryColor}');
gradient.addColorStop(0.5, '${secondaryColor}');
gradient.addColorStop(1, '${accentColor}');

ctx.strokeStyle = gradient;
ctx.lineWidth = 8;
ctx.strokeRect(${padding}, ${padding}, ${width - 2 * padding}, ${height - 2 * padding});\n`;
                break;
                
            case 'frame':
                // Draw frame-style border
                ctx.fillStyle = primaryColor;
                ctx.fillRect(0, 0, width, padding);
                ctx.fillRect(0, 0, padding, height);
                ctx.fillRect(width - padding, 0, padding, height);
                ctx.fillRect(0, height - padding, width, padding);
                
                // Inner line
                ctx.strokeStyle = accentColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(padding + 5, padding + 5, width - 2 * (padding + 5), height - 2 * (padding + 5));
                
                codeString = `// Draw frame-style border
ctx.fillStyle = '${primaryColor}';
ctx.fillRect(0, 0, ${width}, ${padding});
ctx.fillRect(0, 0, ${padding}, ${height});
ctx.fillRect(${width - padding}, 0, ${padding}, ${height});
ctx.fillRect(0, ${height - padding}, ${width}, ${padding});

// Inner line
ctx.strokeStyle = '${accentColor}';
ctx.lineWidth = 2;
ctx.strokeRect(${padding + 5}, ${padding + 5}, ${width - 2 * (padding + 5)}, ${height - 2 * (padding + 5)});\n`;
                break;
                
            default:
                // Default to standard border
                return this.drawBorder(ctx, primaryColor, secondaryColor, width, height);
        }
        
        return codeString;
    }
    
    /**
     * Draw watermark on certificate
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} text - Watermark text
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} color - Watermark color
     * @returns {string} - Code used for watermark
     */
    drawWatermark(ctx, text, width, height, color) {
        // Save context
        ctx.save();
        
        // Configure watermark
        ctx.globalAlpha = 0.05;
        ctx.font = '80px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Rotate and draw watermark
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(text, 0, 0);
        
        // Restore context
        ctx.restore();
        
        return `// Draw watermark
ctx.save();
ctx.globalAlpha = 0.05;
ctx.font = '80px Arial';
ctx.fillStyle = '${color}';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.translate(${width / 2}, ${height / 2});
ctx.rotate(-Math.PI / 6);
ctx.fillText('${text}', 0, 0);
ctx.restore();\n`;
    }
    
    /**
     * Draw corner icons
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @param {string} accentColor - Accent color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {string} - Code used for corner icons
     */
    drawCornerIcons(ctx, primaryColor, secondaryColor, accentColor, width, height) {
        const size = 30;
        const padding = 30;
        let codeString = '// Draw corner icons\n';
        
        // Top-left icon
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding + size, padding);
        ctx.lineTo(padding, padding + size);
        ctx.closePath();
        ctx.fill();
        
        codeString += `ctx.fillStyle = '${primaryColor}';
ctx.beginPath();
ctx.moveTo(${padding}, ${padding});
ctx.lineTo(${padding + size}, ${padding});
ctx.lineTo(${padding}, ${padding + size});
ctx.closePath();
ctx.fill();\n`;
        
        // Top-right icon
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(width - padding, padding, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        codeString += `ctx.fillStyle = '${secondaryColor}';
ctx.beginPath();
ctx.arc(${width - padding}, ${padding}, ${size / 2}, 0, Math.PI * 2);
ctx.fill();\n`;
        
        // Bottom-left icon
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(padding - size / 2, height - padding - size / 2, size, size);
        
        codeString += `ctx.fillStyle = '${secondaryColor}';
ctx.fillRect(${padding - size / 2}, ${height - padding - size / 2}, ${size}, ${size});\n`;
        
        // Bottom-right icon
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(width - padding, height - padding);
        ctx.lineTo(width - padding - size, height - padding);
        ctx.lineTo(width - padding, height - padding - size);
        ctx.closePath();
        ctx.fill();
        
        codeString += `ctx.fillStyle = '${accentColor}';
ctx.beginPath();
ctx.moveTo(${width - padding}, ${height - padding});
ctx.lineTo(${width - padding - size}, ${height - padding});
ctx.lineTo(${width - padding}, ${height - padding - size});
ctx.closePath();
ctx.fill();\n`;
        
        return codeString;
    }
    
    /**
     * Draw ribbon
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Ribbon color
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {string} - Code used for ribbon
     */
    drawRibbon(ctx, color, width, height) {
        // Save context
        ctx.save();
        
        // Configure ribbon
        ctx.fillStyle = color;
        
        // Draw ribbon
        ctx.beginPath();
        ctx.moveTo(width / 2 - 100, 0);
        ctx.lineTo(width / 2 + 100, 0);
        ctx.lineTo(width / 2 + 70, 70);
        ctx.lineTo(width / 2, 50);
        ctx.lineTo(width / 2 - 70, 70);
        ctx.closePath();
        ctx.fill();
        
        // Restore context
        ctx.restore();
        
        return `// Draw ribbon
ctx.save();
ctx.fillStyle = '${color}';
ctx.beginPath();
ctx.moveTo(${width / 2 - 100}, 0);
ctx.lineTo(${width / 2 + 100}, 0);
ctx.lineTo(${width / 2 + 70}, 70);
ctx.lineTo(${width / 2}, 50);
ctx.lineTo(${width / 2 - 70}, 70);
ctx.closePath();
ctx.fill();
ctx.restore();\n`;
    }
    
    /**
     * Draw texture
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} textureType - Type of texture
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} primaryColor - Primary color
     * @param {string} secondaryColor - Secondary color
     * @returns {string} - Code used for texture
     */
    drawTexture(ctx, textureType, width, height, primaryColor, secondaryColor) {
        // Save context
        ctx.save();
        
        // Set global alpha for subtle texture
        ctx.globalAlpha = 0.05;
        
        let codeString = `// Draw ${textureType} texture\nctx.save();\nctx.globalAlpha = 0.05;\n`;
        
        switch (textureType) {
            case 'geometric':
                // Draw geometric pattern
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 1;
                
                // Draw grid of small squares
                const gridSize = 30;
                for (let x = 40; x < width - 40; x += gridSize) {
                    for (let y = 40; y < height - 40; y += gridSize) {
                        if ((x + y) % (gridSize * 2) === 0) {
                            ctx.strokeRect(x, y, gridSize / 2, gridSize / 2);
                        }
                    }
                }
                
                codeString += `ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 1;
const gridSize = 30;
for (let x = 40; x < ${width - 40}; x += gridSize) {
    for (let y = 40; y < ${height - 40}; y += gridSize) {
        if ((x + y) % (gridSize * 2) === 0) {
            ctx.strokeRect(x, y, gridSize / 2, gridSize / 2);
        }
    }
}\n`;
                break;
                
            case 'waves':
                // Draw wave pattern
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 1;
                
                // Draw wavy lines
                const waveHeight = 10;
                const waveLength = 20;
                
                for (let y = 50; y < height - 50; y += 50) {
                    ctx.beginPath();
                    for (let x = 40; x < width - 40; x += 5) {
                        const offset = Math.sin((x / waveLength) * Math.PI) * waveHeight;
                        if (x === 40) {
                            ctx.moveTo(x, y + offset);
                        } else {
                            ctx.lineTo(x, y + offset);
                        }
                    }
                    ctx.stroke();
                }
                
                codeString += `ctx.strokeStyle = '${secondaryColor}';
ctx.lineWidth = 1;
const waveHeight = 10;
const waveLength = 20;
for (let y = 50; y < ${height - 50}; y += 50) {
    ctx.beginPath();
    for (let x = 40; x < ${width - 40}; x += 5) {
        const offset = Math.sin((x / waveLength) * Math.PI) * waveHeight;
        if (x === 40) {
            ctx.moveTo(x, y + offset);
        } else {
            ctx.lineTo(x, y + offset);
        }
    }
    ctx.stroke();
}\n`;
                break;
                
            case 'circuit':
                // Draw circuit pattern
                ctx.strokeStyle = primaryColor;
                ctx.lineWidth = 1;
                
                // Draw circuit lines
                const spacing = 60;
                for (let i = 0; i < width; i += spacing) {
                    // Horizontal lines
                    if (i % (spacing * 2) === 0) {
                        ctx.beginPath();
                        ctx.moveTo(40, i + 40);
                        ctx.lineTo(width - 40, i + 40);
                        ctx.stroke();
                        
                        // Add circuit nodes
                        for (let j = 80; j < width - 80; j += spacing) {
                            ctx.beginPath();
                            ctx.arc(j, i + 40, 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    
                    // Vertical lines
                    if (i % (spacing * 3) === 0) {
                        ctx.beginPath();
                        ctx.moveTo(i + 40, 40);
                        ctx.lineTo(i + 40, height - 40);
                        ctx.stroke();
                        
                        // Add circuit nodes
                        for (let j = 80; j < height - 80; j += spacing) {
                            ctx.beginPath();
                            ctx.arc(i + 40, j, 3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                
                codeString += `ctx.strokeStyle = '${primaryColor}';
ctx.lineWidth = 1;
const spacing = 60;
for (let i = 0; i < ${width}; i += spacing) {
    // Horizontal lines
    if (i % (spacing * 2) === 0) {
        ctx.beginPath();
        ctx.moveTo(40, i + 40);
        ctx.lineTo(${width - 40}, i + 40);
        ctx.stroke();
        
        // Add circuit nodes
        for (let j = 80; j < ${width - 80}; j += spacing) {
            ctx.beginPath();
            ctx.arc(j, i + 40, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Vertical lines
    if (i % (spacing * 3) === 0) {
        ctx.beginPath();
        ctx.moveTo(i + 40, 40);
        ctx.lineTo(i + 40, ${height - 40});
        ctx.stroke();
        
        // Add circuit nodes
        for (let j = 80; j < ${height - 80}; j += spacing) {
            ctx.beginPath();
            ctx.arc(i + 40, j, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}\n`;
                break;
                
            case 'artistic':
                // Draw artistic pattern
                ctx.strokeStyle = secondaryColor;
                ctx.lineWidth = 1;
                
                // Draw swirls
                for (let i = 0; i < 5; i++) {
                    const centerX = 40 + Math.random() * (width - 80);
                    const centerY = 40 + Math.random() * (height - 80);
                    const radius = 20 + Math.random() * 30;
                    
                    ctx.beginPath();
                    for (let angle = 0; angle < Math.PI * 10; angle += 0.1) {
                        const x = centerX + (angle * 2) * Math.cos(angle) * (radius / 50);
                        const y = centerY + (angle * 2) * Math.sin(angle) * (radius / 50);
                        
                        if (angle === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();
                }
                
                codeString += `ctx.strokeStyle = '${secondaryColor}';
ctx.lineWidth = 1;
// Draw swirls (note: random positions will differ in code vs. actual rendering)
for (let i = 0; i < 5; i++) {
    const centerX = 40 + Math.random() * (${width - 80});
    const centerY = 40 + Math.random() * (${height - 80});
    const radius = 20 + Math.random() * 30;
    
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 10; angle += 0.1) {
        const x = centerX + (angle * 2) * Math.cos(angle) * (radius / 50);
        const y = centerY + (angle * 2) * Math.sin(angle) * (radius / 50);
        
        if (angle === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}\n`;
                break;
                
            default:
                // No texture
                ctx.restore();
                return '';
        }
        
        // Restore context
        ctx.restore();
        
        codeString += 'ctx.restore();\n';
        return codeString;
    }
    
    /**
     * Get code for corner ornament
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Ornament color
     * @returns {string} - Code for corner ornament
     */
    getCornerOrnamentCode(x, y, color) {
        return `// Draw corner ornament
ctx.save();
ctx.translate(${x}, ${y});
ctx.fillStyle = '${color}';
ctx.beginPath();
ctx.arc(0, 0, 10, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.moveTo(0, -15);
ctx.lineTo(15, 0);
ctx.lineTo(0, 15);
ctx.lineTo(-15, 0);
ctx.closePath();
ctx.stroke();
ctx.restore();\n`;
    }
}

// Export the certificate generator
const certificateGenerator = new CertificateGenerator(); 