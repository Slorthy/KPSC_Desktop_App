# Kissing Point Sports Club Desktop Application

A modern desktop application for Kissing Point Sports Club (KPSC) designed to display honour board information and manage club media content.

## Team
- Brad Callender - Project Lead & Graphic Designer - bradcallender745@gmail.com
- Benjamin Swinbourne - Software Developer - ben.swinbourne@gmail.com

## Features

- **Photo Board Display**: Browse and display club photos with an intuitive interface
- **Honour Board Viewer**: View club honour board with smooth transitions
- **Fullscreen Image Viewer**: Professional fullscreen display for photos and presentations
- **Multi-Sport Support**: Dedicated interfaces for Cricket, Baseball, Football, Netball, and Softball
- **Modern UI**: Clean, responsive interface built with Electron and Vite

## Screenshots

The application includes multiple viewing modes:
- Main photo board interface
- Honour board with transition effects
- Fullscreen image viewer for presentations

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Setup
1. Clone the repository:
```bash
git clone https://github.com/Slorthy/KPSC_Desktop_App.git
cd KPSC_Desktop_App
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

### Photo Board
- Click on any sport button (Cricket, Baseball, Football, Netball, Softball) to view sport-specific photos
- Use the "All Photos" button to view the complete photo collection
- Click on any photo to open it in fullscreen mode

### Honour Board
- Access the honour board to view the names of the club's honourees
- Features smooth video transitions between honour board sections
- Scrolling Functionality is handled automatically. Depending on the TV the scrolling buffer may vary.

### Fullscreen Mode
- Press BACKSPACE to exit Fullscreen Mode or F2 to completely close the application

### Project Structure
```
KPSC_Desktop_App/
├── src/                    # Main application source code
├── public/                 # Static assets and media files
├── renderer/               # Electron renderer process files
├── forge.config.js         # Electron Forge configuration
└── vite.*.config.mjs      # Vite build configurations
```

### Available Scripts
- `npm start` - Start the development server
- `npm package` - Package the application
- `npm make` - Build distributable packages
- `npm publish` - Publish the application

### Building for Distribution
```bash
# Create distributable packages
npm run make

# Package the application
npm run package
```

## Technologies Used

- **Electron** - Cross-platform desktop application framework
- **Vite** - Fast build tool and development server
- **HTML5/CSS3/JavaScript** - Modern web technologies
- **FFmpeg** - Media processing capabilities
- **GLSL Shaders** - Advanced visual effects

## Club Information

This application is specifically designed for Kissing Point Sports Club to:
- Display club photos and achievements
- Manage honour board content
- Provide professional presentation capabilities
- Support multiple sports categories

## License

2026 Ben Swinbourne. All Rights Reserved.

This software and its source code are the proprietary property of the software developer, Ben Swinbourne. Unauthorized copying, distribution, or modification of this software is strictly prohibited.

## Contact

- **Club**: Kissing Point Sports Club
- **Developer**: Ben Swinbourne
- **Email**: ben.swinbourne@gmail.com
- **Project Lead & Graphic Designer**: Brad Callender
- **Email**: bradcallender745@gmail.com

## Acknowledgments

- Kissing Point Sports Club for the opportunity to develop this application
- The Electron community for excellent documentation and tools
- All club members who contribute photos and content