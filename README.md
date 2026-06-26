# ZroEffortSales Website

A dependency-free official product website and local AI copilot for turning Etsy trend signals into reviewed Printify product launches.

The site presents ZroEffortSales as a polished product with a live operator demo built into the page. It is intentionally review-first: it can draft product ideas, listing copy, Printify setup tasks, customer replies, and approval checklists, but it does not publish listings, send messages, place orders, scrape Etsy, or change account settings on its own.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/`.

## Publish

This is a static website and can be hosted without a build step.

- Netlify: drag this folder into Netlify Drop, or connect the repo. Publish directory is `.`.
- Vercel: import the repo as a static project. No build command is required.
- GitHub Pages: publish from the `gh-pages` branch, root folder.

## Custom Domain and HTTPS

The production domain is `zroeffect.com`. DNS and certificate issuance are completed in the hosting provider after the site is deployed.

Recommended setup:

1. Add `zroeffect.com` as the custom domain in the selected host.
2. Point DNS at that host:
   - Netlify apex: add an `ALIAS`, `ANAME`, or flattened `CNAME` for `zroeffect.com` to the Netlify site hostname.
   - Vercel apex: add an `A` record for `zroeffect.com` to `76.76.21.21`.
   - GitHub Pages apex: add `A` records for `zroeffect.com` to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
   - Optional GitHub Pages IPv6: add `AAAA` records for `zroeffect.com` to `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`.
3. Optional: add `www.zroeffect.com` as an alias and point it with a `CNAME` to `devincolvin-pixel.github.io`.
4. Enable the host's automatic HTTPS certificate for `zroeffect.com`.
5. Confirm `https://zroeffect.com/` loads successfully before using it as the Etsy app website URL.

Included hosting files:

- `.nojekyll` for GitHub Pages static hosting.
- `CNAME` for the GitHub Pages custom domain.
- `netlify.toml` for Netlify publish settings and basic security headers.
- `vercel.json` for Vercel clean URLs and basic security headers.

## Workflow

1. Open the site and use the hero call-to-action or scroll to the live demo.
2. Set the number of products to list per week.
3. Use the Printify and Etsy connection controls to prepare the secure connector workflow.
4. Paste Etsy page text, trend notes, product URLs, or keyword observations into Trend Lab.
5. Analyze trends to score product directions and flag watched trademark terms.
6. Build the launch plan or product pipeline from the strongest signals.
7. Generate listing drafts and photo checklists.
8. Queue Printify product creation tasks and check estimated margin.
9. Review every consequential action in the approval queue before using Etsy or Printify.

## Safety Boundary

This is a local planning console, not an autonomous marketplace agent. Use it to prepare original designs and drafts. Before publishing or ordering, verify:

- trademarks and brand names,
- Etsy policy compliance,
- Printify production costs and shipping windows,
- sample quality,
- customer message accuracy,
- final listing photos and personalization fields.

## Files

- `index.html` - app structure
- `styles.css` - responsive dashboard styling
- `app.js` - local trend analysis, listing generation, margin math, queues, and approvals
