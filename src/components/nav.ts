import type { IconName } from './icons';

export const navItems = [
  { key: 'home', href: '/', icon: 'home' },
  { key: 'tools', href: '/tools', icon: 'tools' },
  { key: 'games', href: '/games', icon: 'games' },
  { key: 'about', href: '/about', icon: 'about' },
] as const satisfies readonly { key: string; href: string; icon: IconName }[];

export function isActive(path: string, href: string): boolean {
  const p = path.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  return href === '/' ? p === '/' : p === href || p.startsWith(href + '/');
}
