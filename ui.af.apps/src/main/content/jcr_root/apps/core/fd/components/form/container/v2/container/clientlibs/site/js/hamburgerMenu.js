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

if (typeof window.HamburgerMenu === 'undefined') {
    window.HamburgerMenu = class HamburgerMenu {
        static activeItemId = '';

        static bemBlock = 'cmp-adaptiveform-container__hamburger-menu';
        static nestingSupport = 10;
    
        static selectors  = {
            active: `.${HamburgerMenu.bemBlock}-item--active`,
            hamburgerMenuMainContainer: `.${HamburgerMenu.bemBlock}-container`,
            hamburgerMenuTopContainer: {
                self: `.${HamburgerMenu.bemBlock}-top`,
                hamburgerMenuIconContainer: `.${HamburgerMenu.bemBlock}-icon-container`,
                hamburgerMenuIcon: `.${HamburgerMenu.bemBlock}-icon`,
            },
            hamburgerMenuWidget: {
                hamburgerMenu: `.${HamburgerMenu.bemBlock}-dropdown`,
                hamburgerSubMenu: `.${HamburgerMenu.bemBlock}-submenu`,
                hamburgerMenuNavLink: `.${HamburgerMenu.bemBlock}-link`,
                hamburgerMenuCloseNavButton: `.${HamburgerMenu.bemBlock}-button--close`,
                hamburgerMenuOpenNavButton: `.${HamburgerMenu.bemBlock}-button--open`,
            },
            hamburgerMenuMiddleContainer: `.${HamburgerMenu.bemBlock}-middle`,
            hamburgerMenuBottomContainer: {
                self: `.${HamburgerMenu.bemBlock}-bottom`,
                hamburgerMenuActiveItemTitle: `.${HamburgerMenu.bemBlock}-active-item-title`,
                hamburgerMenuNextNavButton: `.${HamburgerMenu.bemBlock}-button--next`,
                hamburgerMenuPreviousNavButton: `.${HamburgerMenu.bemBlock}-button--prev`,
                hamburgerMenuNavButtonsContainer: `.${HamburgerMenu.bemBlock}-navigation-container`,
            },
        };
    
        static cssClasses = {
            active: `${HamburgerMenu.bemBlock}-item--active`,
            activeParent: `${HamburgerMenu.bemBlock}-item--activeparent`,
            hamburgerMenuWidget: {
                hamburgerMenu: `${HamburgerMenu.bemBlock}-dropdown`,
                hamburgerSubMenu: `${HamburgerMenu.bemBlock}-submenu`,
                hamburgerMenuNavLink: `${HamburgerMenu.bemBlock}-link`,
                hamburgerMenuCloseNavButton: `${HamburgerMenu.bemBlock}-button--close`,
                hamburgerMenuOpenNavButton: `${HamburgerMenu.bemBlock}-button--open`,
            },
        }

        constructor(formContainer) {
            this.formContainer = formContainer;
            formContainer._model.subscribe((action) => {
                const { payload } = action;
                const { changes, field } = payload;
                const { items } = field;
                if (changes && changes.length > 0) {
                    changes.forEach((change) => {
                        switch (change.propertyName) {
                            case "activeChild":
                                this.#handleActiveItem(field);
                                break;
                            case "items":
                                this.#handleItemsChange(change, items);
                                break;
                            case "visible":
                                this.#updateAttribute(field.id, 'data-panel-visible', field.visible);
                                break;
                            case "enabled":
                                this.#updateAttribute(field.id, 'data-panel-enabled', field.enabled);
                                break;
                        }
                    });
                }
            }, "fieldChanged");
        }

        #updateAttribute(id, attributeName, value) {
            const element = document.querySelector(`[data-panel-id='${id}']`);
            if (attributeName === 'data-panel-enabled' && element) {
                if (value === 'false') {
                    element.setAttribute('disabled', 'true');
                } else {
                    element.removeAttribute('disabled');
                }
            }
            if (element) {
                element.setAttribute(attributeName, value);
            }
        }

        #createListItem(item) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            const textSpan = document.createElement('span');
            link.href = "#";
            textSpan.textContent = item?.label?.value;
            textSpan.setAttribute('tabindex', "0");
            link.appendChild(textSpan);
            li.appendChild(link);
            li.setAttribute('data-panel-id', item?.id);
            li.setAttribute('data-panel-visible', item?.visible);
            li.setAttribute('data-panel-enabled', item?.enabled);
            return li;
        }

        #handleItemsChange(change, items) {
            if (change?.prevValue !== null) {
                document.querySelector(`[data-panel-id='${change?.prevValue?.id}']`)?.remove();
            } else {
                items.forEach((item) => {
                    if (item.id === change.currentValue.id) {
                        const prevListItem = document.querySelector(`[data-panel-id='${items[change.currentValue.index - 1]?.id}']`);
                        const newListItem = this.#createListItem(change.currentValue);
                        prevListItem?.parentNode?.insertBefore(newListItem, prevListItem?.nextSibling);
                    }
                });
            }
        }


        #handleActiveItem(field) {
            const menu = document.querySelector(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu);
            if (field !== null && field) {
                const activeListItem = document.querySelector(`[data-panel-id='${field.id}']`);
                if(activeListItem && activeListItem.tagName === 'LI') {
                    const menuItems = document.querySelectorAll(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu + ' li');
                    const fieldModel = this.formContainer?.getField(activeListItem?.getAttribute('data-panel-id'))?.getModel();
                    const elementID = this.#checkFirstNonPanel(fieldModel);
                    const targetElement = menu.querySelector("[data-panel-id='"+ elementID + "']");
                    this.#resetMenuItems(menuItems);
                    this.#activateCurrentItem(targetElement);
                    const anchorElement = targetElement?.querySelector('a');
                    anchorElement?.classList.add(HamburgerMenu.cssClasses.active);
                    anchorElement?.querySelector('button')?.classList?.toggle(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton);
                    this.#updateSelectedPanelTitle(anchorElement);
                    this.#highlightMenuTree(anchorElement);
                    this.#renderBreadCrumbs(menu);
                }
            }
        }
    
         #updateSelectedPanelTitle(anchorElement, clickedAnchorElement) {
            const activeItemTitleContent = anchorElement?.innerText;
            const clickedAnchorElementText = clickedAnchorElement?.innerText;
            const activeItemTitle = document.querySelector(HamburgerMenu.selectors.hamburgerMenuBottomContainer.hamburgerMenuActiveItemTitle);
            activeItemTitle.innerText = activeItemTitleContent || clickedAnchorElementText || '';
        }
    
         #checkFirstNonPanel(fieldModel) {
            if(fieldModel && fieldModel._children && fieldModel._children[0]) {
                if(fieldModel._children[0]?.fieldType !== 'panel') {
                    return fieldModel._children[0].parent.id;
                }
                return this.#checkFirstNonPanel(fieldModel?._children[0])
            }
            return fieldModel?.id;
        }
    
         #clickHandler(event) {
            const menu = document.querySelector(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu);
            event.stopPropagation();
            let targetElement = event.target.closest('li');    
            if(targetElement?.getAttribute('data-panel-enabled') === 'false') {
                return;
            }
            if(event.target.tagName === "BUTTON" && (event.target.classList.contains(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton) || event.target.classList.contains(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuOpenNavButton)))  {
                const isExpanded = event.target.getAttribute('aria-expanded') === 'true';
                event.target.classList.toggle(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton);
                event.target.setAttribute('aria-expanded', !isExpanded);
                return;
            }
            const menuItems = document.querySelectorAll(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu + ' li');
            const fieldModel = this.formContainer?.getModel().getElement(targetElement?.getAttribute('data-panel-id'));
            const elementID = this.#checkFirstNonPanel(fieldModel) || targetElement?.getAttribute('data-panel-id');
            
            const parentAnchorElement = targetElement?.querySelector('a');
            targetElement = menu.querySelector("[data-panel-id='"+ elementID + "']");
            this.#resetMenuItems(menuItems);
            this.#activateCurrentItem(targetElement);
            const anchorElement = targetElement?.querySelector('a');
            anchorElement?.classList.add(HamburgerMenu.cssClasses.active);
            anchorElement?.querySelector('button')?.classList?.toggle(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton);
            const isExpanded = anchorElement?.querySelector('button')?.getAttribute('aria-expanded') === 'true';
            anchorElement?.querySelector('button')?.setAttribute('aria-expanded', !isExpanded);
            this.#updateSelectedPanelTitle(anchorElement, parentAnchorElement);
            this.#highlightMenuTree(anchorElement, parentAnchorElement);

            this.formContainer.getModel().getElement('accordion-9fbafbc6e6');
    
            const itemId = targetElement?.getAttribute('data-panel-id') || HamburgerMenu.activeItemId;
            const form = this.formContainer?.getModel();
            const field = form?.getElement(itemId);
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            this.#renderBreadCrumbs(menu);
            if (form && field) {
              form.setFocus(field);
            }
        }
    
        #resetMenuItems(menuItems) {
            menuItems.forEach(item => {
                const subMenu = item.querySelector(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerSubMenu);
                if (subMenu)  {
                    subMenu.style.display = 'none';
                    subMenu.setAttribute('aria-hidden', true);
                }
                const link = item.querySelector('a');
                if(link) {
                    link?.querySelector('button')?.classList.remove(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton);
                    link?.querySelector('button')?.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuOpenNavButton);
                    link?.classList.remove(HamburgerMenu.cssClasses.active, HamburgerMenu.cssClasses.activeParent);
                    link.style.fontWeight = 'normal';
                }
            });
        }
        
        #activateCurrentItem(currentItem) {
            while (currentItem) {
                const subMenu = currentItem.querySelector(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerSubMenu);
                if (subMenu)  {
                    subMenu.style.display = 'block';
                    subMenu.setAttribute('aria-hidden', false);
                }
                currentItem = currentItem.parentElement.closest('li');
            }
        }
    
        #menuItemClickHandler(event, subMenu, li, link) {
            event.preventDefault();
            if (li.getAttribute('data-panel-enabled') === 'false') {
                return;
            }
            const expanded = link.getAttribute('aria-expanded') === 'true';
            link.setAttribute('aria-expanded', !expanded);
            if (subMenu.style.display === 'flex' || subMenu.style.display === 'block') {
                subMenu.style.display = 'none';
                subMenu.setAttribute('aria-hidden', true);
            } else {
                subMenu.style.display = 'flex';
                subMenu.setAttribute('aria-hidden', false);
            }
        }
    
        #createDownArrowButton() {
            const downArrowButton = document.createElement('button');
            downArrowButton.type='button';
            downArrowButton.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuOpenNavButton);
            downArrowButton.setAttribute('aria-expanded', false);
            return downArrowButton;
        }
    
        #createHamburgerMenu(items, counter = 0) {
            if (counter >= HamburgerMenu.nestingSupport) {
                return;
            }
            if (!items?.length) return;
            const ul = document.createElement('ul');
            let activeItemTitleUpdated = false;
            items.forEach((item) => {
                if (item?.fieldType !== "panel") return;
    
                if (!activeItemTitleUpdated) {
                    const activeItemTitle = document.querySelector(HamburgerMenu.selectors.hamburgerMenuBottomContainer.hamburgerMenuActiveItemTitle);
                    if(activeItemTitle) {
                        activeItemTitle.innerText = item?.label?.value;
                        activeItemTitleUpdated = true;
                    }
                }
    
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.setAttribute('role', 'menuitem');
                link.setAttribute('aria-expanded', 'false');
                const textSpan = document.createElement('span');
                textSpan.setAttribute('tabindex', "0");
                link.href = "#";
                textSpan.textContent = item?.label?.value;
                link.appendChild(textSpan);
                link.style.visibility = item?.label?.visible ? 'visible' : 'hidden';
                li.appendChild(link);
                
                li.setAttribute('data-panel-id', item?.id);
                li.setAttribute('data-panel-visible', item?.visible);
                li.setAttribute('data-panel-enabled', item?.enabled);
                const children = this.formContainer?.getModel()?.getElement(item.id)?._children;
                let flag = false;
    
                // setting an attibute(data-panel-has-input) if the item is having an input field
                if(children) {
                    for(let i = 0; i< children.length; i++) {
                        if(children[i].fieldType !== 'panel') {
                            flag = true;
                        }
                    }
                }
                if(flag) {
                    li.setAttribute('data-panel-has-input', flag);
                }
    
                link.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuNavLink);
                if (item?.repeatable) {
                    const subMenu = this.#createHamburgerMenu(item.items, counter + 1);
                    subMenu?.childNodes.forEach(child => ul.appendChild(child));
                } else if (Array.isArray(item.items) && item.items.length > 0) {
                    const subMenu = this.#createHamburgerMenu(item.items, counter + 1);
                    if (subMenu?.childNodes?.length) {
                        subMenu.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerSubMenu);
                        li.appendChild(subMenu);
                        link.insertBefore(this.#createDownArrowButton(), link.firstChild);
                        link.addEventListener('click', (event) => {
                            this.#menuItemClickHandler(event, subMenu, li, link)
                        });
                        link.addEventListener('keydown', (event) => {
                            if(event.key === 'Enter' || event.key === ' ') {
                                this.#menuItemClickHandler(event, subMenu, li, link);
                            }
                        });
                    }
                }
                ul.appendChild(li);
            });
        
            return ul;
        }
    
        // Function to find the currently active li
        #findActiveLi() {
            return document.querySelector(HamburgerMenu.selectors.active).parentElement;
        }
    
        #highlightMenuTree(element, parentAnchorElement) {
            const closestLI = element?.closest('li');
            const clickedClosestLI = parentAnchorElement?.closest('li');
    
            const li = closestLI || clickedClosestLI;
        
            if (!li || li === document.body) {
                return;
            }
            let anchorElement = li?.querySelector('a');
    
            if(anchorElement) {
                anchorElement?.classList.add(HamburgerMenu.cssClasses.activeParent);
                anchorElement?.querySelector('button')?.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton);
                if(anchorElement?.querySelector('button')?.classList.contains(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenuCloseNavButton)) {
                    anchorElement?.querySelector('button')?.setAttribute('aria-expanded', true);
                }
                if(li.parentElement.classList.contains(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenu)) {
                    anchorElement.style.fontWeight = 'bold'
                }
                this.#highlightMenuTree(li.parentElement);
            }
        }
    
        #isEligible(element, direction) {
            if (element && element?.getAttribute('data-panel-visible') === 'false' || element?.getAttribute('data-panel-enabled') === 'false' || (direction === 'prev' && element?.getAttribute('data-panel-has-input') !== 'true')) {
                return false;
            } else if (element && element.parentNode && element.parentNode !== document) {
                return this.#isEligible(element.parentNode);
            } else {
                return true;
            }
        }

        #moveTo(menuListItems, direction) {
            const currentActive = this.#findActiveLi();
            if (!currentActive) return;
        
            let newActiveItemIndex = -1;
            menuListItems.forEach((item, index) => {
                if (item.getAttribute('data-panel-id') === currentActive.getAttribute('data-panel-id')) {
                    newActiveItemIndex = direction === 'prev' ? index - 1 : index + 1;
                }
            });
        
            if (direction === 'prev' && newActiveItemIndex < 0) {
                newActiveItemIndex = menuListItems.length - 1;
            }
            while (!this.#isEligible(menuListItems[newActiveItemIndex], direction)) {
                if(direction === 'prev') {
                    newActiveItemIndex = (newActiveItemIndex - 1) % menuListItems.length;
                    if(newActiveItemIndex<=0) {
                        newActiveItemIndex = 0;
                        break;
                    }
                } else {
                    newActiveItemIndex = (newActiveItemIndex + 1) % menuListItems.length;
                }
            }
            const newActiveItem = menuListItems[newActiveItemIndex];
            HamburgerMenu.activeItemId = newActiveItem?.getAttribute('data-panel-id');
            newActiveItem?.click();
        }
    
        #movePrev(menuListItems) {
            this.#moveTo(menuListItems, 'prev');
        }
        
        #moveNext(menuListItems) {
            this.#moveTo(menuListItems, 'next');
        }
    
        #addEventsToNavigationButtons() {
            const previousNavButton = document.querySelector(HamburgerMenu.selectors.hamburgerMenuBottomContainer.hamburgerMenuPreviousNavButton);
            const nextNavButton = document.querySelector(HamburgerMenu.selectors.hamburgerMenuBottomContainer.hamburgerMenuNextNavButton);
            const menuListItems = document.querySelector(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu).querySelectorAll('li');
            previousNavButton.addEventListener('click', () => this.#movePrev(menuListItems));
            nextNavButton.addEventListener('click', () => this.#moveNext(menuListItems));
        }
    
        #generateBreadcrumbs(breadcrumbs) {
            const container = document.createElement('nav');
            container.setAttribute('aria-label', 'Breadcrumb');
            const list = document.createElement('ul');
            list.style.listStyleType = 'none';
            list.style.padding = '0';
            list.style.margin = '0';
            if(breadcrumbs && breadcrumbs.length) {
                [...breadcrumbs].forEach((breadcrumb, index) => {
                    const listItem = document.createElement('li');
                    listItem.style.display = 'inline';
                    const span = document.createElement('span');
                    span.textContent = breadcrumb.innerText;
                    listItem.appendChild(span);
                    if (index < breadcrumbs.length - 1) {
                        const separator = document.createElement('span');
                        separator.textContent = ' > ';
                        separator.style.margin = '0 5px';
                        listItem.appendChild(separator);
                    }
                    if(index  ===  breadcrumbs?.length-1) {
                        listItem.style.fontWeight = 'bold';
                    }
                    list.appendChild(listItem);
                });
            }
            container.appendChild(list);
            return container;
        }
    
        #renderBreadCrumbs(menu) {
            const selectedPanels = menu.getElementsByClassName(HamburgerMenu.cssClasses.activeParent);
            const breadCrumbsContainer = document.querySelector(HamburgerMenu.selectors.hamburgerMenuMiddleContainer);
            breadCrumbsContainer.innerHTML = '';
            const breadCrumbs = this.#generateBreadcrumbs(selectedPanels)
            breadCrumbsContainer.appendChild(breadCrumbs);
            breadCrumbsContainer.scrollLeft = breadCrumbs.scrollWidth;
        }
    
        #renderHamburgerItems(panels) {
            const parentContainer = document.querySelector(HamburgerMenu.selectors.hamburgerMenuTopContainer.self);
            const hamburgerIcon = document.querySelector(HamburgerMenu.selectors.hamburgerMenuTopContainer.hamburgerMenuIcon);
            const hamburgerMenuIconContainer = document.querySelector(HamburgerMenu.selectors.hamburgerMenuTopContainer.hamburgerMenuIconContainer);
    
            const menu = this.#createHamburgerMenu(panels);
            if(menu) {
                menu.classList.add(HamburgerMenu.cssClasses.hamburgerMenuWidget.hamburgerMenu);
                menu.setAttribute('role', 'menu');
                menu.setAttribute('id', 'hamburger-menu');
    
                this.#attachHamburgerEventListeners(hamburgerIcon, menu);
                this.#attachOutsideClickHandler(hamburgerIcon, menu);
                this.#attachMenuEventListeners(menu);
                this.#styleSubmenuItems(menu);
                parentContainer.innerHTML='';
                parentContainer.appendChild(hamburgerMenuIconContainer);
                parentContainer.appendChild(menu);
    
                // Add events to navigation buttons
                this.#addEventsToNavigationButtons();
    
                 // Automatically click the first root list item if it exists
                const rootListItems = menu.querySelectorAll(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu + ' > li');
                if (rootListItems[0] && rootListItems[0].tagName === 'LI') {
                    rootListItems[0].click();
                    menu.style.display = 'none';
                }
            }
        }
    
        #attachMenuEventListeners(menu) {
            menu.addEventListener('click', (event) => this.#clickHandler(event));
            menu.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  this.#clickHandler(event);
                }
              });
            menu.addEventListener('ontouchstart', (event) => this.#clickHandler(event));
        }
    
        #attachHamburgerEventListeners(hamburgerIcon, menu) {
            const toggleMenuVisibility = () => {
                menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
            };
            hamburgerIcon?.addEventListener('click', toggleMenuVisibility);
            hamburgerIcon?.addEventListener('ontouchstart', toggleMenuVisibility);
        }
        
        #styleSubmenuItems(menu) {
            const rootListItems = menu.querySelectorAll(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerMenu + ' > li');
            rootListItems.forEach((item) => {
                let padding = 30;
                const submenus = item.querySelectorAll(HamburgerMenu.selectors.hamburgerMenuWidget.hamburgerSubMenu);
                submenus.forEach((submenu) => {
                    const links = submenu.querySelectorAll('a');
                    links.forEach((link) => {
                        if(link.querySelector('button')) {
                             link.style.paddingInlineStart = `${padding}px`;
                        } else {
                            link.style.paddingInlineStart = `${padding + 30}px`;
                        }
                    });
                    padding += 15;
                });
            });
        }
    
        #attachOutsideClickHandler(hamburger, menu) {
            window.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !menu.contains(e.target) && menu.style.display === 'flex') {
                    menu.style.display = 'none';
                }
            });
        }
    
        #getAllPanels() {
            let items = this.formContainer?._model.getItemsState() || [];
            const panels = items.filter(item => item?.fieldType ===  "panel");
            return panels;
        }
    
        init() {
            if(this.formContainer?.getModel()?.properties?.['fd:isHamburgerMenuEnabled']) {
                document.querySelector('.cmp-adaptiveform-container')?.setAttribute('data-cmp-hamburger-menu-enabled', 'true');
                const panels = this.#getAllPanels();
                this.#renderHamburgerItems(panels);
            }
        }
    }
}