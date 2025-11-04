# GrayJay S.to Plugin

> **⚠️ NOTICE: This repository is now archived.**  
> **Please use the [S.to-like Framework Generator](https://grayjay-sources.github.io/grayjay-source-sto-like/) to create custom plugins for S.to, Aniworld, or any other compatible German streaming site!**
> 
> The generator provides:
> - ✨ Easy custom plugin creation via web interface
> - 📱 QR code generation for instant mobile setup
> - 🎯 Support for any S.to/Aniworld-compatible site
> - 💾 Downloadable config files
> 
> **[Visit Generator →](https://grayjay-sources.github.io/grayjay-source-sto-like/)**

---

A GrayJay plugin for **S.to** - the largest German TV series streaming platform.

![S.to Logo](StoIcon.png)

## Features

- ✅ **Search** - Find your favorite TV series
- ✅ **Browse Series** - View series as channels with metadata
- ✅ **Episode Listing** - Complete episode lists across all seasons
- ✅ **Multi-Season Support** - Automatically fetches up to 20 seasons
- ✅ **Multi-Language** - German and English audio/subtitle options
- ✅ **Multiple Hosters** - VOE, Doodstream, Vidoza, Streamtape, Vidmoly

## Installation

1. Open GrayJay app
2. Go to Sources
3. Click "Add Source"
4. Enter this URL: `https://raw.githubusercontent.com/Bluscream/grayjay-source-sto/main/StoConfig.json`
5. Click "Install"

## Supported Content

- **TV Series** (German and International)
- **Multi-season series** (up to 20 seasons per series)
- **German dubbed content**
- **Original language with German subtitles**

## URL Structure

The plugin supports the following URL patterns:

- **Homepage**: `https://s.to/`
- **Search**: `https://s.to/search?q=QUERY`
- **Series Page**: `https://s.to/serie/stream/breaking-bad`
- **Season Page**: `https://s.to/serie/stream/breaking-bad/staffel-5`
- **Episode Page**: `https://s.to/serie/stream/breaking-bad/staffel-5/episode-16`

## Framework

This plugin uses the **Universal German Streaming Framework** which allows for 98% code reuse across similar sites. Only 3 constants need to be changed to support a new site:

```javascript
const PLATFORM = "S.to";
const BASE_URL = "https://s.to";
const CONTENT_TYPE = "serie";
```

### Related Plugins

- [Aniworld.to Plugin](https://github.com/Hoell08/Grayjay-Aniworld-plugin) - For anime streaming (uses same framework)

## Technical Details

### Language Support

| Language | Audio | Subtitles |
|----------|-------|-----------|
| German (Deutsch) | ✅ | ✅ |
| English | ✅ | ✅ |

### Supported Hosters

- VOE
- Doodstream
- Vidoza
- Streamtape
- Vidmoly

### Requirements

- GrayJay app version 0.x or higher
- Internet connection
- No authentication required (optional login supported)

## Screenshots

*Coming soon*

## Development

### Building from Source

```bash
git clone https://github.com/Bluscream/grayjay-source-sto.git
cd grayjay-source-sto
# No build needed - pure JavaScript
```

### Testing

1. Copy `StoConfig.json` to GrayJay sources directory
2. Reload sources in GrayJay
3. Test search, browse, and playback functionality

### Code Structure

```
grayjay-source-sto/
├── StoConfig.json      # Plugin configuration
├── StoScript.js        # Main plugin logic
├── StoIcon.png         # Plugin icon
└── README.md           # This file
```

## Troubleshooting

### Search not working
- Check if s.to is accessible in your region
- Verify internet connection
- Check GrayJay logs for errors

### Episodes not loading
- The series may not have episodes available
- Try a different season
- Check if the series exists on s.to website

### Videos not playing
- Video playback depends on the hosters
- Some hosters may require additional steps
- Try a different hoster/language option

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Improvement

- [ ] Add video source extraction for direct playback
- [ ] Implement user authentication
- [ ] Add playlist/favorites support
- [ ] Better thumbnail extraction
- [ ] Episode descriptions
- [ ] Genre filtering
- [ ] Rating/views metadata

## Authors

- **Zerophire** - Original concept and initial implementation
- **Bluscream** - Framework development and S.to integration
- **Cursor.AI** - AI-assisted development

## License

This project is open source and available under the MIT License.

## Disclaimer

This plugin is for educational purposes only. The authors are not responsible for any misuse of this plugin. Please respect copyright laws and the terms of service of S.to.

## Related Projects

- [GrayJay](https://grayjay.app/) - The media app this plugin is for
- [Aniworld Plugin](https://github.com/Hoell08/Grayjay-Aniworld-plugin) - Sister plugin for anime

## Support

If you encounter any issues or have suggestions, please:
1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Include GrayJay version and error logs if applicable

## Changelog

### Version 1 (2025-11-04)
- Initial release
- Basic search functionality
- Series browsing as channels
- Episode listing with multi-season support
- Multi-language and multi-hoster support
- Framework-based implementation for easy maintenance

---

Made with ❤️ by the GrayJay community
