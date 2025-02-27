
/**
 * CBE#4-Process Validation Application Configuration
 * 
 * This file contains all configurable parameters for the application.
 * Edit these values to customize the application according to your needs.
 */

const config = {
  // Authentication
  auth: {
    password: "cbe425", // The password required to access the application
  },
  
  // Application
  appName: "CBE#4-Process Validation",
  
  // Google Sheets API Configuration
  googleSheets: {
    // Replace these with your actual API key and Sheet IDs
    apiKey: "YOUR_GOOGLE_SHEETS_API_KEY", // Google Sheets API key
    
    // Tasks Sheet (for Dashboard)
    tasksSheet: {
      sheetId: "YOUR_TASKS_SHEET_ID", // ID of the Google Sheet for tasks
      range: "Tasks!A1:Z1000", // Range to fetch (adjust as needed)
    },
    
    // Documents Sheet (for Documents page)
    documentsSheet: {
      sheetId: "YOUR_DOCUMENTS_SHEET_ID", // ID of the Google Sheet for documents
      range: "Documents!A1:Z1000", // Range to fetch (adjust as needed)
    },
    
    // Tableaux Sheet (for Tableaux page)
    tableauxSheet: {
      sheetId: "YOUR_TABLEAUX_SHEET_ID", // ID of the Google Sheet for tableaux
      range: "Tableaux!A1:Z1000", // Range to fetch (adjust as needed)
    },
  },
  
  // Navigation
  navigation: [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Diagrammes", path: "/diagrammes" },
    { name: "Documents", path: "/documents" },
    { name: "Tableaux", path: "/tableaux" },
  ],
  
  // Project Progress (for Dashboard chart)
  projectProgress: {
    // Sample data for the progress chart
    // Replace with actual data or integration
    data: [
      { name: "Jan", progress: 20 },
      { name: "Feb", progress: 35 },
      { name: "Mar", progress: 50 },
      { name: "Apr", progress: 65 },
      { name: "May", progress: 78 },
      { name: "Jun", progress: 90 },
      { name: "Jul", progress: 95 },
    ],
    // Chart colors
    colors: {
      primary: "#1a1a1a",
      secondary: "#f0f0f0",
    },
  },

  // Sample Diagrammes data (for Diagrammes page)
  // These are links to local HTML files
  diagrammes: {
    categories: [
      {
        name: "Process Maps",
        items: [
          { title: "Main Process Flow", fileName: "process-flow.html" },
          { title: "Validation Process", fileName: "validation-process.html" },
          { title: "Quality Control", fileName: "quality-control.html" },
        ]
      },
      {
        name: "Organizational",
        items: [
          { title: "Team Structure", fileName: "team-structure.html" },
          { title: "Responsibility Matrix", fileName: "responsibility-matrix.html" },
        ]
      }
    ]
  },
  
  // GitHub Pages deployment info
  deployment: {
    repoName: "tgli-cbe4", // The name of the GitHub repo
    branch: "gh-pages", // The branch to deploy to
  },
};

export default config;
