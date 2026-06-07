/**
 * Archive image prompts for Google "nano-banana" (Gemini 2.5 Flash Image).
 *
 * One prompt per archive entry (keyed by the entry id in constants.js). The
 * generator (scripts/generate-archive-images.mjs) prepends ARCHIVE_IMAGE_STYLE
 * to each so all 29 documents share one cursed-scanner look, then writes
 * public/archive/<id>.png. The game references those static files.
 *
 * Keep on-document text SHORT and fragmentary — image models render a few words
 * crisply but garble paragraphs, and fragments suit the redacted-horror tone.
 */

export const ARCHIVE_IMAGE_STYLE = `A hyperrealistic, high-resolution flatbed-scanner scan of a single aged office document, shot perfectly straight-on, the document nearly filling a tall portrait frame. The scan is imperfect: dust specks and lint, hairline scratches, faint moire banding, uneven exposure, a darker shadowed gutter along one edge and a sliver of pure black where the scanner lid did not fully close. The paper is yellowed and foxed with water stains, soft creases and one slightly curled corner. Muted, desaturated colours under a sickly fluorescent-grey cast. Deeply eerie and dread-soaked but quiet and restrained, uncanny rather than gory. Photographic realism, never illustrated or cartoonish.`;

export const ARCHIVE_IMAGE_PROMPTS = {
  resignation: `A typed resignation letter on faded corporate letterhead, the printed date clearly three years in the future. Below the short typed body, one line written by hand in glistening wet black fountain ink: "I quit because I never started." The wet ink catches the light and a single drip runs down the page. A signature beneath in the same wet ink. A greasy thumbprint smudged across the date.`,

  firstday: `An old 1987 employee-orientation group photograph mounted on a personnel card, printed caption "NEW EMPLOYEE ORIENTATION — 1987". Rows of people in period office clothes, all smiling warmly, but every single face has smooth blank skin where the eyes should be, no sockets, just unbroken flesh. Faded Polaroid colour, glossy surface catching the scanner glare, one curled corner.`,

  contract: `A dense typed legal employment contract in tiny print, one clause boxed and underlined in red ballpoint: "Section 7.3 — Employee agrees to exist retroactively." A faded embossed notary seal in the corner. Two signatures at the bottom that are unnaturally, impossibly identical, as if one was traced from the other. A dark coffee ring bleeds through the paper.`,

  performance: `A fan of carbon-copy performance-review forms scanned in a stack, each rubber-stamped "SATISFACTORY" in fading blue ink, each dated today, each comment field crammed edge to edge with the same cramped handwriting. A handwritten tally in the corner reads "847". Dog-eared, smudged carbon edges, a faint blue ink ghost between the sheets.`,

  memo: `A typed interdepartmental memo, header "TO: You   FROM: You   RE: You". The printed body is brief; beneath it, scrawled by hand in pencil pressed hard enough to tear the paper: "the lights have always been watching. they are proud." A small overexposed photograph of a humming fluorescent tube is paperclipped to the corner, glowing too brightly.`,

  manual: `A worn employee handbook lying open on the scanner, the printed running header "CHAPTER 19 — HOW TO LEAVE". Both visible pages are completely blank except a single line typed dead-centre on the right page: "You can't." The blank paper is faintly water-stained, the spine cracked, a deep shadow falling into the gutter between the pages.`,

  glitched: `A warning document caught mid-glitch as if the scanner choked: a red banner reading "WARNING", the body text smearing, doubling and breaking into static and corrupted characters. Frantic handwriting bleeds over the print: "DON'T SWITCH THE LIGHTS — it SAW me — STOP at 19". Horizontal scan-tear lines, channel-split colour fringing, a band of pure digital noise.`,

  payroll: `A green-and-white striped computer payroll printout with perforated tractor-feed edges, columns of figures where the salary and totals are heavily redacted with black bars. One printed deduction line reads "TO THE LIGHTS — 40%". The net pay shows a negative figure. Faded dot-matrix print, a diagonal fold, dust along the perforations.`,

  promotion: `A formal printed promotion notice on letterhead: "Congratulations on your promotion to SENIOR NON-EXISTENCE COORDINATOR." Crisp typeface, a gold-foil seal that has begun to flake. In the margin a handwritten note in red ink: "report to supervisors who were never hired." A faint watermark of the same text shows through from behind the page.`,

  incident: `A typed incident report form headed "INCIDENT REPORT #447", fields filled by typewriter with several lines struck through, "Date: ████/██/████". Stamped "CASE CLOSED" in red, and under it, stamped again crookedly, "STILL FILING REPORTS". A blurred black-and-white photo of an empty cubicle is stapled to the corner, the staple rusted, a smear across the lens.`,

  birthday: `A folded office birthday card opened flat on the scanner, cheerful printed balloons faded to grey. The entire inside is packed with hundreds of handwritten signatures in dozens of different pens and eras, yet on a close look every signature is the same name in a different hand. Some are dated decades in the future. The ink ages from fresh black to brown across the page.`,

  timecard: `A punched paper timecard in a worn manila sleeve, mechanical clock-stamps in faded purple ink. Monday to Friday each read "8 hours"; Saturday and Sunday each read "YOU DON'T WORK", yet are stamped anyway. A handwritten total at the bottom: "847 hours". A line reads "Overtime approved by: THE FLUORESCENT LIGHTS". Punch holes torn slightly, oily fingerprints.`,

  complaint: `A typed HR complaint form, "Employee Name: [REDACTED]" blacked out. The complaint field is handwritten in shaky biro: "The coffee machine is screaming." The typed HR response below: "Coffee machine does not exist. Complaint valid. No action required." A photographic close-up of an ordinary office coffee machine is clipped on, its drip-tray mouth opened unnaturally wide like a throat.`,

  training: `A spiral-bound safety training manual open to "CHAPTER 4 — WHAT TO DO IF YOU STOP EXISTING", a printed numbered list beside a little cartoon safety-mascot figure in the margin whose body is fading to transparent. Step 4 reads "You have always been here." Coffee-stained, a greasy thumbprint over the mascot, hole-punch shadows in the gutter.`,

  meeting: `Typed all-hands meeting minutes, header "CONFERENCE ROOM B". The attendees line reads "Everyone. No one. You (x847)". Typed action items: "Exist harder. Forget meeting occurred." Handwritten in the margin, underlined twice: "THE THING IN THE BREAK ROOM". A faint thermal-fax curl to the paper, the print slightly melted and browning at the top edge.`,

  vacation: `A typed vacation request form, the requested dates redacted with black bars, stamped diagonally in red: "DENIED". The typed manager response: "You are currently on vacation. You have been on vacation for 12 years. You are also at your desk." A small overexposed photo of an empty office chair caught mid-spin (motion blur) is paperclipped to the corner.`,

  exit: `Handwritten exit-interview notes on a yellow legal pad in blue biro pressed hard into the paper. "Reason for leaving: I want to exist somewhere else." "Length of employment: infinite years." The final line trails off mid-word, the pen dragging down off the bottom of the page: "the lights are following me ho—". Faint ghost writing indented from a torn-off page above.`,

  directory: `A printed internal phone-directory page where every alphabetical section lists the same single name with the same extension, "ext. 0000", repeated down the entire column. "Emergency Contact: ext. 0000." Cheap dot-matrix print, binder holes punched down the side, one entry circled in red pen with a hand-drawn arrow pointing into the blank margin.`,

  medical: `A typed occupational medical record on clinical letterhead. "Diagnosed: Temporal Displacement Syndrome, Chronic Existence Failure, Fluorescent Light Sensitivity." "Prognosis: conditions predate patient's birth." A small grey X-ray film is clipped to the corner: a human ribcage, but where the heart should be there is a tiny fluorescent tube glowing through the bone. Light-box glare across the film.`,

  emergency: `A wall-mounted, laminated emergency-procedures placard, scanned: bold printed header "IN CASE OF REALITY BREACH", with simple safety pictograms — a stick figure at a desk, walls turning to dotted transparent lines, and two identical figures facing each other captioned "IF YOU SEE YOURSELF, YOU ARE THE COPY". The laminate is scuffed and glaring, one corner melted.`,

  newsletter: `A cheerful printed company newsletter, masthead and clip-art borders gone grey and faded. "Employee of the Month: You (847th consecutive month!)". "Upcoming Events: THE RECKONING (TBD)". "In Memoriam: You (1987 – forever)". A grinning low-resolution clip-art sun mascot in the corner has far too many teeth. Coarse newsprint halftone dots, a coffee ring across the masthead.`,

  layoff: `A formal typed layoff letter on letterhead. "Your position has been eliminated effective ██/██/████. You are no longer employed. Please continue reporting to work." "Final paycheck deposited: never." "Thank you for your -12 years of service." A crisp signature at the bottom in ink that is somehow still wet and beading. A faint indentation of the same letter shows pressed through from beneath.`,

  policy: `A pinned bulletin-board policy notice, printed: "Employees must EXIST between 9 AM and 5 PM. Non-existence during business hours will result in disciplinary action." "Dress Code: Casual Fridays now include partial transparency." A red pushpin at the top. In the margin a hand has drawn a small human figure fading from solid to fully transparent across four steps.`,

  maintenance: `A grease-stained maintenance logbook page, ruled columns, dated entries in several different mechanics' handwriting growing more disturbed down the page: "Entry 2: Lights watching." "Entry 848: We installed the building around the lights." "Entry 849: The lights installed us." "Entry ∞: [DATA EXPUNGED]" scratched out hard enough to tear. Oily black thumbprints, a smear of fluorescent-white residue.`,

  security: `A CCTV security-footage log sheet beside four printed monitor still-frames in a 2x2 grid with burned-in timecodes. Camera 1: a figure hunched at a desk. Camera 2: an empty hallway. Camera 3: "[FOOTAGE CORRUPTED]" over pure static. Camera 4 shows the back of a person at a desk looking at these very four frames, a screen within the screen receding inward. Heavy VHS scanlines and noise.`,

  encrypted_eye: `A single sheet bearing one enormous hand-inked human eye that fills the page, drawn in obsessive hyperreal detail, the iris made of tiny fluorescent tubes arranged in a spiral, the pupil a perfect square of pure black. Dense encrypted glyphs and corrupted characters spiral outward around it. The ink is still wet along the lashes; faint pencil construction lines remain visible.`,

  encrypted_hallway: `An architectural corridor map hand-drawn in ink: an office hallway that loops back into itself in impossible Escher geometry, doors opening onto the same hallway again and again. Encrypted annotations crawl along the diagram's walls. At the vanishing point a small handwritten note: "it does not lead out." Blueprint-blue paper, scuffed, a thumbtack hole in each corner.`,

  encrypted_spiral: `A page where dense text spirals inward toward a single point at the centre, the words rotating smaller and smaller until illegible so the page would have to be turned to read them. The printed spiral is overwritten with frantic handwriting following the same curve. At the centre is a hole burned clean through the paper, edges scorched brown, faint after-images ghosting outward.`,

  encrypted_lights: `A precise printed engineering schematic of a fluorescent ceiling-light fixture with measurement callouts, but the wiring diagram unmistakably forms a watching face, two tubes as eyes. Encrypted labels and corrupted dimension callouts surround it. Handwritten beneath: "Day 7 minimum or it won't open." Blueprint paper, hard fold lines, a glowing overexposure bleeding from the two eyes.`,
};
