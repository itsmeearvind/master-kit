
export * from './core/theme.js';
export * from './core/components.js';

import { createTheme, defaultTheme, generateCSSVariables } from './core/theme.js';
import { getButtonClasses, getCardClasses, getInputClasses, getTableClasses, defaultLayout } from './core/components.js';

export const AdminUI = {
  createTheme,
  defaultTheme,
  generateCSSVariables,
  getButtonClasses,
  getCardClasses,
  getInputClasses,
  getTableClasses,
  defaultLayout,
  version: '0.1.0',
};
