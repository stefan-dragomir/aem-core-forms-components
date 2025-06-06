/*******************************************************************************
 * Copyright 2024 Adobe
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

export function loadXfa(formdom, renderContext) {
    if (window.xfalib) {
        formBridge.registerConfig("disabledServerScripts", ["initialize", "$formready", "$layoutready"])
        const xfaJson = JSON.parse(JSON.parse(JSON.stringify(formdom)));
        xfalib.runtime.renderContext = JSON.parse(JSON.parse(JSON.stringify(renderContext)));
        xfalib.script.XfaModelRegistry.prototype.createModel(xfaJson);
        //initialize Acrobat specific scripts
        new xfalib.acrobat.Acrobat();
        return function (model) {
            model._syncXfaProps();
            xfalib.runtime.xfa.form._initialize(true);
            $(window).trigger("XfaInitialized");
        }
    }
}
