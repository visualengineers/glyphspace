"""
Tests for the local CSV import: tools/process.py and tools/dataset_common.py.

Run from the repository root (-B and no cache provider leave no cache files behind):
    python -B -m pytest -p no:cacheprovider tools/tests/test_process_cli.py

Every test runs twice: with the installed pandas defaults and with pandas 3
behaviour switched on (Copy-on-Write and the `str` dtype for text columns).
"""
import importlib.util
import json
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace

import numpy as np
import pandas as pd
import pytest

TOOLS = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(TOOLS))
sys.dont_write_bytecode = True

import dataset_common as dc  # noqa: E402

pytestmark = pytest.mark.filterwarnings('error::FutureWarning')

# Text columns with at most this many values are one-hot encoded (the CLI uses 1).
ONE_HOT_THRESHOLD = 10


@pytest.fixture(autouse=True, params=['pandas-default', 'pandas-3-mode'])
def pandas_mode(request, tmp_path, monkeypatch):
    # The import writes its files relative to the working directory.
    monkeypatch.chdir(tmp_path)
    if request.param == 'pandas-default':
        yield
        return
    with pd.option_context('mode.copy_on_write', True, 'future.infer_string', True):
        yield


def with_id(columns: dict) -> pd.DataFrame:
    rows = len(next(iter(columns.values())))
    return pd.DataFrame({'ID': [str(i) for i in range(rows)], **columns})


def import_frame(frame: pd.DataFrame, threshold: int = ONE_HOT_THRESHOLD) -> dict:
    """Schema, feature rows and meta that dataset_common writes for `frame`."""
    columns = dc.plan_features(frame, threshold)
    dc.generate_schema(columns, 'out', glyph_limit=5)
    features_df = dc.generate_features(frame, columns, 'out')
    dc.generate_meta(features_df, columns, frame, 'out', histogram_bins=20)
    return {kind: json.loads(Path(f'out.{kind}.json').read_text(encoding='utf-8'))
            for kind in ('schema', 'feature', 'meta')}


def feature_column(result: dict, key: str) -> list[float]:
    return [row['features']['1'][key] for row in result['feature']]


def tooltip_column(result: dict, key: str) -> list[str]:
    return [row['values'][key] for row in result['feature']]


# --- Missing numbers and dates ------------------------------------------------------


def test_missing_numbers_do_not_squeeze_the_real_values():
    result = import_frame(with_id({'price': [100.0, np.nan, 150.0, 200.0]}))

    assert feature_column(result, '1') == [0.0, 0.0, 0.5, 1.0]
    assert tooltip_column(result, '1') == ['100.0', '', '150.0', '200.0']


def test_missing_dates_do_not_squeeze_the_real_dates():
    frame = with_id({'sold_date': ['2024-01-01', None, '2024-01-11', '2024-01-21']})  # 10 days apart

    result = import_frame(frame)

    assert feature_column(result, '1') == [0.0, 0.0, 0.5, 1.0]
    assert tooltip_column(result, '1') == ['2024-01-01', '', '2024-01-11', '2024-01-21']


def test_the_meta_statistics_use_the_placed_missing_values():
    result = import_frame(with_id({'price': [100.0, np.nan, 150.0, 200.0]}))

    meta = result['meta']['features']['1']
    assert (meta['min'], meta['max'], meta['median']) == (0.0, 1.0, 0.25)


def test_a_column_without_any_value_becomes_0_without_warnings(recwarn):
    result = import_frame(with_id({'empty': [np.nan] * 3, 'x': [1.0, 2.0, 3.0]}))

    assert feature_column(result, '1') == [0.0, 0.0, 0.0]
    assert [str(w.message) for w in recwarn] == []


def test_values_without_missing_ones_are_min_max_normalized_as_before():
    result = import_frame(with_id({'n': [2, 4, 6, 10], 'tag': ['b', 'a', 'c', 'a']}), threshold=1)

    assert feature_column(result, '1') == [0.0, 0.25, 0.5, 1.0]
    assert feature_column(result, '2') == [0.5, 0.0, 1.0, 0.0]  # label codes a=0, b=1, c=2


# --- One-hot columns ------------------------------------------------------------


def test_one_hot_tooltip_values_of_categories_with_underscores():
    frame = with_id({'shade': ['blue_ish', 'red', None, 'blue_ish'], 'my_col': ['a_b', 'c', 'a_b', 'c']})

    result = import_frame(frame)

    labels = result['schema']['label']
    assert list(labels.values()) == ['shade_0', 'shade_blue_ish', 'shade_red', 'my_col_a_b', 'my_col_c']
    assert [row['values'] for row in result['feature']] == [
        {'1': '0', '2': '1', '3': '0', '4': '1', '5': '0'},
        {'1': '0', '2': '0', '3': '1', '4': '0', '5': '1'},
        {'1': '', '2': '', '3': '', '4': '1', '5': '0'},  # shade missing: shown as missing
        {'1': '0', '2': '1', '3': '0', '4': '0', '5': '1'},
    ]
    assert feature_column(result, '2') == [1.0, 0.0, 0.0, 1.0]


def test_schema_labels_and_types_follow_the_one_hot_columns():
    rows = 25  # numeric columns with more than 20 distinct values are typed 'numeric'
    frame = with_id({
        'n': [float(i) for i in range(rows)],
        'c': ['green', 'red_x'] * 12 + ['green'],
        'z': [float(rows - 1 - i) for i in range(rows)],
        'sold_date': [f'2024-01-{d:02d}' for d in range(1, rows + 1)],
    })

    result = import_frame(frame)

    schema = result['schema']
    assert schema['label'] == {'1': 'n', '2': 'c_green', '3': 'c_red_x', '4': 'z', '5': 'sold_date'}
    # dates are typed from the imported text, before they become timestamps (as before)
    assert schema['types'] == {'1': 'numeric', '2': 'categorical', '3': 'categorical', '4': 'numeric',
                               '5': 'categorical'}
    assert schema['tooltip'] == ['1', '2', '3', '4', '5']
    assert schema['glyph'] == ['1', '2', '3', '4', '5']
    # every row and the meta have one entry per label, and label 4 really is z
    for row in result['feature']:
        assert list(row['features']['1']) == list(row['values']) == list(schema['label'])
    assert list(result['meta']['features']) == list(schema['label'])
    assert tooltip_column(result, '4')[:2] == ['24.0', '23.0']
    assert feature_column(result, '4')[:2] == [1.0, 23 / 24]


def test_one_hot_columns_have_no_meta_categories():
    frame = with_id({'c': ['x_1', 'y', 'y'], 'tag': ['p', 'q', 'r']})

    result = import_frame(frame, threshold=2)

    meta = result['meta']['features']
    assert [meta[key]['categories'] for key in ('1', '2', '3')] == [[], [], ['p', 'q', 'r']]


def test_label_encoded_categories_match_the_codes_when_values_are_missing():
    # Codes come from LabelEncoder on the filled text (missing -> MISSING_TEXT_CATEGORY),
    # so the category list must include that filler at its sorted position.
    frame = with_id({'tag': ['b', None, 'a', 'c', 'a']})

    result = import_frame(frame, threshold=1)

    assert result['meta']['features']['1']['categories'] == ['missing', 'a', 'b', 'c']


def test_label_encoded_categories_keep_a_real_zero_category():
    frame = with_id({'tag': ['b', '0', 'a', 'c']})

    result = import_frame(frame, threshold=1)

    assert result['meta']['features']['1']['categories'] == ['0', 'a', 'b', 'c']


def test_a_one_hot_column_named_like_another_column_is_rejected():
    frame = with_id({'c': ['x', 'x'], 'c_x': [1.0, 2.0]})  # c one-hot encoded as c_x

    with pytest.raises(ValueError, match='feature columns the name c_x;'):
        dc.plan_features(frame, cardinality_threshold=1)


def test_a_missing_original_value_is_empty_in_the_tooltip_values():
    frame = with_id({
        'n': [0.0, np.nan, 5.0],
        'created_date': ['2024-01-01', None, '2024-03-01'],
        'c': ['a', None, 'b'],  # one-hot encoded: c_0 (the fill for missing), c_a, c_b
    })

    result = import_frame(frame)

    assert [row['values'] for row in result['feature']] == [
        {'1': '0.0', '2': '2024-01-01', '3': '0', '4': '1', '5': '0'},
        {'1': '', '2': '', '3': '', '4': '', '5': ''},
        {'1': '5.0', '2': '2024-03-01', '3': '0', '4': '0', '5': '1'},
    ]


# --- The CLI --------------------------------------------------------------------


class FakeUMAP:
    """Stand-in for umap.UMAP: the first two feature columns."""

    def __init__(self, **_kwargs) -> None:
        pass

    def fit_transform(self, features) -> np.ndarray:
        return np.asarray(features)[:, :2]


@pytest.fixture
def process(monkeypatch) -> ModuleType:
    """tools/process.py with a stand-in for umap (slow to import, and on Windows its
    DLL fails to load once numpy and pandas are loaded, as they are here)."""
    monkeypatch.setitem(sys.modules, 'umap', SimpleNamespace(UMAP=FakeUMAP))
    spec = importlib.util.spec_from_file_location('process_cli', TOOLS / 'process.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    Path('src/assets/data').mkdir(parents=True)
    return module


def cli_csv() -> str:
    """40 rows (t-SNE needs more than 30): a constant text column, missing numbers and dates."""
    rows = ['ID,shade,kind,price,sold_date,amount']
    for i in range(40):
        price = '' if i % 9 == 4 else f'{100 + i * 2.5:.2f}'
        date = '' if i % 10 == 7 else f'2024-{1 + i % 12:02d}-{1 + i % 27:02d}'
        rows.append(f'r{i},blue_ish,{"abc"[i % 3]},{price},{date},{50 + (i * 7) % 30}')
    Path('edge.csv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    return 'edge.csv'


def written(kind: str) -> dict | list:
    [path] = Path('src/assets/data').glob(f'edge.*.{kind}.json')
    return json.loads(path.read_text(encoding='utf-8'))


def test_the_cli_imports_a_csv_with_a_one_hot_column(process):
    process.process_csv_file(cli_csv())

    schema, rows, meta = written('schema'), written('feature'), written('meta')
    assert schema['label'] == {'1': 'shade_blue_ish', '2': 'kind', '3': 'price', '4': 'sold_date', '5': 'amount'}
    assert list(meta['features']) == list(schema['label'])
    assert {row['values']['1'] for row in rows} == {'1'}
    assert rows[4]['values']['3'] == '' and rows[4]['features']['1']['3'] == 0.0
    assert min(row['features']['1']['4'] for row in rows if row['values']['4']) == 0.0
    for kind in ('pca', 'tsne', 'umap'):
        assert [p['id'] for p in written(f'position.{kind}')] == [f'r{i}' for i in range(40)]


def test_the_cli_lists_the_written_datasets(process):
    process.process_csv_file(cli_csv())

    process.discover_datasets()

    source = Path('src/default-dataset.ts').read_text(encoding='utf-8')
    collection = json.loads(source.split('DEFAULT_DATASETCOLLECTION: DatasetCollection = ', 1)[1])
    [dataset] = collection
    assert (dataset['dataset'], dataset['source']) == ('edge', 'local')
    assert set(dataset['items'][0]['algorithms']) == {'feature', 'meta', 'schema', 'position'}
    assert set(dataset['items'][0]['algorithms']['position']) == {'pca', 'tsne', 'umap'}
