import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  const [gridSize, setGridSize] = useState({ rows: 15, cols: 20 });
  const [wavePosition, setWavePosition] = useState(0);
  const [waveDirection, setWaveDirection] = useState(1);
  const [colorPhase, setColorPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(150);

  // Generate dynamic wave pattern for each row - 6 columns wave with dynamic effects
  const generateWavePattern = useCallback((row, time) => {
    const waveWidth = 6; // Number of columns the wave occupies
    const centerPosition = wavePosition;
    
    return Array.from({ length: gridSize.cols }, (_, col) => {
      // Calculate distance from wave center
      const distanceFromCenter = Math.abs(col - centerPosition);
      
      // Fixed wave width of exactly 6 columns (3.5 on each side of center)
      const waveIntensity = Math.max(0, 1 - (distanceFromCenter / 3.5));
      
      if (waveIntensity > 0) {
        // Create gradient within the 6-column wave
        const gradientPosition = (col - (centerPosition - waveWidth/2)) / waveWidth;
        const clampedGradient = Math.max(0, Math.min(1, gradientPosition));
        
        // Add dynamic effects based on row and time
        const rowEffect = Math.sin((row * 0.5) + (time * 0.02)) * 0.3 + 0.7;
        const timeEffect = Math.sin((time * 0.03) + (col * 0.1)) * 0.2 + 0.8;
        const waveEffect = Math.sin((distanceFromCenter * 0.5) + (time * 0.015)) * 0.15 + 0.85;
        
        // Combine all effects for dynamic intensity
        const dynamicIntensity = waveIntensity * rowEffect * timeEffect * waveEffect;
        const dynamicGradient = clampedGradient * (0.5 + 0.5 * Math.sin(time * 0.025 + row * 0.3));
        
        return {
          intensity: Math.max(0, Math.min(1, dynamicIntensity * (0.3 + 0.7 * clampedGradient))),
          gradientPos: Math.max(0, Math.min(1, dynamicGradient))
        };
      }
      return { intensity: 0, gradientPos: 0 };
    });
  }, [wavePosition, gridSize.cols, colorPhase]);

  // Generate bright, visible colors that show grid properly
  const getColor = (intensity, gradientPos, phase) => {
    if (intensity === 0) return '#1a1a1a'; // Dark background for empty cells
    
    // Color changes every 4 seconds (4000ms / 100ms = 40 cycles)
    const colorCycle = Math.floor(phase / 40) % 6;
    const baseHue = colorCycle * 60; // 0, 60, 120, 180, 240, 300 degrees
    
    // Bright, vibrant colors with good contrast
    const hue = (baseHue + gradientPos * 40) % 360;
    
    // High saturation and brightness for visibility
    const saturation = 85 + intensity * 15; // 85-100% saturation
    const lightness = 40 + intensity * 35; // 40-75% lightness for good visibility
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWavePosition(prev => {
        const newPos = prev + waveDirection;
        // Reverse direction when reaching edges: start to last, then last to start
        if (newPos >= gridSize.cols - 3) {
          setWaveDirection(-1); // Reverse to move left
          return gridSize.cols - 3;
        } else if (newPos <= 0) {
          setWaveDirection(1); // Reverse to move right
          return 0;
        }
        return newPos;
      });
      
      setColorPhase(prev => (prev + 1) % 240); // 240 cycles = 4 seconds at 100ms intervals
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, waveDirection, gridSize.cols, speed]);

  const handleGridSizeChange = (type, value) => {
    const newValue = Math.max(5, Math.min(30, parseInt(value) || 5));
    setGridSize(prev => ({
      ...prev,
      [type]: newValue
    }));
  };

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const resetWave = () => {
    setWavePosition(0); // Start from the first column
    setWaveDirection(1); // Move right initially
    setColorPhase(0);
  };

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">🌊 Bouncing Wave Grid</h1>
        <div className="controls">
          <div className="control-group">
            <label>Rows: {gridSize.rows}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={gridSize.rows}
              onChange={(e) => handleGridSizeChange('rows', e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Cols: {gridSize.cols}</label>
            <input
              type="range"
              min="5"
              max="30"
              value={gridSize.cols}
              onChange={(e) => handleGridSizeChange('cols', e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Speed: {speed}ms</label>
            <input
              type="range"
              min="50"
              max="500"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
            />
          </div>
          <button onClick={togglePlayPause} className="play-button">
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          <button onClick={resetWave} className="reset-button">
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="grid-container">
        <div 
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
          }}
        >
          {Array.from({ length: gridSize.rows }, (_, row) =>
            generateWavePattern(row, colorPhase).map((cell, col) => (
              <div
                key={`${row}-${col}`}
                className="grid-cell"
                style={{
                  backgroundColor: getColor(cell.intensity, cell.gradientPos, colorPhase),
                  boxShadow: cell.intensity > 0 
                    ? `0 0 ${cell.intensity * 10}px ${getColor(cell.intensity, cell.gradientPos, colorPhase)}`
                    : 'none'
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="info-panel">
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Wave Position:</span>
            <span className="stat-value">{wavePosition.toFixed(1)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Color Phase:</span>
            <span className="stat-value">{Math.floor(colorPhase / 40) + 1}/6</span>
          </div>
          <div className="stat">
            <span className="stat-label">Next Color:</span>
            <span className="stat-value">{Math.ceil((240 - colorPhase) / 40)}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Direction:</span>
            <span className="stat-value">{waveDirection > 0 ? '→' : '←'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
