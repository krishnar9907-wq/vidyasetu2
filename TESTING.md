# Test cases

Run the automated data checks first:

```bash
python3 tests/validate_sample_data.py
```

Then run the manual cases below in a browser (Chrome, plus one phone-sized window).

| # | Area | Steps | Expected result |
|---|---|---|---|
| T1 | Load | Open the live URL | Page loads, hero heading and prototype banner are visible, no console errors |
| T2 | Navigation | Tap Library, Mentors, Opportunities, Sports | Each tap scrolls to the right section |
| T3 | Library search | Type "science" in search | Only matching materials are shown |
| T4 | Empty search | Type "zzzz" | Message "No materials match. Try another search." |
| T5 | Level filter | Choose School, College, Competitive, All | List filters correctly each time |
| T6 | Save | Tap ★ on an item, then tick "Saved only" | Only saved items show; dashboard saved count goes up |
| T7 | Persistence | Save an item, then reload the page | The item is still saved |
| T8 | Share resource | Fill the "Share a resource" form and submit | New item appears in the library on this device only |
| T9 | Share validation | Submit the form with empty fields | Form does not submit, or shows an error |
| T10 | HTML safety | Add a resource with the title `<b>test</b>` | Text is shown literally, not rendered as HTML |
| T11 | Languages | Switch through all 7 languages | The whole interface changes, nothing stays in English by mistake |
| T12 | Language persistence | Pick Hindi and reload | Hindi is still selected |
| T13 | Voice search | Tap the mic and speak (Chrome) | Query is filled in; unsupported browsers fail gracefully |
| T14 | Mentors | Open a mentor request, then Cancel and Send | Cancel closes it; Send works; privacy warning is visible |
| T15 | Opportunities | Tap each official link | Opens the correct official site in a new tab |
| T16 | Sports checklist | Choose Kabaddi and School team, then Create checklist | Checklist appears and the dashboard shows it |
| T17 | Feedback | Fill the form and tap Send feedback on WhatsApp | WhatsApp opens with the message pre-filled |
| T18 | WhatsApp share | Tap Share VidyaSetu on WhatsApp | WhatsApp opens with the site link |
| T19 | Mobile layout | Resize to about 375px wide | No sideways scrolling, buttons are tappable |
| T20 | Storage blocked | Open in a private window with storage blocked | App still loads and does not crash |
| T21 | Offline | Load once, turn off internet, reload | Record what happens. A full offline version needs a service worker (roadmap) |

Record results with Pass / Fail and the date.
