# TypeScript Migration Plan - Tracklist Downloader

## A. Project Summary

This is a **Node.js CLI application** that downloads music tracks from various sources (1001tracklists.com and Spotify playlists) by:
1. Scraping tracklists from web sources or fetching from Spotify API
2. Searching YouTube for matching videos
3. Downloading and converting videos to MP3 format

**Architecture:**
- **Module System**: CommonJS (`require`/`module.exports`)
- **Entry Point**: `lambda.js` (CLI script using yargs)
- **Main Handler**: `src/handler.js` (orchestrates the download pipeline)
- **Core Modules**:
  - `src/sourceScrappers/` - Web scraping (Playwright + Cheerio) and Spotify API integration
  - `src/youtubeSearcher/` - YouTube video search with filtering logic
  - `src/youtubeDownloader/` - MP3 download orchestration
  - `src/folderManager/` - Directory creation and management
  - `src/utils/` - Shared utilities (Promise.allSettled wrappers, print utilities)

**Dependencies:**
- **Functional Programming**: Ramda, @flybondi/ramda-land
- **Web Scraping**: Playwright, Cheerio, Tesseract.js (OCR for captcha solving)
- **APIs**: spotify-web-api-node, simple-youtube-api, yt-search
- **Media Processing**: ytdl-mp3, sharp (image processing)
- **Tooling**: ESLint (babel-eslint), Prettier, no test framework detected

**Code Characteristics:**
- Heavy use of Ramda functional composition
- Complex async/await patterns with Promise.allSettled
- Browser automation with Playwright (captcha solving, cookie consent)
- External API integrations (Spotify, YouTube)
- File system operations
- Configuration-driven behavior (config/local.json)

---

## B. Detected Risks

### High Risk Areas

1. **`src/youtubeDownloader/Downloader.js`** - **CRITICAL BUG DETECTED**
   - Line 10: References `YTDL` which is never imported/defined
   - Should use `DownloadAS` (imported as `Downloader` from 'ytdl-mp3')
   - This file appears to be unused (main downloader uses `src/youtubeDownloader/index.js`)
   - **Action Required**: Fix or remove this file during migration

2. **External API Response Types**
   - Spotify API responses (`response.body.items`, `response.body.name`)
   - YouTube search results (`r.videos`, `video.duration.timestamp`)
   - yt-search library return types
   - **Risk**: No type definitions for these external APIs
   - **Mitigation**: Create custom type definitions or use `@types` packages where available

3. **Playwright Page Types**
   - Complex browser automation with dynamic selectors
   - Captcha solving logic with OCR
   - **Risk**: Playwright types are well-maintained, but custom page interactions need typing

4. **Ramda Functional Composition**
   - Heavy use of `compose`, `pipe`, `map`, `chain`, etc.
   - Type inference can be challenging with Ramda
   - **Risk**: May require explicit type annotations for complex compositions
   - **Mitigation**: Use `@types/ramda` and consider `ramda-adjunct` for better TypeScript support

5. **Configuration Object Structure**
   - `config/local.json` structure is implicit
   - No validation of config shape at runtime
   - **Risk**: Runtime errors if config is malformed
   - **Mitigation**: Create TypeScript interface and add runtime validation

6. **Promise.allSettled Response Handling**
   - Custom `prAll` utility wraps Promise.allSettled
   - Complex filtering logic (`responseFormatter` in youtubeSearcher)
   - **Risk**: Type narrowing needed for fulfilled/rejected states

### Medium Risk Areas

7. **File System Operations**
   - Dynamic folder creation based on URLs
   - Debug file writing (captcha images, HTML dumps)
   - **Risk**: Path handling differences between platforms

8. **Error Handling Patterns**
   - Inconsistent error handling (some functions return `undefined`, others throw)
   - `youtubeVideoSearcher` returns `err` object instead of throwing
   - **Risk**: Type system will expose these inconsistencies

9. **JSDoc Coverage**
   - Only 5 functions have JSDoc comments
   - Most functions lack type documentation
   - **Opportunity**: Migration will force explicit typing

### Low Risk Areas

10. **Simple Utility Functions**
    - `printUtils.js` - Pure functions, easy to type
    - `utils/index.js` - Simple Promise wrappers

11. **Entry Point**
    - `lambda.js` - Simple CLI wrapper, straightforward migration

---

## C. Migration Plan by Phases

### Phase 0: Preparation (No Code Changes)

- [ ] **0.1** Install TypeScript and type definitions
  - `yarn add -D typescript @types/node @types/ramda`
  - `yarn add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin`
  - Check for `@types` packages for: cheerio, yargs, sharp, tesseract.js, playwright

- [ ] **0.2** Create initial `tsconfig.json` (see Section D)
  - Start with permissive settings (`allowJs: true`, `checkJs: false`)
  - Target ES2020 or higher (Node 10.15.3+ requirement)

- [ ] **0.3** Update ESLint configuration
  - Replace `babel-eslint` with `@typescript-eslint/parser`
  - Add TypeScript-specific rules gradually
  - Keep existing Prettier integration

- [ ] **0.4** Create type definition files structure
  - `src/types/config.d.ts` - Configuration interfaces
  - `src/types/api.d.ts` - External API response types
  - `src/types/index.d.ts` - Re-export all types

- [ ] **0.5** Document current runtime behavior
  - Test the application end-to-end
  - Document expected input/output types
  - Identify edge cases

### Phase 1: Infrastructure & Types (Low Risk)

- [ ] **1.1** Create configuration type definitions
  - Define `Config` interface matching `config/local.json.example`
  - Create type-safe config loader utility
  - Add runtime validation (optional but recommended)

- [ ] **1.2** Create external API type definitions
  - Spotify API response types (playlist, tracks)
  - YouTube search result types (yt-search library)
  - ytdl-mp3 event types

- [ ] **1.3** Migrate utility functions (`src/utils/`)
  - `src/utils/printUtils.js` → `.ts`
  - `src/utils/index.js` → `.ts`
  - These are pure functions, low complexity

- [ ] **1.4** Update imports in files that use utilities
  - Change `require('../utils')` to use new TypeScript exports
  - Test that CommonJS interop works

### Phase 2: Core Business Logic (Medium Risk)

- [ ] **2.1** Migrate `src/folderManager/index.js`
  - Simple async function with file system operations
  - Type the return value (string | undefined)

- [ ] **2.2** Migrate `src/youtubeSearcher/index.js`
  - Complex filtering logic with Ramda
  - Type the video search results
  - Handle the error return pattern (returns `err` instead of throwing)

- [ ] **2.3** Migrate `src/youtubeDownloader/index.js`
  - Type the Downloader class usage
  - Type the video URL array input
  - Handle Promise.allSettled response types

- [ ] **2.4** Fix or remove `src/youtubeDownloader/Downloader.js`
  - **CRITICAL**: This file has a bug (undefined YTDL reference)
  - Determine if it's used anywhere
  - Either fix the bug or remove the file

### Phase 3: Complex Scrapers (High Risk)

- [ ] **3.1** Migrate `src/sourceScrappers/spotify-scrapper.js`
  - Type Spotify API client and responses
  - Handle authentication flow types
  - Type error responses (statusCode checks)

- [ ] **3.2** Migrate `src/sourceScrappers/1001-scrapper.js`
  - **Most complex file** - Playwright automation, OCR, image processing
  - Type Playwright Page and BrowserContext
  - Type Tesseract OCR results
  - Type Sharp image processing pipeline
  - Type Cheerio DOM manipulation

- [ ] **3.3** Migrate `src/sourceScrappers/index.js`
  - Simple router function
  - Type the scraper function signatures

### Phase 4: Orchestration Layer (Medium Risk)

- [ ] **4.1** Migrate `src/handler.js`
  - Type the main handler function
  - Type the pipeline flow (tracklist → youtubeUrls → download)
  - Ensure error types are properly handled

- [ ] **4.2** Migrate `lambda.js`
  - Type yargs argument parsing
  - Type the handler invocation

### Phase 5: Stricter Type Checking (Incremental)

- [ ] **5.1** Enable `checkJs: true` in tsconfig.json
  - Type-check remaining `.js` files
  - Fix any type errors in JS files

- [ ] **5.2** Enable `noImplicitAny: true`
  - Gradually fix implicit `any` types
  - Start with utilities, then core logic

- [ ] **5.3** Enable `strictNullChecks: true`
  - Handle `undefined` and `null` explicitly
  - Update functions that return `undefined`

- [ ] **5.4** Enable `strict: true` (includes all strict flags)
  - Final pass for type safety
  - Address any remaining type issues

### Phase 6: Cleanup & Optimization

- [ ] **6.1** Remove `allowJs: true` (all files migrated)
  - Ensure no `.js` files remain in `src/`

- [ ] **6.2** Update build/run scripts
  - Consider using `ts-node` for development
  - Or compile to `dist/` and run from there
  - Update `package.json` scripts

- [ ] **6.3** Update documentation
  - README.md with TypeScript setup instructions
  - Document type definitions location

- [ ] **6.4** Remove FlowType ESLint plugin
  - Currently configured but not used
  - Clean up `.eslintrc.json`

---

## D. Proposed Initial tsconfig.json

```json
{
  "compilerOptions": {
    // Target and Module
    "target": "ES2020",                    // Node 10.15.3+ supports ES2020
    "module": "commonjs",                  // Keep CommonJS for compatibility
    "lib": ["ES2020"],                     // Standard library features
    
    // Output
    "outDir": "./dist",                    // Compiled output directory
    "rootDir": "./src",                    // Source root
    "sourceMap": true,                     // Generate source maps for debugging
    
    // Type Checking - START PERMISSIVE
    "allowJs": true,                       // Allow JavaScript files during migration
    "checkJs": false,                      // Don't type-check JS files initially
    "noImplicitAny": false,                // Allow implicit any during migration
    "strictNullChecks": false,             // Disable strict null checks initially
    "strict": false,                       // Disable all strict checks initially
    
    // Module Resolution
    "moduleResolution": "node",            // Node.js module resolution
    "esModuleInterop": true,               // Enable ES module interop
    "allowSyntheticDefaultImports": true,   // Allow default imports from modules without default export
    "resolveJsonModule": true,             // Allow importing JSON files (for config)
    
    // Emit
    "declaration": true,                   // Generate .d.ts files
    "declarationMap": true,                // Generate declaration source maps
    "removeComments": false,                // Keep comments during migration
    
    // Interop Constraints
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true                   // Skip type checking of declaration files (faster)
  },
  "include": [
    "src/**/*",
    "lambda.js"                            // Include entry point
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "config/local.json"                    // Exclude local config (may contain secrets)
  ],
  "ts-node": {
    "esm": false,                          // Use CommonJS for ts-node
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

### Migration Path for tsconfig.json Flags

**Phase 1-2 (Initial Migration):**
- `allowJs: true`, `checkJs: false`
- `noImplicitAny: false`, `strict: false`

**Phase 3-4 (Core Migration):**
- `allowJs: true`, `checkJs: true` (start checking JS files)
- `noImplicitAny: false` (still permissive)

**Phase 5 (Stricter Checking):**
- `allowJs: true`, `checkJs: true`
- `noImplicitAny: true` (enable strict any checking)
- `strictNullChecks: true` (enable strict null checks)

**Phase 6 (Final):**
- `allowJs: false` (all files migrated)
- `strict: true` (enable all strict checks)

---

## E. Files/Folders That Require Explicit Approval Before Modification

### Critical Files (Do Not Modify Without Approval)

1. **`config/local.json`**
   - Contains sensitive credentials (Spotify API keys, YouTube API keys)
   - Should NEVER be committed or modified programmatically
   - Only read, never write

2. **`config/local.json.example`**
   - Template file for configuration
   - Can be modified to add new config options, but structure changes need approval

3. **`package.json`**
   - Dependency versions and scripts
   - Changes to dependencies require testing
   - Script modifications affect how the app runs

4. **`.eslintrc.json`**
   - Linting rules
   - Changes affect code style enforcement
   - Should be updated gradually during migration

5. **`README.md`**
   - Project documentation
   - Updates should reflect actual migration progress

### Generated/Temporary Files (Can Be Ignored)

- `*-player-script.js` (ytdl-core temporary files)
- `debug_captcha*.png` (debug images)
- `debug-1001-dump.html` (debug HTML)
- `node_modules/` (dependencies)
- `dist/` (compiled output, once TypeScript compilation is set up)

### Files That May Need Special Handling

6. **`src/youtubeDownloader/Downloader.js`**
   - **BUG DETECTED**: References undefined `YTDL`
   - Appears unused (main code uses `src/youtubeDownloader/index.js`)
   - **Decision Needed**: Fix the bug or remove the file?
   - **Recommendation**: Check git history, verify if it's used, then fix or remove

7. **Root-level `lambda.js`**
   - Entry point, simple but critical
   - Can be migrated but needs testing to ensure CLI still works

### Files Safe to Migrate Automatically

- All files in `src/utils/` (pure functions)
- All files in `src/folderManager/` (simple file operations)
- `src/handler.js` (orchestration, well-structured)
- `src/sourceScrappers/index.js` (simple router)

### Files Requiring Careful Migration

- `src/sourceScrappers/1001-scrapper.js` (most complex, Playwright + OCR)
- `src/sourceScrappers/spotify-scrapper.js` (API integration)
- `src/youtubeSearcher/index.js` (complex Ramda composition)
- `src/youtubeDownloader/index.js` (Promise.allSettled handling)

---

## F. Recommended Next Prompt for Executing Migration

Use this prompt to begin the actual migration:

```
I'm ready to begin the TypeScript migration for this project. Please start with Phase 0 (Preparation) and Phase 1 (Infrastructure & Types).

Specifically:
1. Install TypeScript and necessary type definition packages
2. Create the initial tsconfig.json with the permissive settings from the migration plan
3. Update .eslintrc.json to support TypeScript
4. Create the type definition files structure:
   - src/types/config.d.ts (for configuration interfaces)
   - src/types/api.d.ts (for external API response types)
   - src/types/index.d.ts (re-export all types)
5. Define the Config interface based on config/local.json.example
6. Create type definitions for Spotify API responses and YouTube search results
7. Migrate src/utils/printUtils.js and src/utils/index.js to TypeScript

Do NOT modify any other source files yet. Only create new type definition files and migrate the utility files. Test that the application still runs after these changes.
```

### Alternative: Incremental File-by-File Migration

If you prefer a more gradual approach:

```
I want to migrate this project to TypeScript incrementally. Please:
1. Set up TypeScript infrastructure (tsconfig.json, types directory, install packages)
2. Migrate ONLY src/utils/printUtils.js to TypeScript
3. Ensure the rest of the codebase can still import and use it
4. Test that the application still works
5. Show me what changed and ask for approval before proceeding to the next file
```

---

## Additional Notes

### Dependency Type Availability

**Has @types packages:**
- `@types/node` ✅
- `@types/ramda` ✅ (check compatibility with ramda@0.26.1)
- `@types/yargs` ✅
- `@types/cheerio` ✅ (may need version check)
- `@types/sharp` ✅ (may need version check)

**May need custom type definitions:**
- `ytdl-mp3` - Check npm for @types/ytdl-mp3
- `yt-search` - May need custom types
- `simple-youtube-api` - May need custom types
- `spotify-web-api-node` - Check for @types package
- `@flybondi/ramda-land` - May need custom types or check package for built-in types
- `tesseract.js` - Check for @types/tesseract.js
- `playwright` - Should have built-in types

### Ramda TypeScript Considerations

- Ramda 0.26.1 is quite old (current is 0.29+)
- TypeScript support improved significantly in newer versions
- Consider if upgrading Ramda is feasible (may require code changes)
- `@types/ramda` should work but may have limitations with older Ramda versions
- Complex compositions may need explicit type annotations

### Testing Strategy

- **No test framework detected** - Consider adding tests during/after migration
- TypeScript will catch many errors at compile time
- Manual testing still required for:
  - Playwright browser automation
  - Captcha solving logic
  - External API integrations
  - File system operations

### Build Strategy Options

1. **Development**: Use `ts-node` to run TypeScript directly
2. **Production**: Compile to `dist/` and run compiled JavaScript
3. **Hybrid**: Keep source as `.ts`, compile for distribution

Recommendation: Start with `ts-node` for development, add compilation step later.

---

**End of Migration Plan**

