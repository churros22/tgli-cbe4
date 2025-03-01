
import config from '@/config';

// Define types for Google Sheets API responses
interface SheetRow {
  [key: string]: any;
}

interface GoogleSheetsResponse {
  values: string[][];
}

/**
 * Service for interacting with Google Sheets API
 */
class GoogleSheetsService {
  private apiKey: string;
  private gapiLoaded: boolean = false;
  private authInstance: any = null;
  private isAuthenticated: boolean = false;

  constructor() {
    this.apiKey = config.googleSheets.apiKey;
  }

  /**
   * Initialize the Google API client
   */
  async initialize(): Promise<boolean> {
    if (this.gapiLoaded) return true;

    return new Promise((resolve) => {
      // Load the Google API client library
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.apiKey,
              clientId: config.googleSheets.clientId,
              discoveryDocs: config.googleSheets.discoveryDocs,
              scope: config.googleSheets.scopes,
            });

            this.authInstance = window.gapi.auth2.getAuthInstance();
            this.isAuthenticated = this.authInstance.isSignedIn.get();
            this.gapiLoaded = true;
            resolve(true);
          } catch (error) {
            console.error('Error initializing Google API client:', error);
            resolve(false);
          }
        });
      };
      script.onerror = () => {
        console.error('Failed to load Google API client');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Sign in to Google
   */
  async signIn(): Promise<boolean> {
    if (!this.gapiLoaded) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      await this.authInstance.signIn();
      this.isAuthenticated = this.authInstance.isSignedIn.get();
      return this.isAuthenticated;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return false;
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    if (this.authInstance) {
      await this.authInstance.signOut();
      this.isAuthenticated = false;
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Fetch data from a Google Sheet
   * @param spreadsheetId The ID of the spreadsheet
   * @param range The range of cells to fetch
   * @param headers Whether the first row contains headers
   */
  async fetchSheetData(
    spreadsheetId: string, 
    range: string, 
    headers: boolean = true
  ): Promise<SheetRow[]> {
    if (!this.gapiLoaded) {
      const initialized = await this.initialize();
      if (!initialized) throw new Error('Failed to initialize Google API client');
    }

    if (!this.isAuthenticated) {
      const signedIn = await this.signIn();
      if (!signedIn) throw new Error('User not authenticated with Google');
    }

    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const data = response.result as GoogleSheetsResponse;
      
      if (!data.values || data.values.length === 0) {
        return [];
      }

      // If headers is true, use the first row as keys for the objects
      if (headers) {
        const headerRow = data.values[0];
        return data.values.slice(1).map(row => {
          const obj: SheetRow = {};
          headerRow.forEach((header, index) => {
            // Use an empty string if the cell value is undefined
            obj[header] = index < row.length ? row[index] : '';
          });
          return obj;
        });
      } else {
        // If no headers, return the raw data
        return data.values.map(row => ({ values: row }));
      }
    } catch (error) {
      console.error('Error fetching Google Sheet data:', error);
      throw error;
    }
  }

  /**
   * Fetch tasks from the configured Google Sheet
   */
  async fetchTasks(): Promise<SheetRow[]> {
    const config = this.getTasksConfig();
    return this.fetchSheetData(config.spreadsheetId, config.range);
  }

  /**
   * Fetch documents from the configured Google Sheet
   */
  async fetchDocuments(): Promise<SheetRow[]> {
    const config = this.getDocumentsConfig();
    return this.fetchSheetData(config.spreadsheetId, config.range);
  }

  /**
   * Fetch tableaux from the configured Google Sheet
   */
  async fetchTableaux(): Promise<SheetRow[]> {
    const config = this.getTableauxConfig();
    return this.fetchSheetData(config.spreadsheetId, config.range);
  }

  /**
   * Get configuration for tasks spreadsheet
   */
  private getTasksConfig() {
    return config.googleSheets.tasksSheet;
  }

  /**
   * Get configuration for documents spreadsheet
   */
  private getDocumentsConfig() {
    return config.googleSheets.documentsSheet;
  }

  /**
   * Get configuration for tableaux spreadsheet
   */
  private getTableauxConfig() {
    return config.googleSheets.tableauxSheet;
  }
}

// Create a singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
