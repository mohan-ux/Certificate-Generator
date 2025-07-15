/**
 * Main application script
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const categoryInput = document.getElementById('category-name');
    const industryInput = document.getElementById('industry-name');
    const recipientInput = document.getElementById('recipient-name');
    const generateBtn = document.getElementById('generate-btn');
    const loadingElement = document.getElementById('loading');
    const certificatesContainer = document.getElementById('certificates-container');
    
    // Event listeners
    generateBtn.addEventListener('click', handleGenerateCertificates);
    
    /**
     * Handle certificate generation
     */
    async function handleGenerateCertificates() {
        const categoryName = categoryInput.value.trim();
        const industryName = industryInput.value.trim();
        const recipientName = recipientInput.value.trim() || '[Recipient Name]';
        
        if (!categoryName) {
            alert('Please enter a certificate category name');
            return;
        }
        
        // Show loading state
        loadingElement.style.display = 'flex';
        certificatesContainer.innerHTML = '';
        
        try {
            // Generate certificate designs using Gemini
            const designs = await geminiService.generateCertificateDesigns(categoryName);
            
            // Generate certificates using Canvas with certificate name and industry
            const certificates = await certificateGenerator.generateCertificates(
                designs, 
                recipientName,
                categoryName,
                industryName
            );
            
            // Display certificates
            displayCertificates(certificates);
        } catch (error) {
            console.error('Error generating certificates:', error);
            alert('An error occurred while generating certificates. Please try again.');
        } finally {
            // Hide loading state
            loadingElement.style.display = 'none';
        }
    }
    
    /**
     * Display certificates in the UI
     * @param {Array} certificates - Array of certificate objects
     */
    function displayCertificates(certificates) {
        // Clear previous certificates
        certificatesContainer.innerHTML = '';
        
        certificates.forEach((certificate, index) => {
            const { canvas, code, design } = certificate;
            
            // Create certificate item container
            const certificateItem = document.createElement('div');
            certificateItem.className = 'certificate-item';
            
            // Create certificate title
            const titleElement = document.createElement('h3');
            titleElement.textContent = design.title;
            titleElement.className = 'certificate-title';
            
            // Create organization name if available
            if (design.organization) {
                const orgElement = document.createElement('p');
                orgElement.textContent = `Issued by: ${design.organization}`;
                orgElement.className = 'certificate-organization';
                titleElement.appendChild(orgElement);
            }
            
            // Create certificate preview container
            const previewContainer = document.createElement('div');
            previewContainer.className = 'certificate-preview';
            previewContainer.appendChild(canvas);
            
            // Create download button
            const downloadBtn = document.createElement('button');
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Certificate';
            downloadBtn.className = 'download-btn';
            downloadBtn.addEventListener('click', () => downloadCertificate(canvas, design.title));
            
            // Create code container
            const codeContainer = document.createElement('div');
            codeContainer.className = 'certificate-code';
            
            // Create code toggle button
            const codeToggleBtn = document.createElement('button');
            codeToggleBtn.innerHTML = '<i class="fas fa-code"></i> Show/Hide Code';
            codeToggleBtn.className = 'code-toggle-btn';
            codeToggleBtn.addEventListener('click', () => toggleCodeVisibility(codeDisplay));
            
            // Create code display
            const codeDisplay = document.createElement('pre');
            codeDisplay.className = 'code-display';
            codeDisplay.textContent = formatCanvasCode(code, design);
            codeDisplay.style.display = 'none'; // Hidden by default
            
            // Assemble certificate item
            codeContainer.appendChild(codeToggleBtn);
            codeContainer.appendChild(codeDisplay);
            
            certificateItem.appendChild(titleElement);
            certificateItem.appendChild(previewContainer);
            certificateItem.appendChild(downloadBtn);
            certificateItem.appendChild(codeContainer);
            
            // Add to container
            certificatesContainer.appendChild(certificateItem);
        });
    }
    
    /**
     * Toggle code visibility
     * @param {HTMLElement} codeElement - Code display element
     */
    function toggleCodeVisibility(codeElement) {
        codeElement.style.display = codeElement.style.display === 'none' ? 'block' : 'none';
    }
    
    /**
     * Format Canvas.js code for display
     * @param {string} code - Raw Canvas.js code
     * @param {Object} design - Certificate design object
     * @returns {string} - Formatted code
     */
    function formatCanvasCode(code, design) {
        let header = `// Canvas.js code for "${design.title}"`;
        
        if (design.organization) {
            header += `\n// Organization: ${design.organization}`;
        }
        
        header += `\n// Description: ${design.description}`;
        header += `\n// Colors: ${design.colors}`;
        header += `\n// Fonts: ${design.fonts}`;
        header += `\n// Elements: ${design.elements}`;
        
        if (design.officials && design.officials.length > 0) {
            header += `\n// Officials: ${design.officials.map(o => `${o.name} (${o.title})`).join(', ')}`;
        }
        
        return `${header}

// Get canvas element
const canvas = document.getElementById('certificate-canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// Clear canvas
ctx.clearRect(0, 0, width, height);

${code}`;
    }
    
    /**
     * Download certificate as PNG image
     * @param {HTMLCanvasElement} canvas - Canvas element with certificate
     * @param {string} title - Certificate title for filename
     */
    function downloadCertificate(canvas, title) {
        // Create a temporary link element
        const link = document.createElement('a');
        
        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Set the link attributes
        link.href = dataUrl;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
        
        // Append to the document, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}); 