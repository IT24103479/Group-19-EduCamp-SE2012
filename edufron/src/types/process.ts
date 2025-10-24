// src/processEnv.ts

export const process = {
  env: {
    REACT_APP_API_URL: import.meta.env.VITE_API_URL ?? "",
    // You can add more environment variables here
    // EXAMPLE_VAR: import.meta.env.VITE_EXAMPLE_VAR ?? "",
  },
};
