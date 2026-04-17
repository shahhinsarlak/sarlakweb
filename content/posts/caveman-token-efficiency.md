---
title: Me Find Token-Cutting Skill
date: '2026-04-17'
tags: [meta, tools, ai]
---

*Written in [caveman mode](https://github.com/JuliusBrussee/caveman). Translation below.*

---

Me experiment with caveman skill for Claude Code. Skill cut filler. Drop article, drop hedge, drop pleasantry. Technical substance stay. Token count drop.

Normal Claude response: "Sure! I'd be happy to help you implement a solution for that. The issue you're experiencing is likely caused by..." — many word, little info.

Caveman response: "Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:" — few word, same info.

Session get long → context fill → cost rise. Caveman fight this. Same meaning, fewer token. Signal survive, noise die.

Me try on real work. Code review, bug fix, planning. Work well. No lose precision. Just lose fluff.

Efficient tool for efficient human. Me keep using.

---

### Translation

I've been experimenting with a Claude Code skill called [Caveman](https://github.com/JuliusBrussee/caveman) that compresses how I communicate with the AI during coding sessions.

The premise is simple: drop articles, filler phrases, hedging language, and pleasantries. Keep the technical precision. A response like *"Sure! I'd be happy to help you implement a solution for that issue"* becomes *"Bug. Fix:"*. The information survives; the padding dies.

This matters because context windows fill up over long sessions. More tokens in = more cost, slower responses, earlier context cutoff. Caveman mode counteracts this by expressing the same ideas in roughly 60–75% fewer tokens without losing meaning.

I've been using it across real work — code reviews, debugging, planning — and it holds up. No loss of technical accuracy, just less noise to wade through.

Small optimisation, but it compounds.
