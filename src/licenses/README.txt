Third-party software notices for GlyphSpace
===========================================

GlyphSpace itself is licensed under the MIT License (see LICENSE in the source
repository: https://github.com/visualengineers/glyphspace).

DruidJS
-------

This site bundles DruidJS 0.9.0 (@saehrimnir/druidjs), which is licensed under
the GNU Lesser General Public License, version 3 or later. Its licence and the
GNU GPL it refers to are included here:

  LGPL-3.0.txt   GNU Lesser General Public License, version 3
  GPL-3.0.txt    GNU General Public License, version 3

The source code of the version used is available at
https://github.com/saehm/DruidJS/tree/v0.9.0 and from npm
(https://www.npmjs.com/package/@saehrimnir/druidjs/v/0.9.0). To run GlyphSpace
with a modified version of DruidJS, build GlyphSpace from its source repository
after installing your version of the library (npm install, npm run build).

Pyodide and the Python packages
-------------------------------

The import wizard runs Python in the browser with Pyodide 314.0.7
(https://github.com/pyodide/pyodide), served unmodified from ../pyodide/.

  MPL-2.0.txt       Mozilla Public License 2.0, the licence of Pyodide
  Python-3.14.txt   the licence of CPython 3.14, which Pyodide includes

The Python packages it loads (pandas, NumPy, SciPy, scikit-learn and their
dependencies) are unmodified wheels from the Pyodide distribution. Their
licences, as shipped in the wheels, are in ../pyodide/THIRD-PARTY-LICENSES.txt.

Other packages
--------------

The licences of all other bundled third-party packages are listed in
../3rdpartylicenses.txt.

Data
----

The bundled "wineqr" dataset and the wizard's sample file
(assets/samples/wine-quality-red.csv) are based on "Wine Quality" by P. Cortez,
A. Cerdeira, F. Almeida, T. Matos and J. Reis, UCI Machine Learning Repository,
https://doi.org/10.24432/C56S3T, licensed under CC BY 4.0
(https://creativecommons.org/licenses/by/4.0/). Modified: GlyphSpace uses the
red wines, adds an ID to each, and derives normalised features and projections.
