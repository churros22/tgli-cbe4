# CBE#4-Process Validation Application

A modern, password-protected web application for managing process validation project data, documents, diagrams, and spreadsheets.

## Project Overview

This application provides a central hub for managing process validation resources with the following features:

- Password-protected access
- Interactive dashboard with project progress visualization
- Task management interface with Google Sheets integration
- Organized access to diagrams, documents, and spreadsheets
- Modern, responsive UI with smooth animations

## Deployment Instructions for GitHub Pages

### 1. Clone the Repository

```bash
git clone https://github.com/YourUsername/tgli-cbe4.git
cd tgli-cbe4
```

### 2. Configure the Application

Open `src/config.js` and update the configuration values:

- Verify the password is set correctly (default: "cbe425")
- Add your Google Sheets API key
- Update Sheet IDs for tasks, documents, and tableaux 
- Customize any other settings as needed

### 3. Install Dependencies and Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:8080` to test the application locally.

### 4. Build for Production

```bash
npm run build
```

### 5. Deploy to GitHub Pages

The easiest way to deploy is to use the gh-pages package:

```bash
npm install --save-dev gh-pages
```

Add these scripts to your package.json:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Then deploy:

```bash
npm run deploy
```

Your site will be available at `https://YourUsername.github.io/tgli-cbe4`

## Configuration Guide

### Password Management

The login password can be changed in `src/config.js`:

```javascript
auth: {
  password: "cbe425", // Change this to your desired password
}
```

### Google Sheets Integration

To connect your Google Sheets:

1. Create a Google Cloud Platform project
2. Enable the Google Sheets API
3. Create API credentials
4. Add your API key to `src/config.js`:

```javascript
googleSheets: {
  apiKey: "YOUR_GOOGLE_SHEETS_API_KEY",
  tasksSheet: {
    sheetId: "YOUR_TASKS_SHEET_ID",
    range: "Tasks!A1:Z1000",
  },
  // Other sheet configurations...
}
```

### Adding Diagrams

To add diagrams:

1. Create HTML files for your diagrams
2. Add them to the `public/diagrams` folder
3. Update the diagram list in `src/config.js`:

```javascript
diagrammes: {
  categories: [
    {
      name: "Category Name",
      items: [
        { title: "Diagram Title", fileName: "your-diagram.html" },
        // Add more diagrams...
      ]
    }
  ]
}
```

## Customization

The application is designed to be easily customizable:

- Colors and styles can be adjusted in `tailwind.config.ts` and `src/index.css`
- Component layouts are modular and can be modified in their respective files
- All data configurations are centralized in `src/config.js`

## Support

For issues or questions, please create an issue in the GitHub repository.
