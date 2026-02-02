/**
 * Domain Detection Utility
 * Detects which subdomain/route the app is running on
 * 
 * Supports:
 * - Real subdomains (app.flowversal.com, admin.flowversal.com)
 * - Path-based routing for development (/admin, /docs)
 */

export type Domain = 'app' | 'admin' | 'marketing' | 'docs';

export function detectDomain(): Domain {
  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // Production subdomains take precedence
  if (hostname.startsWith('app.')) {
    return 'app';
  }
  if (hostname.startsWith('admin.')) {
    return 'admin';
  }
  if (hostname.startsWith('docs.')) {
    return 'docs';
  }

  // Path-based routing for local/dev
  if (path.startsWith('/admin')) {
    return 'admin';
  }
  if (path.startsWith('/docs')) {
    return 'docs';
  }
  if (path.startsWith('/app')) {
    return 'app';
  }
  if (path.startsWith('/marketing')) {
    return 'marketing';
  }

  // Default local root should show marketing site
  if (path === '/' || path === '') {
    return 'marketing';
  }

  // Fallback to app for any other in-app deep links (e.g., /workflow-builder)
  return 'app';
}

export function getDomainConfig(domain: Domain) {
  const configs = {
    app: {
      name: 'Flowversal App',
      baseUrl: '/app',
      requiresAuth: true,
      allowedRoles: ['user', 'admin', 'super_admin'],
    },
    admin: {
      name: 'Admin Panel',
      baseUrl: '/admin',
      requiresAuth: true,
      allowedRoles: ['admin', 'super_admin'],
    },
    marketing: {
      name: 'Flowversal',
      baseUrl: '/',
      requiresAuth: false,
      allowedRoles: [],
    },
    docs: {
      name: 'Documentation',
      baseUrl: '/docs',
      requiresAuth: false,
      allowedRoles: [],
    },
  };
  
  return configs[domain];
}

export function isAdminDomain(): boolean {
  return detectDomain() === 'admin';
}

export function isAppDomain(): boolean {
  return detectDomain() === 'app';
}

export function navigateToDomain(domain: Domain, path: string = '') {
  const hostname = window.location.hostname;
  
  // In production, use real subdomains
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    const baseDomain = hostname.replace(/^(app|admin|docs)\./, '');
    const subdomain = domain === 'marketing' ? '' : `${domain}.`;
    window.location.href = `https://${subdomain}${baseDomain}${path}`;
  } else {
    // In development, use path-based routing
    const basePath = domain === 'app' ? '' : `/${domain}`;
    window.location.href = `${basePath}${path}`;
  }
}