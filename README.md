# thimofej.de

Personal website of Thimofej Zapko. Next.js 16, React 19, Tailwind 4, vgpu / WebGPU.

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint
npm test
npm run build
```

Deployed on Vercel.

The homepage uses vgpu for the cinematic particle intro, chapter morphs, bloom, grain and vignette. Three.js supplies camera and curve math only; the homepage no longer uses a WebGL renderer or React Three Fiber. Sound is opt-in. Reduced motion, unavailable WebGPU and GPU device loss use the static monogram; navigation remains available if a flight is interrupted. Project pages remain readable without the 3D scene.

`/lab/vgpu` retains the small vgpu / Three.js comparison scene. It is excluded from search indexing and is not a benchmark of the full homepage.

## Google Search

The homepage includes Thimofej Zapko's name in its title and server-rendered heading, a canonical URL, and linked `WebSite`, `ProfilePage`, and `Person` structured data. The site name is consistently "Thimofej Zapko"; the structured data connects it with "Thimofej" and "Thimorrow", and the visible copy explains the Thimorrow alias. `robots.txt` allows crawling and points to the sitemap. The sitemap lists the homepage and Academy project; `/writing` is omitted while it has no articles. Only add `lastModified` when an actual content update date is available.

Keep `public/google47519819701820bd.html` in every deployment: Search Console ownership was verified through this file. The root layout also contains the HTML-tag verification code.

After publishing:

1. Open the `https://thimofej.de/` URL-prefix property in [Google Search Console](https://search.google.com/search-console) using `thimofej@yesterday-ai.de`. Its HTML-tag verification code is included in the root layout; confirm ownership once that code is live and keep the tag in place. A separate Domain property would require a DNS TXT record supplied by Google.
2. Submit `https://thimofej.de/sitemap.xml` under **Sitemaps**.
3. Inspect `https://thimofej.de/` with **URL inspection**, run the live test, and choose **Request indexing** if the page is eligible.
4. Link to `https://thimofej.de/` from the existing GitHub and X profiles so visitors and crawlers can discover it.

Search Console reports Google's actual indexing status. A search query alone is not a complete indexing check. Crawling can take days to weeks; neither submission nor structured data guarantees inclusion or a particular position for “Thimofej”. See [Google's recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
