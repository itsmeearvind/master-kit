
export type ThemeConfig = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  font: 'inter' | 'poppins' | 'roboto' | 'system';
  mode: 'light' | 'dark';
};

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#0a0a0a',
    secondary: '#71717a',
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#09090b',
    textSecondary: '#71717a',
    border: '#e4e4e7',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  radius: 'md',
  font: 'inter',
  mode: 'light',
};

export const generateCSSVariables = (theme: ThemeConfig): string => {
  return `
:root {
  --maasters-primary: ${theme.colors.primary};
  --maasters-secondary: ${theme.colors.secondary};
  --maasters-bg: ${theme.colors.background};
  --maasters-surface: ${theme.colors.surface};
  --maasters-text: ${theme.colors.text};
  --maasters-text-secondary: ${theme.colors.textSecondary};
  --maasters-border: ${theme.colors.border};
  --maasters-success: ${theme.colors.success};
  --maasters-warning: ${theme.colors.warning};
  --maasters-error: ${theme.colors.error};
  --maasters-radius: ${theme.radius === 'none' ? '0' : theme.radius === 'sm' ? '0.25rem' : theme.radius === 'md' ? '0.5rem' : theme.radius === 'lg' ? '0.75rem' : '9999px'};
  --maasters-font: ${theme.font === 'inter' ? 'Inter, sans-serif' : theme.font === 'poppins' ? 'Poppins, sans-serif' : theme.font === 'roboto' ? 'Roboto, sans-serif' : 'system-ui, sans-serif'};
}
`.trim();
};

export const createTheme = (overrides: Partial<ThemeConfig> & { colors?: Partial<ThemeConfig['colors']> }): ThemeConfig => {
  return {
    ...defaultTheme,
    ...overrides,
    colors: { ...defaultTheme.colors, ...overrides.colors },
  };
};
