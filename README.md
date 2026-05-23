# Legal Mate

## Reason for the Project

Legal Mate is an innovative project designed to empower Small and Medium-sized Enterprises (SMEs/UMKM) by providing advanced analysis of contract clauses and agreements. Our primary goal is to help SMEs identify potential risks and avoid significant financial losses before signing any legal documents.

Powered by **Sada**, our intelligent AI legal assistant built on top of the **GEMINI-3.5-flash** model, Legal Mate delivers proactive and accessible contract analysis for everyday business owners. Sada is designed to detect unfair, ambiguous, or potentially harmful clauses hidden within legal documents, helping users better understand agreements before making important decisions.

By leveraging modern AI technology, Legal Mate offers a smarter and more approachable way for SMEs to review contracts, reduce legal uncertainty, and protect their business interests with greater confidence.

## Project Structure

This project follows a standard Next.js application structure with a clear separation of concerns:

- `public/`: Static assets such as images and favicons.
- `src/app/`:
    - `api/`: Contains API routes for backend functionalities:
        - `analyze/`: Endpoint for contract analysis.
        - `check/`: Endpoint for checking specific clauses or conditions.
        - `news/`: Endpoint for fetching relevant legal news or updates.
    - `(root)`: Next.js pages, including `layout.tsx` for global UI and `page.tsx` for the main application entry points.
    - `globals.css`: Global styles for the application.
- `src/components/`: Reusable UI components.
    - `custom-ui/`: Application-specific UI components, such as `analyze-confirm.tsx`, `dropzone.tsx`, `news-feed.tsx`, etc.
    - `ui/`: Generic, atomic UI components (e.g., `button.tsx`, `card.tsx`) based on a UI library (likely Shadcn UI, given the file names).
- `src/lib/`: Utility functions, types, and helpers:
    - `convertFiletoBase64.ts`: Utility for converting files to Base64 format.
    - `extractFileContent.ts`: Logic for extracting content from various file types.
    - `types.ts`: TypeScript type definitions.
    - `utils.ts`: General utility functions.
    - `validTypeFiles.ts`: Logic for validating allowed file types.

## How to do Local Development

To set up and run Legal Mate locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hiyokun-d/legal-mate
    cd legal-mate
    ```

2.  **Install dependencies:**
    This project uses `bun` for package management. Ensure you have `bun` installed.
    ```bash
    bun install
    ```
    If you prefer `npm` or `yarn`, you can use:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your environment variables.
    For example, you might need to configure your API key for the GEMINI-3.5-flash model:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

4.  **Run the development server:**
    ```bash
    bun dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

5.  **Run tests (if available):**
    If the project includes tests, you can run them using:
    ```bash
    bun test
    # or
    npm test
    # or
    yarn test
    ```
