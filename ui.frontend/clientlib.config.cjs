/*******************************************************************************
 * Copyright 2022 Adobe
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

const path = require('path');

const CLIENTLIB_DIR = path.join(
    __dirname,
    '..',
    'ui.af.apps',
    'src',
    'main',
    'content',
    'jcr_root',
    'apps',
    'core',
    'fd',
    'af-clientlibs'
);

const libsBaseConfig = {
    allowProxy: true,
    serializationFormat: 'xml',
    cssProcessor: ['default:none', 'min:none'],
    jsProcessor: ['default:none', 'min:none']
};

const xfaDependencies = [
    'xfaforms.3rdparty',
    'xfaforms.I18N.en',
    'xfaforms.formbridge',
    'xfaforms.xfalibutil',
    'xfaforms.xfalibwidgets',
    'xfaforms.formcalc',
    'xfaforms.xfalibModel'
];

// Config for `aem-clientlib-generator`
module.exports = {
    context: __dirname,
    clientLibRoot: CLIENTLIB_DIR,
    libs: [
        {
            ...libsBaseConfig,
            name: 'core-forms-components-runtime-base',
            categories: ['core.forms.components.runtime.base'],
            dependencies: ['granite.csrf.standalone.fetchsupport', 'af.rum', 'dompurify'],
            assets: {
                js: ['dist/main.js']
            }
        }
    ],
    xfaDependencies
};
