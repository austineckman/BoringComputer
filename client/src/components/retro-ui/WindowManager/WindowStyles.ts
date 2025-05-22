// WindowStyles.ts - Centralized styling system for windows

export type ColorScheme = 'blue' | 'black' | 'orange' | 'green' | 'red';

export const windowStyles = {
  titleBar: {
    active: {
      blue: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500',
      black: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700',
      orange: 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500',
      green: 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-500',
      red: 'bg-gradient-to-r from-red-600 via-red-500 to-rose-500'
    },
    inactive: 'bg-gradient-to-r from-gray-700 to-gray-600'
  },
  
  startBar: {
    blue: 'bg-gradient-to-r from-blue-900 to-purple-900 border-t-2 border-blue-400',
    black: 'bg-gradient-to-r from-gray-900 to-gray-800 border-t-2 border-gray-600',
    orange: 'bg-gradient-to-r from-orange-900 to-amber-800 border-t-2 border-orange-500',
    green: 'bg-gradient-to-r from-green-900 to-emerald-800 border-t-2 border-green-500',
    red: 'bg-gradient-to-r from-red-900 to-rose-800 border-t-2 border-red-500'
  },
  
  startButton: {
    blue: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border border-cyan-300',
    black: 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 border border-gray-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 border border-orange-300',
    green: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border border-green-300',
    red: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border border-red-300'
  },
  
  taskbarButton: {
    blue: 'bg-blue-800 hover:bg-blue-700 border border-blue-500',
    black: 'bg-gray-800 hover:bg-gray-700 border border-gray-600',
    orange: 'bg-orange-800 hover:bg-orange-700 border border-orange-500',
    green: 'bg-green-800 hover:bg-green-700 border border-green-500',
    red: 'bg-red-800 hover:bg-red-700 border border-red-500'
  },

  controlButton: {
    blue: 'bg-blue-800 hover:bg-blue-700 border border-blue-500',
    black: 'bg-gray-800 hover:bg-gray-700 border border-gray-600',
    orange: 'bg-orange-800 hover:bg-orange-700 border border-orange-500',
    green: 'bg-green-800 hover:bg-green-700 border border-green-500',
    red: 'bg-red-800 hover:bg-red-700 border border-red-500'
  }
};

export const getWindowStyle = (colorScheme: ColorScheme, type: keyof typeof windowStyles, variant?: string) => {
  const styleGroup = windowStyles[type];
  
  if (typeof styleGroup === 'object' && variant) {
    return (styleGroup as any)[variant]?.[colorScheme] || (styleGroup as any)[variant];
  }
  
  return (styleGroup as any)[colorScheme];
};