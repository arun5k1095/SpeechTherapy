'use strict';

/* ============================================================
   CalcPro — Calculator Engine
   ============================================================ */
class Calculator {
  constructor() {
    this.expression    = '';   // raw expression string (display symbols inside)
    this.rawResult     = '0';  // numeric string, no formatting
    this.displayResult = '0';  // formatted string shown in big result area
    this.memory        = null;
    this.history       = [];
    this.angleUnit     = 'deg'; // 'deg' | 'rad'
    this.sciMode       = false;
    this.histOpen      = false;
    this.justCalc      = false; // true after = pressed, before next input
    this.loading       = false;
    this._toastTimer   = null;

    this._el = {};
    this._init();
  }

  /* ── Initialisation ── */
  _init() {
    this._cache();
    this._bind();
    this._loadHistory();
    this._render();
  }

  _cache() {
    const ids = [
      'expression','result','copyBtn','copyIcon','checkIcon',
      'angleBadge','memoryBadge','modeToggle','historyToggle',
      'sciPanel','historyPanel','historyList','clearHistory',
      'degRadBtn','toast',
    ];
    ids.forEach(id => { this._el[id] = document.getElementById(id); });
  }

  _bind() {
    // Number keys
    document.querySelectorAll('[data-num]').forEach(btn => {
      btn.addEventListener('click', e => {
        this._ripple(e.currentTarget);
        this._inputNum(e.currentTarget.dataset.num);
      });
    });

    // Operator keys
    document.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('click', e => {
        this._ripple(e.currentTarget);
        this._inputOp(e.currentTarget.dataset.op);
      });
    });

    // Action keys
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', e => {
        this._ripple(e.currentTarget);
        this._action(e.currentTarget.dataset.action);
      });
    });

    // Scientific keys
    document.querySelectorAll('[data-sci]').forEach(btn => {
      btn.addEventListener('click', e => {
        this._ripple(e.currentTarget);
        this._inputSci(e.currentTarget.dataset.sci);
      });
    });

    // Toolbar
    this._el.modeToggle?.addEventListener('click', () => this._toggleSci());
    this._el.historyToggle?.addEventListener('click', () => this._toggleHist());
    this._el.copyBtn?.addEventListener('click', () => this._copy());
    this._el.clearHistory?.addEventListener('click', () => this._clearHistory());

    // Keyboard
    document.addEventListener('keydown', e => this._onKey(e));
  }

  /* ── Input handlers ── */
  _inputNum(ch) {
    if (this.justCalc) {
      this.expression = '';
      this.justCalc = false;
    }

    // Prevent multiple decimal points in the current number segment
    if (ch === '.') {
      const segs = this.expression.split(/[\+\-×÷\(\)]/);
      if (segs[segs.length - 1].includes('.')) return;
    }

    this.expression += ch;
    this._render();
  }

  _inputOp(op) {
    if (!this.expression && !this.justCalc) {
      if (op === '−') { this.expression = '−'; this._render(); }
      return;
    }

    // If result was just shown, chain from it
    if (this.justCalc) {
      this.expression = this.rawResult;
      this.justCalc = false;
    }

    // Replace trailing operator + surrounding spaces if present
    this.expression = this.expression.replace(/\s[×÷+−]\s$/, '').replace(/\s$/, '');

    // Don't append operator right after open paren
    if (this.expression.endsWith('(') && op !== '−') return;

    this.expression += ` ${op} `;
    this._render();
  }

  _inputSci(token) {
    if (this.justCalc) {
      // Postfix tokens like **2, **3 operate on the result
      if (token.startsWith('**') || token === 'π' || token === 'e') {
        this.expression = this.rawResult;
      } else {
        this.expression = '';
      }
      this.justCalc = false;
    }
    this.expression += token;
    this._render();
  }

  _action(act) {
    const map = {
      ac:        () => this._allClear(),
      sign:      () => this._toggleSign(),
      percent:   () => this._percent(),
      backspace: () => this._backspace(),
      equals:    () => this._calculate(),
      mc:        () => this._mc(),
      mr:        () => this._mr(),
      'm+':      () => this._mPlus(),
      'm-':      () => this._mMinus(),
      'deg-rad': () => this._toggleAngle(),
    };
    map[act]?.();
  }

  /* ── Keyboard ── */
  _onKey(e) {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') { this._copy(); return; }
    }
    const k = e.key;
    if (k >= '0' && k <= '9') { e.preventDefault(); this._inputNum(k); return; }
    if (k === '.') { e.preventDefault(); this._inputNum('.'); return; }
    if (k === '+') { e.preventDefault(); this._inputOp('+'); return; }
    if (k === '-') { e.preventDefault(); this._inputOp('−'); return; }
    if (k === '*') { e.preventDefault(); this._inputOp('×'); return; }
    if (k === '/') { e.preventDefault(); this._inputOp('÷'); return; }
    if (k === '%') { e.preventDefault(); this._percent(); return; }
    if (k === 'Enter' || k === '=') { e.preventDefault(); this._calculate(); return; }
    if (k === 'Escape')    { e.preventDefault(); this._allClear(); return; }
    if (k === 'Backspace') { e.preventDefault(); this._backspace(); return; }
    if (k === '(') { e.preventDefault(); this.expression += '('; this._render(); return; }
    if (k === ')') { e.preventDefault(); this.expression += ')'; this._render(); return; }
  }

  /* ── Core operations ── */
  _allClear() {
    this.expression    = '';
    this.rawResult     = '0';
    this.displayResult = '0';
    this.justCalc      = false;
    this._render();
  }

  _backspace() {
    if (this.justCalc) { this._allClear(); return; }
    if (!this.expression) return;

    // Smart backspace: remove whole operator token " × " etc.
    const opMatch = this.expression.match(/\s[×÷+−]\s?$/);
    if (opMatch) {
      this.expression = this.expression.slice(0, -opMatch[0].length);
    } else {
      this.expression = this.expression.slice(0, -1);
    }
    this._render();
  }

  _percent() {
    if (!this.expression && !this.justCalc) return;
    const src = this.justCalc ? this.rawResult : this.expression;
    this.expression = `(${src})/100`;
    this.justCalc   = false;
    this._render();
  }

  _toggleSign() {
    if (this.justCalc) {
      const n = parseFloat(this.rawResult);
      if (!isNaN(n)) {
        const toggled  = -n;
        this.rawResult = this._fmt(toggled).raw;
        this.displayResult = this._fmt(toggled).display;
        this.expression = String(toggled);
        this._render();
      }
      return;
    }
    // Wrap current expression in negation
    if (this.expression) {
      this.expression = `-(${this.expression})`;
      this._render();
    }
  }

  /* ── Calculation ── */
  async _calculate() {
    const src = this.justCalc ? this.rawResult : this.expression;
    if (!src || src === '0') return;

    this.loading = true;
    this._render();

    try {
      const res  = await fetch('/api/calculate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ expression: src, angleUnit: this.angleUnit }),
      });
      const data = await res.json();

      if (data.success) {
        const fmt          = this._fmt(data.result);
        const histExpr     = this.expression || this.rawResult;
        this.rawResult     = String(data.result);
        this.displayResult = fmt.display;
        this.expression    = src + ' =';
        this.justCalc      = true;
        this._addHistory(histExpr, fmt.display);
        this._popResult();
      } else {
        this._showError(data.error || 'Error');
      }
    } catch {
      this._showError('Network error');
    }

    this.loading = false;
    this._render();
  }

  /* ── Formatting ── */
  _fmt(num) {
    if (typeof num !== 'number' || !isFinite(num)) {
      return { raw: String(num), display: String(num) };
    }
    const raw = String(num);
    let display;
    if (Math.abs(num) >= 1e15 || (num !== 0 && Math.abs(num) < 1e-10)) {
      display = num.toExponential(6).replace(/\.?0+e/, 'e');
    } else {
      // Thousand-separated display
      const parts = raw.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      display = parts.join('.');
    }
    return { raw, display };
  }

  /* ── Memory ── */
  _mc()     { this.memory = null; this._render(); }
  _mr()     { if (this.memory !== null) this._inputNum(String(this.memory)); }

  _mPlus() {
    const n = parseFloat(this.displayResult.replace(/,/g, ''));
    if (!isNaN(n)) { this.memory = (this.memory ?? 0) + n; this._showToast('Added to memory'); this._render(); }
  }

  _mMinus() {
    const n = parseFloat(this.displayResult.replace(/,/g, ''));
    if (!isNaN(n)) { this.memory = (this.memory ?? 0) - n; this._showToast('Subtracted from memory'); this._render(); }
  }

  /* ── Mode toggles ── */
  _toggleSci() {
    this.sciMode = !this.sciMode;
    this._el.sciPanel?.classList.toggle('open', this.sciMode);
    this._el.modeToggle?.classList.toggle('active', this.sciMode);
    if (this._el.modeToggle) {
      this._el.modeToggle.lastChild.textContent = this.sciMode ? 'Standard' : 'Scientific';
    }
    // Show/hide angle badge
    this._el.angleBadge?.classList.toggle('visible', this.sciMode);
  }

  _toggleHist() {
    this.histOpen = !this.histOpen;
    this._el.historyPanel?.classList.toggle('open', this.histOpen);
    this._el.historyToggle?.classList.toggle('active', this.histOpen);
  }

  _toggleAngle() {
    this.angleUnit = this.angleUnit === 'deg' ? 'rad' : 'deg';
    if (this._el.degRadBtn)    this._el.degRadBtn.textContent = this.angleUnit.toUpperCase();
    if (this._el.angleBadge)   this._el.angleBadge.textContent = this.angleUnit.toUpperCase();
  }

  /* ── Clipboard ── */
  async _copy() {
    const val = this.displayResult.replace(/,/g, '');
    try {
      await navigator.clipboard.writeText(val);
      this._el.copyBtn?.classList.add('copied');
      if (this._el.copyIcon)  this._el.copyIcon.style.display  = 'none';
      if (this._el.checkIcon) this._el.checkIcon.style.display = '';
      this._showToast('Copied!');
      setTimeout(() => {
        this._el.copyBtn?.classList.remove('copied');
        if (this._el.copyIcon)  this._el.copyIcon.style.display  = '';
        if (this._el.checkIcon) this._el.checkIcon.style.display = 'none';
      }, 2200);
    } catch {
      this._showToast('Copy failed');
    }
  }

  /* ── History ── */
  _addHistory(expr, result) {
    this.history.unshift({
      id:         Date.now(),
      expression: expr,
      result,
      time:       new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    if (this.history.length > 25) this.history.pop();
    this._saveHistory();
    this._renderHistory();
  }

  _clearHistory() {
    this.history = [];
    this._saveHistory();
    this._renderHistory();
  }

  _loadHistory() {
    try {
      const saved = localStorage.getItem('calcpro-history');
      if (saved) this.history = JSON.parse(saved);
    } catch { /* ignore */ }
  }

  _saveHistory() {
    try { localStorage.setItem('calcpro-history', JSON.stringify(this.history)); } catch { /* ignore */ }
  }

  /* ── Error ── */
  _showError(msg) {
    this.displayResult = msg;
    this.rawResult     = '0';
    this.expression    = '';
    this.justCalc      = false;
    this._el.result?.classList.add('error');
    setTimeout(() => this._el.result?.classList.remove('error'), 500);
    this._render();
  }

  /* ── Visual feedback ── */
  _popResult() {
    const el = this._el.result;
    if (!el) return;
    el.classList.remove('popped');
    void el.offsetWidth; // reflow
    el.classList.add('popped');
  }

  _ripple(btn) {
    btn.classList.remove('rippling');
    void btn.offsetWidth;
    btn.classList.add('rippling');
    setTimeout(() => btn.classList.remove('rippling'), 400);
  }

  _showToast(msg) {
    const el = this._el.toast;
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ── Render ── */
  _render() {
    // Expression line
    if (this._el.expression) {
      this._el.expression.textContent = this.expression;
    }

    // Result
    if (this._el.result) {
      const show = this.loading ? '…' : this.displayResult;
      this._el.result.textContent = show;
    }

    // Memory badge
    if (this._el.memoryBadge) {
      if (this.memory !== null) {
        this._el.memoryBadge.textContent = `M: ${this._fmt(this.memory).display}`;
        this._el.memoryBadge.classList.add('visible');
      } else {
        this._el.memoryBadge.textContent = '';
        this._el.memoryBadge.classList.remove('visible');
      }
    }
  }

  _renderHistory() {
    const list = this._el.historyList;
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = `
        <div class="hist-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>No calculations yet</p>
        </div>`;
      return;
    }

    list.innerHTML = this.history.map(h => `
      <div class="hist-item" data-id="${h.id}">
        <div class="hist-expr">${this._escape(h.expression)}</div>
        <div class="hist-result">= ${this._escape(h.result)}</div>
        <div class="hist-time">${h.time}</div>
      </div>`).join('');

    list.querySelectorAll('.hist-item').forEach(item => {
      item.addEventListener('click', () => {
        const entry = this.history.find(h => h.id === parseInt(item.dataset.id));
        if (!entry) return;
        this.displayResult = entry.result;
        this.rawResult     = entry.result.replace(/,/g, '');
        this.expression    = '';
        this.justCalc      = true;
        this._render();
        this._showToast('Restored from history');
      });
    });
  }

  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  window._calc = new Calculator();
});
