# Football Auction System

A Premier League-inspired auction application for your company football tournament. Features a stunning presentation view for the projector and a separate control panel for the operator.

## Quick Start

### Option 1: Using Node.js (Recommended)

1. Open Terminal
2. Navigate to this folder:
   ```bash
   cd "/Users/raghuvinaych/Downloads/football/Republic cup/football-auction"
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open in browser:
   - **Presentation View (Projector):** http://localhost:3000/
   - **Control Panel (Operator):** http://localhost:3000/control.html

### Option 2: Using Python (Alternative)

If you don't have Node.js, use Python's built-in server:

```bash
cd "/Users/raghuvinaych/Downloads/football/Republic cup/football-auction"
python3 -m http.server 3000
```

Then open the same URLs as above.

### Option 3: Direct File Opening (Limited)

You can open `index.html` directly in your browser, but some features may not work due to browser security restrictions.

---

## How It Works

### Two-Window Setup

1. **Presentation View** (`index.html`) - Full-screen display for the projector
   - Shows player teasers, reveals, bidding, and team displays
   - Controlled via keyboard shortcuts or the control panel

2. **Control Panel** (`control.html`) - Operator interface on a separate laptop/window
   - Select players for auction
   - Control the auction flow (teaser → reveal → bidding → sold)
   - Input bid amounts
   - Assign players to managers
   - Switch presentation views

### Real-Time Sync

Both windows stay synchronized automatically using browser technology. They must be:
- **Same device:** Open both in the same browser (different tabs/windows)
- **Different devices:** Must be on the same local network, accessing the same server

---

## Editing Player Data

### Player File: `data/players.json`

Each player has the following fields:

```json
{
  "id": 1,
  "name": "Player Name",
  "photo": "assets/players/player1.jpg",
  "category": "ATT",
  "attributes": {
    "pace": 90,
    "shooting": 85,
    "passing": 78,
    "dribbling": 88,
    "defense": 45,
    "physical": 75
  },
  "funFact": "A fun fact about the player for the teaser slide...",
  "oneWordTrait": "Lightning",
  "basePrice": 12000000,
  "status": "unsold",
  "soldTo": null,
  "soldPrice": null
}
```

**Field Guide:**

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique number for each player | `1`, `2`, `3`... |
| `name` | Player's display name | `"John Smith"` |
| `photo` | Path to player photo | `"assets/players/john.jpg"` |
| `category` | Position: `GK`, `DEF`, `MID`, or `ATT` | `"MID"` |
| `attributes` | Six stats, each 1-100 | See example above |
| `funFact` | Teaser text (audience guesses who) | `"This player once..."` |
| `oneWordTrait` | Short description on card | `"Speedster"` |
| `basePrice` | Starting auction price in full number | `10000000` (= €10M) |
| `status` | Leave as `"unsold"` | `"unsold"` |
| `soldTo` | Leave as `null` | `null` |
| `soldPrice` | Leave as `null` | `null` |

### Adding Player Photos

1. Place photos in `assets/players/` folder
2. Name them `player1.jpg`, `player2.jpg`, etc.
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`
4. Recommended size: 400x400 pixels (square)
5. Update the `photo` field in `players.json`

---

## Editing Manager/Team Data

### Manager File: `data/managers.json`

```json
{
  "id": 1,
  "name": "Manager Name",
  "teamName": "Thunder FC",
  "primaryColor": "#e90052",
  "secondaryColor": "#04f5ff",
  "logo": "assets/teams/team1.png",
  "budget": 100000000,
  "players": []
}
```

**Field Guide:**

| Field | Description |
|-------|-------------|
| `name` | Manager's name |
| `teamName` | Team display name |
| `primaryColor` | Main team color (hex code) |
| `secondaryColor` | Secondary team color |
| `logo` | Path to team logo image |
| `budget` | Starting budget (leave at 100000000) |
| `players` | Leave as empty `[]` |

---

## Changing Colors (Designer Guide)

All colors are defined as CSS variables in `css/styles.css` at the top of the file.

### Main Color Variables

```css
:root {
  /* Primary Colors */
  --primary-color: #37003c;        /* Main brand purple */
  --primary-light: #5a0063;        /* Lighter purple */
  --primary-dark: #1a001e;         /* Darker purple */

  /* Accent Colors */
  --accent-color: #00ff85;         /* Neon green - main highlight */
  --accent-secondary: #e90052;     /* Pink/magenta */
  --accent-tertiary: #04f5ff;      /* Cyan */

  /* Background Colors */
  --bg-primary: #1a1a2e;           /* Main background */
  --bg-secondary: #16213e;         /* Card backgrounds */
  --bg-tertiary: #0f0f1a;          /* Darker sections */

  /* Text Colors */
  --text-primary: #ffffff;         /* Main text */
  --text-secondary: #b8b8b8;       /* Secondary text */

  /* Category Colors */
  --cat-gk: #ff9f43;               /* Goalkeeper - Orange */
  --cat-def: #00d2d3;              /* Defender - Cyan */
  --cat-mid: #00ff85;              /* Midfielder - Green */
  --cat-att: #ff6b6b;              /* Attacker - Red */
}
```

### How to Change Colors

1. Open `css/styles.css` in a text editor
2. Find the `:root` section at the top
3. Change the hex color values (e.g., `#00ff85` → `#ff0000`)
4. Save and refresh the browser

**Pro Tip:** Use a color picker website like [coolors.co](https://coolors.co) to find matching colors.

---

## Keyboard Shortcuts (Presentation View)

| Key | Action |
|-----|--------|
| `Space` | Next step (reveal player, start bidding) |
| `1` | Show Team 1 View |
| `2` | Show Team 2 View |
| `3` | Show Team 3 View |
| `4` | Show Team 4 View |
| `M` | Master Overview (all teams) |
| `B` | Budget Tracker |
| `S` | Sold/Unsold Players List |
| `W` | Welcome Screen |
| `Esc` | Back to Auction View |

---

## Auction Flow

1. **Select Player** - Click a player in the Control Panel
2. **Show Teaser** - Click "Show Teaser" to display the fun fact
3. **Reveal Player** - Click "Reveal Player" to show the player card (or press Space)
4. **Start Bidding** - Click "Start Bidding" to show the auction view
5. **Update Bids** - Use increment buttons or type amount manually
6. **Select Manager** - Click the winning manager
7. **Mark Sold** - Click "MARK AS SOLD" to complete the sale

---

## Exporting Results

In the Control Panel:

- **Export JSON** - Full auction data in JSON format
- **Export CSV** - Spreadsheet-friendly format with player sales
- **Save State** - Save current progress (auto-loads on next session)
- **Load State** - Restore previously saved state

---

## Configuration Options

### Config File: `data/config.json`

```json
{
  "tournamentName": "Republic Cup 2026",
  "totalBudget": 100000000,
  "currency": "€",
  "bidIncrements": [100000, 500000, 1000000, 2000000, 5000000],
  "basePrices": {
    "GK": 5000000,
    "DEF": 8000000,
    "MID": 10000000,
    "ATT": 12000000
  }
}
```

---

## Troubleshooting

### "Sync not working between windows"

- Make sure both windows are from the same server URL
- Try refreshing both windows
- Check if browser allows localStorage (not in incognito)

### "Player photos not showing"

- Check the file path in `players.json`
- Ensure the image file exists in `assets/players/`
- Check file extension matches exactly (case-sensitive on some systems)

### "Server won't start"

- Make sure Node.js is installed: `node --version`
- Make sure you're in the correct folder
- Check if port 3000 is already in use (try a different port)

### "Colors not updating"

- Clear browser cache (Cmd+Shift+R on Mac)
- Make sure you saved the CSS file
- Check for typos in hex color codes

### "Presentation looks wrong on projector"

- Set browser to fullscreen (F11 or Cmd+Shift+F)
- Check projector resolution settings
- Try Chrome or Firefox for best compatibility

---

## File Structure

```
football-auction/
├── index.html          # Presentation view
├── control.html        # Control panel
├── server.js           # Simple web server
├── package.json        # Node.js config
├── README.md           # This file
├── PROGRESS.md         # Development progress
├── css/
│   └── styles.css      # All styles (colors here!)
├── js/
│   ├── app.js          # Presentation logic
│   ├── control.js      # Control panel logic
│   ├── sync.js         # Real-time sync
│   └── confetti.js     # Celebration effects
├── data/
│   ├── config.json     # Tournament settings
│   ├── players.json    # Player data (edit this!)
│   └── managers.json   # Manager/team data
└── assets/
    ├── players/        # Player photos
    ├── teams/          # Team logos
    └── sounds/         # Sound effects (optional)
```

---

## Tips for Event Day

1. **Test everything beforehand** - Run a full mock auction
2. **Prepare player photos** - Square images work best
3. **Set up two displays** - Projector + operator laptop
4. **Use the same browser** - Chrome recommended
5. **Save state periodically** - Click "Save State" during breaks
6. **Have backup** - Export JSON after each few sales

---

## Credits

Built with love for your company football tournament. Premier League inspired design.

Good luck with your auction!
