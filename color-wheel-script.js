// Fashion Designer's Color Wheel App
class ColorWheelApp {
    constructor() {
        this.baseColor = { r: 255, g: 107, b: 107 };
        this.canvas = document.getElementById('color-wheel');
        this.ctx = this.canvas.getContext('2d');
        this.modelCanvas = document.getElementById('model-canvas');
        this.modelCtx = this.modelCanvas.getContext('2d');
        this.wheelRadius = 180;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.selectedColors = [];
        this.currentPalette = [];
        this.modelImages = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadModelImages();
        this.drawColorWheel();
        this.updateColorInputs();
        this.generatePalettes();
        this.drawModel();
    }

    async loadModelImages() {
        // Create placeholder model silhouettes for different styles
        this.modelImages = {
            casual: this.createModelSilhouette('casual'),
            business: this.createModelSilhouette('business'),
            evening: this.createModelSilhouette('evening'),
            sporty: this.createModelSilhouette('sporty')
        };
    }

    createModelSilhouette(style) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 600;
        
        // Draw model silhouette based on style
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw model outline
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        switch (style) {
            case 'casual':
                this.drawCasualModel(ctx);
                break;
            case 'business':
                this.drawBusinessModel(ctx);
                break;
            case 'evening':
                this.drawEveningModel(ctx);
                break;
            case 'sporty':
                this.drawSportyModel(ctx);
                break;
        }
        
        return canvas;
    }

    drawCasualModel(ctx) {
        // Head
        ctx.beginPath();
        ctx.arc(200, 80, 30, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Body - casual t-shirt
        ctx.beginPath();
        ctx.moveTo(170, 110);
        ctx.lineTo(230, 110);
        ctx.lineTo(240, 200);
        ctx.lineTo(160, 200);
        ctx.closePath();
        ctx.stroke();
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(170, 120);
        ctx.lineTo(150, 180);
        ctx.moveTo(230, 120);
        ctx.lineTo(250, 180);
        ctx.stroke();
        
        // Legs - jeans
        ctx.beginPath();
        ctx.moveTo(160, 200);
        ctx.lineTo(150, 350);
        ctx.moveTo(240, 200);
        ctx.lineTo(250, 350);
        ctx.stroke();
        
        // Feet
        ctx.beginPath();
        ctx.arc(150, 350, 15, 0, 2 * Math.PI);
        ctx.arc(250, 350, 15, 0, 2 * Math.PI);
        ctx.stroke();
    }

    drawBusinessModel(ctx) {
        // Head
        ctx.beginPath();
        ctx.arc(200, 80, 30, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Body - suit jacket
        ctx.beginPath();
        ctx.moveTo(170, 110);
        ctx.lineTo(230, 110);
        ctx.lineTo(240, 220);
        ctx.lineTo(160, 220);
        ctx.closePath();
        ctx.stroke();
        
        // Arms - suit sleeves
        ctx.beginPath();
        ctx.moveTo(170, 120);
        ctx.lineTo(150, 200);
        ctx.moveTo(230, 120);
        ctx.lineTo(250, 200);
        ctx.stroke();
        
        // Legs - dress pants
        ctx.beginPath();
        ctx.moveTo(160, 220);
        ctx.lineTo(150, 380);
        ctx.moveTo(240, 220);
        ctx.lineTo(250, 380);
        ctx.stroke();
        
        // Feet - dress shoes
        ctx.beginPath();
        ctx.ellipse(150, 380, 20, 10, 0, 0, 2 * Math.PI);
        ctx.ellipse(250, 380, 20, 10, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    drawEveningModel(ctx) {
        // Head
        ctx.beginPath();
        ctx.arc(200, 80, 30, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Body - evening dress
        ctx.beginPath();
        ctx.moveTo(170, 110);
        ctx.lineTo(230, 110);
        ctx.lineTo(220, 300);
        ctx.lineTo(180, 300);
        ctx.closePath();
        ctx.stroke();
        
        // Arms - dress sleeves
        ctx.beginPath();
        ctx.moveTo(170, 120);
        ctx.lineTo(150, 180);
        ctx.moveTo(230, 120);
        ctx.lineTo(250, 180);
        ctx.stroke();
        
        // Legs - dress hem
        ctx.beginPath();
        ctx.moveTo(180, 300);
        ctx.lineTo(160, 400);
        ctx.moveTo(220, 300);
        ctx.lineTo(240, 400);
        ctx.stroke();
        
        // Feet - heels
        ctx.beginPath();
        ctx.moveTo(160, 400);
        ctx.lineTo(150, 420);
        ctx.moveTo(240, 400);
        ctx.lineTo(250, 420);
        ctx.stroke();
    }

    drawSportyModel(ctx) {
        // Head
        ctx.beginPath();
        ctx.arc(200, 80, 30, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Body - athletic wear
        ctx.beginPath();
        ctx.moveTo(170, 110);
        ctx.lineTo(230, 110);
        ctx.lineTo(235, 200);
        ctx.lineTo(165, 200);
        ctx.closePath();
        ctx.stroke();
        
        // Arms - athletic sleeves
        ctx.beginPath();
        ctx.moveTo(170, 120);
        ctx.lineTo(150, 180);
        ctx.moveTo(230, 120);
        ctx.lineTo(250, 180);
        ctx.stroke();
        
        // Legs - athletic pants
        ctx.beginPath();
        ctx.moveTo(165, 200);
        ctx.lineTo(155, 350);
        ctx.moveTo(235, 200);
        ctx.lineTo(245, 350);
        ctx.stroke();
        
        // Feet - sneakers
        ctx.beginPath();
        ctx.ellipse(155, 350, 18, 12, 0, 0, 2 * Math.PI);
        ctx.ellipse(245, 350, 18, 12, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Color input synchronization
        document.getElementById('base-color').addEventListener('input', (e) => {
            this.updateFromColorPicker(e.target.value);
        });

        document.getElementById('base-hex').addEventListener('input', (e) => {
            this.updateFromHex(e.target.value);
        });

        // RGB sliders
        ['r', 'g', 'b'].forEach(channel => {
            const slider = document.getElementById(`base-${channel}`);
            const value = document.getElementById(`base-${channel}-value`);
            
            slider.addEventListener('input', (e) => {
                this.baseColor[channel] = parseInt(e.target.value);
                value.textContent = e.target.value;
                this.updateColorInputs();
                this.generatePalettes();
            });
        });

        // Context changes
        document.getElementById('season-select').addEventListener('change', () => {
            this.generatePalettes();
        });

        document.getElementById('formality-select').addEventListener('change', () => {
            this.generatePalettes();
        });

        document.getElementById('harmony-select').addEventListener('change', () => {
            this.generatePalettes();
        });

        // Image upload
        document.getElementById('image-upload').addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        // URL extraction
        document.getElementById('extract-from-url').addEventListener('click', () => {
            this.extractFromURL();
        });

        // Preset palettes
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.loadPreset(e.currentTarget.dataset.palette);
            });
        });

        // Color wheel interaction
        this.canvas.addEventListener('click', (e) => {
            this.handleWheelClick(e);
        });

        // Model visualization
        document.getElementById('apply-to-model').addEventListener('click', () => {
            this.applyColorsToModel();
        });

        document.getElementById('model-style').addEventListener('change', () => {
            this.drawModel();
        });

        document.getElementById('save-model-image').addEventListener('click', () => {
            this.saveModelImage();
        });

        document.getElementById('share-model').addEventListener('click', () => {
            this.shareModel();
        });

        // Export functionality
        document.getElementById('export-palette').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('close-export-modal').addEventListener('click', () => {
            this.hideExportModal();
        });

        document.getElementById('copy-hex').addEventListener('click', () => {
            this.copyToClipboard('hex-codes');
        });

        document.getElementById('copy-rgb').addEventListener('click', () => {
            this.copyToClipboard('rgb-values');
        });

        document.getElementById('download-palette').addEventListener('click', () => {
            this.downloadPaletteImage();
        });

        // Reset wheel
        document.getElementById('reset-wheel').addEventListener('click', () => {
            this.resetWheel();
        });

        // Drag and drop for image upload
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
            uploadArea.style.background = 'rgba(102, 126, 234, 0.05)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = '#f7fafc';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#cbd5e0';
            uploadArea.style.background = '#f7fafc';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    updateFromColorPicker(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        this.baseColor = rgb;
        this.updateColorInputs();
        this.generatePalettes();
    }

    updateFromHex(hexColor) {
        if (hexColor.match(/^#[0-9A-F]{6}$/i)) {
            const rgb = this.hexToRgb(hexColor);
            this.baseColor = rgb;
            this.updateColorInputs();
            this.generatePalettes();
        }
    }

    updateColorInputs() {
        const hex = this.rgbToHex(this.baseColor.r, this.baseColor.g, this.baseColor.b);
        document.getElementById('base-color').value = hex;
        document.getElementById('base-hex').value = hex;
        
        document.getElementById('base-r').value = this.baseColor.r;
        document.getElementById('base-r-value').textContent = this.baseColor.r;
        document.getElementById('base-g').value = this.baseColor.g;
        document.getElementById('base-g-value').textContent = this.baseColor.g;
        document.getElementById('base-b').value = this.baseColor.b;
        document.getElementById('base-b-value').textContent = this.baseColor.b;
    }

    drawColorWheel() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw color wheel
        for (let angle = 0; angle < 360; angle += 1) {
            for (let radius = 0; radius < this.wheelRadius; radius += 1) {
                const hue = angle;
                const saturation = (radius / this.wheelRadius) * 100;
                const lightness = 50;
                
                const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                this.ctx.fillStyle = color;
                
                const x = this.centerX + radius * Math.cos(angle * Math.PI / 180);
                const y = this.centerY + radius * Math.sin(angle * Math.PI / 180);
                
                this.ctx.fillRect(x, y, 1, 1);
            }
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    handleWheelClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.wheelRadius && distance > 20) {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const hue = (angle + 360) % 360;
            const saturation = (distance / this.wheelRadius) * 100;
            
            const color = this.hslToRgb(hue, saturation, 50);
            this.baseColor = color;
            this.updateColorInputs();
            this.generatePalettes();
        }
    }

    generatePalettes() {
        const season = document.getElementById('season-select').value;
        const formality = document.getElementById('formality-select').value;
        const harmony = document.getElementById('harmony-select').value;
        
        const palettes = [];
        
        // Generate different harmony types
        const harmonyTypes = ['complementary', 'analogous', 'triadic', 'monochromatic', 'split-complementary'];
        
        harmonyTypes.forEach(type => {
            const palette = this.generateHarmonyPalette(type);
            const adjustedPalette = this.adjustForContext(palette, season, formality);
            
            palettes.push({
                type: type,
                colors: adjustedPalette,
                isActive: type === harmony
            });
        });
        
        this.displayPalettes(palettes);
    }

    generateHarmonyPalette(harmonyType) {
        const baseHsl = this.rgbToHsl(this.baseColor.r, this.baseColor.g, this.baseColor.b);
        const colors = [];
        
        switch (harmonyType) {
            case 'complementary':
                colors.push(this.baseColor);
                colors.push(this.hslToRgb((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l));
                break;
                
            case 'analogous':
                colors.push(this.hslToRgb((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l));
                colors.push(this.baseColor);
                colors.push(this.hslToRgb((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l));
                break;
                
            case 'triadic':
                colors.push(this.baseColor);
                colors.push(this.hslToRgb((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l));
                colors.push(this.hslToRgb((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l));
                break;
                
            case 'monochromatic':
                colors.push(this.baseColor);
                colors.push(this.hslToRgb(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 20)));
                colors.push(this.hslToRgb(baseHsl.h, baseHsl.s, Math.min(100, baseHsl.l + 20)));
                colors.push(this.hslToRgb(baseHsl.h, Math.max(0, baseHsl.s - 20), baseHsl.l));
                colors.push(this.hslToRgb(baseHsl.h, Math.min(100, baseHsl.s + 20), baseHsl.l));
                break;
                
            case 'split-complementary':
                colors.push(this.baseColor);
                colors.push(this.hslToRgb((baseHsl.h + 150) % 360, baseHsl.s, baseHsl.l));
                colors.push(this.hslToRgb((baseHsl.h + 210) % 360, baseHsl.s, baseHsl.l));
                break;
        }
        
        return colors;
    }

    adjustForContext(colors, season, formality) {
        return colors.map(color => {
            let adjustedColor = { ...color };
            
            // Season adjustments
            switch (season) {
                case 'spring':
                    adjustedColor = this.adjustForSpring(adjustedColor);
                    break;
                case 'summer':
                    adjustedColor = this.adjustForSummer(adjustedColor);
                    break;
                case 'autumn':
                    adjustedColor = this.adjustForAutumn(adjustedColor);
                    break;
                case 'winter':
                    adjustedColor = this.adjustForWinter(adjustedColor);
                    break;
            }
            
            // Formality adjustments
            if (formality === 'formal') {
                adjustedColor = this.adjustForFormal(adjustedColor);
            } else {
                adjustedColor = this.adjustForCasual(adjustedColor);
            }
            
            return adjustedColor;
        });
    }

    adjustForSpring(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.min(100, hsl.s + 10), Math.min(100, hsl.l + 15));
    }

    adjustForSummer(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.min(100, hsl.s + 20), hsl.l);
    }

    adjustForAutumn(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.min(100, hsl.s + 15), Math.max(0, hsl.l - 10));
    }

    adjustForWinter(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.max(0, hsl.s - 20), Math.max(0, hsl.l - 15));
    }

    adjustForFormal(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.max(0, hsl.s - 15), Math.max(0, hsl.l - 10));
    }

    adjustForCasual(color) {
        const hsl = this.rgbToHsl(color.r, color.g, color.b);
        return this.hslToRgb(hsl.h, Math.min(100, hsl.s + 10), hsl.l);
    }

    displayPalettes(palettes) {
        const grid = document.getElementById('palette-grid');
        grid.innerHTML = '';
        
        palettes.forEach(palette => {
            const card = document.createElement('div');
            card.className = `palette-card ${palette.isActive ? 'active' : ''}`;
            
            const header = document.createElement('div');
            header.className = 'palette-header';
            header.innerHTML = `
                <span class="palette-title">${palette.type.charAt(0).toUpperCase() + palette.type.slice(1)}</span>
                <div class="palette-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.copyPalette('${palette.type}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            `;
            
            const colors = document.createElement('div');
            colors.className = 'palette-colors';
            
            palette.colors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'palette-color';
                colorDiv.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
                colorDiv.innerHTML = `
                    <div class="color-info">${this.rgbToHex(color.r, color.g, color.b)}</div>
                `;
                colorDiv.addEventListener('click', () => {
                    this.baseColor = color;
                    this.updateColorInputs();
                    this.generatePalettes();
                });
                colors.appendChild(colorDiv);
            });
            
            card.appendChild(header);
            card.appendChild(colors);
            grid.appendChild(card);
        });
        
        this.currentPalette = palettes;
    }

    drawModel() {
        const style = document.getElementById('model-style').value;
        const modelImage = this.modelImages[style];
        
        if (modelImage) {
            this.modelCtx.clearRect(0, 0, this.modelCanvas.width, this.modelCanvas.height);
            this.modelCtx.drawImage(modelImage, 0, 0);
        }
    }

    applyColorsToModel() {
        const activePalette = this.currentPalette.find(p => p.isActive);
        if (!activePalette) return;

        const application = document.getElementById('color-application').value;
        const lighting = document.getElementById('lighting').value;
        
        this.drawModel();
        this.applyColorsToModelCanvas(activePalette.colors, application, lighting);
        this.updateModelPreview(activePalette);
    }

    applyColorsToModelCanvas(colors, application, lighting) {
        const style = document.getElementById('model-style').value;
        
        // Apply lighting effect
        this.applyLightingEffect(lighting);
        
        // Apply colors based on application type
        switch (application) {
            case 'top':
                this.colorModelTop(colors[0]);
                break;
            case 'bottom':
                this.colorModelBottom(colors[1] || colors[0]);
                break;
            case 'accessories':
                this.colorModelAccessories(colors[2] || colors[0]);
                break;
            case 'full-outfit':
                this.colorModelFullOutfit(colors);
                break;
        }
    }

    applyLightingEffect(lighting) {
        const imageData = this.modelCtx.getImageData(0, 0, this.modelCanvas.width, this.modelCanvas.height);
        const data = imageData.data;
        
        switch (lighting) {
            case 'natural':
                // Slight warm tint
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.05);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.02); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 0.98); // B
                }
                break;
            case 'studio':
                // Bright, clean lighting
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.1);      // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.1); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
                }
                break;
            case 'outdoor':
                // Natural outdoor lighting
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.08);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 1.02); // B
                }
                break;
            case 'indoor':
                // Warm indoor lighting
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] * 1.15);     // R
                    data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
                    data[i + 2] = Math.min(255, data[i + 2] * 0.95); // B
                }
                break;
        }
        
        this.modelCtx.putImageData(imageData, 0, 0);
    }

    colorModelTop(color) {
        this.modelCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.modelCtx.fillRect(170, 110, 60, 90);
    }

    colorModelBottom(color) {
        this.modelCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        this.modelCtx.fillRect(160, 200, 80, 150);
    }

    colorModelAccessories(color) {
        this.modelCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
        // Color small accessory areas
        this.modelCtx.fillRect(190, 60, 20, 10); // Head accessory
        this.modelCtx.fillRect(150, 180, 20, 20); // Left arm accessory
        this.modelCtx.fillRect(230, 180, 20, 20); // Right arm accessory
    }

    colorModelFullOutfit(colors) {
        if (colors.length >= 2) {
            this.colorModelTop(colors[0]);
            this.colorModelBottom(colors[1]);
        }
        if (colors.length >= 3) {
            this.colorModelAccessories(colors[2]);
        }
    }

    updateModelPreview(palette) {
        // Update model overlay info
        document.getElementById('model-palette-name').textContent = palette.type.charAt(0).toUpperCase() + palette.type.slice(1);
        
        const modelColors = document.getElementById('model-colors');
        modelColors.innerHTML = '';
        palette.colors.slice(0, 3).forEach(color => {
            const colorSpan = document.createElement('span');
            colorSpan.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
            modelColors.appendChild(colorSpan);
        });
        
        // Update applied colors preview
        const appliedColors = document.getElementById('applied-colors');
        appliedColors.innerHTML = '';
        
        const application = document.getElementById('color-application').value;
        const colorNames = {
            'top': 'Top/Shirt',
            'bottom': 'Bottom/Pants',
            'accessories': 'Accessories',
            'full-outfit': 'Full Outfit'
        };
        
        palette.colors.forEach((color, index) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'applied-color-item';
            colorItem.innerHTML = `
                <div class="applied-color-swatch" style="background: rgb(${color.r}, ${color.g}, ${color.b})"></div>
                <div class="applied-color-info">
                    <div class="applied-color-name">${colorNames[application] || `Color ${index + 1}`}</div>
                    <div class="applied-color-hex">${this.rgbToHex(color.r, color.g, color.b)}</div>
                </div>
            `;
            appliedColors.appendChild(colorItem);
        });
    }

    saveModelImage() {
        const link = document.createElement('a');
        link.download = `fashion-model-${Date.now()}.png`;
        link.href = this.modelCanvas.toDataURL();
        link.click();
    }

    shareModel() {
        if (navigator.share) {
            navigator.share({
                title: 'Fashion Color Palette',
                text: 'Check out this color palette applied to a fashion model!',
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            this.modelCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                navigator.clipboard.writeText(url).then(() => {
                    alert('Model image URL copied to clipboard!');
                });
            });
        }
    }

    async handleImageUpload(file) {
        if (!file) return;
        
        try {
            const colors = await this.extractColorsFromImage(file);
            this.displayExtractedColors(colors);
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try again.');
        }
    }

    async extractColorsFromImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = this.getDominantColors(imageData.data, 5);
                resolve(colors);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    getDominantColors(imageData, count) {
        const colorMap = new Map();
        
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            
            // Quantize colors to reduce noise
            const quantizedR = Math.floor(r / 32) * 32;
            const quantizedG = Math.floor(g / 32) * 32;
            const quantizedB = Math.floor(b / 32) * 32;
            
            const key = `${quantizedR},${quantizedG},${quantizedB}`;
            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }
        
        // Sort by frequency and get top colors
        const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([key]) => {
                const [r, g, b] = key.split(',').map(Number);
                return { r, g, b };
            });
        
        return sortedColors;
    }

    displayExtractedColors(colors) {
        const container = document.getElementById('extracted-colors');
        const swatches = document.getElementById('color-swatches');
        
        swatches.innerHTML = '';
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.background = `rgb(${color.r}, ${color.g}, ${color.b})`;
            swatch.addEventListener('click', () => {
                this.baseColor = color;
                this.updateColorInputs();
                this.generatePalettes();
            });
            swatches.appendChild(swatch);
        });
        
        container.style.display = 'block';
    }

    async extractFromURL() {
        const url = document.getElementById('image-url').value;
        if (!url) {
            alert('Please enter a valid image URL');
            return;
        }
        
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            await this.handleImageUpload(blob);
        } catch (error) {
            console.error('Error fetching image:', error);
            alert('Error fetching image. Please check the URL and try again.');
        }
    }

    loadPreset(paletteName) {
        const presets = {
            spring: { r: 255, g: 179, b: 186 },
            summer: { r: 255, g: 107, b: 107 },
            autumn: { r: 139, g: 69, b: 19 },
            winter: { r: 44, g: 62, b: 80 }
        };
        
        if (presets[paletteName]) {
            this.baseColor = presets[paletteName];
            this.updateColorInputs();
            this.generatePalettes();
            this.switchTab('manual');
        }
    }

    resetWheel() {
        this.baseColor = { r: 255, g: 107, b: 107 };
        this.updateColorInputs();
        this.generatePalettes();
    }

    showExportModal() {
        const modal = document.getElementById('export-modal');
        const activePalette = this.currentPalette.find(p => p.isActive);
        
        if (activePalette) {
            const hexCodes = activePalette.colors.map(color => 
                this.rgbToHex(color.r, color.g, color.b)
            ).join('\n');
            
            const rgbValues = activePalette.colors.map(color => 
                `rgb(${color.r}, ${color.g}, ${color.b})`
            ).join('\n');
            
            document.getElementById('hex-codes').value = hexCodes;
            document.getElementById('rgb-values').value = rgbValues;
        }
        
        modal.classList.add('active');
    }

    hideExportModal() {
        document.getElementById('export-modal').classList.remove('active');
    }

    async copyToClipboard(elementId) {
        const textarea = document.getElementById(elementId);
        try {
            await navigator.clipboard.writeText(textarea.value);
            alert('Copied to clipboard!');
        } catch (error) {
            textarea.select();
            document.execCommand('copy');
            alert('Copied to clipboard!');
        }
    }

    downloadPaletteImage() {
        const activePalette = this.currentPalette.find(p => p.isActive);
        if (!activePalette) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 100;
        
        const colorWidth = canvas.width / activePalette.colors.length;
        
        activePalette.colors.forEach((color, index) => {
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(index * colorWidth, 0, colorWidth, canvas.height);
        });
        
        const link = document.createElement('a');
        link.download = `palette-${activePalette.type}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    copyPalette(type) {
        const palette = this.currentPalette.find(p => p.type === type);
        if (palette) {
            const hexCodes = palette.colors.map(color => 
                this.rgbToHex(color.r, color.g, color.b)
            ).join('\n');
            
            navigator.clipboard.writeText(hexCodes).then(() => {
                alert('Palette copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy palette');
            });
        }
    }

    // Color conversion utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ColorWheelApp();
});
