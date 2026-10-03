# Wishlist discovery engine (n8n + Gemini)

An AI workflow that reads public posts about shopping on Myntra and turns each one into structured, quote-backed evidence about the wishlist-to-purchase journey.

## Try it
**Live test link:** _paste the Production URL of workflow 3 here once it is active_ - open it, paste any review or comment (Hinglish works), and see how the engine tags it.

## How it works
1. **Collect** (workflow 1): Myntra App Store reviews (RSS, 10 pages) and YouTube comments on Myntra videos (YouTube Data API, Myntra-only titles). Reddit search is built in but switched off until Reddit approves API access. Survey answers can be added through a `manual_sources` sheet tab.
2. **Clean**: removes duplicates and very short posts, keeps Myntra posts only, puts posts with buying words first, skips posts already tagged.
3. **Tag** (Gemini, free tier): one call per post with a fixed label taxonomy covering wishlist reasons, blockers, uncertainties, postponement triggers, outside sources, comparison behaviour, intent, segment, unmet need and severity (1-3). Every label must be backed by a verbatim quote, and quotes are checked against the post. Placeholder answers are removed and praise-only posts are marked not relevant.
4. **Store**: one row per post in the `tagged` Google Sheet.
5. **Analyse** (workflow 2): counts each label, the share of relevant posts, average severity and the share among genuine buying intent. It ranks opportunities by frequency x severity x metric fit and writes them to the `insights` tab, plus a 50-row `validation` sample for a human check.

## Files
| File | What it is |
|---|---|
| `wishlist_1_collect_and_tag.json` | Collect, clean, tag with Gemini, save to the sheet |
| `wishlist_2_analyze.json` | Compute insights and a validation sample |
| `wishlist_3_try_it_public_link.json` | Public page: paste a post, see the tags (same prompt and checks) |

Import into n8n (Workflows -> Import from file), then select your credentials: Gemini as Header Auth (`x-goog-api-key`), YouTube as Query Auth (`key`), and Google Sheets. No keys are stored in these files.

## Results from the run used in the case study
250 Myntra posts (123 App Store reviews, 127 YouTube comments) -> 126 relevant (29 reviews, 97 comments).
Top blockers (share of relevant posts): fear of returns and refunds 44%, comparing with other platforms 16%, trust and authenticity 15%, price or waiting for a sale 12%, cart and checkout friction 11%, delivery 8%, unpredictable discounts 8%, fabric quality 6%, fit and size 3%.
Only 3 of 250 posts use the word "wishlist", so primary research was needed to test these blockers with wishlisters.
