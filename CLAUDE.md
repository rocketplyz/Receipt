# Warranty & Receipt Vault: Project Brief

## 1. What we're building

A mobile app that tracks purchases, return windows, and warranties. The user snaps a photo of a receipt or forwards an order-confirmation email, and the app extracts the details, calculates the deadlines, and reminds them before coverage runs out.

**Core promise:** "You'll never miss a return window or lose a warranty claim again."

**Who it's for:** Anyone who buys electronics, appliances, or furniture. Second audience: couples and roommates who share a household.

## 2. Non-goals (do not build)

- Expense tracking, budgeting, or accounting
- Bank or credit-card connections
- Extended-warranty sales (later, as affiliate links only)
- A web app (mobile first; a web view can come later)

## 3. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo (React Native) + TypeScript | One codebase for iOS and Android, fast iteration |
| Navigation | Expo Router | File-based routing |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) | Row-level security fits the household model |
| Receipt extraction | Claude API with vision, called from an Edge Function | Handles crumpled or messy receipts better than classic OCR |
| Inbound email | Postmark Inbound (or Cloudflare Email Routing) webhook to an Edge Function | Enables "forward to save" |
| Push notifications | Expo Notifications | Simple, works with both platforms |
| Scheduling | Supabase `pg_cron` calling an Edge Function daily | Sends due reminders |
| Testing | Vitest (logic), Maestro (a few key flows) | Keep it light |

Keep the extraction model name in an environment variable (`EXTRACTION_MODEL`). Never put API keys in the mobile app; all Claude calls go through Edge Functions.

## 4. Data model

```
households        (id, name, created_at)
household_members (household_id, user_id, role)            -- role: owner | member

purchases (
  id, household_id, created_by,
  item_name, merchant, purchase_date,
  price_cents, currency,
  category,                                                -- electronics | appliance | furniture | other
  model_number, serial_number, notes,
  return_deadline, warranty_expires,
  source,                                                  -- photo | email | manual
  extraction_confidence,                                   -- 0..1, null for manual
  created_at, updated_at
)

receipt_files (id, purchase_id, storage_path, mime_type)

reminders (
  id, purchase_id,
  kind,                                                    -- return | warranty
  fire_at, sent_at
)

push_tokens (user_id, token, platform)

merchant_policies (merchant_key, default_return_days)     -- seed with common retailers; user can override
category_defaults (category, default_warranty_months)     -- e.g. electronics 12, appliance 24
```

**Security:** Enable row-level security on every table. A user can only read or write rows for households they belong to. Receipt images live in a private bucket and are served via short-lived signed URLs.

## 5. Build phases

Build in order. Finish each phase (working, tested, committed) before starting the next.

### Phase 0: Setup
- Expo + TypeScript project, Supabase project, env handling, linting
- Auth (email magic link), auto-create a personal household on first sign-in
- **Done when:** a user can sign in and see an empty "Purchases" screen

### Phase 1: Manual entry, list, and search
- Add/edit/delete a purchase by hand
- Auto-calculate `return_deadline` and `warranty_expires` from merchant and category defaults, with manual override
- List sorted by soonest deadline, with color-coded urgency (expiring within 7 days, within 30 days, safe, expired)
- Full-text search across item, merchant, and notes
- **Done when:** the user can answer "when did I buy the dishwasher?" in two taps

### Phase 2: Photo capture and extraction
- Camera or gallery, then upload to Storage, then Edge Function sends the image to Claude
- Extraction returns structured JSON: merchant, date, item lines, price, model number if visible, and a confidence score
- **Review screen** always appears before saving. Low-confidence fields are highlighted. Fixing a wrong field must take one tap.
- Multi-item receipts: let the user choose which line items to track
- **Done when:** a real, slightly crumpled receipt photo becomes a saved purchase in under 30 seconds

### Phase 3: Reminders
- Create two reminders per deadline: 30 days and 7 days before (plus a "last day" reminder for return windows)
- Daily `pg_cron` job finds due reminders and sends pushes via Expo
- Tapping a notification opens that purchase
- Editing a purchase's dates regenerates its reminders
- **Done when:** a test purchase with a near deadline triggers a real push on a device

### Phase 4: Email forwarding
- Each user gets a unique inbound address (e.g. `u_abc123@in.yourdomain.com`)
- Inbound webhook parses the email (and any PDF attachment), runs the same extraction, and creates a purchase marked `source = email`
- Send the user a push: "Saved your Best Buy order. Tap to review."
- **Done when:** forwarding a real order confirmation creates a reviewable purchase

### Phase 5: Household sharing
- Invite a partner by link or email; shared purchases visible to all members
- **Done when:** two accounts see the same list and both get reminders

### Phase 6: Claim helper
- "Start a claim" button on a purchase generates a one-page proof-of-purchase PDF (receipt image, dates, model and serial number)
- Attach the manufacturer's manual and support link, looked up by brand and model number where possible
- **Done when:** the PDF can be shared straight from the share sheet

### Phase 7: Polish and monetization
- Free tier capped at 25 items; paywall at the cap (RevenueCat), roughly $3-5/month
- Onboarding, empty states, data export, and account deletion (which deletes all files)
- Crash reporting and basic analytics

## 6. UX principles

- Adding a purchase should feel faster than putting a receipt in a drawer.
- Never trust extraction blindly. Always show the review screen.
- The app is opened only a few times a year, so reminders and email auto-import do the heavy lifting. Make notification copy specific: "Your Sony headphones' return window ends in 7 days."
- Large tap targets, plain language, works in light and dark mode.

## 7. Risks to design around

- **Extraction errors on thermal paper:** fast correction flow, and keep the original image attached.
- **Low retention:** reminders and email import are core features, not extras.
- **Incumbents (Apple Wallet receipts, Expensify, niche warranty apps):** our edge is a simple, reminder-first experience.
- **Sensitive data:** receipts contain personal info. Use RLS, private storage, minimal logging, and no third-party analytics on receipt content.

## 8. Working agreements for Claude Code

- Start by proposing a short plan for the current phase and wait for my approval before writing code.
- Work in small commits with clear messages. Run lint and tests before each commit.
- Write unit tests for the date and deadline logic and the extraction-response parser.
- Do not add dependencies without saying why.
- Ask me before making decisions that affect cost (paid APIs, services) or privacy (what data leaves the device).
- Keep a `TODO.md` of open questions and deferred ideas.

## 9. Engineering notes (added during Phase 0/1 build)

- Expo SDK 57 was used for scaffolding. If anything looks off against these notes, check the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before assuming a bug.
- No local Docker daemon is available in the Claude Code sandbox used to build this, so Supabase migrations are written as SQL files and applied to the hosted project via `supabase db push` (or the dashboard SQL editor) rather than `supabase start`.
- Deadline calculation logic (`src/features/purchases/deadlines.ts`, `urgency.ts`) is deliberately dependency-free (no date-fns) so it can be tested with Vitest without any RN/Expo setup and reused later from an Edge Function.
