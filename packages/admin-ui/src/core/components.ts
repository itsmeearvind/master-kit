
import type { ThemeConfig } from './theme.js';

// Headless UI helpers - returns class strings based on theme
export const getButtonClasses = (theme: ThemeConfig, variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50';
  const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-8 text-base' };
  const radius = `rounded-${theme.radius === 'none' ? 'none' : theme.radius}`;
  
  const variants = {
    primary: `bg-[var(--maasters-primary)] text-white hover:opacity-90`,
    secondary: `bg-[var(--maasters-surface)] text-[var(--maasters-text)] border border-[var(--maasters-border)] hover:bg-[var(--maasters-bg)]`,
    ghost: `text-[var(--maasters-text)] hover:bg-[var(--maasters-surface)]`,
    danger: `bg-[var(--maasters-error)] text-white hover:opacity-90`,
  };

  return `${base} ${sizes[size]} ${radius} ${variants[variant]}`;
};

export const getCardClasses = (theme: ThemeConfig) => {
  return `bg-[var(--maasters-bg)] border border-[var(--maasters-border)] rounded-[var(--maasters-radius)] shadow-sm p-6`;
};

export const getInputClasses = (theme: ThemeConfig) => {
  return `flex h-10 w-full rounded-[var(--maasters-radius)] border border-[var(--maasters-border)] bg-[var(--maasters-bg)] px-3 py-2 text-sm text-[var(--maasters-text)] placeholder:text-[var(--maasters-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--maasters-primary)]`;
};

export const getTableClasses = (theme: ThemeConfig) => {
  return {
    table: 'w-full text-sm',
    thead: 'border-b border-[var(--maasters-border)]',
    th: 'h-12 px-4 text-left font-medium text-[var(--maasters-text-secondary)]',
    tr: 'border-b border-[var(--maasters-border)] hover:bg-[var(--maasters-surface)] transition-colors',
    td: 'p-4 text-[var(--maasters-text)]',
  };
};

// Admin layout config
export type AdminLayoutConfig = {
  sidebar: { width: string; collapsible: boolean; items: Array<{ label: string; href: string; icon?: string; permission?: string; children?: any[] }> };
  header: { showSearch: boolean; showNotifications: boolean; showProfile: boolean };
  theme: ThemeConfig;
};

export const defaultLayout: AdminLayoutConfig = {
  sidebar: {
    width: '280px',
    collapsible: true,
    items: [
      { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
      { label: 'Users', href: '/admin/users', icon: 'Users', permission: 'user:list' },
      { label: 'Orders', href: '/admin/orders', icon: 'ShoppingCart', permission: 'order:list' },
      { label: 'Products', href: '/admin/products', icon: 'Package', permission: 'product:list' },
      { label: 'Settings', href: '/admin/settings', icon: 'Settings', permission: 'admin:*' },
    ]
  },
  header: { showSearch: true, showNotifications: true, showProfile: true },
  theme: { colors: { primary: '#0a0a0a', secondary: '#71717a', background: '#ffffff', surface: '#f4f4f5', text: '#09090b', textSecondary: '#71717a', border: '#e4e4e7', success: '#22c55e', warning: '#f59e0b', error: '#ef4444' }, radius: 'md', font: 'inter', mode: 'light' },
};
