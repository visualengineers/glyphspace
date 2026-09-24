"""
Tests for the wizard's Python pipeline: src/assets/preprocessing_processor_config.py
and the outlier detection it shares with preprocessing_processor.detect_outliers.
(The local CSV import, tools/process.py, is tested in test_process_cli.py.)

Run from the repository root (-B and no cache provider leave no cache files behind):
    python -B -m pytest -p no:cacheprovider tools/tests/test_preprocessing_config.py

Every test runs twice: with the installed pandas defaults and with pandas 3
behaviour switched on (Copy-on-Write and the `str` dtype for text columns).
The wizard's option values are read from the TypeScript enums, so a new option
without a Python branch fails here.
"""
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / 'src' / 'assets'))
# src/assets is copied into the app build as is: keep __pycache__ out of it.
sys.dont_write_bytecode = True

import preprocessing_processor as pp  # noqa: E402
import preprocessing_processor_config as ppc  # noqa: E402

pytestmark = pytest.mark.filterwarnings('error::FutureWarning')

ENUM_FILE = REPO / 'src' / 'app' / 'preprocessing-wizard' / 'models' / 'data-type.enum.ts'


def ts_enum(name: str) -> list[str]:
    """The string values of a TypeScript enum in data-type.enum.ts."""
    source = ENUM_FILE.read_text(encoding='utf-8')
    body = re.search(rf'export enum {name} \{{(.*?)\}}', source, re.S).group(1)
    return re.findall(r"=\s*'([^']*)'", body)


@pytest.fixture(autouse=True, params=['pandas-default', 'pandas-3-mode'])
def pandas_mode(request, tmp_path, monkeypatch):
    # The pipeline writes processed_features.csv into the working directory.
    monkeypatch.chdir(tmp_path)
    if request.param == 'pandas-default':
        yield
        return
    with pd.option_context('mode.copy_on_write', True, 'future.infer_string', True):
        yield


def column(name: str, **overrides) -> dict:
    """A column config as buildProcessingConfig sends it, with the wizard's defaults."""
    defaults = {
        'name': name, 'enabled': True, 'dataType': 'numeric', 'encoding': 'none', 'scaling': 'none',
        'includeInProjection': True, 'isColorFeature': False, 'missingValueStrategy': 'keep',
        'outlierMethod': 'iqr_1.5', 'outlierStrategy': 'keep',
    }
    return {**defaults, **overrides}


def write_csv(frame: pd.DataFrame, name: str = 'data.csv') -> str:
    frame.to_csv(name, index=False)
    return name


def run(csv: str, columns: list, cleaning: dict | None = None) -> dict:
    """The dataset process_with_config builds for `columns`."""
    config = {'columns': columns, 'cleaning': cleaning or {'removeDuplicates': False},
              'datasetName': 'test', 'timestamp': '1'}
    collection = json.loads(ppc.process_with_config(csv, json.dumps(config)))
    return collection['datasets'][collection['selectedDataset']]


def ids(dataset: dict) -> list[str]:
    return [row['id'] for row in dataset['features']]


def feature_key(dataset: dict, name: str) -> str:
    return next(key for key, label in dataset['schema']['label'].items() if label == name)


def cleaned_column(frame: pd.DataFrame, config_column: dict) -> list:
    """The column after apply_cleaning, with NaN as None."""
    cleaned = ppc.apply_cleaning(frame, {'columns': [config_column]})
    return [None if pd.isna(v) else v for v in cleaned[config_column['name']]]


def outlier_frame() -> pd.DataFrame:
    """200 rows around 50 with three planted outliers and two missing values."""
    rng = np.random.default_rng(7)
    x = rng.normal(50, 5, 200)
    x[[3, 50, 120]] = [150, -60, 400]
    x[[10, 20]] = np.nan
    return pd.DataFrame({'x': x, 'y': rng.normal(0, 1, 200)})


# --- Missing values ---------------------------------------------------------------

MISSING = pd.DataFrame({'a': [1.0, np.nan, 2.0, np.nan, 6.0]})
MISSING_EXPECTED = {
    'keep': [1.0, None, 2.0, None, 6.0],
    'remove_rows': [1.0, None, 2.0, None, 6.0],  # dropped by apply_cleaning's row drop, see below
    'fill_mean': [1.0, 3.0, 2.0, 3.0, 6.0],
    'fill_median': [1.0, 2.0, 2.0, 2.0, 6.0],
    'fill_mode': [1.0, 1.0, 2.0, 1.0, 6.0],
    'fill_value': [1.0, 7.0, 2.0, 7.0, 6.0],
}


@pytest.mark.parametrize('strategy', ts_enum('MissingValueStrategy'))
def test_every_wizard_missing_value_strategy_has_its_effect(strategy):
    config = column('a', missingValueStrategy=strategy, missingValueFillValue='7')
    cleaned = ppc.apply_cleaning(MISSING, {'columns': [config]})

    if strategy == 'remove_rows':
        assert cleaned.index.tolist() == [0, 2, 4]
        assert cleaned['a'].tolist() == [1.0, 2.0, 6.0]
    else:
        assert cleaned.index.tolist() == [0, 1, 2, 3, 4]
        assert [None if pd.isna(v) else v for v in cleaned['a']] == MISSING_EXPECTED[strategy]
    assert len(run(write_csv(MISSING), [config])['features']) == len(cleaned)


def test_remove_rows_drops_missing_rows_after_the_fills_of_other_columns():
    frame = pd.DataFrame({'a': [1.0, np.nan, 3.0, 8.0], 'b': [1.0, 2.0, np.nan, 4.0]})
    columns = [column('a', missingValueStrategy='fill_mean'), column('b', missingValueStrategy='remove_rows')]

    cleaned = ppc.apply_cleaning(frame, {'columns': columns})

    assert cleaned.index.tolist() == [0, 1, 3]
    assert cleaned['a'].tolist() == [1.0, 4.0, 8.0]  # mean of all original rows: (1 + 3 + 8) / 3


def test_remove_rows_ignores_disabled_columns():
    frame = pd.DataFrame({'a': [1.0, 2.0, 3.0], 'b': [1.0, np.nan, 3.0]})
    columns = [column('a'), column('b', enabled=False, missingValueStrategy='remove_rows')]

    assert len(ppc.apply_cleaning(frame, {'columns': columns})) == 3


def test_legacy_drop_strategy_only_drops_with_remove_missing():
    frame = pd.DataFrame({'a': [1.0, np.nan, 3.0]})
    columns = [column('a', missingValueStrategy='drop')]

    assert len(ppc.apply_cleaning(frame, {'columns': columns})) == 3
    assert len(ppc.apply_cleaning(frame, {'columns': columns, 'cleaning': {'removeMissing': True}})) == 2


def test_string_fill_value_keeps_a_numeric_column_numeric():
    frame = pd.DataFrame({'score': [1.5, np.nan, 3.0], 'other': [1.0, 2.0, 3.0]})
    config = column('score', missingValueStrategy='fill_value', missingValueFillValue=' 5 ')

    assert cleaned_column(frame, config) == [1.5, 5.0, 3.0]
    dataset = run(write_csv(frame), [config, column('other')])
    assert list(dataset['schema']['label'].values()) == ['score', 'other']  # not one-hot encoded


@pytest.mark.parametrize('fill_value', ['abc', '', 'nan', 'inf'])
def test_non_numeric_fill_value_on_a_numeric_column_is_rejected(fill_value):
    frame = pd.DataFrame({'score': [1.5, np.nan, 3.0]})
    config = column('score', missingValueStrategy='fill_value', missingValueFillValue=fill_value)

    with pytest.raises(Exception, match="Column 'score': the fill value .* is not a number"):
        run(write_csv(frame), [config])


def test_fill_value_on_a_boolean_column_with_missing_values():
    csv = 'data.csv'
    Path(csv).write_text('flag,x\nTrue,1\n,2\nFalse,3\n', encoding='utf-8')
    config = column('flag', dataType='boolean', missingValueStrategy='fill_value', missingValueFillValue='TRUE')

    dataset = run(csv, [config, column('x')])

    key = feature_key(dataset, 'flag')
    assert [row['features']['1'][key] for row in dataset['features']] == [1.0, 1.0, 0.0]
    with pytest.raises(Exception, match='is not true or false'):
        run(csv, [dict(config, missingValueFillValue='maybe'), column('x')])


def test_fill_mode_on_a_boolean_column_with_missing_values():
    # Filling the object column of booleans directly warned about downcasting
    # (FutureWarning, an error in this module).
    csv = 'data.csv'
    Path(csv).write_text('flag,x\nTrue,1\n,2\nTrue,3\nFalse,4\n', encoding='utf-8')
    config = column('flag', dataType='boolean', missingValueStrategy='fill_mode')

    dataset = run(csv, [config, column('x')])

    key = feature_key(dataset, 'flag')
    assert [row['features']['1'][key] for row in dataset['features']] == [1.0, 1.0, 1.0, 0.0]


# --- Outliers --------------------------------------------------------------------


@pytest.mark.parametrize('method', ts_enum('OutlierMethod'))
def test_outlier_remove_drops_exactly_the_rows_step3_counts(method):
    csv = write_csv(outlier_frame())
    detected = json.loads(pp.detect_outliers(csv, 'x', method))
    assert detected['outlierCount'] > 0

    dataset = run(csv, [column('x', outlierMethod=method, outlierStrategy='remove'), column('y')])

    assert ids(dataset) == [str(i) for i in range(200) if i not in detected['outlierIndices']]


@pytest.mark.parametrize('method', ts_enum('OutlierMethod'))
def test_outlier_cap_clips_exactly_the_values_step3_counts(method):
    csv = write_csv(outlier_frame())
    raw = pd.read_csv(csv)
    detected = json.loads(pp.detect_outliers(csv, 'x', method))
    bounds = pp.find_outliers(raw['x'], method)
    config = column('x', outlierMethod=method, outlierStrategy='cap')

    cleaned = ppc.apply_cleaning(raw, {'columns': [config]})['x']

    changed = cleaned.ne(raw['x']) & raw['x'].notna()
    assert changed[changed].index.tolist() == detected['outlierIndices']
    assert set(cleaned[changed].round(9)) <= {round(bounds.lower, 9), round(bounds.upper, 9)}
    assert bounds.lower <= cleaned.min() and cleaned.max() <= bounds.upper
    assert cleaned.isna().sum() == 2


def test_outliers_are_detected_on_the_original_values_not_on_filled_ones():
    raw = outlier_frame()
    fill = column('x', missingValueStrategy='fill_value', missingValueFillValue='1000')

    capped = cleaned_column(raw, dict(fill, outlierStrategy='cap'))
    kept = ppc.apply_cleaning(raw, {'columns': [dict(fill, outlierStrategy='remove')]})

    assert capped[10] == 1000.0 and capped[20] == 1000.0
    assert {10, 20} <= set(kept.index)


@pytest.mark.parametrize('strategy', ts_enum('OutlierStrategy'))
def test_every_wizard_outlier_strategy_runs(strategy):
    csv = write_csv(outlier_frame())
    outliers = json.loads(pp.detect_outliers(csv, 'x', 'iqr_1.5'))['outlierCount']
    expected_rows = 200 - outliers if strategy == 'remove' else 200

    dataset = run(csv, [column('x', outlierStrategy=strategy), column('y')])

    assert len(dataset['features']) == expected_rows


@pytest.mark.parametrize('method', ts_enum('OutlierMethod'))
def test_boolean_columns_have_no_outliers(method):
    csv = 'data.csv'
    rows = ['True'] * 95 + ['False'] * 4 + ['']
    Path(csv).write_text('flag,strict\n' + '\n'.join(f'{r},{r or "True"}' for r in rows), encoding='utf-8')

    for name in ('flag', 'strict'):  # with missing values (object column) and a bool column
        assert json.loads(pp.detect_outliers(csv, name, method))['outlierCount'] == 0
    dataset = run(csv, [column(name, dataType='boolean', outlierMethod=method, outlierStrategy='remove')
                        for name in ('flag', 'strict')])
    assert len(dataset['features']) == 100


def test_detect_outliers_on_a_text_column_reports_none():
    csv = write_csv(pd.DataFrame({'t': ['a', 'b', 'c']}))

    assert json.loads(pp.detect_outliers(csv, 't', 'iqr_1.5')) == {'outlierIndices': [], 'outlierCount': 0}


# --- Encoding and scaling ----------------------------------------------------------


def encoded(values: list, encoding: str, scaling: str = 'none', **overrides) -> list[float]:
    frame = pd.DataFrame({'ID': [str(i) for i in range(len(values))], 'v': values})
    config = {'columns': [column('v', encoding=encoding, scaling=scaling, **overrides)]}
    processed, *_ = ppc.apply_feature_engineering(frame, config)
    return processed['v'].round(12).tolist()


def assert_all_finite(value, path: str = '$') -> None:
    """No NaN or infinity anywhere in a JSON value (json.loads accepts them, JS does not)."""
    if isinstance(value, dict):
        for key, item in value.items():
            assert_all_finite(item, f'{path}.{key}')
    elif isinstance(value, list):
        for i, item in enumerate(value):
            assert_all_finite(item, f'{path}[{i}]')
    elif isinstance(value, float):
        assert math.isfinite(value), path


def test_normalize_encoding_maps_the_range_to_0_1_and_missing_values_to_0():
    assert encoded([2.0, 4.0, 6.0, np.nan], 'normalize') == [0.0, 0.5, 1.0, 0.0]


def test_standardize_encoding_uses_the_sample_standard_deviation():
    # mean 4, sample sd 2 (population sd would give +-1.2247)
    assert encoded([2.0, 4.0, 6.0, np.nan], 'standardize') == [-1.0, 0.0, 1.0, 0.0]


@pytest.mark.parametrize('encoding', ['normalize', 'standardize'])
@pytest.mark.parametrize('values', [[5.0, 5.0, 5.0], [5.0, np.nan, np.nan], [np.nan, np.nan, np.nan]])
def test_rescaling_a_constant_column_gives_0(encoding, values):
    assert encoded(values, encoding) == [0.0, 0.0, 0.0]


# Kept missing values ('keep') are ignored by the scaling and become 0 afterwards.
SPREAD = [250.0, 275.0, 300.0]
SPREAD_SCALED = {
    'none': SPREAD,
    'minmax': [0.0, 0.5, 1.0],
    'normalize': [0.0, 0.5, 1.0],
    'standard': [-1.224744871392, 0.0, 1.224744871392],  # population sd, like StandardScaler
    'robust': [-1.0, 0.0, 1.0],
}


@pytest.mark.parametrize('scaling', SPREAD_SCALED)
def test_kept_missing_numbers_do_not_distort_the_scaling(scaling):
    scaled = encoded([SPREAD[0], np.nan, SPREAD[1], SPREAD[2], np.nan], 'none', scaling)

    assert [scaled[0], scaled[2], scaled[3]] == SPREAD_SCALED[scaling]
    assert scaled[1] == scaled[4] == 0.0


@pytest.mark.parametrize('scaling', ['minmax', 'standard', 'robust'])
def test_kept_missing_numbers_stay_out_of_the_scaling_after_a_rescaling_encoding(scaling):
    # normalize: 0, 0.5, 1 (missing stays missing), then scaled without the missing value
    scaled = encoded([SPREAD[0], np.nan, SPREAD[1], SPREAD[2]], 'normalize', scaling)

    assert [scaled[0], scaled[2], scaled[3]] == encoded([0.0, 0.5, 1.0], 'none', scaling)
    assert scaled[1] == 0.0


@pytest.mark.parametrize('scaling', ['none', 'minmax', 'standard', 'robust', 'normalize'])
def test_a_column_without_any_value_becomes_0_without_warnings(scaling, recwarn):
    assert encoded([np.nan, np.nan, np.nan], 'none', scaling) == [0.0, 0.0, 0.0]
    assert encoded([None, None, None], 'none', scaling, dataType='date') == [0.0, 0.0, 0.0]
    assert [str(w.message) for w in recwarn] == []


DATES = ['2024-01-01', None, '2024-01-11', '2024-01-21']  # 10 days apart


@pytest.mark.parametrize('scaling', ['minmax', 'standard', 'robust'])
def test_missing_dates_do_not_squeeze_the_real_dates(scaling):
    scaled = encoded(DATES, 'none', scaling, dataType='date')

    assert [scaled[0], scaled[2], scaled[3]] == SPREAD_SCALED[scaling]
    assert scaled[1] == 0.0


def test_the_meta_of_a_date_column_ignores_missing_dates():
    frame = pd.DataFrame({'d': DATES, 'x': [1.0, 2.0, 3.0, 4.0]})

    dataset = run(write_csv(frame), [column('d', dataType='date', scaling='minmax'), column('x')])

    meta = dataset['meta']['features'][feature_key(dataset, 'd')]
    assert meta['originalMin'] == pd.Timestamp('2024-01-01').timestamp()
    assert meta['originalMax'] == pd.Timestamp('2024-01-21').timestamp()
    # the three real dates at 0, 0.5 and 1: one value (density 1 / (3 * 0.05)) in bins 0, 10 and 19
    density = 1 / (3 * 0.05)
    assert meta['histogram'] == pytest.approx({str(j): density if j in (0, 10, 19) else 0.0 for j in range(20)})
    assert (meta['min'], meta['max']) == (0.0, 1.0)


def test_numeric_histograms_leave_kept_missing_values_out():
    frame = pd.DataFrame({'n': [250.0, np.nan, np.nan, 300.0]})

    dataset = run(write_csv(frame), [column('n', scaling='minmax')])

    histogram = dataset['meta']['features'][feature_key(dataset, 'n')]['histogram']
    assert histogram == pytest.approx({str(j): 10.0 if j in (0, 19) else 0.0 for j in range(20)})


@pytest.mark.parametrize('scaling', ['none', 'minmax', 'standard', 'robust'])
def test_no_missing_value_reaches_the_features_or_the_meta(scaling):
    frame = pd.DataFrame({
        'n': [250.0, np.nan, 275.0, 300.0],
        'empty': [np.nan] * 4,
        'd': DATES,
        'flag': [True, None, False, True],
        'c': ['a', None, 'b', 'a'],
    })
    columns = [column('n', scaling=scaling), column('empty', scaling=scaling),
               column('d', dataType='date', scaling=scaling), column('flag', dataType='boolean'),
               column('c', dataType='categorical', encoding='label')]

    dataset = run(write_csv(frame), columns)

    assert_all_finite(dataset)
    assert not pd.read_csv('processed_features.csv').isna().any().any()


@pytest.mark.parametrize('encoding', ts_enum('EncodingMethod'))
@pytest.mark.parametrize('scaling', ts_enum('ScalingMethod'))
def test_every_wizard_encoding_and_scaling_runs(encoding, scaling):
    frame = pd.DataFrame({'n': [1.0, 2.0, 30.0, np.nan], 'c': ['a', 'b', 'a', None]})
    columns = [column('n', encoding=encoding, scaling=scaling),
               column('c', dataType='categorical', encoding=encoding, scaling=scaling)]

    dataset = run(write_csv(frame), columns)

    assert len(dataset['features']) == 4


def test_label_encoding_with_standard_scaling_keeps_the_category_histogram():
    frame = pd.DataFrame({'c': ['a', 'b', 'b', 'c', 'c', 'c'], 'n': [1, 2, 3, 4, 5, 6]})
    columns = [column('c', dataType='categorical', encoding='label', scaling='standard'), column('n')]

    dataset = run(write_csv(frame), columns)

    meta = dataset['meta']['features'][feature_key(dataset, 'c')]
    assert meta['categories'] == ['a', 'b', 'c']
    assert meta['histogram'] == pytest.approx({'0': 1 / 6, '1': 2 / 6, '2': 3 / 6})
    assert meta['min'] < 0  # the feature itself is scaled


# --- Booleans ------------------------------------------------------------------


@pytest.mark.parametrize('flags, histogram', [
    (['True', 'False', 'False'], {'0': 2 / 3, '1': 1 / 3}),
    (['False', 'True'], {'0': 0.5, '1': 0.5}),
    (['True', 'True'], {'0': 0.0, '1': 1.0}),
    (['False', 'False'], {'0': 1.0, '1': 0.0}),
    (['True', '', 'False', 'True'], {'0': 1 / 3, '1': 2 / 3}),  # missing values are not counted
])
def test_boolean_categories_are_indexed_by_their_codes(flags, histogram):
    csv = 'data.csv'
    Path(csv).write_text('flag,x\n' + '\n'.join(f'{flag},{i}' for i, flag in enumerate(flags)), encoding='utf-8')

    dataset = run(csv, [column('flag', dataType='boolean'), column('x')])

    meta = dataset['meta']['features'][feature_key(dataset, 'flag')]
    assert meta['categories'] == ['False', 'True']  # code 0.0 = False, 1.0 = True
    assert meta['histogram'] == pytest.approx(histogram)


def test_a_0_1_boolean_column_keeps_its_own_labels():
    frame = pd.DataFrame({'flag': [1, 0, 0], 'x': [1.0, 2.0, 3.0]})

    dataset = run(write_csv(frame), [column('flag', dataType='boolean'), column('x')])

    assert dataset['meta']['features'][feature_key(dataset, 'flag')]['categories'] == ['0', '1']


def test_a_kept_missing_boolean_is_placed_at_0_and_shown_as_missing():
    csv = 'data.csv'
    Path(csv).write_text('flag,x\nTrue,1\n,2\nFalse,3\n', encoding='utf-8')

    dataset = run(csv, [column('flag', dataType='boolean'), column('x')])

    key = feature_key(dataset, 'flag')
    assert [row['features']['1'][key] for row in dataset['features']] == [1.0, 0.0, 0.0]
    assert [row['values'][key] for row in dataset['features']] == ['True', '', 'False']


# --- Tooltip values: a missing original value is "" -------------------------------

TOOLTIP_CSV = 'n,d,c,flag\n0,2024-01-01,a,True\n,,,\n5,2024-03-01,b,False\n'
FILLS = {'n': 'fill_mean', 'd': 'fill_mode', 'c': 'fill_mode'}


@pytest.mark.parametrize('fill', [False, True])
def test_a_missing_original_value_is_empty_in_the_tooltip_values(fill):
    csv = 'data.csv'
    Path(csv).write_text(TOOLTIP_CSV, encoding='utf-8')
    strategy = {name: FILLS[name] if fill else 'keep' for name in FILLS}
    flag = {'missingValueStrategy': 'fill_value', 'missingValueFillValue': 'true'} if fill else {}
    columns = [column('n', missingValueStrategy=strategy['n']),
               column('d', dataType='date', scaling='minmax', missingValueStrategy=strategy['d']),
               column('c', dataType='categorical', encoding='onehot', missingValueStrategy=strategy['c']),
               column('flag', dataType='boolean', **flag)]

    dataset = run(csv, columns)

    # the tooltip shows the original values: a filled value is still reported missing
    first, missing, _ = [row['values'] for row in dataset['features']]
    assert set(missing.values()) == {''}
    assert first[feature_key(dataset, 'n')] == '0.0'  # a real 0 is not missing
    assert first[feature_key(dataset, 'd')] == '2024-01-01'
    assert first[feature_key(dataset, 'flag')] == 'True'


# --- Rows: alignment, duplicates, nothing left --------------------------------------


def test_tooltip_values_stay_aligned_with_their_rows_after_drops():
    frame = outlier_frame()
    frame['m'] = [np.nan if i % 7 == 0 else i for i in range(200)]
    frame['tag'] = [f'row{i}' for i in range(200)]
    columns = [column('x', outlierStrategy='remove'), column('y'), column('m', missingValueStrategy='remove_rows'),
               column('tag', dataType='categorical', encoding='label')]

    dataset = run(write_csv(frame), columns)

    tag, m = feature_key(dataset, 'tag'), feature_key(dataset, 'm')
    assert 150 < len(dataset['features']) < 200
    for row in dataset['features']:
        assert row['values'][tag] == f'row{row["id"]}'
        assert float(row['values'][m]) == float(row['id'])


def test_remove_duplicates_drops_the_rows_step3_counts():
    frame = pd.DataFrame({'a': [1, 1, 2, 3, 3, 3], 'b': ['x', 'x', 'y', 'z', 'z', 'w']})
    csv = write_csv(frame)
    detected = json.loads(pp.detect_duplicates(csv))
    columns = [column('a'), column('b', dataType='categorical', encoding='label')]

    dataset = run(csv, columns, {'removeDuplicates': True})

    assert detected['duplicateCount'] == 2
    assert ids(dataset) == ['0', '2', '3', '5']
    assert len(run(csv, columns, {'removeDuplicates': False})['features']) == 6


def test_a_clear_error_when_every_row_is_removed():
    frame = pd.DataFrame({'a': [np.nan, np.nan], 'b': [1.0, 2.0]})

    with pytest.raises(Exception, match='No rows are left after cleaning'):
        run(write_csv(frame), [column('a', missingValueStrategy='remove_rows'), column('b')])
