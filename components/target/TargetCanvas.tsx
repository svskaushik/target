import React, { useState, useCallback } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import type { ShotPlacement } from '@/lib/types';

interface TargetCanvasProps {
  targetImageUrl?: string;
  shots: ShotPlacement[];
  onShotPlaced?: (x: number, y: number) => void;
  readonly?: boolean;
  width?: number;
  height?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export function TargetCanvas({ 
  targetImageUrl, 
  shots, 
  onShotPlaced, 
  readonly = false,
  width = screenWidth - 32,
  height = screenWidth - 32
}: TargetCanvasProps) {

  const handleCanvasPress = useCallback((event: any) => {
    if (readonly || !onShotPlaced) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = (locationX / width) * 100;
    const normalizedY = (locationY / height) * 100;
    
    onShotPlaced(normalizedX, normalizedY);
  }, [readonly, onShotPlaced, width, height]);

  const renderDefaultTarget = () => (
    <>
      {/* Target rings */}
      <Circle cx={width/2} cy={height/2} r={width/2 * 0.9} fill="#f3f4f6" stroke="#374151" strokeWidth="2" />
      <Circle cx={width/2} cy={height/2} r={width/2 * 0.7} fill="#ffffff" stroke="#374151" strokeWidth="2" />
      <Circle cx={width/2} cy={height/2} r={width/2 * 0.5} fill="#f3f4f6" stroke="#374151" strokeWidth="2" />
      <Circle cx={width/2} cy={height/2} r={width/2 * 0.3} fill="#ffffff" stroke="#374151" strokeWidth="2" />
      <Circle cx={width/2} cy={height/2} r={width/2 * 0.1} fill="#1f2937" />
      
      {/* Crosshairs */}
      <Line x1={width/2} y1={0} x2={width/2} y2={height} stroke="#9ca3af" strokeWidth="1" strokeDasharray="5,5" />
      <Line x1={0} y1={height/2} x2={width} y2={height/2} stroke="#9ca3af" strokeWidth="1" strokeDasharray="5,5" />
    </>
  );

  return (
    <Pressable
      style={{ width, height }}
      className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
      onPress={handleCanvasPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Target canvas with ${shots.length} shots recorded`}
      accessibilityHint={readonly ? "View target with shots" : "Tap to place a shot on the target"}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Target background */}
        {targetImageUrl ? (
          // In a real implementation, we'd use SvgImage here
          // For now, we'll use the default target
          renderDefaultTarget()
        ) : (
          renderDefaultTarget()
        )}
        
        {/* Shot placements */}
        {shots.map((shot, index) => (
          <Circle
            key={shot.id}
            cx={(shot.x_coordinate / 100) * width}
            cy={(shot.y_coordinate / 100) * height}
            r="8"
            fill="#dc2626"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}
      </Svg>
    </Pressable>
  );
}
