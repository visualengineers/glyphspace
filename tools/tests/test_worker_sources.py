"""
Tests for the fixed Python sources the Pyodide worker runs, which live as text
in src/app/workers/pyodide-calls.ts (UNPACK_FLAT_SOURCE, REMOVE_UNPACKED_SOURCE).

The sources are read from the TypeScript file and run here with CPython, with
the worker's root folder ("/") replaced by a temporary folder.

Run from the repository root:
    python -B -m pytest -p no:cacheprovider tools/tests/test_worker_sources.py
"""
import io
import json
import re
import zipfile
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[2]
CALLS_FILE = REPO / 'src' / 'app' / 'workers' / 'pyodide-calls.ts'

LIMITS = {'max_entries': 100, 'max_file_bytes': 1000, 'max_total_bytes': 2500}


def worker_source(name: str, root: Path) -> dict:
    """The Python source `name` from pyodide-calls.ts, run with `root` as the file system root."""
    text = CALLS_FILE.read_text(encoding='utf-8')
    source = re.search(rf'const {name} = `(.*?)`;', text, re.S).group(1)
    source = source.replace('\\\\', '\\')  # the only escape the template literals use
    source = source.replace('base = "/" + ', f'base = {str(root)!r} + "/" + ')
    namespace: dict = {}
    exec(source, namespace)
    return namespace


@pytest.fixture
def unpack_flat(tmp_path):
    return worker_source('UNPACK_FLAT_SOURCE', tmp_path)['unpack_flat']


@pytest.fixture
def remove_unpacked(tmp_path):
    return worker_source('REMOVE_UNPACKED_SOURCE', tmp_path)['remove_unpacked']


def make_zip(path: Path, files: dict[str, bytes]) -> str:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w') as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    path.write_bytes(buffer.getvalue())
    return str(path)


def test_the_images_are_unpacked_flat_and_the_rest_is_skipped(tmp_path, unpack_flat):
    archive = make_zip(tmp_path / 'thumbnails-0.zip', {
        '1.png': b'one',
        'photos/2.JPG': b'two',
        'photos\\3.webp': b'three',  # made on Windows: \\ separates the folders
        '__MACOSX/photos/._2.JPG': b'fork',
        'photos/._4.png': b'fork',
        'notes.txt': b'text',
        'photos/': b'',
    })

    result = json.loads(unpack_flat(archive, *LIMITS.values()))

    assert result == {'images': ['1.png', '2.JPG', '3.webp'], 'duplicates': []}
    folder = tmp_path / 'thumbnails-0'
    assert sorted(p.name for p in folder.iterdir()) == ['.unpacked', '1.png', '2.JPG', '3.webp']
    assert (folder / '3.webp').read_bytes() == b'three'


def test_the_first_image_of_a_name_wins_and_the_others_are_reported(tmp_path, unpack_flat):
    archive = make_zip(tmp_path / 'thumbnails-0.zip', {'a/7.png': b'first', 'b/7.png': b'second'})

    result = json.loads(unpack_flat(archive, *LIMITS.values()))

    assert result == {'images': ['7.png'], 'duplicates': ['b/7.png']}
    assert (tmp_path / 'thumbnails-0' / '7.png').read_bytes() == b'first'


@pytest.mark.parametrize('files, message', [
    ({f'{i}.png': b'x' for i in range(101)}, 'holds 101 files; at most 100'),
    ({'big.png': b'x' * 1001}, 'big.png is larger than'),
    ({'1.png': b'x' * 900, '2.png': b'x' * 900, '3.png': b'x' * 900}, 'larger than 0 MB together'),
])
def test_an_archive_over_the_limits_is_rejected_before_anything_is_written(tmp_path, unpack_flat, files, message):
    folder = tmp_path / 'thumbnails-0'
    folder.mkdir()
    (folder / '.unpacked').touch()
    (folder / 'old.png').write_bytes(b'kept')
    archive = make_zip(tmp_path / 'thumbnails-0.zip', files)

    with pytest.raises(ValueError, match=message):
        unpack_flat(archive, *LIMITS.values())

    assert (folder / 'old.png').read_bytes() == b'kept'


def test_a_folder_not_made_by_an_unpack_is_never_replaced(tmp_path, unpack_flat):
    (tmp_path / 'lib').mkdir()
    archive = make_zip(tmp_path / 'lib.zip', {'1.png': b'one'})

    with pytest.raises(ValueError, match='Refusing to replace existing folder'):
        unpack_flat(archive, *LIMITS.values())


def test_remove_unpacked_deletes_only_unpacked_folders(tmp_path, unpack_flat, remove_unpacked):
    unpack_flat(make_zip(tmp_path / 'thumbnails-0.zip', {'1.png': b'one'}), *LIMITS.values())
    (tmp_path / 'home').mkdir()

    assert remove_unpacked('thumbnails-0') is True
    assert remove_unpacked('home') is False
    assert remove_unpacked('missing') is False
    assert not (tmp_path / 'thumbnails-0').exists() and (tmp_path / 'home').exists()
