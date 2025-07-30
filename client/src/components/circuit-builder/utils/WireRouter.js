/**
 * Smart Wire Router - Creates clean orthogonal wire paths
 * Converts free-form drawing into clean horizontal/vertical segments
 */

export class WireRouter {
  /**
   * Convert a free-form drawn path into clean but natural-looking segments
   * @param {Array} points - Array of {x, y} points from user drawing
   * @param {Object} startPin - Starting pin position {x, y}
   * @param {Object} endPin - Ending pin position {x, y}
   * @returns {Array} Optimized path that follows user's intent
   */
  static optimizePath(points, startPin, endPin) {
    if (!points || points.length < 2) {
      return this.createDirectPath(startPin, endPin);
    }

    // Build complete path including start and end points
    const fullPath = [startPin, ...points, endPin];
    
    // Simplify the path by removing redundant points but preserve shape
    const simplified = this.simplifyPathPreservingShape(fullPath);
    
    // Smooth the path while maintaining the user's intended direction
    const smoothed = this.smoothPath(simplified);
    
    return smoothed;
  }

  /**
   * Create a direct path between two pins - can be straight diagonal or with gentle bend
   */
  static createDirectPath(startPin, endPin) {
    const dx = Math.abs(endPin.x - startPin.x);
    const dy = Math.abs(endPin.y - startPin.y);
    
    // If the points are close to being on the same line, make it straight
    if (dx < 10 || dy < 10) {
      return [startPin, endPin];
    }
    
    // For diagonal connections, allow direct diagonal lines
    if (Math.abs(dx - dy) < 30) {
      return [startPin, endPin];
    }
    
    // Otherwise use a single gentle bend
    if (dx > dy) {
      // Horizontal first, then vertical
      return [
        startPin,
        { x: endPin.x, y: startPin.y },
        endPin
      ];
    } else {
      // Vertical first, then horizontal
      return [
        startPin,
        { x: startPin.x, y: endPin.y },
        endPin
      ];
    }
  }

  /**
   * Simplify path by removing redundant points while preserving the user's intended shape
   */
  static simplifyPathPreservingShape(points, tolerance = 8) {
    if (points.length <= 2) return points;
    
    const simplified = [points[0]]; // Always keep first point
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Calculate if this point is important for preserving shape
      const keepPoint = this.shouldKeepPoint(prev, curr, next, tolerance);
      
      if (keepPoint) {
        simplified.push(curr);
      }
    }
    
    simplified.push(points[points.length - 1]); // Always keep last point
    return simplified;
  }

  /**
   * Determine if a point should be kept to preserve the wire's shape
   */
  static shouldKeepPoint(prev, curr, next, tolerance) {
    // Always keep points that are far apart
    if (this.distance(prev, curr) > tolerance * 2 || this.distance(curr, next) > tolerance * 2) {
      return true;
    }
    
    // Calculate if removing this point would significantly change the path
    const directDistance = this.distance(prev, next);
    const pathDistance = this.distance(prev, curr) + this.distance(curr, next);
    
    // Keep point if it adds significant path length (indicates intentional bend)
    if (pathDistance > directDistance * 1.15) {
      return true;
    }
    
    // Calculate angle change to preserve sharp turns
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let angleDiff = Math.abs(angle1 - angle2);
    
    // Normalize angle difference
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
    
    // Keep point if it represents a significant direction change (preserve S-curves, etc.)
    return angleDiff > Math.PI / 8; // 22.5 degrees
  }

  /**
   * Smooth the path while maintaining the user's drawing intent
   */
  static smoothPath(points) {
    if (points.length <= 2) return points;
    
    const smoothed = [points[0]]; // Keep start point
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Slightly smooth the current point while preserving the overall shape
      const smoothedPoint = this.smoothPoint(prev, curr, next);
      smoothed.push(smoothedPoint);
    }
    
    smoothed.push(points[points.length - 1]); // Keep end point
    return smoothed;
  }

  /**
   * Apply gentle smoothing to a point while preserving shape
   */
  static smoothPoint(prev, curr, next) {
    // Light smoothing factor - don't over-smooth
    const smoothFactor = 0.15;
    
    // Calculate the "ideal" smooth position
    const smoothX = (prev.x + curr.x + next.x) / 3;
    const smoothY = (prev.y + curr.y + next.y) / 3;
    
    // Blend original position with smooth position
    return {
      x: curr.x * (1 - smoothFactor) + smoothX * smoothFactor,
      y: curr.y * (1 - smoothFactor) + smoothY * smoothFactor
    };
  }

  /**
   * Generate SVG path with optional smooth curves
   */
  static generateSVGPathWithCurves(points, useCurves = true) {
    if (!points || points.length < 2) return '';
    
    if (!useCurves || points.length === 2) {
      // Simple straight line or user wants no curves
      return this.generateSVGPath(points);
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      if (i === 1 || i === points.length - 1) {
        // First and last segments stay straight for clean pin connections
        path += ` L ${points[i].x} ${points[i].y}`;
      } else {
        // Add gentle curves for middle segments
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        // Calculate control points for smooth curve
        const controlDistance = Math.min(
          this.distance(prev, curr) * 0.3,
          this.distance(curr, next) * 0.3,
          20 // Max control distance
        );
        
        // Direction vectors
        const prevDir = this.normalize({ x: curr.x - prev.x, y: curr.y - prev.y });
        const nextDir = this.normalize({ x: next.x - curr.x, y: next.y - curr.y });
        
        // Control points for smooth curve
        const cp1 = {
          x: curr.x - prevDir.x * controlDistance,
          y: curr.y - prevDir.y * controlDistance
        };
        const cp2 = {
          x: curr.x + nextDir.x * controlDistance,
          y: curr.y + nextDir.y * controlDistance
        };
        
        path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  }

  /**
   * Normalize a vector
   */
  static normalize(vector) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
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