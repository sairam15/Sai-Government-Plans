# Fashion Designer's Color Wheel App

A modern, intuitive color wheel application specifically designed for fashion designers to explore color harmonies, generate palette recommendations, and adapt suggestions based on various contexts like seasons and attire formality. **Now with Model Visualization!** See your color palettes applied to fashion models in real-time.

## Features

### 🎨 Versatile Color Input
- **Manual Color Input**: Use color picker, hex codes, or RGB sliders
- **Image Upload**: Drag & drop or upload images to extract dominant colors
- **URL Input**: Extract colors from online images via URL
- **Pre-defined Palettes**: Start with classic seasonal palettes

### 🌈 Intelligent Color Theory
- **Complementary Colors**: Colors opposite on the color wheel
- **Analogous Colors**: Adjacent colors on the wheel
- **Triadic Colors**: Three colors equally spaced around the wheel
- **Monochromatic Schemes**: Variations of the base color
- **Split-Complementary**: Base color with two colors adjacent to its complement

### 👗 Fashion Context Adaptations
- **Seasonal Adjustments**: 
  - Spring: Lighter, pastel variations
  - Summer: Bright, vibrant colors
  - Autumn: Earthy, warm tones
  - Winter: Cool, muted colors
- **Formality Levels**:
  - Formal: Subdued, sophisticated colors
  - Casual: Bold, playful combinations

### 🎭 **NEW: Model Visualization**
- **Fashion Model Display**: See your color palettes applied to different model styles
- **Multiple Outfit Styles**: Casual, Business, Evening, and Sporty looks
- **Color Application Options**: Apply colors to tops, bottoms, accessories, or full outfits
- **Lighting Effects**: Natural, Studio, Outdoor, and Indoor lighting simulations
- **Real-time Preview**: Watch colors change instantly on the model
- **Save & Share**: Download model images or share your creations

### 🎯 Interactive Features
- **Interactive Color Wheel**: Click to select colors directly
- **Real-time Updates**: Instant palette generation as you adjust settings
- **Export Options**: Save palettes as hex codes, RGB values, or PNG images
- **Copy to Clipboard**: Quick palette copying for design tools

## Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- No additional dependencies required

### Installation
1. Download all files to your local directory
2. Open `color-wheel-app.html` in your web browser
3. Start exploring colors and visualizing them on models!

### File Structure
```
color-wheel-app/
├── color-wheel-app.html      # Main HTML file
├── color-wheel-styles.css    # CSS styles
├── color-wheel-script.js     # JavaScript functionality
└── color-wheel-README.md     # This documentation
```

## Usage Guide

### 1. Choosing Your Base Color
- **Manual Tab**: Use the color picker, type hex codes, or adjust RGB sliders
- **Upload Tab**: Drag & drop an image or click to browse files
- **URL Tab**: Paste an image URL to extract colors
- **Presets Tab**: Choose from seasonal starter palettes

### 2. Setting Context
- **Season**: Select Spring, Summer, Autumn, or Winter
- **Formality**: Choose between Casual and Formal
- **Harmony Type**: Pick your preferred color harmony

### 3. Exploring Palettes
- Click on the interactive color wheel to change your base color
- View generated palettes below the wheel
- Click on any color in a palette to make it your new base color
- Use the copy button to copy palette hex codes

### 4. **NEW: Model Visualization**
- **Select Model Style**: Choose from Casual, Business, Evening, or Sporty
- **Choose Color Application**: Apply to Top/Shirt, Bottom/Pants, Accessories, or Full Outfit
- **Set Lighting**: Natural, Studio, Outdoor, or Indoor lighting
- **Apply Colors**: Click "Apply to Model" to see your palette on the model
- **Save & Share**: Download the model image or share your creation

### 5. Exporting Your Work
- Click the "Export" button to open the export modal
- Copy hex codes or RGB values
- Download palette as a PNG image
- **Save model visualizations** as PNG files

## Technical Details

### Color Theory Implementation
The app uses standard color theory principles:
- **HSL Color Space**: For intuitive color manipulation
- **RGB Conversions**: For accurate color representation
- **Harmony Calculations**: Mathematical color wheel positioning

### Model Visualization System
- **Canvas-based Rendering**: Real-time model drawing and color application
- **Silhouette Generation**: Custom-drawn fashion model outlines for each style
- **Lighting Effects**: Pixel-level color adjustments for realistic lighting simulation
- **Color Mapping**: Intelligent color application to different garment areas

### Image Processing
- **Client-side Processing**: No server required
- **Dominant Color Extraction**: Uses color quantization and frequency analysis
- **Support Formats**: JPEG, PNG, and other web-compatible formats

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Design Philosophy

### "Cursor Vibe" UI/UX
- **Clean & Minimalist**: Focus on functionality without clutter
- **Visual Dominance**: Color swatches, wheel, and model visualization are focal points
- **Intuitive Workflow**: Logical progression from input to visualization
- **Responsive Design**: Works seamlessly across all device sizes
- **Modern Aesthetics**: Glassmorphism effects and smooth animations

### Accessibility Features
- High contrast color combinations
- Keyboard navigation support
- Screen reader friendly
- Responsive touch targets

## Customization

### Adding New Preset Palettes
Edit the `loadPreset()` function in `color-wheel-script.js`:

```javascript
const presets = {
    spring: { r: 255, g: 179, b: 186 },
    summer: { r: 255, g: 107, b: 107 },
    autumn: { r: 139, g: 69, b: 19 },
    winter: { r: 44, g: 62, b: 80 },
    // Add your custom palette here
    custom: { r: 255, g: 255, b: 255 }
};
```

### Modifying Color Adjustments
Adjust the seasonal and formality color modifications in the respective functions:
- `adjustForSpring()`
- `adjustForSummer()`
- `adjustForAutumn()`
- `adjustForWinter()`
- `adjustForFormal()`
- `adjustForCasual()`

### Adding New Model Styles
Extend the model visualization by adding new styles in the `createModelSilhouette()` function:

```javascript
case 'new-style':
    this.drawNewStyleModel(ctx);
    break;
```

## Troubleshooting

### Common Issues

**Image upload not working:**
- Ensure the image file is a supported format (JPEG, PNG)
- Check that the file size is reasonable (< 10MB)
- Try refreshing the page and uploading again

**Color wheel not responding:**
- Make sure JavaScript is enabled in your browser
- Try clicking in the colored area of the wheel (not the center)
- Refresh the page if the issue persists

**Model visualization not working:**
- Ensure you have a palette generated before applying to model
- Check that your browser supports Canvas API
- Try selecting a different model style or color application

**Export not working:**
- Ensure you have a palette generated before trying to export
- Check that your browser supports the clipboard API
- Try using the copy buttons instead of the download feature

### Performance Tips
- Use smaller images for faster color extraction
- Close other browser tabs to free up memory
- Update your browser to the latest version
- For model visualization, use fewer colors for better performance

## Contributing

This is a standalone application, but you can:
1. Fork the project
2. Create a feature branch
3. Make your improvements
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Review the browser compatibility requirements
3. Ensure all files are in the same directory
4. Try opening the app in a different browser

---

**Happy Designing!** 🎨✨👗

This color wheel app empowers fashion designers to make informed color decisions and create stunning, harmonious collections. Now with the power to visualize your color palettes on fashion models in real-time!
