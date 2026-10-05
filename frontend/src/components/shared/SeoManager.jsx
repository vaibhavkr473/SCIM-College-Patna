import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://scim-college-patna-cew7.vercel.app';

const publicPages = {
  '/': {
    title: 'SCIM College, Patna | BBA & BCA Programs and Admissions',
    description:
      'Explore BBA and BCA programs, admissions, and student resources at SCIM College, Patna. Access study materials, online tests, academic support, and college updates.',
    indexable: true,
  },
  '/login': {
    title: 'Student Login | SCIM College, Patna',
    description: 'Sign in to the SCIM College academic portal.',
    indexable: false,
  },
};

function setMetaTag(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!content) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = publicPages[pathname];
    const isIndexable = Boolean(page?.indexable);
    const title = page?.title || 'Academic Portal | SCIM College, Patna';
    const description = page?.description || 'SCIM College, Patna academic portal.';
    const canonicalUrl = isIndexable ? `${siteUrl}${pathname}` : null;

    document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', isIndexable ? 'index, follow' : 'noindex, nofollow');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', isIndexable ? `${siteUrl}/og-image.svg` : null);
    setMetaTag('property', 'og:image:alt', isIndexable ? 'SCIM College, Patna — BBA and BCA programs' : null);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', isIndexable ? `${siteUrl}/og-image.svg` : null);
    setMetaTag('name', 'twitter:image:alt', isIndexable ? 'SCIM College, Patna — BBA and BCA programs' : null);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    } else {
      canonical?.remove();
    }
  }, [pathname]);

  return null;
}
