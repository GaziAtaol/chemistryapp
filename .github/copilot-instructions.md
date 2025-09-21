# Chemistry App Development Instructions

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

## Current Repository State
This is a greenfield chemistry application project. The repository currently contains only a README.md file and is ready for initial development setup.

## Working Effectively

### Initial Development Setup
When this becomes a functional chemistry application, follow these patterns:

#### For Web-Based Chemistry Applications (React/Vue/Angular):
- Install Node.js LTS version: `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`
  - **NOTE**: May fail in sandboxed environments due to network restrictions
  - Verify installation: `node --version && npm --version` 
- Bootstrap project: `npm install` -- **NEVER CANCEL: Can take 5-15 minutes depending on dependencies. Set timeout to 30+ minutes.**
  - **NOTE**: May fail due to network restrictions or firewall limitations in sandboxed environments
- Build application: `npm run build` -- **NEVER CANCEL: Chemistry apps with 3D molecular visualization can take 15-45 minutes to build. Set timeout to 60+ minutes.**
- Run development server: `npm run dev` or `npm start`
- Run tests: `npm run test` -- **NEVER CANCEL: Test suites can take 10-30 minutes. Set timeout to 45+ minutes.**

#### For Python-Based Chemistry Applications (Flask/Django + Scientific Libraries):
- Install Python dependencies: `pip install -r requirements.txt` -- **NEVER CANCEL: Scientific libraries like RDKit, NumPy, SciPy can take 20-60 minutes to compile. Set timeout to 90+ minutes.**
  - **NOTE**: May fail in sandboxed environments due to network restrictions or missing build tools
  - If pip fails, try: `conda env create -f environment.yml` -- **NEVER CANCEL: Set timeout to 120+ minutes.**
- Install build dependencies if needed: `sudo apt-get install build-essential python3-dev`
- Run application: `python app.py` or `python manage.py runserver`
- Run tests: `python -m pytest` or `python manage.py test` -- **NEVER CANCEL: Chemistry computation tests can take 15-45 minutes. Set timeout to 60+ minutes.**

#### For Full-Stack Chemistry Applications:
- Backend setup (Python/Flask/Django):
  - `cd backend && pip install -r requirements.txt` -- **NEVER CANCEL: Set timeout to 90+ minutes.**
  - `python app.py` or `python manage.py runserver`
- Frontend setup (React/Vue/Angular):
  - `cd frontend && npm install` -- **NEVER CANCEL: Set timeout to 30+ minutes.**
  - `npm run build` -- **NEVER CANCEL: Set timeout to 60+ minutes.**
  - `npm run dev`

### Database Setup
Chemistry applications typically require databases for chemical compounds:
- PostgreSQL with RDKit extension: 
  - `sudo apt-get install postgresql postgresql-contrib postgresql-server-dev-all`
  - `sudo apt-get install postgresql-rdkit`
- MongoDB for flexible chemical data storage:
  - `sudo apt-get install mongodb`
- Initialize database: `python manage.py migrate` or equivalent setup script

### Validation Requirements

#### CRITICAL: Manual Validation Steps
After making any changes to a chemistry application, **ALWAYS** perform these validation scenarios:

1. **Molecular Visualization Test:**
   - Load a sample molecule (e.g., caffeine, aspirin)
   - Verify 3D rendering displays correctly
   - Test rotation, zoom, and interaction controls
   - Take screenshot to verify visual rendering

2. **Chemical Calculation Test:**
   - Run a basic calculation (molecular weight, formula analysis)
   - Verify numerical results are accurate
   - Test edge cases with complex molecules

3. **Database Integration Test:**
   - Query chemical compound database
   - Verify search functionality works
   - Test data persistence and retrieval

4. **API Functionality Test:**
   - Test all chemical calculation endpoints
   - Verify error handling for invalid inputs
   - Test rate limiting and performance

#### Pre-commit Validation
Before committing changes, **ALWAYS** run:
- `npm run lint` or `flake8 .` (for Python) -- **NEVER CANCEL: Set timeout to 15+ minutes.**
- `npm run format` or `black .` (for Python)
- `npm run test` or `python -m pytest` -- **NEVER CANCEL: Set timeout to 60+ minutes.**
- Manual validation scenarios above

### Common Chemistry App Technologies

#### Frontend Technologies:
- **3D Molecular Visualization:** Three.js, WebGL, 3Dmol.js
- **Chemical Structure Drawing:** Kekule.js, ChemDoodle, JSmol
- **Frameworks:** React, Vue.js, Angular
- **Build Tools:** Webpack, Vite, Parcel

#### Backend Technologies:
- **Chemical Computing:** RDKit, Open Babel, PubChemPy
- **Scientific Computing:** NumPy, SciPy, pandas
- **Web Frameworks:** Flask, Django, FastAPI
- **Databases:** PostgreSQL with RDKit, MongoDB, Neo4j

#### Key Dependencies to Monitor:
- **RDKit installation issues:** Common on some systems, may require conda
- **WebGL compatibility:** Test across different browsers
- **Memory usage:** Chemistry calculations can be memory-intensive

### Troubleshooting Common Issues

#### Network and Environment Issues:
- **Package installation failures:** Common in sandboxed environments due to firewall restrictions
  - Error: "Read timed out" or "Connection refused" during pip/npm install
  - Solution: Document the failure, note it's environment-specific, continue with development
- **Build tool missing errors:** Install build essentials: `sudo apt-get install build-essential python3-dev`
- **Permission errors:** Use virtual environments or user installs: `pip install --user` or `npm install --prefix ~/.npm-global`

#### Build Failures:
- **Node-gyp compilation errors:** Install build essentials: `sudo apt-get install build-essential`
- **Python scientific library errors:** Use conda instead of pip for complex dependencies
- **Memory issues during build:** Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=8192" npm run build`

#### Runtime Issues:
- **3D rendering problems:** Check WebGL support in browser
- **Chemical calculation errors:** Verify input validation and error handling
- **Performance issues:** Profile chemical computation bottlenecks

### Performance Expectations
- **Initial setup:** 30-120 minutes (due to scientific library compilation)
- **Development builds:** 5-45 minutes (depending on 3D asset processing)
- **Test execution:** 10-60 minutes (chemistry computations are intensive)
- **Production builds:** 15-90 minutes (includes optimization and bundling)

### Project Structure (When Implemented)
```
chemistryapp/
├── frontend/          # React/Vue/Angular app with 3D visualization
├── backend/           # Python Flask/Django API
├── database/          # Database schemas and migrations
├── calculations/      # Chemical computation modules
├── tests/            # Comprehensive test suites
├── docs/             # API and user documentation
└── docker/           # Containerization configs
```

### Key Files to Monitor:
- `package.json` / `requirements.txt` - Dependencies
- `webpack.config.js` / `vite.config.js` - Build configuration
- `models.py` / database schemas - Data structures
- API route files - Backend endpoints
- Chemical calculation modules - Core functionality

## Important Notes

### NEVER CANCEL Operations
The following operations should **NEVER** be cancelled even if they appear to hang:
- Scientific library installation (RDKit, NumPy, SciPy): 20-90 minutes
- Chemistry app builds with 3D assets: 15-60 minutes  
- Test suites with molecular calculations: 10-60 minutes
- Conda environment creation: 30-120 minutes

### Always Set Appropriate Timeouts:
- Build commands: 60-120 minutes
- Test commands: 45-90 minutes
- Installation commands: 90-180 minutes
- Never use default timeouts for chemistry applications

### Development Best Practices:
- Always validate chemical calculations with known reference values
- Test molecular visualization across multiple browsers
- Verify performance with large molecular datasets
- Document any chemical domain assumptions in code
- Include error handling for invalid chemical structures

## Current Repository Commands
Since this is currently an empty repository:
- `ls -la` shows: README.md, .git/, and .github/ directories
- `node --version` returns: v20.19.5 (Node.js is available)
- `python3 --version` returns: Python 3.12.3 (Python is available) 
- `npm --version` returns: 10.8.2 (npm is available)
- `pip3 --version` returns: pip 24.0 (pip is available)
- No build system, dependencies, or source code files yet installed
- Ready for initial project scaffolding

### Repository Structure:
```
chemistryapp/
├── .git/             # Git repository data
├── .github/          # GitHub configuration (contains this file)
│   └── copilot-instructions.md
└── README.md         # Basic project readme
```

### Validated Commands:
These commands have been tested and work in the current environment:
- `npm init -y` - Creates new Node.js project
- `node --version` and `npm --version` - Check Node.js/npm versions
- `python3 --version` and `pip3 --version` - Check Python/pip versions  
- Basic file operations: `ls -la`, `mkdir`, `cd`

### Commands That May Fail:
These commands may fail due to environment restrictions but should work in normal development environments:
- `pip install <package>` - May timeout due to network restrictions
- `npm install <package>` - May fail due to firewall limitations  
- `sudo apt-get install <package>` - Requires elevated permissions
- `curl` downloads - May be blocked by firewall

When development begins, return to the appropriate technology-specific sections above.