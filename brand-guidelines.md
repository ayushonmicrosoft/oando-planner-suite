# One&Only Brand Guidelines

**Version 1.0 | June 2025**
**Domain:** oando.co.in
**Category:** Premium Office Furniture & Workspace Planning SaaS
**Market:** India (B2B)

---

## Table of Contents

1. [Brand Identity Analysis](#1-brand-identity-analysis)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Logo Usage](#4-logo-usage)
5. [Button & Interactive Styles](#5-button--interactive-styles)
6. [Tone of Voice & Messaging](#6-tone-of-voice--messaging)
7. [Do's and Don'ts](#7-dos-and-donts)
8. [Competitive Positioning](#8-competitive-positioning)
9. [Suggested Refinements](#9-suggested-refinements)
10. [Brand Extensions](#10-brand-extensions)

---

## 1. Brand Identity Analysis

### 1.1 Brand Overview

| Attribute       | Value                                                                 |
|-----------------|-----------------------------------------------------------------------|
| Name            | One&Only                                                              |
| Tagline         | "Work. Space. Performance."                                           |
| Domain          | oando.co.in                                                           |
| Positioning     | Premium workspace design tool for Indian enterprises                  |
| Target Audience | Corporates, architects, interior designers, facility managers (India) |
| Pricing Tier    | Premium / Enterprise                                                  |

### 1.2 Strengths

- **Strong color identity.** The Dark Midnight Blue (#1F3653) palette is distinctive, professional, and well-differentiated from competitors who default to generic blues or greens. It conveys authority without being aggressive.
- **Impressive client roster.** JSW, Tata Motors, Maruti Suzuki, L&T, SAIL, Franklin Templeton, Canara Bank, DMRC, and Government of Bihar provide immediate credibility. This is a genuine competitive moat.
- **Consistent visual language.** The pill-style buttons, clean typography, hero imagery of real workspaces, and navy-to-white gradient aesthetic are applied consistently across the landing page, planner UI, and CTAs.
- **Tagline is memorable.** "Work. Space. Performance." is punchy, rhythmic, and communicates the value proposition in three words. The stacked line-break treatment in the hero reinforces it visually.
- **Design system maturity.** The codebase contains a well-structured token system (theme-tokens.css, typography.css) with semantic naming, shade ramps, and consistent spacing. This is rare for companies at this stage.
- **Premium photography.** Real project photography (DMRC, Franklin Templeton, Usha, Titan) in the hero section communicates capability far better than stock imagery.

### 1.3 Weaknesses

- **Limited accent color usage.** Bronze (#9D876C) is defined in the token system but barely used in the landing page or product UI. This creates a monochromatic feel that could become monotonous across extended interfaces.
- **No formal brand guidelines document.** Colors, typography, and component styles exist in code but are not documented for non-technical stakeholders (marketing teams, print vendors, partner agencies).
- **Typography lacks hierarchy visibility.** While the CSS defines a complete type scale, the landing page uses inline Tailwind sizes (`text-[48px]`, `text-[15px]`) rather than the semantic tokens, creating inconsistency risk.
- **Missing semantic color variety.** Success, warning, and danger states are all mapped to shades of the same blue family, reducing visual clarity for status indicators.
- **Footer is underdeveloped.** No social links, no contact information, no certifications or trust badges. For a B2B brand serving government and enterprise clients, this is a missed opportunity.
- **"O&O" / "oando" naming ambiguity.** The domain (oando.co.in) reads as "O-and-O" which doesn't immediately connect to "One&Only." This could cause confusion in verbal referrals.

### 1.4 Consistency Assessment

| Area                  | Score | Notes                                                    |
|-----------------------|-------|----------------------------------------------------------|
| Color usage           | 8/10  | Consistent navy palette, but accent underutilized        |
| Typography            | 6/10  | Tokens defined but inline overrides in components        |
| Button styles         | 9/10  | Pill-style consistently applied                          |
| Imagery               | 8/10  | Real project photos, consistent quality                  |
| Spacing & layout      | 8/10  | Max-width 1200px consistently applied                    |
| Voice & messaging     | 5/10  | No documented tone guidelines, CTA copy varies in style  |
| Logo placement        | 7/10  | Consistent nav/footer placement, no formal usage rules   |

---

## 2. Color Palette

### 2.1 Primary Colors

| Name                | Hex       | RGB             | Usage                                              |
|---------------------|-----------|-----------------|-----------------------------------------------------|
| Dark Midnight Blue  | `#1F3653` | 31, 54, 83      | Primary brand color, buttons, headings, links        |
| Deep Navy           | `#0B1324` | 11, 19, 36      | Navigation bar, footer, dark backgrounds, hero overlays |
| Text Body           | `#1B2940` | 27, 41, 64      | Primary body text                                    |

### 2.2 Primary Shade Ramp (Dark Midnight Blue)

| Shade | Hex       | Usage                                   |
|-------|-----------|-----------------------------------------|
| 50    | `#CCD6E3` | Light tints, disabled states             |
| 100   | `#B2C2D6` | Hover backgrounds on light surfaces      |
| 200   | `#7E9ABB` | Secondary borders                        |
| 300   | `#4B719F` | Active states, secondary buttons         |
| 400   | `#335479` | Medium emphasis text                     |
| 500   | `#1F3653` | **Primary brand color**                  |
| 550   | `#1B3049` | Primary hover                            |
| 600   | `#182A40` | Primary active / pressed                 |
| 700   | `#111E2D` | Deep UI elements                         |
| 800   | `#0B141D` | Near-black panels                        |
| 900   | `#070D12` | Darkest backgrounds                      |
| 950   | `#05080C` | Canvas / viewport black                  |

### 2.3 Secondary Color: Ocean Boat Blue

| Shade | Hex       | Usage                                   |
|-------|-----------|-----------------------------------------|
| 50    | `#EDF4FA` | Soft highlights, selected row backgrounds |
| 100   | `#DDEAF6` | Light accent backgrounds                 |
| 300   | `#9BBBDA` | Borders, dividers on dark surfaces       |
| 500   | `#5488B6` | **Secondary brand color**, links         |
| 600   | `#406F99` | Secondary hover                          |
| 700   | `#2D577B` | Secondary active                         |
| 900   | `#0F2538` | Deep secondary panels                   |

### 2.4 Accent Color: Bronze

| Shade | Hex       | Usage                                   |
|-------|-----------|-----------------------------------------|
| 300   | `#BEAF9A` | Soft accent backgrounds, badges          |
| 400   | `#9D876C` | **Primary accent**, premium highlights   |
| 500   | `#7F6A52` | Strong accent, active accent states      |
| 600   | `#66533F` | Accent on dark backgrounds               |

### 2.5 Sustainability Green

| Shade | Hex       | Usage                                   |
|-------|-----------|-----------------------------------------|
| 300   | `#7FAF96` | Sustainability indicators, success text  |
| 400   | `#5E8E74` | Active green states                      |
| 500   | `#476D58` | Strong green emphasis                    |

### 2.6 Surface Colors

| Token              | Hex         | Usage                                 |
|---------------------|-------------|---------------------------------------|
| Surface Page        | `#FFFFFF`   | Main page background                  |
| Surface Soft        | `#FAFBFC`   | Subtle background differentiation     |
| Surface Muted       | `#F5F7FA`   | Section backgrounds, cards             |
| Surface Mist        | `#EEF2F7`   | Accent wash areas                      |
| Surface Fog         | `#E2E8F0`   | Stronger muted backgrounds             |
| Glass               | `#FFFFFFD1` | Frosted glass panels (with backdrop-filter) |
| Glass Strong        | `#FFFFFFEB` | More opaque glass panels               |
| Inverse             | `#070D12`   | Dark mode surfaces                     |
| Inverse Soft        | `#0B141D`   | Dark mode secondary surfaces           |

### 2.7 Text Colors

| Token          | Hex       | Usage                          | Min Contrast (on white) |
|----------------|-----------|--------------------------------|------------------------|
| Heading        | `#050B17` | Page titles, section headers    | 18.5:1                 |
| Strong         | `#0B1324` | Emphasized body text            | 16.8:1                 |
| Body           | `#1B2940` | Standard body text              | 12.4:1                 |
| Muted          | `#4A5C76` | Secondary text, descriptions    | 5.8:1                  |
| Subtle         | `#64748B` | Tertiary text, timestamps       | 4.6:1 (AA)             |
| Inverse        | `#F8FAFC` | Text on dark backgrounds        | 17.2:1 (on #0B1324)    |
| Inverse Body   | `#E2E8F0` | Body text on dark backgrounds   | 13.8:1 (on #0B1324)    |
| Inverse Muted  | `#CBD5E1` | Secondary text on dark          | 10.5:1 (on #0B1324)    |

### 2.8 Semantic Colors

| State    | Color Token                   | Hex       | Usage                       |
|----------|-------------------------------|-----------|-----------------------------|
| Success  | Ocean Boat Blue 550           | `#4A7CA8` | Confirmations, saved states |
| Warning  | Bronze 400                    | `#9D876C` | Caution notices             |
| Danger   | Dark Midnight Blue 450        | `#294566` | Error states, destructive   |
| Info     | Ocean Boat Blue 500           | `#5488B6` | Informational alerts        |

### 2.9 Border Colors

| Token         | Value              | Usage                      |
|---------------|--------------------|----------------------------|
| Border Soft   | White 350 tint     | Default borders            |
| Border Muted  | White 450 tint     | Stronger borders           |
| Border Strong | DMB 300            | High-contrast borders      |
| Border Accent | `#1F36532E`        | Accent-tinted borders      |
| Border Hover  | `#1F365347`        | Interactive hover borders  |

---

## 3. Typography

### 3.1 Font Stack

| Role     | Font Family                                                        | Fallback              |
|----------|--------------------------------------------------------------------|-----------------------|
| Display  | Cisco Sans, Helvetica Neue, Helvetica, Arial                       | System sans-serif     |
| Body     | Helvetica Neue, Cisco Sans, Helvetica, Arial                       | System sans-serif     |

### 3.2 Type Scale

| Level           | Size                                | Weight | Letter Spacing | Line Height | Usage                        |
|-----------------|-------------------------------------|--------|----------------|-------------|------------------------------|
| Display / H1    | clamp(4rem, 6.2vw, 5.6rem)         | 300    | -0.05em        | 0.94        | Hero headlines               |
| Section Title   | clamp(1.75rem, 4vw, 2.75rem)       | 300    | -0.04em        | 1.08        | Section headings             |
| Title Large     | clamp(2rem, 2.3vw, 2.8rem)         | 300    | -0.04em        | 1.08        | Page titles                  |
| Title Small / H3| clamp(1.12rem, 1.04rem + 0.24vw, 1.28rem) | 400 | -0.038em    | 1.14        | Card titles, subsections     |
| Body Large      | clamp(1rem, 0.99rem + 0.14vw, 1.06rem) | 400 | -0.008em     | 1.52        | Lead paragraphs, descriptions|
| Body            | 1rem (16px)                         | 400    | -0.008em       | 1.6         | Standard body text           |
| Caption Large   | 0.6875rem (11px)                    | 400    | -0.008em       | 1.3         | Metadata, timestamps         |
| Caption         | 0.625rem (10px)                     | 400    | -0.008em       | 1.25        | Fine print, badges           |
| Label / Eyebrow | 0.72rem (11.5px)                    | 500    | 0.11em         | 1.3         | Section labels, overlines    |
| Nav             | 1rem (16px)                         | 500    | 0.01em         | 1.4         | Navigation links             |
| CTA             | 1rem (16px)                         | 600    | 0.04em         | 1.3         | Button labels                |
| Stat            | clamp(2.5rem, 5vw, 4.2rem)         | 300    | -0.06em        | 1.0         | Large numbers, metrics       |

### 3.3 Font Weight Scale

| Weight | Name       | Usage                                     |
|--------|------------|-------------------------------------------|
| 300    | Light      | Display headings, hero text, stat numbers |
| 400    | Regular    | Body text, titles, descriptions            |
| 500    | Medium     | Navigation, labels, eyebrows              |
| 600    | Semibold   | CTAs, buttons, emphasis                    |

### 3.4 Typography Rules

1. **Display headings** always use the Display font stack (Cisco Sans primary) at weight 300 with tight letter-spacing.
2. **Body text** uses the Sans font stack (Helvetica Neue primary) at weight 400.
3. **Never use bold (700+)** for headlines. The brand voice is light and refined, not heavy.
4. **Labels and eyebrows** are always uppercase with wide letter-spacing (0.11em).
5. **Fluid sizing** via clamp() is mandatory for responsive typography. Never use fixed pixel values.
6. **Line heights** decrease as font size increases: Display (0.94), Titles (1.08-1.14), Body (1.52-1.6).
7. **Anti-aliasing**: Always enable `-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility`.

---

## 4. Logo Usage

### 4.1 Logo Variants

| Variant          | File                    | Background         | Usage                          |
|------------------|-------------------------|---------------------|--------------------------------|
| White (Primary)  | `logo-v2-white.webp`    | Dark / Navy         | Navigation, footer, dark hero  |
| Dark             | `logo-v2.webp`          | White / Light       | Documents, light backgrounds   |
| Correct (Full)   | `logo-correct.webp`     | Variable            | Full-color applications        |

### 4.2 Clear Space

- Maintain a minimum clear space around the logo equal to the height of the "&" character in "One&Only."
- No other graphic elements, text, or imagery should encroach on this clear space.

### 4.3 Minimum Sizes

| Context       | Minimum Height | Notes                           |
|---------------|----------------|---------------------------------|
| Digital (nav) | 28px (1.75rem) | As used in the navigation bar   |
| Digital (footer) | 24px (1.5rem) | Smaller footer placement      |
| Print         | 12mm           | Business cards, letterhead      |
| Favicon       | 16x16px        | Use simplified icon mark        |

### 4.4 Background Rules

| Background           | Logo Variant  | Notes                         |
|----------------------|---------------|-------------------------------|
| Dark Navy (#0B1324)  | White         | Primary website navigation    |
| Dark Midnight Blue   | White         | Headers, banners              |
| White / Light Gray   | Dark          | Documents, email signatures   |
| Photography          | White         | Must have sufficient overlay  |
| Gradient backgrounds | White         | Ensure min 4.5:1 contrast     |

### 4.5 Logo Don'ts

- Do not rotate, skew, or distort the logo.
- Do not change the logo colors outside the approved variants.
- Do not place the logo on busy photography without a dark overlay (min 60% opacity).
- Do not add drop shadows, outlines, or effects to the logo.
- Do not recreate the logo in a different typeface.
- Do not use the logo smaller than the minimum sizes specified above.
- Do not alter the spacing between "One" and "&Only."

---

## 5. Button & Interactive Styles

### 5.1 Button Hierarchy

| Level     | Style                                                      | Usage                        |
|-----------|-------------------------------------------------------------|------------------------------|
| Primary   | Navy bg (`#1F3653`), white text, pill shape, white/10 border | Main CTAs, hero buttons      |
| Secondary | White/10 bg, white text, pill shape, white/20 border, backdrop-blur | Supporting actions       |
| Tertiary  | White bg, navy text, pill shape, shadow-lg                   | High-contrast CTA sections   |
| Ghost     | Transparent, white text, white/40 border, pill shape         | Navigation, sign-in          |

### 5.2 Button Specifications

| Property          | Value                                  |
|--------------------|-----------------------------------------|
| Border Radius      | `999px` (pill / fully rounded)         |
| Font Size          | 15px-16px (1rem)                       |
| Font Weight        | 600 (Semibold)                         |
| Letter Spacing     | 0.04em                                 |
| Padding (default)  | 12px vertical, 28px horizontal         |
| Padding (large)    | 12px vertical, 32px horizontal         |
| Min Height (sm)    | 44px (2.75rem)                         |
| Min Height (md)    | 50px (3.125rem)                        |
| Min Height (lg)    | 58px (3.625rem)                        |
| Transition         | 240ms ease (var(--motion-base))        |

### 5.3 Button States

| State    | Primary                    | Secondary                 | Ghost                    |
|----------|----------------------------|---------------------------|--------------------------|
| Default  | bg: #1F3653, text: white   | bg: white/10, text: white | bg: transparent          |
| Hover    | bg: #1B3049, scale: 1.03   | bg: white/20, scale: 1.03 | border: white/70         |
| Active   | bg: #182A40, scale: 0.98   | bg: white/25, scale: 0.98 | bg: white/5              |
| Disabled | opacity: 0.5, no pointer  | opacity: 0.5              | opacity: 0.5             |
| Focus    | box-shadow: 0 0 0 3px #406F9940 | Same focus ring      | Same focus ring          |

### 5.4 Border Radius Scale

| Token        | Value      | Usage                                |
|--------------|------------|--------------------------------------|
| radius-sm    | 0.875rem   | Small cards, inputs                  |
| radius-md    | 1.125rem   | Medium cards, modals                 |
| radius-lg    | 1.25rem    | Large cards                          |
| radius-xl    | 1.5rem     | Feature cards                        |
| radius-huge  | 1.75rem    | Hero cards                           |
| radius-blob  | 2rem       | Large decorative elements            |
| radius-pill  | 999px      | Buttons, chips, tags                 |

### 5.5 Shadow Scale

| Token          | Value                                     | Usage                   |
|----------------|-------------------------------------------|-------------------------|
| Shadow Soft    | 0 16px 48px -30px #111E2D29               | Subtle card elevation   |
| Shadow Panel   | 0 24px 56px -42px #111E2D33               | Panel elevation         |
| Shadow Lift    | 0 22px 44px -30px #1F36534A               | Hover elevation         |
| Shadow Float   | 0 32px 80px -48px #111E2D42               | Modal elevation         |
| Shadow Deep    | 0 28px 80px #01050A3D                     | Hero section depth      |
| Shadow Shell   | 0 24px 72px #01050A57                     | App shell depth         |
| Accent Glow    | 0 10px 24px #97764829                     | Accent element glow     |
| Focus Ring     | 0 0 0 3px #406F9940                       | Focus indicator         |

### 5.6 Motion Tokens

| Token        | Value  | Usage                     |
|--------------|--------|---------------------------|
| Motion Fast  | 180ms  | Micro-interactions        |
| Motion Base  | 240ms  | Standard transitions      |
| Motion Slow  | 320ms  | Page transitions, modals  |
| Ease Standard| cubic-bezier(0.22, 1, 0.36, 1) | All transitions |

---

## 6. Tone of Voice & Messaging

### 6.1 Brand Personality

One&Only speaks as a **knowledgeable industry partner**, not a flashy tech startup. The voice is:

- **Authoritative** — We know workspace design. We've done it for India's largest organizations.
- **Refined** — We communicate with precision and elegance. No jargon-heavy marketing.
- **Practical** — We focus on outcomes: better workspaces, efficient planning, real results.
- **Confident but understated** — We let our work speak. The client roster is the proof.
- **Indian yet global** — Rooted in India's business landscape while meeting international standards.

### 6.2 Voice Spectrum

| More like this                        | Less like this                         |
|---------------------------------------|----------------------------------------|
| "Design workspaces that perform."     | "Revolutionize your office game!"      |
| "Trusted by India's leading enterprises." | "We're disrupting the furniture industry!" |
| "Plan. Visualize. Execute."           | "OMG the coolest planning tool ever!"  |
| "Precision tools for workspace professionals." | "Anyone can design an office!" |
| "From blueprint to boardroom."        | "Click click done!"                    |

### 6.3 Messaging Framework

| Message Level | Format                    | Example                                                |
|---------------|---------------------------|--------------------------------------------------------|
| Tagline       | Three-word rhythm         | "Work. Space. Performance."                            |
| Headline      | Benefit-led, 4-8 words   | "Design Workspaces That Perform"                       |
| Subheadline   | Context + outcome         | "Precision planning tools trusted by India's leading enterprises." |
| Body Copy     | Feature + benefit pairs   | "Import CAD drawings and instantly visualize furniture layouts in 3D, cutting planning time by 60%." |
| CTA           | Action verb + object      | "Start Designing" / "Explore Products" / "Request Quote" |
| Proof Point   | Stat + credibility        | "Trusted by 14+ leading enterprises including Tata Motors, JSW, and L&T." |

### 6.4 Key Phrases & Language

**Use:**
- "Workspace design" (not "office decoration")
- "Plan" and "Planner" (core product language)
- "Performance" (ties back to tagline)
- "Enterprise-grade" (positioning)
- "Precision" (quality indicator)
- "India's leading..." (market positioning)
- "Trusted by" (social proof framing)

**Avoid:**
- "Cheap" or "affordable" (undermines premium positioning)
- "Disruptive" or "revolutionary" (overused startup language)
- "AI-powered" as a lead message (unless substantive)
- "Simple" or "easy" as primary descriptors (implies basic)
- Exclamation marks in headlines
- Emoji in professional communications

### 6.5 Writing Style

- **Sentence case** for headlines and CTAs (not Title Case or ALL CAPS, except for eyebrow labels).
- **Short paragraphs.** Maximum 3 sentences per paragraph in marketing copy.
- **Active voice.** "One&Only designs workspaces" not "Workspaces are designed by One&Only."
- **Numbers over words.** "14+ clients" not "fourteen-plus clients."
- **Oxford comma.** Use it: "architects, designers, and facility managers."
- **Ampersand.** Always "One&Only" with no spaces around the ampersand. Never "One & Only" or "One and Only."

---

## 7. Do's and Don'ts

### 7.1 Color Do's and Don'ts

| Do                                                  | Don't                                              |
|-----------------------------------------------------|----------------------------------------------------|
| Use Dark Midnight Blue (#1F3653) as the primary color | Use pure black (#000000) for text or backgrounds   |
| Use the bronze accent (#9D876C) for premium highlights | Introduce new brand colors without approval       |
| Maintain 4.5:1 contrast ratio for text               | Use light blue text on white backgrounds           |
| Use the defined shade ramps for tints                 | Eyeball approximate colors                         |
| Tint backgrounds toward the primary hue               | Use warm grays that conflict with the cool palette |

### 7.2 Typography Do's and Don'ts

| Do                                                  | Don't                                              |
|-----------------------------------------------------|----------------------------------------------------|
| Use the defined type scale tokens                    | Use arbitrary pixel sizes in components             |
| Keep display text at weight 300 (Light)              | Use bold (700) for headlines                        |
| Use uppercase + wide tracking for labels only        | Use all-caps for body text or headlines              |
| Use fluid sizing (clamp) for responsive type         | Set fixed font sizes for headings                   |
| Maintain the defined line-height ratios              | Use line-height: 1 for body text                    |

### 7.3 Layout Do's and Don'ts

| Do                                                  | Don't                                              |
|-----------------------------------------------------|----------------------------------------------------|
| Contain content to max-width 1200px                  | Let content span the full viewport width            |
| Use 20px (px-5) horizontal padding                   | Use less than 16px padding on mobile                |
| Use the defined spacing scale (0.25rem base)         | Use arbitrary spacing values                        |
| Maintain generous whitespace between sections         | Crowd sections together                             |
| Use pill-shaped buttons consistently                  | Mix pill buttons with squared buttons                |

### 7.4 Imagery Do's and Don'ts

| Do                                                  | Don't                                              |
|-----------------------------------------------------|----------------------------------------------------|
| Use real project photography                         | Use generic stock office imagery                   |
| Apply navy overlays on hero images (60-90% opacity)  | Place white text on unprocessed photos              |
| Show workspaces in use or freshly completed          | Show empty, sterile environments                    |
| Feature recognizable Indian enterprise environments   | Use exclusively Western office aesthetics           |
| Maintain consistent color grading (cool/blue tones)   | Use warm-filtered or heavily saturated photos       |

### 7.5 Brand Name Do's and Don'ts

| Do                                                  | Don't                                              |
|-----------------------------------------------------|----------------------------------------------------|
| Write as "One&Only" (no spaces around ampersand)     | Write as "One & Only" or "One and Only"             |
| Use "oando.co.in" for the domain reference           | Abbreviate to "O&O" in formal communications        |
| Capitalize "One" and "Only"                          | Write as "one&only" or "ONEANDONLY"                  |

---

## 8. Competitive Positioning

### 8.1 Competitive Landscape

| Competitor         | Type                        | Visual Identity                      | Positioning              |
|--------------------|-----------------------------|--------------------------------------|--------------------------|
| **pCon.planner**   | Free 3D room planner        | Orange/gray, functional UI           | Free tool for dealers    |
| **SmartDraw**      | Diagramming SaaS            | Blue/white, corporate clean          | General diagramming      |
| **RoomSketcher**   | Consumer room planner       | Green/white, friendly approachable   | Consumer-first, freemium |
| **Steelcase**      | Enterprise furniture + tools| Red/black, corporate authority       | Global enterprise        |
| **Herman Miller**  | Premium furniture + tools   | Warm neutrals, design-forward        | Design heritage, premium |
| **Godrej Interio** | Indian furniture + planning | Red/white, mass-market               | Indian mass market       |
| **Featherlite**    | Indian office furniture     | Blue/white, corporate standard       | Indian mid-market        |

### 8.2 One&Only's Differentiation

| Dimension         | One&Only Position                                    | vs. Competitors                                  |
|-------------------|------------------------------------------------------|--------------------------------------------------|
| **Market**        | India-specific, enterprise-focused                   | Most tools are global/Western or consumer-first  |
| **Color**         | Dark Midnight Blue — rare, distinguished             | Most competitors use primary blue or red          |
| **Aesthetic**     | Premium, refined, understated                        | Competitors range from utilitarian to mass-market |
| **Technology**    | Full SaaS platform (CAD, 3D, planning)               | Most offer only one capability                   |
| **Social Proof**  | Verified enterprise clients (JSW, Tata, L&T)         | Few competitors can match this client roster in India |
| **Price Position**| Premium / Enterprise tier                            | Competitors span free to enterprise               |

### 8.3 Positioning Statement

> One&Only is the premium workspace planning platform built for India's leading enterprises. Unlike generic planning tools or Western imports, One&Only combines CAD drawing, 3D visualization, and furniture catalog management in a single platform, trusted by organizations like Tata Motors, JSW, and L&T to design workspaces that perform.

---

## 9. Suggested Refinements

These are small improvements to strengthen the existing brand. They do not constitute a redesign.

### 9.1 Activate the Bronze Accent

**Current state:** Bronze (#9D876C) is defined in tokens but barely visible in the UI.

**Recommendation:** Introduce bronze as a "premium indicator" throughout:
- Use bronze for eyebrow labels on premium features (e.g., "ENTERPRISE" badge)
- Apply bronze borders/underlines to differentiate CTAs (e.g., a thin bottom border on primary buttons on light backgrounds)
- Use bronze-tinted backgrounds (`#BEAF9A` at 8-12% opacity) for premium feature cards
- Apply the defined `--shadow-accent-glow` (0 10px 24px #97764829) to featured elements

### 9.2 Enforce Semantic Type Tokens

**Current state:** Landing page components use inline Tailwind sizes like `text-[48px]`, `text-[15px]` instead of the defined CSS utility tokens.

**Recommendation:**
- Replace all inline size declarations with the semantic typography utilities (`typ-h1`, `typ-h3`, `typ-lead`, `typ-cta`, etc.)
- This ensures consistency if the type scale is ever adjusted globally
- Audit all components for typography token compliance

### 9.3 Strengthen Semantic Status Colors

**Current state:** Success, warning, and danger all map to shades of the blue/navy family.

**Recommendation:** Introduce dedicated semantic colors while staying within the brand palette:
- **Success:** Keep the sustainability green (`#7FAF96`) already in the system
- **Warning:** Use a warmer bronze tone (`#9D876C`) — already defined
- **Danger:** Introduce a muted, cool-toned red: `#A85454` (desaturated to fit the palette). Add a danger surface at 8% opacity

### 9.4 Enhance the Footer

**Current state:** Minimal footer with logo, nav links, and copyright only.

**Recommendation:** Add:
- Contact email and phone (or WhatsApp link)
- Social media links (LinkedIn is essential for B2B)
- "ISO certified" or relevant certifications/badges
- An "Enterprise" or "Government" trust section
- A simplified version of the client logo strip

### 9.5 Add a Favicon & App Icon Suite

**Current state:** favicon.svg exists but no documented app icon suite.

**Recommendation:** Generate a complete icon suite:
- favicon.svg (current)
- favicon-32.png, favicon-16.png
- apple-touch-icon (180x180)
- Android Chrome icons (192x192, 512x512)
- Open Graph image (already exists at opengraph.jpg, verify dimensions are 1200x630)
- Ensure the icon is recognizable at 16px (use a simplified "O" or "&" mark)

### 9.6 Introduce a Subtle Pattern/Texture

**Current state:** Dark sections use flat gradients (`from-navy-dark to-navy`) with simple blurred circles for depth.

**Recommendation:** Develop a subtle geometric pattern (inspired by floor plan grids or blueprint lines) that can be overlaid at 3-5% opacity on dark sections. This reinforces the "workspace planning" identity without cluttering the design.

---

## 10. Brand Extensions

### 10.1 Marketing Materials

#### Business Cards

| Element          | Specification                                     |
|------------------|----------------------------------------------------|
| Paper            | 400gsm, matte laminated, soft-touch finish         |
| Front            | Navy (#0B1324) background, white logo, name in white, title in white/70 |
| Back             | White, contact details in Text Body (#1B2940), bronze accent line |
| Logo Placement   | Top-left, minimum 12mm height                      |
| Typography       | Name: 10pt, Semibold | Title: 8pt, Regular | Contact: 7.5pt, Regular |

#### Letterhead

| Element          | Specification                                     |
|------------------|----------------------------------------------------|
| Header           | Dark logo (logo-v2.webp), top-left, 15mm height    |
| Accent           | 1px bronze line under header                        |
| Body             | Helvetica Neue, 11pt, #1B2940                       |
| Footer           | oando.co.in, contact info, 8pt, #64748B             |

#### Presentation Deck

| Element          | Specification                                     |
|------------------|----------------------------------------------------|
| Title Slides     | Navy (#0B1324) background, white text, hero photography |
| Content Slides   | White background, navy headings, #1B2940 body text  |
| Accent Elements  | Bronze highlights, dividers                         |
| Charts           | Primary: #1F3653, Secondary: #5488B6, Accent: #9D876C, Tertiary: #7FAF96 |
| Footer           | Logo (small), slide number, oando.co.in             |

### 10.2 Social Media

#### LinkedIn (Primary B2B channel)

| Format           | Specification                                     |
|------------------|----------------------------------------------------|
| Profile Image    | Logo mark on navy circle, 400x400px                |
| Cover Image      | Project hero photography with navy overlay, tagline, 1584x396px |
| Post Graphics    | Navy background with white text OR white background with navy text |
| Post Typography  | Headlines: Light weight, large. Body: Regular, smaller. |
| Accent Usage     | Bronze for highlight bars, underlines, "NEW" badges |
| Content Mix      | 40% project showcases, 30% industry insights, 20% product features, 10% team/culture |

#### Instagram (Secondary, project portfolio)

| Format           | Specification                                     |
|------------------|----------------------------------------------------|
| Grid Aesthetic   | Alternating navy-framed and full-bleed workspace photos |
| Stories           | Navy background with white text, subtle grid overlay |
| Reels             | Before/after workspace transformations               |

### 10.3 Email Templates

#### Transactional Emails (Welcome, Plan Saved, Quote Request)

| Element          | Specification                                     |
|------------------|----------------------------------------------------|
| Header           | Navy bar (#0B1324), white logo, 60px height         |
| Body Background  | #F5F7FA (Surface Muted)                             |
| Content Card     | White, 14px border-radius, shadow-soft              |
| Heading          | #050B17, 24px, weight 300                           |
| Body Text        | #1B2940, 16px, weight 400, 1.6 line-height          |
| CTA Button       | #1F3653 bg, white text, pill shape, 48px height     |
| Footer           | #64748B text, 13px, links to website and social     |

#### Marketing Emails (Product Updates, Newsletters)

| Element          | Specification                                     |
|------------------|----------------------------------------------------|
| Hero Section     | Full-width workspace photo with navy overlay        |
| Feature Blocks   | Alternating left/right image + text layout          |
| Accent           | Bronze divider lines between sections               |
| Social Links     | Navy icon buttons in footer                         |

### 10.4 Trade Show / Event Materials

| Material         | Specification                                     |
|------------------|----------------------------------------------------|
| Booth Backdrop   | Navy (#0B1324), large white logo, tagline, client logos |
| Brochure         | Tri-fold, navy/white exterior, project photos interior |
| Name Badge       | Navy header, white body, bronze accent stripe       |
| Giveaway Items   | Navy + white, understated branding (pen, notebook)  |

### 10.5 Digital Ad Formats

| Format           | Specification                                     |
|------------------|----------------------------------------------------|
| Google Display   | Navy background, white headline, CTA button, logo   |
| LinkedIn Ads     | Project photography with navy overlay + white text   |
| Retargeting      | Product screenshots with bronze "Try Free" badge     |
| Sizing           | Follow Google/LinkedIn specs: 300x250, 728x90, 1200x627 |

---

## Appendix A: CSS Token Reference

All design tokens are defined in `artifacts/planner-suite/src/styles/theme-tokens.css` and `artifacts/planner-suite/src/styles/typography.css`.

### Quick Reference: Core Token Map

```css
/* Primary */
--color-primary: #1F3653;
--color-primary-hover: #1B3049;
--color-primary-active: #182A40;

/* Accent */
--color-accent: #9D876C;
--color-accent-soft: #BEAF9A;
--color-accent-strong: #7F6A52;

/* Surfaces */
--surface-page: #FFFFFF;
--surface-soft: #FAFBFC;
--surface-muted: #F5F7FA;

/* Text */
--text-heading: #050B17;
--text-body: #1B2940;
--text-muted: #4A5C76;
--text-subtle: #64748B;
--text-inverse: #F8FAFC;

/* Typography */
--font-display: "Cisco Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
--font-sans: "Helvetica Neue", "Cisco Sans", Helvetica, Arial, sans-serif;

/* Radius */
--radius-pill: 999px;
--radius-default: 0.875rem;

/* Motion */
--motion-fast: 180ms;
--motion-base: 240ms;
--motion-slow: 320ms;
--ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
```

---

## Appendix B: Tailwind Integration

The following Tailwind configuration extends the default theme to match brand tokens:

```js
// tailwind.config extension
colors: {
  navy: {
    DEFAULT: '#1F3653',
    dark: '#0B1324',
    light: '#335479',
    50: '#CCD6E3',
    100: '#B2C2D6',
    200: '#7E9ABB',
    300: '#4B719F',
    400: '#335479',
    500: '#1F3653',
    600: '#182A40',
    700: '#111E2D',
    800: '#0B141D',
    900: '#070D12',
    950: '#05080C',
  },
  ocean: {
    50: '#EDF4FA',
    100: '#DDEAF6',
    300: '#9BBBDA',
    500: '#5488B6',
    600: '#406F99',
    700: '#2D577B',
    900: '#0F2538',
  },
  bronze: {
    300: '#BEAF9A',
    400: '#9D876C',
    500: '#7F6A52',
    600: '#66533F',
  },
  sustain: {
    300: '#7FAF96',
    400: '#5E8E74',
    500: '#476D58',
  },
}
```

---

## Appendix C: Asset Inventory

| Asset                    | Path                                  | Format | Usage              |
|--------------------------|---------------------------------------|--------|--------------------|
| Logo (white)             | `/logo-v2-white.webp`                 | WebP   | Dark backgrounds   |
| Logo (white, PNG)        | `/logo-v2-white.png`                  | PNG    | Email, documents   |
| Logo (dark/full)         | `/logo-v2.webp`                       | WebP   | Light backgrounds  |
| Logo (correct)           | `/logo-correct.webp`                  | WebP   | Full-color use     |
| Catalog Logo             | `/catalog-logo-sharp.svg`             | SVG    | Product section    |
| Favicon                  | `/favicon.svg`                        | SVG    | Browser tab        |
| OpenGraph Image          | `/opengraph.jpg`                      | JPG    | Social sharing     |
| Hero: Titan              | `/hero/titan-hero.webp`               | WebP   | Hero section       |
| Hero: DMRC               | `/hero/dmrc-hero.webp`                | WebP   | Hero rotation      |
| Hero: Franklin Templeton | `/hero/franklin-hero.webp`            | WebP   | Hero rotation      |
| Hero: Usha               | `/hero/usha-hero.webp`                | WebP   | Hero rotation      |
| Client Logos             | `/ClientLogos/*.webp`                 | WebP   | Social proof strip |

---

*Document maintained by the One&Only design team. For questions or updates, contact the brand owner.*
*Last updated: June 2025*
