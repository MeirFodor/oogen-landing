# עוגן — דף נחיתה (קהל: יזמים וחברות קבלניות)

דף נחיתה סטטי, RTL עברית. ללא שלב build — HTML/CSS/JS טהור.

## מבנה
```
anchor-landing/
├── index.html          ← הדף
├── netlify.toml        ← קונפיג פריסה + headers
├── assets/
│   ├── tokens.css      ← משתני העיצוב (צבעים, טיפוגרפיה, מרווחים)
│   ├── styles.css      ← כל הסגנונות
│   └── main.js         ← אינטראקציות (reveal, ספירת "30", אקורדיון, שליחת טופס)
└── README.md
```

## פריסה: GitHub → Netlify
1. דחפו את התיקייה `anchor-landing/` ל-repo ב-GitHub.
2. ב-Netlify: **Add new site → Import from GitHub** ובחרו את ה-repo.
3. **Publish directory:** `anchor-landing` (אם ה-repo מכיל רק את התיקייה הזו — השאירו ריק / `.`).
   **Build command:** השאירו ריק.
4. Deploy. זהו.

## הטופס (Netlify Forms)
הטופס משתמש ב-**Netlify Forms** — אפס שרת.
- הלידים מגיעים אוטומטית ל: **Netlify → Site → Forms → "lead"**.
- כדי לקבל אותם **למייל**: Netlify → Forms → Form notifications → **Add notification → Email**, והזינו את כתובת המייל.
- יש honeypot מובנה נגד ספאם.

## מה הוזן ומה עדיין חסר
הוזן: ✅ מייסדים (נתי מצגר, משולם פודור) · ✅ טלפון 052-5204080 · ✅ מייל זמני meirfodor@gmail.com · ✅ וואטסאפ (כפתור צף + footer).

נשאר:
- [ ] **קובץ לוגו** — שמרו אותו בתור `assets/logo.svg` או `assets/logo.png`. ה-JS יזהה אותו אוטומטית ויחליף את ה-wordmark הטקסטואלי (header + footer). עד אז מוצג טקסט "עוגן".
- [ ] **תמונת המייסדים** — placeholder ב-`.founder-photo` (שמרו כתמונה והחליפו את ה-`<div class="founder-photo-ph">`).
- [ ] **מייל קבוע** — להחליף את meirfodor@gmail.com כשיהיה מייל עסקי (footer + התראת Netlify).
- [ ] **המלצות / לוגואי לקוחות** — חריץ עתידי (נוסיף סקשן כשיהיו חומרים).

## בדיקה מקומית
```
cd anchor-landing && python3 -m http.server 4321
# פתחו http://localhost:4321
```
> הערה: שליחת הטופס תעבוד רק אחרי פריסה ל-Netlify (בלוקאלי ה-POST ל-"/" לא יקלוט).
