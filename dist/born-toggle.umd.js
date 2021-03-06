(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', '@borngroup/born-utilities'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('@borngroup/born-utilities'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.bornUtilities);
        global.bornToggle = mod.exports;
    }
})(this, function (exports, _bornUtilities) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Toggle = function () {
        function Toggle(options) {
            _classCallCheck(this, Toggle);

            this.options = options || {};

            //Setup the data attribute to use for the triggers.
            this.options.dataAttribute = this.options.dataAttribute || 'data-toggle';

            _bornUtilities.callbackOnElements.call(this, this.options.triggers, this._setupTrigger);

            //Make sure the document only has this event attached once.
            document.removeEventListener('keydown', this._toggleOnReturn);
            document.addEventListener('keydown', this._toggleOnReturn);
        }

        //Adds event listener to trigger toggle on keyboard ENTER/RETURN, in case trigger is not focusable.


        _createClass(Toggle, [{
            key: '_toggleOnReturn',
            value: function _toggleOnReturn(evt) {
                var isNotFocusable = this.activeElement !== document.body && this.activeElement.nodeName !== 'BUTTON';

                if (this.activeElement.toggle && evt.keyCode === 13 && isNotFocusable) {
                    Toggle.toggleEventHandler.call(this.activeElement, evt);
                }
            }
        }, {
            key: '_setupTrigger',
            value: function _setupTrigger(trigger) {
                var triggerID = trigger.id || this.generateCustomToggleID(trigger);

                trigger.toggle = trigger.toggle || {};

                trigger.toggle.options = this._getOptions(trigger);
                trigger.toggle.parentEl = this._getParent(trigger);
                trigger.toggle.targetEl = this._getTarget(trigger);

                if (!trigger.toggle.targetEl) {
                    console.warn('No target provided or element not found for: ', trigger);

                    return false;
                }

                trigger.toggle.targetFocusEl = this._getTargetFocus(trigger);

                trigger.id = triggerID;
                trigger.toggle.targetEl.id = trigger.toggle.targetEl.id || triggerID + '--target';

                trigger.toggle.options.customAttributes = (0, _bornUtilities.objectAssign)(this.getCustomAttributes(trigger), trigger.toggle.options.customAttributes);

                this._setupCallbacks(trigger);
                this._setupMethods(trigger);
                this._setupHandlers(trigger);

                Toggle.updateAttributes(trigger);

                if (trigger.toggle.options.auto) {
                    if (!isNaN(trigger.toggle.options.auto)) {
                        //if the 'auto' property is set to a Number, use that as milliseconds to trigger the toggle when ellapsed.
                        window.setTimeout(Toggle.set.bind(this, trigger), trigger.toggle.options.auto);
                    } else if (typeof trigger.toggle.options.auto === 'string') {
                        //if the 'auto' property is set to a String that matches a URL parameter or hash, fire the toggle.
                        if ((0, _bornUtilities.hasURLParameter)(trigger.toggle.options.auto)) {
                            Toggle.set(trigger);
                        } else if (this.options.breakpoints) {
                            //Else if this.options.breakpoints is provided, attempt to find the matched trigger.toggle.options.auto breakpoint name.
                            var matchedBreakpoint = this.options.breakpoints[trigger.toggle.options.auto];

                            //Check if the matched breakpoint falls within the provided boundaries.
                            if (matchedBreakpoint && (!matchedBreakpoint.min || document.body.offsetWidth >= matchedBreakpoint.min) && (!matchedBreakpoint.max || document.body.offsetWidth <= matchedBreakpoint.max)) {
                                Toggle.set(trigger);
                            } else {
                                Toggle.unset(trigger, false);
                            }
                        }
                    } else {
                        Toggle.set(trigger);
                    }
                }

                //Removes the data-* attribute to enable easy re-initialization if needed.
                trigger.removeAttribute(this.options.dataAttribute);
            }
        }, {
            key: 'generateCustomToggleID',
            value: function generateCustomToggleID(trigger) {
                var randomString = Math.floor(new Date().getTime() * Math.random()).toString().substr(0, 4);

                return 'toggleID-' + randomString;
            }
        }, {
            key: '_getOptions',
            value: function _getOptions(trigger) {
                var triggerOptionsString = trigger.getAttribute(this.options.dataAttribute),
                    triggerOptions = (0, _bornUtilities.objectAssign)({}, this.options, triggerOptionsString ? this._safeJSONParse(triggerOptionsString) : {});

                triggerOptions.closeSelector = triggerOptions.closeSelector || '[data-toggle-close]';
                triggerOptions.activeClass = triggerOptions.activeClass || 'toggle--active';
                triggerOptions.unsetSelf = triggerOptions.hasOwnProperty('unsetSelf') ? triggerOptions.unsetSelf : true;
                triggerOptions.allowEscClose = triggerOptions.hasOwnProperty('allowEscClose') ? triggerOptions.allowEscClose : true;

                return triggerOptions;
            }
        }, {
            key: '_safeJSONParse',
            value: function _safeJSONParse(JSONString) {
                try {
                    return JSON.parse(JSONString);
                } catch (e) {
                    return {};
                }
            }
        }, {
            key: 'getCustomAttributes',
            value: function getCustomAttributes(trigger) {
                //`value`: [String | Array] If Array, index 0 is used when Toggle is unset, and index 1 is used when it's set.
                //`trigger`: [Boolean] Set to true to only attach the attribute to the trigger element.
                //`target`: [Boolean] Set to true to only attach the attribute to the target element.
                return {
                    'aria-expanded': {
                        value: ['false', 'true'],
                        trigger: true
                    },
                    'aria-labelledby': {
                        value: trigger.id,
                        target: true
                    },
                    'aria-controls': {
                        value: trigger.toggle.targetEl.id,
                        trigger: true
                    }
                };
            }
        }, {
            key: '_getParent',
            value: function _getParent(trigger) {
                return trigger.closest(trigger.toggle.options.parent) || document.querySelector(trigger.toggle.options.parent) || trigger.parentNode;
            }
        }, {
            key: '_getTarget',
            value: function _getTarget(trigger) {
                var targetSelector = trigger.toggle.options.target,
                    targetEl = document.querySelectorAll(targetSelector);

                return targetEl.length > 1 ? trigger.toggle.parentEl.querySelector(targetSelector) : targetEl[0];
            }
        }, {
            key: '_getTargetFocus',
            value: function _getTargetFocus(trigger) {
                var targetFocus = trigger.toggle.options.targetFocus,
                    isSelector = typeof targetFocus === 'string';

                return isSelector ? trigger.toggle.targetEl.querySelector(targetFocus) : targetFocus ? trigger.toggle.targetEl : null;
            }
        }, {
            key: '_setupCallbacks',
            value: function _setupCallbacks(trigger) {
                trigger.toggle.beforeUnset = trigger.toggle.options.beforeUnset || function () {
                    return true;
                };
                trigger.toggle.afterUnset = trigger.toggle.options.afterUnset || function () {
                    return true;
                };
                trigger.toggle.beforeUnsetAll = trigger.toggle.options.beforeUnsetAll || function () {
                    return true;
                };
                trigger.toggle.beforeSet = trigger.toggle.options.beforeSet || function () {
                    return true;
                };
                trigger.toggle.afterSet = trigger.toggle.options.afterSet || function () {
                    return true;
                };
            }
        }, {
            key: '_setupMethods',
            value: function _setupMethods(trigger) {
                trigger.toggle.toggle = Toggle.toggle.bind(this, trigger);
                trigger.toggle.set = Toggle.set.bind(this, trigger);
                trigger.toggle.unset = Toggle.unset.bind(this, trigger);
            }
        }, {
            key: '_setupHandlers',
            value: function _setupHandlers(trigger) {
                var evtType = (trigger.toggle.options.event || 'click').split(' ');

                evtType.forEach(function (currentEvt) {
                    trigger.addEventListener(currentEvt, Toggle.toggleEventHandler);
                }.bind(this));
            }
        }], [{
            key: 'updateAttributes',
            value: function updateAttributes(trigger, isActive) {
                var customAttributes = trigger.toggle.options.customAttributes;

                for (var attrKey in customAttributes) {
                    if (customAttributes[attrKey]) {
                        if (customAttributes[attrKey].trigger) {
                            Toggle.setAttributeValue(trigger, attrKey, customAttributes[attrKey], isActive);
                        } else if (customAttributes[attrKey].target) {
                            Toggle.setAttributeValue(trigger.toggle.targetEl, attrKey, customAttributes[attrKey], isActive);
                        } else {
                            Toggle.setAttributeValue(trigger, attrKey, customAttributes[attrKey], isActive);
                            Toggle.setAttributeValue(trigger.toggle.targetEl, attrKey, customAttributes[attrKey], isActive);
                        }
                    }
                }
            }
        }, {
            key: 'setAttributeValue',
            value: function setAttributeValue(el, attrName, attrObject, isActive) {
                var value = typeof attrObject.value === 'string' ? attrObject.value : isActive ? attrObject.value[1] : attrObject.value[0];

                el.setAttribute(attrName, value);
            }
        }, {
            key: 'toggleEventHandler',
            value: function toggleEventHandler(evt) {
                var isTouch = evt.type.indexOf('touch') !== -1;

                if (this.nodeName === 'A' || isTouch) {
                    evt.preventDefault();
                }

                Toggle.toggle(this, evt);

                if (isTouch) {
                    evt.stopImmediatePropagation();
                }
            }
        }, {
            key: 'toggle',
            value: function toggle(trigger, evt) {
                var evtType = evt ? evt.type : '';

                if (trigger.classList.contains(trigger.toggle.options.activeClass)) {
                    if (trigger.toggle.options.unsetSelf && evtType !== 'mouseenter') {
                        Toggle.unset(trigger, false);
                    }
                } else {
                    Toggle.set(trigger, evt, evtType);
                }
            }
        }, {
            key: 'unset',
            value: function unset(trigger, focusTrigger) {
                if (trigger.classList.contains(trigger.toggle.options.activeClass) && trigger.toggle.beforeUnset(trigger)) {
                    trigger.classList.remove(trigger.toggle.options.activeClass);
                    trigger.toggle.parentEl.classList.remove(trigger.toggle.options.activeClass);
                    trigger.toggle.targetEl.classList.remove(trigger.toggle.options.activeClass);

                    trigger.toggle.targetEl.removeEventListener('click', Toggle.closeElHandler);

                    trigger.toggle.afterUnset(trigger);

                    trigger.toggle.isSet = false;
                    //Remove the currently active trigger from this targetEl.
                    trigger.toggle.targetEl.currentTrigger = null;

                    Toggle.updateAttributes(trigger);

                    if (focusTrigger) {
                        trigger.focus();
                    }
                }
            }
        }, {
            key: 'set',
            value: function set(trigger, evt, evtType) {
                var triggerEvt = evtType || '';

                if (trigger.toggle.beforeSet(trigger, evt)) {
                    if (trigger.toggle.beforeUnsetAll(trigger)) {
                        Toggle.unsetAll(trigger, trigger.toggle.options.siblingSelector);
                    }

                    trigger.classList.add(trigger.toggle.options.activeClass);
                    trigger.toggle.parentEl.classList.add(trigger.toggle.options.activeClass);
                    trigger.toggle.targetEl.classList.add(trigger.toggle.options.activeClass);

                    trigger.toggle.isSet = true;
                    //Set the currently active trigger for this targetEl.
                    trigger.toggle.targetEl.currentTrigger = trigger;

                    Toggle.updateAttributes(trigger, true);

                    if (trigger.toggle.targetFocusEl) {
                        (0, _bornUtilities.forceFocus)(trigger.toggle.targetFocusEl);
                    }

                    //If 'options.persist' is false, attach an event listener to the body to unset the trigger.
                    if (!trigger.toggle.options.persist) {
                        var bodyEvtType = triggerEvt.indexOf('touch') >= 0 ? triggerEvt : 'click',
                            blurCloseHandler = function blurCloseHandler(evt) {
                            // Ugly, but it works. The reason we check for parentEl AND targetEl is
                            // cause sometimes the parentEl does not contain the targetEl, but only the trigger
                            if (!trigger.toggle.targetEl.contains(evt.target) && !trigger.toggle.parentEl.contains(evt.target) && evt.target !== trigger) {
                                this.removeEventListener(bodyEvtType, blurCloseHandler, true);

                                Toggle.unset(trigger, false);
                            }
                        };

                        document.body.addEventListener(bodyEvtType, blurCloseHandler, true);

                        if (trigger.toggle.options.allowEscClose) {
                            var escCloseHandler = function escCloseHandler(evt) {
                                if (evt.keyCode === 27) {
                                    this.removeEventListener('keydown', escCloseHandler);

                                    Toggle.unset(trigger, true);
                                }
                            };

                            document.addEventListener('keydown', escCloseHandler);
                        }
                    }

                    //Hide content on hover out
                    if (trigger.toggle.options.unsetOnHoverOut) {
                        var mouseLeaveHandler = function mouseLeaveHandler() {
                            this.removeEventListener('mouseleave', mouseLeaveHandler);
                            Toggle.unset(trigger, true);
                        };

                        trigger.toggle.parentEl.addEventListener('mouseleave', mouseLeaveHandler);
                    }

                    //Toggles the content off after 'timeout' has ellapsed.
                    //Need to add option to reset timer when cursor is on trigger or its components
                    if (trigger.toggle.options.timeout) {
                        window.setTimeout(Toggle.unset.bind(this, trigger, false), trigger.toggle.options.timeout);
                    }

                    //Trap focus within the target element.
                    if (trigger.toggle.options.focusTrap) {
                        (0, _bornUtilities.focusTrap)(trigger.toggle.targetEl);
                    }

                    trigger.toggle.targetEl.addEventListener('click', Toggle.closeElHandler);

                    trigger.toggle.afterSet(trigger);
                }
            }
        }, {
            key: 'closeElHandler',
            value: function closeElHandler(evt) {
                var targetCloseEl = evt.target.closest(this.currentTrigger.toggle.options.closeSelector),
                    targetTriggerSelector = targetCloseEl && targetCloseEl.getAttribute('data-toggle-close') ? targetCloseEl.getAttribute('data-toggle-close') : null;

                if (targetCloseEl && (this.currentTrigger.matches(targetTriggerSelector) || !targetTriggerSelector)) {
                    Toggle.unset(this.currentTrigger, true);
                }
            }
        }, {
            key: 'unsetAll',
            value: function unsetAll(refTrigger) {
                var activeClass = refTrigger.toggle.options.activeClass,
                    siblingSelector = refTrigger.toggle.options.siblingSelector,
                    skipSelector = refTrigger.toggle.options.skipSelector,
                    activeTriggers = document.querySelectorAll('.' + activeClass);

                [].forEach.call(activeTriggers, function (trigger) {
                    if (trigger.toggle && !trigger.matches(skipSelector) && (!trigger.toggle.options.persist || trigger.matches(siblingSelector))) {
                        Toggle.unset(trigger, false);
                    }
                });
            }
        }]);

        return Toggle;
    }();

    exports.default = Toggle;
});
