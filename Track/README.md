# Goal Tracker - Personal Goals Management

A beautiful, responsive web application for tracking and managing your personal goals. Built with vanilla HTML, CSS, and JavaScript.

## Features

- ✅ **Add, Edit, and Delete Goals** - Full CRUD functionality for managing your goals
- 📊 **Progress Tracking** - Visual progress bars and percentage tracking for each goal
- 🏷️ **Categories & Priorities** - Organize goals by category (Personal, Career, Health, etc.) and priority levels
- 📅 **Due Dates** - Set deadlines and get visual indicators for overdue goals
- ✅ **Completion Status** - Mark goals as complete with checkbox controls
- 🔍 **Filtering** - Filter goals by status (All, Active, Completed)
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop devices
- 💾 **Local Storage** - All data is saved locally in your browser
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations

## Getting Started

### Option 1: Local Development (Simple)

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start tracking your goals!

### Option 2: Run on Server (Recommended for Production)

For secure server deployment with authentication, see [README-SERVER.md](README-SERVER.md)

**Quick Start:**
```bash
chmod +x start-server.sh
./start-server.sh
```

The server will start on `http://localhost:8000` with:
- HTTP Basic Authentication
- IP Whitelisting
- Rate Limiting
- Security Headers

**Default Credentials:**
- Username: `admin`
- Password: `secure123`

⚠️ **IMPORTANT**: Change these credentials in `server.py` before deploying!

### Usage

1. **Add a Goal**: Click the "Add New Goal" button to create a new goal
2. **Edit a Goal**: Click the edit icon (✏️) on any goal card
3. **Delete a Goal**: Click the delete icon (🗑️) on any goal card
4. **Mark Complete**: Check the checkbox at the bottom of a goal card
5. **Filter Goals**: Use the filter tabs (All, Active, Completed) to view different goal sets
6. **Track Progress**: Set a progress percentage (0-100%) for each goal

## File Structure

```
Track/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # Application logic and functionality
└── README.md       # This file
```

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

All goal data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Works offline
- ⚠️ Data is browser-specific (won't sync across devices)
- ⚠️ Clearing browser data will remove your goals

## Customization

You can easily customize the appearance by modifying the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    /* ... more variables */
}
```

## License

This project is open source and available for personal use.

## Future Enhancements

Potential features for future versions:
- Export/Import goals (JSON)
- Goal templates
- Recurring goals
- Goal notes/journal entries
- Dark mode toggle
- Goal sharing capabilities
