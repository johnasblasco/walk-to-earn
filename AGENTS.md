# Walk-to-Earn Frontend Agent Guide

This folder is the Expo frontend for the Walk-to-Earn Celo MVP. Treat this app as a mobile-first product that must also render cleanly on web for demos, judging, and development review. Web and mobile should show the same product, the same visual hierarchy, and the same user flows unless a platform API makes a tiny behavior difference unavoidable.

Use `Mobile-Frontend-BJOC` only as a reference for cross-platform discipline: shared visual language, consistent web/mobile screens, feature-oriented structure, centralized services, safe-area handling, reusable UI, typed environment config, and production-style app organization. Do not copy BJOC domain logic into this product.

## Product Definition

Walk-to-Earn is a movement-first rewards app:

"A walk-to-earn app where users earn rewards only through valid walking or jogging activity, improve earnings by buying better shoes through CELO and MiniPay, and activate temporary walking boosts by watching ads."

The MVP must stay focused on one clear loop:

1. User logs in or registers.
2. User completes onboarding and grants movement permissions.
3. User starts a walking session.
4. App validates steps and speed.
5. User earns rewards only from valid walking or jogging.
6. User watches ads for temporary boosts.
7. User buys or upgrades shoes with CELO through MiniPay.
8. User returns daily for goals, streaks, and progression.

## Non-Negotiable Product Rules

- Walking or jogging is the only earning mechanic.
- Never add mining, idle earning, offline token generation, staking, passive rewards, or background passive income.
- Rewards are earned only during an active walking session.
- Only valid movement counts. Standing still, vehicle-speed movement, unrealistic motion, and movement above the speed cap must pause earning.
- Shoes improve rewards only for valid movement. Shoes must not generate rewards by themselves.
- One shoe is equipped at a time.
- CELO through MiniPay is used only for shoe purchases and shoe upgrades.
- Temporary boosts are activated by watching ads, not by CELO payment.
- Boosts apply only during active valid walking sessions and must stop helping when movement becomes invalid.
- The reward formula should remain understandable: `Final Reward = Base Reward x Shoe Multiplier x Active Boost Modifier`.

## Expected MVP Screens

Build toward these screens and flows:

- Launch: logo, tagline `Walk to Earn. Move to Win.`, Login and Register actions.
- Auth: email login, email registration, password confirmation, persisted session.
- Onboarding: explains valid movement, shoes, ad boosts, MiniPay, location permission, and motion/step permission.
- Home dashboard: steps today, rewards earned, current shoe, shoe multiplier, active boost, daily goal progress, Start Walking.
- Walking session: live steps, valid reward progress, speed status, boost status, milestone progress, invalid movement warning, stop/end session.
- Shoes: catalog, CELO prices, owned shoes, equipped shoe, buy and upgrade flows through MiniPay.
- Boosts: ad-watched activation, active/expired state, temporary modifier details.
- Leaderboard/ranks: weekly, monthly, and all-time views where supported by the backend.
- Profile: email, total valid steps, total rewards, current shoe, owned shoes, boost status, MiniPay connection, CELO balance, transaction history.
- Daily engagement: daily goals, streaks, bonuses, and milestone achievements.

## Current Stack

- Expo SDK app with Expo Router in `app/`.
- React Native, React Native Web, TypeScript strict mode.
- NativeWind and `global.css` for styling.
- `lucide-react-native` and Expo vector icons for iconography.
- EAS is the expected production build path, even when web is used for viewing.

## Architecture Rules

- Keep route files in `app/` focused on routing and screen composition.
- As the app grows, move domain code into `src/features/<feature>` and shared code into `src/shared`, following the BJOC reference style.
- Prefer this structure for new production code:
  - `src/features/auth`
  - `src/features/onboarding`
  - `src/features/walk-session`
  - `src/features/shoes`
  - `src/features/boosts`
  - `src/features/wallet`
  - `src/features/profile`
  - `src/features/leaderboard`
  - `src/shared/components`
  - `src/shared/services`
  - `src/shared/hooks`
  - `src/shared/constants`
  - `src/config`
- Keep API calls in service files, not inside screen components.
- Keep reward, speed, boost, and shoe calculations in typed utility or domain files so both screens and tests can reuse them.
- Keep constants such as colors, spacing, speed thresholds, reward units, and shoe tiers centralized.
- Do not leave production flows powered by inline mock arrays. Demo data belongs in clearly named mock files and must not be confused with server data.

## Visual And UX Rules

- Mobile is the primary product surface; web must preserve the same visual design and behavior.
- Match the same screen composition across iOS, Android, and web: same cards, same CTA hierarchy, same tab behavior, same colors, same spacing intent.
- Use responsive constraints instead of separate web/mobile designs. Prefer max-width wrappers on web when a phone-sized UI should be previewed.
- Always use safe-area-aware layout for screens and bottom tabs.
- Centralize the app palette. The current visual direction is energetic green, clean white surfaces, neutral text, and amber reward accents.
- Avoid scattering duplicate `colors` objects in every screen; move tokens into shared constants when touching screens.
- Use icons for tabs, movement state, wallet, rewards, shoes, boosts, and settings.
- Keep text readable and within bounds on small phones and web widths. Do not let labels overlap, truncate important amounts, or hide CTAs behind the tab bar.
- Use loading, empty, error, denied-permission, invalid-movement, payment-pending, payment-failed, and payment-success states.
- Animations should be light and battery-conscious. Disable or simplify JS-driven loops on web when they cause lag.
- Do not use decorative visuals that obscure the product. Movement, shoes, rewards, and MiniPay state should be immediately inspectable.

## Cross-Platform Rules

- Do not use browser-only APIs directly in shared components. Guard platform-specific code with `Platform.OS` or isolate it in platform files.
- Do not use native-only APIs without a web fallback. Web may show a demo-safe permission or sensor fallback, but it must be explicit and non-misleading.
- Location and motion tracking must clean up subscriptions when sessions stop or screens unmount.
- Keep tab and keyboard behavior usable on mobile and web.
- Test any changed screen with `npm run web` and at least one mobile target or Expo Go/development build when device APIs are involved.
- When adding native modules needed for EAS builds, update app config, permissions, README notes, and environment documentation in the same change.

## Data And API Rules

- Use a typed API client and typed service functions for backend calls.
- Read runtime config from Expo public environment variables, for example `EXPO_PUBLIC_API_URL`.
- For physical device testing, document when localhost must become the machine LAN IP.
- Never trust client-side reward totals as authoritative. The frontend can display live estimates, but the backend must confirm final rewards.
- Persist auth tokens securely. Prefer Expo SecureStore on native; use a deliberate, documented web fallback for web.
- Avoid storing private keys, seed phrases, or payment secrets in the frontend.
- All MiniPay payment success screens must reflect backend verification, not just client navigation success.

## Movement Tracking Rules

- Request location and motion/step permissions with clear user-facing context.
- Track steps and GPS speed only during active sessions unless a future feature explicitly requires background tracking.
- Show the user when movement is valid, paused, or invalid.
- Pause reward estimation when speed exceeds the allowed threshold.
- Keep constants for speed threshold, base reward, and reward modifiers in one place.
- Record enough local session data for good UX, but let the backend validate and persist final session results.

## MiniPay, CELO, And Ads

- MiniPay integration is only for buying or upgrading shoes.
- Show CELO prices from backend catalog data when possible.
- Do not hardcode transaction success. Handle pending, success, cancellation, rejection, insufficient funds, and verification failure.
- Ads unlock temporary boosts only. Do not show CELO purchase CTAs for boosts.
- Boost timers, remaining valid steps, and active multipliers must be clear to the user.

## Quality Bar

- TypeScript must remain strict.
- Prefer small, typed components over large screen files.
- Handle network failures, permission denial, expired sessions, and retry paths.
- Use accessible labels for icon-only buttons and important actions.
- Avoid adding dependencies unless they clearly improve production readiness.
- Before finishing a frontend change, run:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run web` for visual checks when UI changes
- For EAS-related changes, confirm the app config, permissions, icons, splash assets, and environment requirements are documented.

