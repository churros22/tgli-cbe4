
// Type definitions for Google API Client
// These are simplified definitions and may need to be expanded based on usage

interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey: string;
        clientId: string;
        discoveryDocs: string[];
        scope: string;
      }) => Promise<void>;
      sheets: {
        spreadsheets: {
          values: {
            get: (params: {
              spreadsheetId: string;
              range: string;
            }) => Promise<{
              result: {
                values: string[][];
              };
            }>;
          };
        };
      };
    };
    auth2: {
      getAuthInstance: () => {
        isSignedIn: {
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        signIn: () => Promise<any>;
        signOut: () => Promise<void>;
        currentUser: {
          get: () => {
            getBasicProfile: () => {
              getName: () => string;
              getEmail: () => string;
              getImageUrl: () => string;
            };
          };
        };
      };
    };
  };
}
