// Circle sizing constants for consistent scaling across component
export const CIRCLE_CONFIG_LARGE = {

  // Base radius for topic circles
  BASE_RADIUS: 100,
  
  // Scaling factor for all circles (0.7 = 30% reduction)
  SCALE_FACTOR: 1,
  
  // Calculated scaled radius
  get SCALED_RADIUS() {
    return this.BASE_RADIUS * this.SCALE_FACTOR;
  },
  
  // Belt connection radius (accounting for stroke)
  get BELT_RADIUS() {
    return this.SCALED_RADIUS - 2;
  },
  
  // Collision radius for force simulation
  COLLISION_RADIUS: {
    SMALL: 180,
    MEDIUM: 150,
    LARGE: 150
  },
  POSITIONS_THREE:[
        { x: 0.25, y: 0.5 }, // Left
        { x: 0.5, y: 0.5 },  // Center
        { x: 0.75, y: 0.5 }, // Right
      ],

  POSITIONS_FOUR:[
        { x: 0.35, y: 0.4 }, // Top-left
        { x: 0.65, y: 0.4 }, // Top-right
        { x: 0.35, y: 0.65 }, // Bottom-left
        { x: 0.65, y: 0.65 }, // Bottom-right
      ],

   POSITIONS_TEN: [
        { x: 0.4, y: 0.5 }, // Position 1 (center-left, middle row)
        { x: 0.6, y: 0.5 }, // Position 2 (center-right, middle row)
        { x: 0.5, y: 0.35 }, // Position 3 (top-center) - moved down to avoid header
         { x: 0.5, y: 0.75 }, // Position 4 (top-left) - moved down to avoid header
        { x: 0.25, y: 0.35 }, // Position 5 (far-left, middle row)
        { x: 0.75, y: 0.35 },// Position 6 (top-right) - moved down to avoid header
         { x: 0.7, y: 0.75 }, // Position 7 (bottom-center)
        { x: 0.3, y: 0.75 }, // Position 8 (bottom-left)
        { x: 0.8, y: 0.5 }, // Position 9 (far-right, middle row)
        { x: 0.2, y: 0.5 }, // Position 10 (bottom-right)
      ],
    
      BOUNDARIES:{
            X_MIN: 0.21,
            X_MAX: 0.9,
            Y_MIN_SMALL: 0.15,
            Y_MIN_LARGE: 0.18,
            Y_MAX: 0.75,
      }
    
};

export const CIRCLE_CONFIG_SMALL = {
  // Base radius for topic circles
  BASE_RADIUS: 100,
  
  // Scaling factor for all circles (0.7 = 30% reduction)
  SCALE_FACTOR: 0.8,
  
  // Calculated scaled radius
  get SCALED_RADIUS() {
    return this.BASE_RADIUS * this.SCALE_FACTOR;
  },
  
  // Belt connection radius (accounting for stroke)
  get BELT_RADIUS() {
    return this.SCALED_RADIUS - 2;
  },
  
  // Collision radius for force simulation
  COLLISION_RADIUS: {
    SMALL: 150,
    MEDIUM: 150,
    LARGE: 150
  },
  POSITIONS_THREE:[
        { x: 0.25, y: 0.5 }, // Left
        { x: 0.5, y: 0.5 },  // Center
        { x: 0.75, y: 0.5 }, // Right
      ],
   POSITIONS_FOUR:[
        { x: 0.35, y: 0.4 }, // Top-left
        { x: 0.65, y: 0.4 }, // Top-right
        { x: 0.35, y: 0.65 }, // Bottom-left
        { x: 0.65, y: 0.65 }, // Bottom-right
      ],

   POSITIONS_TEN: [
        { x: 0.4, y: 0.5 }, // Position 1 (center-left, middle row)
        { x: 0.6, y: 0.4 }, // Position 2 (center-right, middle row)
        { x: 0.5, y: 0.35 }, // Position 3 (top-center) - moved down to avoid header
         { x: 0.5, y: 0.75 }, // Position 4 (top-left) - moved down to avoid header
        { x: 0.25, y: 0.35 }, // Position 5 (far-left, middle row)
        { x: 0.75, y: 0.35 },// Position 6 (top-right) - moved down to avoid header
         { x: 0.7, y: 0.75 }, // Position 7 (bottom-center)
        { x: 0.3, y: 0.75 }, // Position 8 (bottom-left)
        { x: 0.8, y: 0.5 }, // Position 9 (far-right, middle row)
        { x: 0.2, y: 0.5 }, // Position 10 (bottom-right)
      ],
      BOUNDARIES:{
            X_MIN: 0.24,
            X_MAX: 0.9,
            Y_MIN_SMALL: 0.15,
            Y_MIN_LARGE: 0.15,
            Y_MAX: 0.8,
      }
};

export const SCREEN_WIDTH = 1900;