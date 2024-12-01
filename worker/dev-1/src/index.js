var src_default = {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle robots.txt request
    if (pathname === '/robots.txt') {
      try {
        const optionsResponse = await fetch('https://dev-1.pockethost.io/api/collections/options/records', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!optionsResponse.ok) {
          throw new Error('Failed to fetch options');
        }

        const optionsData = await optionsResponse.json();

        // Get robots.txt content and siteurl from options
        const robotsTxt = optionsData.items.find((item) => item.name === 'robots')?.value || '';
        const siteurl = optionsData.items.find((item) => item.name === 'siteurl')?.value || 'https://default-url.com';

        // If no robots.txt content is set in options, generate a default one
        const defaultRobotsTxt = `User-agent: *
Allow: /
Sitemap: ${siteurl}/sitemap.xml`;

        return new Response(robotsTxt || defaultRobotsTxt, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        // Return default robots.txt in case of error
        return new Response(`User-agent: *\nAllow: /`, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }

    // Handle sitemap.xml request
    if (pathname === '/sitemap.xml') {
      try {
        // Fetch page links and options
        const [linksResponse, optionsResponse] = await Promise.all([
          fetch('https://dev-1.pockethost.io/api/collections/page_links/records', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
          fetch('https://dev-1.pockethost.io/api/collections/options/records', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }),
        ]);

        if (!linksResponse.ok || !optionsResponse.ok) {
          throw new Error('Failed to fetch data for sitemap');
        }

        const linksData = await linksResponse.json();
        const optionsData = await optionsResponse.json();

        // Get site URL from options
        const siteurl = optionsData.items.find((item) => item.name === 'siteurl')?.value || 'https://default-url.com';

        // Generate sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add URLs for each page (excluding header and footer)
        linksData.items
          .filter((item) => !['header', 'footer'].includes(item.name.replace('/', '')))
          .forEach((page) => {
            // Format the updated date to be compatible with W3C Datetime format
            const lastmod = page.updated ? new Date(page.updated).toISOString() : new Date().toISOString();

            sitemap += `
  <url>
    <loc>${siteurl}${page.name}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
          });

        // <changefreq>${page.name === '/' ? 'daily' : 'weekly'}</changefreq>
        // <priority>${page.name === '/' ? '1.0' : '0.8'}</priority>

        sitemap += `
</urlset>`;

        // Return sitemap XML with appropriate headers
        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        return new Response('Error generating sitemap', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }
    const postsApiUrl = `https://dev-1.pockethost.io/api/collections/posts/records?filter=(name="${pathname}")&expand=objects`;
    const optionsApiUrl = `https://dev-1.pockethost.io/api/collections/options/records`;
    const themesApiUrl = `https://dev-1.pockethost.io/api/collections/themes/records`;

    console.log('Fetching data from:', postsApiUrl, optionsApiUrl, themesApiUrl);

    try {
      // Fix: Only checking for the responses we actually fetch
      const [postsResponse, optionsResponse, themesResponse] = await Promise.all([
        fetch(postsApiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(optionsApiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
        fetch(themesApiUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } }),
      ]);

      // Fix: Remove checks for headerResponse and footerResponse
      if (!postsResponse.ok) throw new Error(`Failed to fetch posts API: ${postsResponse.statusText}`);
      if (!optionsResponse.ok) throw new Error(`Failed to fetch options API: ${optionsResponse.statusText}`);
      if (!themesResponse.ok) throw new Error(`Failed to fetch themes API: ${themesResponse.statusText}`);

      const postsData = await postsResponse.json();
      const optionsData = await optionsResponse.json();
      const themesData = await themesResponse.json();

      if (postsData.items.length === 0) {
        return new Response('Page not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      // Rest of your code remains the same
      const matchingPost = postsData.items[0];
      // Find header and footer from posts data

      // Correct approach
      // Check if expand exists first, then safely access objects
      const headerObject = matchingPost.expand ? matchingPost.expand.objects?.find((item) => item.name === '/header') : null;
      const footerObject = matchingPost.expand ? matchingPost.expand.objects?.find((item) => item.name === '/footer') : null;

      const siteurl = optionsData.items.find((item) => item.name === 'siteurl')?.value || 'https://default-url.com';
      const metaDescription = optionsData.items.find((item) => item.name === 'meta')?.value || 'Default meta description.';
      const cacheLength = parseInt(optionsData.items.find((item) => item.name === 'cacheLength')?.value) || 3600;
      const themeName = optionsData.items.find((item) => item.name === 'theme')?.value || 'default-theme';
      const activeTheme = themesData.items.find((item) => item.class === themeName) || {};
      const themeClass = activeTheme.class || '';
      const themeStylesheet = activeTheme.stylesheet || '';
      const themeJavascript = activeTheme.javascript || '';

      const headContent = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${metaDescription}">
        <title>${matchingPost.title || 'Untitled'}</title>
        <link rel="canonical" href="${siteurl}${pathname}">
        <style>${themeStylesheet}</style>
      `;

      let fullHtml = `
        <!DOCTYPE html>
        <html lang="en" class="${themeClass}">
        <head>
          ${headContent}
        </head>
        <body>
      `;

      // Add header if it exists
      if (headerObject && headerObject.content) {
        fullHtml += headerObject.content;
      }

      // Fix: Access content through matchingPost (which is postsData.items[0])
      fullHtml += `
			${matchingPost.content}
		`;

      // Add footer if it exists
      if (footerObject && footerObject.content) {
        fullHtml += footerObject.content;
      }

      if (themeJavascript) {
        fullHtml += `<script>${themeJavascript}<\/script>`;
      }

      fullHtml += `
        </body>
        </html>
      `;

      const headers = {
        'Content-Type': 'text/html',
        'Cache-Control': `public, max-age=${cacheLength}`,
      };

      const response = new Response(fullHtml, { headers });
      console.log('Response generated:', response);
      return response;
    } catch (error) {
      console.error('Error occurred:', error);
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>${error.message}</p>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' }, status: 500 }
      );
    }
  },
};

export { src_default as default };
