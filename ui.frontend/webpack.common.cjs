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

module.exports = (env = {}) => ({
    entry: './src/index.js',
    output: {
        filename: env.xfa ? '[name]-xfa.js' : '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: !env.xfa,
        library: {
            name: 'FormView',
            type: 'window'
        },
    },
    resolve: env.xfa ? {
        alias: {
            '@aemforms/af-core': '@aemforms/af-core-xfa'
        }
    } : {}
});