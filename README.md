
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

## Google Sheets Integration: Detailed Setup

### 1. Create a Google Cloud Platform Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and give it a name (e.g., "CBE4-Validation-App")
3. Wait for the project to be created and select it

### 2. Enable the Google Sheets API

1. In your project dashboard, navigate to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on the API and press "Enable"

### 3. Create API Credentials

#### For Client-Side Access (API Key):
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API Key"
3. Copy the generated API key
4. For security, restrict the API key:
   - Click "Restrict Key"
   - Under API restrictions, select "Google Sheets API"
   - Under Application restrictions, choose "HTTP referrers" and add your domains (e.g., localhost and your GitHub Pages URL)

#### For OAuth 2.0 (for better security):
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Configure the OAuth consent screen if prompted
4. Choose "Web application" as the application type
5. Add authorized JavaScript origins (e.g., http://localhost:8080, https://yourusername.github.io)
6. Click "Create" and copy the Client ID

### 4. Prepare Your Google Sheets

#### Tasks Sheet:
1. Create a new Google Sheet or use an existing one
2. Format the first sheet with these columns:
   - ID (A)
   - Title (B)
   - Description (C)
   - Status (D) - Use "pending", "in_progress", "completed"
   - Due Date (E) - Use YYYY-MM-DD format
   - Assignee (F)
   - Category (G)
   - Priority (H) - Use "low", "medium", "high"
3. Name this sheet "Tasks"

#### Documents Sheet:
1. Add a new sheet named "Documents"
2. Format with these columns:
   - ID (A)
   - Title (B)
   - Category (C)
   - URL (D) - Direct link to the document
   - Type (E) - E.g., "doc", "pdf", etc.
   - Date (F) - Last update date in YYYY-MM-DD format

#### Tableaux Sheet:
1. Add a new sheet named "Tableaux"
2. Format with these columns:
   - ID (A)
   - Title (B)
   - Category (C)
   - URL (D) - Direct link to the spreadsheet
   - Type (E) - E.g., "sheet", "pdf", etc.
   - Date (F) - Last update date in YYYY-MM-DD format

### 5. Make Your Sheets Public (Read-Only)

1. Click the "Share" button in your Google Sheet
2. Change access to "Anyone with the link" and set permission to "Viewer"
3. Copy the spreadsheet ID from the URL (the long string between /d/ and /edit in the URL)

### 6. Update Configuration in the Application

Open `src/config.js` and update these values:

```javascript
googleSheets: {
  apiKey: "YOUR_API_KEY", // API Key from step 3
  clientId: "YOUR_CLIENT_ID", // Client ID from step 3 (if using OAuth)
  
  // Tasks Sheet
  tasksSheet: {
    spreadsheetId: "YOUR_SPREADSHEET_ID", // From step 5
    range: "Tasks!A1:Z1000", // Adjust range as needed
  },
  
  // Documents Sheet
  documentsSheet: {
    spreadsheetId: "YOUR_SPREADSHEET_ID", // Same ID if all in one spreadsheet
    range: "Documents!A1:Z1000", // Adjust range as needed
  },
  
  // Tableaux Sheet
  tableauxSheet: {
    spreadsheetId: "YOUR_SPREADSHEET_ID", // Same ID if all in one spreadsheet
    range: "Tableaux!A1:Z1000", // Adjust range as needed
  },
}
```

### 7. Test the Integration

1. Run the application locally
2. Log in with your password
3. Check the dashboard to see if tasks are loading from your Google Sheet
4. Test the Documents and Tableaux pages to ensure they're fetching data correctly

### Troubleshooting

- If you see CORS errors, ensure your API key is properly restricted to your domains
- Check the browser console for specific error messages related to the Google Sheets API
- Verify that your spreadsheet has appropriate sharing settings
- Ensure the sheet names and column structure match what the application expects

## Configuration Guide

### Password Management

The login password can be changed in `src/config.js`:

```javascript
auth: {
  password: "cbe425", // Change this to your desired password
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

```
