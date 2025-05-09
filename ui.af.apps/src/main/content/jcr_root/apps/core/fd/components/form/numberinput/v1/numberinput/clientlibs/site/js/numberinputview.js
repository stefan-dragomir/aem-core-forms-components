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
(function() {

    "use strict";
    class NumberInput extends FormView.FormFieldBase {

        static NS = FormView.Constants.NS;
        static IS = "adaptiveFormNumberInput";
        static bemBlock = 'cmp-adaptiveform-numberinput';
        static selectors  = {
            self: "[data-" + this.NS + '-is="' + this.IS + '"]',
            widget: `.${NumberInput.bemBlock}__widget`,
            label: `.${NumberInput.bemBlock}__label`,
            description: `.${NumberInput.bemBlock}__longdescription`,
            errorDiv: `.${NumberInput.bemBlock}__errormessage`,
            qm: `.${NumberInput.bemBlock}__questionmark`,
            tooltipDiv: `.${NumberInput.bemBlock}__shortdescription`
        };

        constructor(params) {
            super(params);
        }

        getClass() {
            return NumberInput.IS;
        }

        getWidget() {
            return this.element.querySelector(NumberInput.selectors.widget);
        }

        getDescription() {
            return this.element.querySelector(NumberInput.selectors.description);
        }

        getLabel() {
            return this.element.querySelector(NumberInput.selectors.label);
        }

        getErrorDiv() {
            return this.element.querySelector(NumberInput.selectors.errorDiv);
        }

        getTooltipDiv() {
            return this.element.querySelector(NumberInput.selectors.tooltipDiv);
        }

        getQuestionMarkDiv() {
            return this.element.querySelector(NumberInput.selectors.qm);
        }

        initializeWidget() {
            this.widgetObject = new NumericInputWidget(this.getWidget(), this._model);
            this.getWidget().addEventListener('blur', (e) => {
                if(this.element) {
                    this.setInactive();
                }
            });
        }

        updateValue(value) {
            if (this.widgetObject == null && (this._model._jsonModel.editFormat || this._model._jsonModel.displayFormat || FormView.Utils.isUserAgent('safari'))) {
                this.initializeWidget();
            }
            if (this.widgetObject) {
                this.widgetObject.setValue(value);
                super.updateEmptyStatus();
            } else {
                super.updateValue(value);
            }
        }

        setModel(model) {
            super.setModel(model);
            // only initialize if patterns are set
            if (this._model._jsonModel.editFormat || this._model._jsonModel.displayFormat || this._model._jsonModel.displayValueExpression
                || this._model._jsonModel.type === 'integer' || FormView.Utils.isUserAgent('safari')) {
                if (this.widgetObject == null) {
                    this.initializeWidget();
                }
            } else {
                if (this.widget.value !== '') {
                    this.setModelValue(this.widget.value);
                }
                this.getWidget().addEventListener('blur', (e) => {
                    this.setModelValue(e.target.value);
                    if(this.element) {
                        this.setInactive();
                        this.triggerExit();
                    }
                });
            }
            this.getWidget().addEventListener('focus', (e) => {
                if (this.element) {
                    this.setActive();
                    this.triggerEnter();
                }
            });
        }
    }

    FormView.Utils.setupField(({element, formContainer}) => {
        return new NumberInput({element,formContainer})
    }, NumberInput.selectors.self);
})();
