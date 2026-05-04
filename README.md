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

## GitHub Actions

This repository now includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

- Runs on `push` and `pull_request` for `main`/`master`
- Uses open-source actions: `actions/checkout`, `actions/setup-python`, `actions/cache`, `actions/upload-artifact`
- Installs dependencies from `calculator/requirements.txt`
- Performs Python syntax validation with `py_compile`
- Generates a repository structure visualization file (`repo-structure.md`)
- Uploads the visualization as a workflow artifact for easy inspection on GitHub

> After the workflow runs, download `repo-structure` from the workflow summary to view the repository tree structure generated automatically.
