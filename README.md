# SpeechTherapy Project
## Author : Shirshank
This repository contains a modern web-based calculator application built with Flask.

## Project Structure

- `README.md` - This file
- `TestGit.txt` - Test file for Git operations
- `calculator/` - Main application directory
  - `config.py` - Flask application configuration
  - `requirements.txt` - Python dependencies
  - `run.py` - Application entry point
  - `app/` - Flask application package
    - `__init__.py` - Application factory
    - `routes/` - Flask blueprints
      - `main.py` - Main routes with calculator logic
    - `static/` - Static assets (CSS, JS)
      - `css/calculator.css` - Stylesheets
      - `js/calculator.js` - Client-side JavaScript
    - `templates/` - Jinja2 templates
      - `base.html` - Base template
      - `index.html` - Calculator interface

## Features

The calculator application ("CalcPro") provides:

- Safe mathematical expression evaluation using Python AST
- Support for basic arithmetic operations (+, -, *, /, ^, %)
- Trigonometric functions (sin, cos, tan, asin, acos, atan) with degree/radian modes
- Mathematical constants (pi, e)
- Functions: sqrt, log, ln, abs, factorial, ceil, floor
- Modern web interface with responsive design
- Copy-to-clipboard functionality
- Error handling for invalid expressions

## Setup and Installation

1. Ensure you have Python 3.7+ installed
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - macOS/Linux: `source .venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r calculator/requirements.txt
   ```
5. Run the application:
   ```bash
   python calculator/run.py
   ```
6. Open your browser to `http://localhost:5000`

## Usage

- Enter mathematical expressions in the input field
- Use standard operators and functions
- Toggle between degrees and radians for trigonometric functions
- Click the copy button to copy results to clipboard

## Technologies Used

- **Backend**: Flask (Python web framework)
- **Frontend**: HTML5, CSS3, JavaScript
- **Security**: AST-based safe evaluation to prevent code injection

## GitHub Actions Learning Workflows

This repository includes a few small workflows in `.github/workflows/` for learning how GitHub Actions runs work in the cloud.

- `01 - Automatic Python CI` (`ci.yml`) runs on pushes, pull requests, and manual dispatch. It installs dependencies, validates Python syntax, runs unit tests on Python 3.11 and 3.12, and uploads a repository structure artifact.
- `02 - Manual Cloud Lab` (`manual-cloud-lab.yml`) runs only when started from the GitHub Actions tab. It demonstrates manual inputs, environment variables, run summaries, and downloadable artifacts.
- `03 - Scheduled Health Check` (`scheduled-health-check.yml`) runs every Monday at 03:30 UTC and can also be started manually. It demonstrates scheduled automation with a lightweight calculator smoke check.

To try them, push this repository to GitHub, open the **Actions** tab, choose a workflow, and use **Run workflow** for the manual examples.
