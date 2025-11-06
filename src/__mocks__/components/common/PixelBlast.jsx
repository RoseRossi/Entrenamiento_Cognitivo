import React from 'react';

// Mock PixelBlast component for testing
// This prevents WebGL/Three.js rendering issues in JSDOM test environment
const PixelBlast = (props) => {
    return (
        <div
            data-testid="pixel-blast-mock"
            className="pixel-blast-mock"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #001f29, #003d5c)',
                zIndex: -1
            }}
        >
            {/* Mock representation of PixelBlast animation */}
        </div>
    );
};

export default PixelBlast;