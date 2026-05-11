import unittest

from app import create_app
from app.routes.main import _normalize, _safe_eval


class CalculatorEvaluationTest(unittest.TestCase):
    def test_basic_arithmetic(self):
        self.assertEqual(_safe_eval('2 + 3 * 4'), 14)

    def test_normalizes_ui_symbols(self):
        self.assertEqual(_normalize('2 \u00d7 3 \u00f7 2'), '2 * 3 / 2')

    def test_degree_mode_trigonometry(self):
        self.assertAlmostEqual(_safe_eval('sin(90)', angle_unit='deg'), 1.0)


class CalculatorApiTest(unittest.TestCase):
    def setUp(self):
        app = create_app()
        app.testing = True
        self.client = app.test_client()

    def test_calculate_endpoint_returns_result(self):
        response = self.client.post(
            '/api/calculate',
            json={'expression': 'sqrt(81)', 'angleUnit': 'rad'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {'result': 9, 'success': True})

    def test_calculate_endpoint_rejects_empty_expression(self):
        response = self.client.post(
            '/api/calculate',
            json={'expression': '', 'angleUnit': 'rad'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.get_json()['success'])


if __name__ == '__main__':
    unittest.main()
