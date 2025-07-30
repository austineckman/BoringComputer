/**
 * Smart Wire Router - Creates clean orthogonal wire paths
 * Converts free-form drawing into clean horizontal/vertical segments
 */

export class WireRouter {
  /**
   * Convert a free-form drawn path into clean orthogonal segments
   * @param {Array} points - Array of {x, y} points from user drawing
   * @param {Object} startPin - Starting pin position {x, y}
   * @param {Object} endPin - Ending pin position {x, y}
   * @returns {Array} Optimized path with minimal bends
   */
  static optimizePath(points, startPin, endPin) {
    if (!points || points.length < 2) {
      return this.createDirectPath(startPin, endPin);
    }

    // Simplify the path by removing redundant points
    const simplified = this.simplifyPath(points);
    
    // Convert to orthogonal segments
    const orthogonal = this.makeOrthogonal(simplified, startPin, endPin);
    
    // Minimize bends
    const optimized = this.minimizeBends(orthogonal);
    
    return optimized;
  }

  /**
   * Create a direct path between two pins with one bend
   */
  static createDirectPath(startPin, endPin) {
    const dx = endPin.x - startPin.x;
    const dy = endPin.y - startPin.y;
    
    // Choose the best bend point based on distance
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal first, then vertical
      return [
        { x: startPin.x, y: startPin.y },
        { x: endPin.x, y: startPin.y },
        { x: endPin.x, y: endPin.y }
      ];
    } else {
      // Vertical first, then horizontal
      return [
        { x: startPin.x, y: startPin.y },
        { x: startPin.x, y: endPin.y },
        { x: endPin.x, y: endPin.y }
      ];
    }
  }

  /**
   * Simplify path by removing points that don't change direction significantly
   */
  static simplifyPath(points, tolerance = 10) {
    if (points.length <= 2) return points;
    
    const simplified = [points[0]]; // Always keep first point
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Calculate angle change
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs(angle1 - angle2);
      
      // Keep point if it represents a significant direction change
      if (angleDiff > Math.PI / 6 || // 30 degrees
          this.distance(prev, curr) > tolerance * 3) {
        simplified.push(curr);
      }
    }
    
    simplified.push(points[points.length - 1]); // Always keep last point
    return simplified;
  }

  /**
   * Convert path to orthogonal (horizontal/vertical) segments
   */
  static makeOrthogonal(points, startPin, endPin) {
    if (points.length <= 2) {
      return this.createDirectPath(startPin, endPin);
    }
    
    const orthogonal = [{ x: startPin.x, y: startPin.y }];
    let currentPos = { x: startPin.x, y: startPin.y };
    
    for (let i = 1; i < points.length; i++) {
      const target = points[i];
      const dx = target.x - currentPos.x;
      const dy = target.y - currentPos.y;
      
      // Determine whether to go horizontal or vertical first
      if (Math.abs(dx) > Math.abs(dy)) {
        // Move horizontally first
        if (Math.abs(dx) > 5) { // Minimum movement threshold
          currentPos = { x: target.x, y: currentPos.y };
          orthogonal.push({ ...currentPos });
        }
        // Then vertically
        if (Math.abs(dy) > 5) {
          currentPos = { x: currentPos.x, y: target.y };
          orthogonal.push({ ...currentPos });
        }
      } else {
        // Move vertically first
        if (Math.abs(dy) > 5) {
          currentPos = { x: currentPos.x, y: target.y };
          orthogonal.push({ ...currentPos });
        }
        // Then horizontally
        if (Math.abs(dx) > 5) {
          currentPos = { x: target.x, y: currentPos.y };
          orthogonal.push({ ...currentPos });
        }
      }
    }
    
    // Ensure we end at the target pin
    if (currentPos.x !== endPin.x || currentPos.y !== endPin.y) {
      // Add final segments to reach end pin
      if (currentPos.x !== endPin.x) {
        orthogonal.push({ x: endPin.x, y: currentPos.y });
      }
      if (currentPos.y !== endPin.y) {
        orthogonal.push({ x: endPin.x, y: endPin.y });
      }
    }
    
    return orthogonal;
  }

  /**
   * Minimize bends by removing unnecessary intermediate points
   */
  static minimizeBends(points) {
    if (points.length <= 2) return points;
    
    const minimized = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Check if current point is necessary
      const isHorizontalLine = prev.y === curr.y && curr.y === next.y;
      const isVerticalLine = prev.x === curr.x && curr.x === next.x;
      
      // Only keep the point if it's not on a straight line
      if (!isHorizontalLine && !isVerticalLine) {
        minimized.push(curr);
      }
    }
    
    minimized.push(points[points.length - 1]);
    return minimized;
  }

  /**
   * Calculate distance between two points
   */
  static distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generate SVG path string from optimized points
   */
  static generateSVGPath(points) {
    if (!points || points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  /**
   * Add rounded corners to wire path for smoother appearance
   */
  static addRoundedCorners(points, radius = 5) {
    if (points.length < 3) return points;
    
    const rounded = [];
    
    for (let i = 0; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (i === 0 || i === points.length - 1) {
        // Keep start and end points as-is
        rounded.push(curr);
      } else {
        // Add rounded corner
        const d1 = this.distance(prev, curr);
        const d2 = this.distance(curr, next);
        const r = Math.min(radius, d1 / 2, d2 / 2);
        
        if (r > 1) {
          // Calculate corner points
          const t1 = r / d1;
          const t2 = r / d2;
          
          const corner1 = {
            x: curr.x + (prev.x - curr.x) * t1,
            y: curr.y + (prev.y - curr.y) * t1
          };
          
          const corner2 = {
            x: curr.x + (next.x - curr.x) * t2,
            y: curr.y + (next.y - curr.y) * t2
          };
          
          rounded.push(corner1, curr, corner2);
        } else {
          rounded.push(curr);
        }
      }
    }
    
    return rounded;
  }
}