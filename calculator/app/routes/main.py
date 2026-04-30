from flask import Blueprint, render_template, request, jsonify
import ast
import operator
import math

main = Blueprint('main', __name__)


# ── Safe expression evaluator ──────────────────────────────────

def _safe_eval(expression: str, angle_unit: str = 'rad'):
    """Evaluate a mathematical expression safely using Python AST."""

    if angle_unit == 'deg':
        trig = {
            'sin':  lambda x: math.sin(math.radians(x)),
            'cos':  lambda x: math.cos(math.radians(x)),
            'tan':  lambda x: math.tan(math.radians(x)),
            'asin': lambda x: math.degrees(math.asin(x)),
            'acos': lambda x: math.degrees(math.acos(x)),
            'atan': lambda x: math.degrees(math.atan(x)),
        }
    else:
        trig = {
            'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
            'asin': math.asin, 'acos': math.acos, 'atan': math.atan,
        }

    safe_funcs = {
        **trig,
        'sqrt':      math.sqrt,
        'log':       math.log10,
        'ln':        math.log,
        'abs':       abs,
        'factorial': math.factorial,
        'ceil':      math.ceil,
        'floor':     math.floor,
    }

    safe_consts = {'pi': math.pi, 'e': math.e}

    OPS = {
        ast.Add:      operator.add,
        ast.Sub:      operator.sub,
        ast.Mult:     operator.mul,
        ast.Div:      operator.truediv,
        ast.Pow:      operator.pow,
        ast.Mod:      operator.mod,
        ast.FloorDiv: operator.floordiv,
        ast.USub:     operator.neg,
        ast.UAdd:     operator.pos,
    }

    class _Eval(ast.NodeVisitor):
        def visit_BinOp(self, node):
            l, r = self.visit(node.left), self.visit(node.right)
            op   = OPS.get(type(node.op))
            if op is None:
                raise ValueError('Unsupported operator')
            return op(l, r)

        def visit_UnaryOp(self, node):
            op = OPS.get(type(node.op))
            if op is None:
                raise ValueError('Unsupported unary operator')
            return op(self.visit(node.operand))

        def visit_Constant(self, node):
            if isinstance(node.value, (int, float)):
                return node.value
            raise ValueError('Unsupported literal type')

        def visit_Call(self, node):
            if not isinstance(node.func, ast.Name):
                raise ValueError('Invalid function call')
            name = node.func.id
            if name not in safe_funcs:
                raise ValueError(f'Unknown function: {name}')
            return safe_funcs[name](*[self.visit(a) for a in node.args])

        def visit_Name(self, node):
            if node.id in safe_consts:
                return safe_consts[node.id]
            raise ValueError(f'Unknown name: {node.id}')

        def generic_visit(self, node):
            raise ValueError(f'Unsupported node: {type(node).__name__}')

    try:
        return _Eval().visit(ast.parse(expression, mode='eval').body)
    except ZeroDivisionError:
        raise ValueError('Division by zero')
    except OverflowError:
        raise ValueError('Result too large')


def _normalize(expr: str) -> str:
    return (expr
            .replace('÷', '/')
            .replace('×', '*')
            .replace('−', '-')
            .replace('π', 'pi')
            .replace('√(', 'sqrt(')
            .replace('^', '**'))


# ── Routes ────────────────────────────────────────────────────

@main.route('/')
def index():
    return render_template('index.html')


@main.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No JSON payload', 'success': False}), 400

    raw        = data.get('expression', '').strip()
    angle_unit = data.get('angleUnit', 'rad')

    if not raw:
        return jsonify({'error': 'Empty expression', 'success': False}), 400

    expression = _normalize(raw)

    try:
        result = _safe_eval(expression, angle_unit)

        if isinstance(result, float):
            if result.is_integer() and abs(result) < 1e15:
                result = int(result)
            else:
                result = float(f'{result:.10g}')

        return jsonify({'result': result, 'success': True})

    except ValueError as exc:
        return jsonify({'error': str(exc), 'success': False}), 400
    except Exception:
        return jsonify({'error': 'Calculation error', 'success': False}), 400
