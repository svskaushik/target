import React, { useCallback } from 'react';
import { View, Dimensions, Pressable, Platform } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { ShotPlacement } from '@/lib/types';

interface TargetCanvasProps {
  targetImageUrl?: string;
  shots: ShotPlacement[];
  onShotPlaced?: (x: number, y: number) => void;
  readonly?: boolean;
  width?: number;
  height?: number;
  showPoints?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export function TargetCanvas({ 
  targetImageUrl, 
  shots, 
  onShotPlaced, 
  readonly = false,
  width = screenWidth - 32,
  height = screenWidth - 32,
  showPoints = false
}: TargetCanvasProps) {

  // Native handler
  const handleCanvasPress = useCallback((event: any) => {
    if (readonly || !onShotPlaced) return;
    const { locationX, locationY } = event.nativeEvent;
    console.log('[TargetCanvas] Native Raw press:', { locationX, locationY, width, height });
    const normalizedX = (locationX / width) * 100;
    const normalizedY = (locationY / height) * 100;
    console.log('[TargetCanvas] Native Normalized:', { normalizedX, normalizedY });
    onShotPlaced(normalizedX, normalizedY);
  }, [readonly, onShotPlaced, width, height]);

  // Web handler
  const handleCanvasClick = useCallback((event: any) => {
    if (readonly || !onShotPlaced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    console.log('[TargetCanvas] Web click:', { offsetX, offsetY, width, height });
    const normalizedX = (offsetX / width) * 100;
    const normalizedY = (offsetY / height) * 100;
    console.log('[TargetCanvas] Web Normalized:', { normalizedX, normalizedY });
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

  if (Platform.OS === 'web') {
    return (
      <div
        style={{
          width,
          height,
          background: 'white',
          border: '2px solid #d1d5db',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          cursor: readonly ? 'default' : 'pointer',
        }}
        onClick={handleCanvasClick}
        aria-label={`Target canvas with ${shots.length} shots recorded`}
        role="button"
        tabIndex={0}
      >
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {targetImageUrl ? renderDefaultTarget() : renderDefaultTarget()}
          {shots.map((shot, index) => {
            // Calculate center
            const cx = (shot.x_coordinate / 100) * width;
            const cy = (shot.y_coordinate / 100) * height;

            // Scoring logic
            const centerX = width / 2;
            const centerY = height / 2;
            const dx = cx - centerX;
            const dy = cy - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radii = [
              width / 2 * 0.1, // 10
              width / 2 * 0.3, // 9
              width / 2 * 0.5, // 8
              width / 2 * 0.7, // 7
              width / 2 * 0.9, // 6
            ];
            let score = 0;
            if (distance <= radii[0]) score = 10;
            else if (distance <= radii[1]) score = 9;
            else if (distance <= radii[2]) score = 8;
            else if (distance <= radii[3]) score = 7;
            else if (distance <= radii[4]) score = 6;
            else score = 0;

            return (
              <React.Fragment key={shot.id}>
                <Circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <SvgText
                  x={cx}
                  y={cy + 3}
                  fontSize="10"
                  fontWeight="bold"
                  fill="#fff"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {index + 1}
                </SvgText>
                {showPoints && (
                  <SvgText
                    x={cx}
                    y={cy + 18}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#374151"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {score}
                  </SvgText>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </div>
    );
  }

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
        {targetImageUrl ? renderDefaultTarget() : renderDefaultTarget()}
        {shots.map((shot, index) => {
          // Calculate center
          const cx = (shot.x_coordinate / 100) * width;
          const cy = (shot.y_coordinate / 100) * height;

          // Scoring logic
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = cx - centerX;
          const dy = cy - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radii = [
            width / 2 * 0.1, // 10
            width / 2 * 0.3, // 9
            width / 2 * 0.5, // 8
            width / 2 * 0.7, // 7
            width / 2 * 0.9, // 6
          ];
          let score = 0;
          if (distance <= radii[0]) score = 10;
          else if (distance <= radii[1]) score = 9;
          else if (distance <= radii[2]) score = 8;
          else if (distance <= radii[3]) score = 7;
          else if (distance <= radii[4]) score = 6;
          else score = 0;

          return (
            <React.Fragment key={shot.id}>
              <Circle
                cx={cx}
                cy={cy}
                r="8"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <SvgText
                x={cx}
                y={cy + 3}
                fontSize="10"
                fontWeight="bold"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {index + 1}
              </SvgText>
              {showPoints && (
                <SvgText
                  x={cx}
                  y={cy + 18}
                  fontSize="9"
                  fontWeight="bold"
                  fill="#374151"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {score}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </Pressable>
  );
}
