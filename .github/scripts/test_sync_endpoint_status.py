import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class EndpointStatusTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.script = self.root / ".github/scripts/sync_endpoint_status.py"
        self.script.parent.mkdir(parents=True)
        shutil.copyfile(Path(__file__).with_name(self.script.name), self.script)
        self.page = self.root / "api-reference/usage/summary.mdx"
        self.page.parent.mkdir(parents=True)
        self.original = (
            "---\nopenapi: get /v2/usage/summary\ntitle: Get usage summary\n"
            "description: Your consumption\ncanonical: 'https://example.com/summary/'\n---\n\n"
            "    indented code example\n\nAuthored examples stay here.\n"
        )
        self.page.write_text(self.original)

    def schema(self, operation):
        (self.root / "api-reference/openapi.json").write_text(
            json.dumps({"paths": {"/v2/usage/summary": {"get": operation}}})
        )

    def run_sync(self, *args):
        return subprocess.run(
            [sys.executable, str(self.script), *args], capture_output=True, text=True
        )

    def assert_synced(self):
        result = self.run_sync()
        self.assertEqual(result.returncode, 0, result.stderr)
        generated = self.page.read_text()
        self.assertEqual(self.run_sync("--check").returncode, 0)
        self.assertEqual(self.run_sync().returncode, 0)
        self.assertEqual(self.page.read_text(), generated)
        return generated

    def test_lifecycle_changes_generate_and_remove_badges_and_warnings(self):
        self.schema({"x-beta": True})
        result = self.run_sync("--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("api-reference/usage/summary.mdx", result.stdout)
        self.assertEqual(self.page.read_text(), self.original)

        beta = self.assert_synced()
        self.assertIn("tag: 'Beta'", beta)
        self.assertIn('import UsageBeta from "/snippets/usage-v2-beta.mdx";', beta)
        self.assertEqual(beta.count("<UsageBeta />"), 1)
        self.assertIn("title: Get usage summary", beta)
        self.assertIn("description: Your consumption", beta)
        self.assertIn("Authored examples stay here.", beta)

        self.schema({"x-beta": True, "deprecated": True})
        deprecated = self.assert_synced()
        self.assertIn("tag: 'Deprecated'", deprecated)
        self.assertIn("<StatusPagesDeprecated />", deprecated)
        self.assertNotIn("UsageBeta", deprecated)
        self.assertNotIn("tag: 'Beta'", deprecated)

        self.schema({"x-beta": False, "deprecated": False})
        self.assertEqual(self.assert_synced(), self.original)

    def test_only_schema_booleans_enable_status(self):
        for operation in ({}, {"x-beta": "true"}, {"deprecated": "true"}):
            with self.subTest(operation=operation):
                self.schema(operation)
                self.assertEqual(self.assert_synced(), self.original)

        self.schema({"deprecated": True})
        self.assertIn("tag: 'Deprecated'", self.assert_synced())
        self.schema({})
        self.assertEqual(self.assert_synced(), self.original)


if __name__ == "__main__":
    unittest.main()
