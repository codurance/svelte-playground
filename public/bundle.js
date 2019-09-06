
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var candidateSelectors = [
      'input',
      'select',
      'textarea',
      'a[href]',
      'button',
      '[tabindex]',
      'audio[controls]',
      'video[controls]',
      '[contenteditable]:not([contenteditable="false"])',
    ];
    var candidateSelector = candidateSelectors.join(',');

    var matches = typeof Element === 'undefined'
      ? function () {}
      : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

    function tabbable(el, options) {
      options = options || {};

      var regularTabbables = [];
      var orderedTabbables = [];

      var candidates = el.querySelectorAll(candidateSelector);

      if (options.includeContainer) {
        if (matches.call(el, candidateSelector)) {
          candidates = Array.prototype.slice.apply(candidates);
          candidates.unshift(el);
        }
      }

      var i, candidate, candidateTabindex;
      for (i = 0; i < candidates.length; i++) {
        candidate = candidates[i];

        if (!isNodeMatchingSelectorTabbable(candidate)) continue;

        candidateTabindex = getTabindex(candidate);
        if (candidateTabindex === 0) {
          regularTabbables.push(candidate);
        } else {
          orderedTabbables.push({
            documentOrder: i,
            tabIndex: candidateTabindex,
            node: candidate,
          });
        }
      }

      var tabbableNodes = orderedTabbables
        .sort(sortOrderedTabbables)
        .map(function(a) { return a.node })
        .concat(regularTabbables);

      return tabbableNodes;
    }

    tabbable.isTabbable = isTabbable;
    tabbable.isFocusable = isFocusable;

    function isNodeMatchingSelectorTabbable(node) {
      if (
        !isNodeMatchingSelectorFocusable(node)
        || isNonTabbableRadio(node)
        || getTabindex(node) < 0
      ) {
        return false;
      }
      return true;
    }

    function isTabbable(node) {
      if (!node) throw new Error('No node provided');
      if (matches.call(node, candidateSelector) === false) return false;
      return isNodeMatchingSelectorTabbable(node);
    }

    function isNodeMatchingSelectorFocusable(node) {
      if (
        node.disabled
        || isHiddenInput(node)
        || isHidden(node)
      ) {
        return false;
      }
      return true;
    }

    var focusableCandidateSelector = candidateSelectors.concat('iframe').join(',');
    function isFocusable(node) {
      if (!node) throw new Error('No node provided');
      if (matches.call(node, focusableCandidateSelector) === false) return false;
      return isNodeMatchingSelectorFocusable(node);
    }

    function getTabindex(node) {
      var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
      if (!isNaN(tabindexAttr)) return tabindexAttr;
      // Browsers do not return `tabIndex` correctly for contentEditable nodes;
      // so if they don't have a tabindex attribute specifically set, assume it's 0.
      if (isContentEditable(node)) return 0;
      return node.tabIndex;
    }

    function sortOrderedTabbables(a, b) {
      return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
    }

    function isContentEditable(node) {
      return node.contentEditable === 'true';
    }

    function isInput(node) {
      return node.tagName === 'INPUT';
    }

    function isHiddenInput(node) {
      return isInput(node) && node.type === 'hidden';
    }

    function isRadio(node) {
      return isInput(node) && node.type === 'radio';
    }

    function isNonTabbableRadio(node) {
      return isRadio(node) && !isTabbableRadio(node);
    }

    function getCheckedRadio(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
          return nodes[i];
        }
      }
    }

    function isTabbableRadio(node) {
      if (!node.name) return true;
      // This won't account for the edge case where you have radio groups with the same
      // in separate forms on the same page.
      var radioSet = node.ownerDocument.querySelectorAll('input[type="radio"][name="' + node.name + '"]');
      var checked = getCheckedRadio(radioSet);
      return !checked || checked === node;
    }

    function isHidden(node) {
      // offsetParent being null will allow detecting cases where an element is invisible or inside an invisible element,
      // as long as the element does not use position: fixed. For them, their visibility has to be checked directly as well.
      return node.offsetParent === null || getComputedStyle(node).visibility === 'hidden';
    }

    var tabbable_1 = tabbable;

    var immutable = extend;

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function extend() {
        var target = {};

        for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target
    }

    var activeFocusDelay;

    var activeFocusTraps = (function() {
      var trapQueue = [];
      return {
        activateTrap: function(trap) {
          if (trapQueue.length > 0) {
            var activeTrap = trapQueue[trapQueue.length - 1];
            if (activeTrap !== trap) {
              activeTrap.pause();
            }
          }

          var trapIndex = trapQueue.indexOf(trap);
          if (trapIndex === -1) {
            trapQueue.push(trap);
          } else {
            // move this existing trap to the front of the queue
            trapQueue.splice(trapIndex, 1);
            trapQueue.push(trap);
          }
        },

        deactivateTrap: function(trap) {
          var trapIndex = trapQueue.indexOf(trap);
          if (trapIndex !== -1) {
            trapQueue.splice(trapIndex, 1);
          }

          if (trapQueue.length > 0) {
            trapQueue[trapQueue.length - 1].unpause();
          }
        }
      };
    })();

    function focusTrap(element, userOptions) {
      var doc = document;
      var container =
        typeof element === 'string' ? doc.querySelector(element) : element;

      var config = immutable(
        {
          returnFocusOnDeactivate: true,
          escapeDeactivates: true
        },
        userOptions
      );

      var state = {
        firstTabbableNode: null,
        lastTabbableNode: null,
        nodeFocusedBeforeActivation: null,
        mostRecentlyFocusedNode: null,
        active: false,
        paused: false
      };

      var trap = {
        activate: activate,
        deactivate: deactivate,
        pause: pause,
        unpause: unpause
      };

      return trap;

      function activate(activateOptions) {
        if (state.active) return;

        updateTabbableNodes();

        state.active = true;
        state.paused = false;
        state.nodeFocusedBeforeActivation = doc.activeElement;

        var onActivate =
          activateOptions && activateOptions.onActivate
            ? activateOptions.onActivate
            : config.onActivate;
        if (onActivate) {
          onActivate();
        }

        addListeners();
        return trap;
      }

      function deactivate(deactivateOptions) {
        if (!state.active) return;

        clearTimeout(activeFocusDelay);

        removeListeners();
        state.active = false;
        state.paused = false;

        activeFocusTraps.deactivateTrap(trap);

        var onDeactivate =
          deactivateOptions && deactivateOptions.onDeactivate !== undefined
            ? deactivateOptions.onDeactivate
            : config.onDeactivate;
        if (onDeactivate) {
          onDeactivate();
        }

        var returnFocus =
          deactivateOptions && deactivateOptions.returnFocus !== undefined
            ? deactivateOptions.returnFocus
            : config.returnFocusOnDeactivate;
        if (returnFocus) {
          delay(function() {
            tryFocus(state.nodeFocusedBeforeActivation);
          });
        }

        return trap;
      }

      function pause() {
        if (state.paused || !state.active) return;
        state.paused = true;
        removeListeners();
      }

      function unpause() {
        if (!state.paused || !state.active) return;
        state.paused = false;
        updateTabbableNodes();
        addListeners();
      }

      function addListeners() {
        if (!state.active) return;

        // There can be only one listening focus trap at a time
        activeFocusTraps.activateTrap(trap);

        // Delay ensures that the focused element doesn't capture the event
        // that caused the focus trap activation.
        activeFocusDelay = delay(function() {
          tryFocus(getInitialFocusNode());
        });

        doc.addEventListener('focusin', checkFocusIn, true);
        doc.addEventListener('mousedown', checkPointerDown, {
          capture: true,
          passive: false
        });
        doc.addEventListener('touchstart', checkPointerDown, {
          capture: true,
          passive: false
        });
        doc.addEventListener('click', checkClick, {
          capture: true,
          passive: false
        });
        doc.addEventListener('keydown', checkKey, {
          capture: true,
          passive: false
        });

        return trap;
      }

      function removeListeners() {
        if (!state.active) return;

        doc.removeEventListener('focusin', checkFocusIn, true);
        doc.removeEventListener('mousedown', checkPointerDown, true);
        doc.removeEventListener('touchstart', checkPointerDown, true);
        doc.removeEventListener('click', checkClick, true);
        doc.removeEventListener('keydown', checkKey, true);

        return trap;
      }

      function getNodeForOption(optionName) {
        var optionValue = config[optionName];
        var node = optionValue;
        if (!optionValue) {
          return null;
        }
        if (typeof optionValue === 'string') {
          node = doc.querySelector(optionValue);
          if (!node) {
            throw new Error('`' + optionName + '` refers to no known node');
          }
        }
        if (typeof optionValue === 'function') {
          node = optionValue();
          if (!node) {
            throw new Error('`' + optionName + '` did not return a node');
          }
        }
        return node;
      }

      function getInitialFocusNode() {
        var node;
        if (getNodeForOption('initialFocus') !== null) {
          node = getNodeForOption('initialFocus');
        } else if (container.contains(doc.activeElement)) {
          node = doc.activeElement;
        } else {
          node = state.firstTabbableNode || getNodeForOption('fallbackFocus');
        }

        if (!node) {
          throw new Error(
            "You can't have a focus-trap without at least one focusable element"
          );
        }

        return node;
      }

      // This needs to be done on mousedown and touchstart instead of click
      // so that it precedes the focus event.
      function checkPointerDown(e) {
        if (container.contains(e.target)) return;
        if (config.clickOutsideDeactivates) {
          deactivate({
            returnFocus: !tabbable_1.isFocusable(e.target)
          });
          return;
        }
        // This is needed for mobile devices.
        // (If we'll only let `click` events through,
        // then on mobile they will be blocked anyways if `touchstart` is blocked.)
        if (config.allowOutsideClick && config.allowOutsideClick(e)) {
          return;
        }
        e.preventDefault();
      }

      // In case focus escapes the trap for some strange reason, pull it back in.
      function checkFocusIn(e) {
        // In Firefox when you Tab out of an iframe the Document is briefly focused.
        if (container.contains(e.target) || e.target instanceof Document) {
          return;
        }
        e.stopImmediatePropagation();
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }

      function checkKey(e) {
        if (config.escapeDeactivates !== false && isEscapeEvent(e)) {
          e.preventDefault();
          deactivate();
          return;
        }
        if (isTabEvent(e)) {
          checkTab(e);
          return;
        }
      }

      // Hijack Tab events on the first and last focusable nodes of the trap,
      // in order to prevent focus from escaping. If it escapes for even a
      // moment it can end up scrolling the page and causing confusion so we
      // kind of need to capture the action at the keydown phase.
      function checkTab(e) {
        updateTabbableNodes();
        if (e.shiftKey && e.target === state.firstTabbableNode) {
          e.preventDefault();
          tryFocus(state.lastTabbableNode);
          return;
        }
        if (!e.shiftKey && e.target === state.lastTabbableNode) {
          e.preventDefault();
          tryFocus(state.firstTabbableNode);
          return;
        }
      }

      function checkClick(e) {
        if (config.clickOutsideDeactivates) return;
        if (container.contains(e.target)) return;
        if (config.allowOutsideClick && config.allowOutsideClick(e)) {
          return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      function updateTabbableNodes() {
        var tabbableNodes = tabbable_1(container);
        state.firstTabbableNode = tabbableNodes[0] || getInitialFocusNode();
        state.lastTabbableNode =
          tabbableNodes[tabbableNodes.length - 1] || getInitialFocusNode();
      }

      function tryFocus(node) {
        if (node === doc.activeElement) return;
        if (!node || !node.focus) {
          tryFocus(getInitialFocusNode());
          return;
        }

        node.focus();
        state.mostRecentlyFocusedNode = node;
        if (isSelectableInput(node)) {
          node.select();
        }
      }
    }

    function isSelectableInput(node) {
      return (
        node.tagName &&
        node.tagName.toLowerCase() === 'input' &&
        typeof node.select === 'function'
      );
    }

    function isEscapeEvent(e) {
      return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
    }

    function isTabEvent(e) {
      return e.key === 'Tab' || e.keyCode === 9;
    }

    function delay(fn) {
      return setTimeout(fn, 0);
    }

    var focusTrap_1 = focusTrap;

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    function createFocusTrapInstance(surfaceEl, focusTrapFactory) {
        if (focusTrapFactory === void 0) { focusTrapFactory = focusTrap_1; }
        return focusTrapFactory(surfaceEl, {
            clickOutsideDeactivates: true,
            escapeDeactivates: false,
            initialFocus: undefined,
            returnFocusOnDeactivate: false,
        });
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter_ = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCComponent = /** @class */ (function () {
        function MDCComponent(root, foundation) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            this.root_ = root;
            this.initialize.apply(this, __spread(args));
            // Note that we initialize foundation here and not within the constructor's default param so that
            // this.root_ is defined and can be used within the foundation class.
            this.foundation_ = foundation === undefined ? this.getDefaultFoundation() : foundation;
            this.foundation_.init();
            this.initialSyncWithDOM();
        }
        MDCComponent.attachTo = function (root) {
            // Subclasses which extend MDCBase should provide an attachTo() method that takes a root element and
            // returns an instantiated component with its root set to that element. Also note that in the cases of
            // subclasses, an explicit foundation class will not have to be passed in; it will simply be initialized
            // from getDefaultFoundation().
            return new MDCComponent(root, new MDCFoundation({}));
        };
        /* istanbul ignore next: method param only exists for typing purposes; it does not need to be unit tested */
        MDCComponent.prototype.initialize = function () {
            var _args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _args[_i] = arguments[_i];
            }
            // Subclasses can override this to do any additional setup work that would be considered part of a
            // "constructor". Essentially, it is a hook into the parent constructor before the foundation is
            // initialized. Any additional arguments besides root and foundation will be passed in here.
        };
        MDCComponent.prototype.getDefaultFoundation = function () {
            // Subclasses must override this method to return a properly configured foundation class for the
            // component.
            throw new Error('Subclasses must override getDefaultFoundation to return a properly configured ' +
                'foundation class');
        };
        MDCComponent.prototype.initialSyncWithDOM = function () {
            // Subclasses should override this method if they need to perform work to synchronize with a host DOM
            // object. An example of this would be a form control wrapper that needs to synchronize its internal state
            // to some property or attribute of the host DOM. Please note: this is *not* the place to perform DOM
            // reads/writes that would cause layout / paint, as this is called synchronously from within the constructor.
        };
        MDCComponent.prototype.destroy = function () {
            // Subclasses may implement this method to release any resources / deregister any listeners they have
            // attached. An example of this might be deregistering a resize event from the window object.
            this.foundation_.destroy();
        };
        MDCComponent.prototype.listen = function (evtType, handler, options) {
            this.root_.addEventListener(evtType, handler, options);
        };
        MDCComponent.prototype.unlisten = function (evtType, handler, options) {
            this.root_.removeEventListener(evtType, handler, options);
        };
        /**
         * Fires a cross-browser-compatible custom event from the component root of the given type, with the given data.
         */
        MDCComponent.prototype.emit = function (evtType, evtData, shouldBubble) {
            if (shouldBubble === void 0) { shouldBubble = false; }
            var evt;
            if (typeof CustomEvent === 'function') {
                evt = new CustomEvent(evtType, {
                    bubbles: shouldBubble,
                    detail: evtData,
                });
            }
            else {
                evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(evtType, shouldBubble, false, evtData);
            }
            this.root_.dispatchEvent(evt);
        };
        return MDCComponent;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches$1(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches$1(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        ROOT: 'mdc-list',
    };
    var strings = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"]:not(:disabled), input[type="radio"]:not(:disabled)',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]:not(:disabled)',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses.LIST_ITEM_CLASS + " a\n  ",
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses.LIST_ITEM_CLASS + " a,\n    ." + cssClasses.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]:not(:disabled)',
    };
    var numbers = {
        UNSET_INDEX: -1,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    function isNumberArray(selectedIndex) {
        return selectedIndex instanceof Array;
    }
    var MDCListFoundation = /** @class */ (function (_super) {
        __extends(MDCListFoundation, _super);
        function MDCListFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCListFoundation.defaultAdapter, adapter)) || this;
            _this.wrapFocus_ = false;
            _this.isVertical_ = true;
            _this.isSingleSelectionList_ = false;
            _this.selectedIndex_ = numbers.UNSET_INDEX;
            _this.focusedItemIndex_ = numbers.UNSET_INDEX;
            _this.useActivatedClass_ = false;
            _this.ariaCurrentAttrValue_ = null;
            _this.isCheckboxList_ = false;
            _this.isRadioList_ = false;
            return _this;
        }
        Object.defineProperty(MDCListFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassForElementIndex: function () { return undefined; },
                    focusItemAtIndex: function () { return undefined; },
                    getAttributeForElementIndex: function () { return null; },
                    getFocusedElementIndex: function () { return 0; },
                    getListItemCount: function () { return 0; },
                    hasCheckboxAtIndex: function () { return false; },
                    hasRadioAtIndex: function () { return false; },
                    isCheckboxCheckedAtIndex: function () { return false; },
                    isFocusInsideList: function () { return false; },
                    isRootFocused: function () { return false; },
                    notifyAction: function () { return undefined; },
                    removeClassForElementIndex: function () { return undefined; },
                    setAttributeForElementIndex: function () { return undefined; },
                    setCheckedCheckboxOrRadioAtIndex: function () { return undefined; },
                    setTabIndexForListItemChildren: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCListFoundation.prototype.layout = function () {
            if (this.adapter_.getListItemCount() === 0) {
                return;
            }
            if (this.adapter_.hasCheckboxAtIndex(0)) {
                this.isCheckboxList_ = true;
            }
            else if (this.adapter_.hasRadioAtIndex(0)) {
                this.isRadioList_ = true;
            }
        };
        /**
         * Sets the private wrapFocus_ variable.
         */
        MDCListFoundation.prototype.setWrapFocus = function (value) {
            this.wrapFocus_ = value;
        };
        /**
         * Sets the isVertical_ private variable.
         */
        MDCListFoundation.prototype.setVerticalOrientation = function (value) {
            this.isVertical_ = value;
        };
        /**
         * Sets the isSingleSelectionList_ private variable.
         */
        MDCListFoundation.prototype.setSingleSelection = function (value) {
            this.isSingleSelectionList_ = value;
        };
        /**
         * Sets the useActivatedClass_ private variable.
         */
        MDCListFoundation.prototype.setUseActivatedClass = function (useActivated) {
            this.useActivatedClass_ = useActivated;
        };
        MDCListFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex_;
        };
        MDCListFoundation.prototype.setSelectedIndex = function (index) {
            if (!this.isIndexValid_(index)) {
                return;
            }
            if (this.isCheckboxList_) {
                this.setCheckboxAtIndex_(index);
            }
            else if (this.isRadioList_) {
                this.setRadioAtIndex_(index);
            }
            else {
                this.setSingleSelectionAtIndex_(index);
            }
        };
        /**
         * Focus in handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusIn = function (_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '0');
            }
        };
        /**
         * Focus out handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusOut = function (_, listItemIndex) {
            var _this = this;
            if (listItemIndex >= 0) {
                this.adapter_.setTabIndexForListItemChildren(listItemIndex, '-1');
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any element. Setting a delay to wait till the focus
             * is moved to next element.
             */
            setTimeout(function () {
                if (!_this.adapter_.isFocusInsideList()) {
                    _this.setTabindexToFirstSelectedItem_();
                }
            }, 0);
        };
        /**
         * Key handler for the list.
         */
        MDCListFoundation.prototype.handleKeydown = function (evt, isRootListItem, listItemIndex) {
            var isArrowLeft = evt.key === 'ArrowLeft' || evt.keyCode === 37;
            var isArrowUp = evt.key === 'ArrowUp' || evt.keyCode === 38;
            var isArrowRight = evt.key === 'ArrowRight' || evt.keyCode === 39;
            var isArrowDown = evt.key === 'ArrowDown' || evt.keyCode === 40;
            var isHome = evt.key === 'Home' || evt.keyCode === 36;
            var isEnd = evt.key === 'End' || evt.keyCode === 35;
            var isEnter = evt.key === 'Enter' || evt.keyCode === 13;
            var isSpace = evt.key === 'Space' || evt.keyCode === 32;
            if (this.adapter_.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    evt.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    evt.preventDefault();
                    this.focusFirstElement();
                }
                return;
            }
            var currentIndex = this.adapter_.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            var nextIndex;
            if ((this.isVertical_ && isArrowDown) || (!this.isVertical_ && isArrowRight)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusFirstElement();
            }
            else if (isEnd) {
                this.preventDefaultEvent_(evt);
                nextIndex = this.focusLastElement();
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers synthetic MouseEvent event.
                    var target = evt.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    this.preventDefaultEvent_(evt);
                    if (this.isSelectableList_()) {
                        this.setSelectedIndexOnAction_(currentIndex);
                    }
                    this.adapter_.notifyAction(currentIndex);
                }
            }
            this.focusedItemIndex_ = currentIndex;
            if (nextIndex !== undefined) {
                this.setTabindexAtIndex_(nextIndex);
                this.focusedItemIndex_ = nextIndex;
            }
        };
        /**
         * Click handler for the list.
         */
        MDCListFoundation.prototype.handleClick = function (index, toggleCheckbox) {
            if (index === numbers.UNSET_INDEX) {
                return;
            }
            if (this.isSelectableList_()) {
                this.setSelectedIndexOnAction_(index, toggleCheckbox);
            }
            this.adapter_.notifyAction(index);
            this.setTabindexAtIndex_(index);
            this.focusedItemIndex_ = index;
        };
        /**
         * Focuses the next element on the list.
         */
        MDCListFoundation.prototype.focusNextElement = function (index) {
            var count = this.adapter_.getListItemCount();
            var nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus_) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(nextIndex);
            return nextIndex;
        };
        /**
         * Focuses the previous element on the list.
         */
        MDCListFoundation.prototype.focusPrevElement = function (index) {
            var prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus_) {
                    prevIndex = this.adapter_.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.adapter_.focusItemAtIndex(prevIndex);
            return prevIndex;
        };
        MDCListFoundation.prototype.focusFirstElement = function () {
            this.adapter_.focusItemAtIndex(0);
            return 0;
        };
        MDCListFoundation.prototype.focusLastElement = function () {
            var lastIndex = this.adapter_.getListItemCount() - 1;
            this.adapter_.focusItemAtIndex(lastIndex);
            return lastIndex;
        };
        /**
         * Ensures that preventDefault is only called if the containing element doesn't
         * consume the event, and it will cause an unintended scroll.
         */
        MDCListFoundation.prototype.preventDefaultEvent_ = function (evt) {
            var target = evt.target;
            var tagName = ("" + target.tagName).toLowerCase();
            if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
                evt.preventDefault();
            }
        };
        MDCListFoundation.prototype.setSingleSelectionAtIndex_ = function (index) {
            if (this.selectedIndex_ === index) {
                return;
            }
            var selectedClassName = cssClasses.LIST_ITEM_SELECTED_CLASS;
            if (this.useActivatedClass_) {
                selectedClassName = cssClasses.LIST_ITEM_ACTIVATED_CLASS;
            }
            if (this.selectedIndex_ !== numbers.UNSET_INDEX) {
                this.adapter_.removeClassForElementIndex(this.selectedIndex_, selectedClassName);
            }
            this.adapter_.addClassForElementIndex(index, selectedClassName);
            this.setAriaForSingleSelectionAtIndex_(index);
            this.selectedIndex_ = index;
        };
        /**
         * Sets aria attribute for single selection at given index.
         */
        MDCListFoundation.prototype.setAriaForSingleSelectionAtIndex_ = function (index) {
            // Detect the presence of aria-current and get the value only during list initialization when it is in unset state.
            if (this.selectedIndex_ === numbers.UNSET_INDEX) {
                this.ariaCurrentAttrValue_ =
                    this.adapter_.getAttributeForElementIndex(index, strings.ARIA_CURRENT);
            }
            var isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
            var ariaAttribute = isAriaCurrent ? strings.ARIA_CURRENT : strings.ARIA_SELECTED;
            if (this.selectedIndex_ !== numbers.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
            }
            var ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
            this.adapter_.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
        };
        /**
         * Toggles radio at give index. Radio doesn't change the checked state if it is already checked.
         */
        MDCListFoundation.prototype.setRadioAtIndex_ = function (index) {
            this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, true);
            if (this.selectedIndex_ !== numbers.UNSET_INDEX) {
                this.adapter_.setAttributeForElementIndex(this.selectedIndex_, strings.ARIA_CHECKED, 'false');
            }
            this.adapter_.setAttributeForElementIndex(index, strings.ARIA_CHECKED, 'true');
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setCheckboxAtIndex_ = function (index) {
            for (var i = 0; i < this.adapter_.getListItemCount(); i++) {
                var isChecked = false;
                if (index.indexOf(i) >= 0) {
                    isChecked = true;
                }
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(i, isChecked);
                this.adapter_.setAttributeForElementIndex(i, strings.ARIA_CHECKED, isChecked ? 'true' : 'false');
            }
            this.selectedIndex_ = index;
        };
        MDCListFoundation.prototype.setTabindexAtIndex_ = function (index) {
            if (this.focusedItemIndex_ === numbers.UNSET_INDEX && index !== 0) {
                // If no list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no preselected items.
                this.adapter_.setAttributeForElementIndex(0, 'tabindex', '-1');
            }
            else if (this.focusedItemIndex_ >= 0 && this.focusedItemIndex_ !== index) {
                this.adapter_.setAttributeForElementIndex(this.focusedItemIndex_, 'tabindex', '-1');
            }
            this.adapter_.setAttributeForElementIndex(index, 'tabindex', '0');
        };
        /**
         * @return Return true if it is single selectin list, checkbox list or radio list.
         */
        MDCListFoundation.prototype.isSelectableList_ = function () {
            return this.isSingleSelectionList_ || this.isCheckboxList_ || this.isRadioList_;
        };
        MDCListFoundation.prototype.setTabindexToFirstSelectedItem_ = function () {
            var targetIndex = 0;
            if (this.isSelectableList_()) {
                if (typeof this.selectedIndex_ === 'number' && this.selectedIndex_ !== numbers.UNSET_INDEX) {
                    targetIndex = this.selectedIndex_;
                }
                else if (isNumberArray(this.selectedIndex_) && this.selectedIndex_.length > 0) {
                    targetIndex = this.selectedIndex_.reduce(function (currentIndex, minIndex) { return Math.min(currentIndex, minIndex); });
                }
            }
            this.setTabindexAtIndex_(targetIndex);
        };
        MDCListFoundation.prototype.isIndexValid_ = function (index) {
            var _this = this;
            if (index instanceof Array) {
                if (!this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.length === 0) {
                    return true;
                }
                else {
                    return index.some(function (i) { return _this.isIndexInRange_(i); });
                }
            }
            else if (typeof index === 'number') {
                if (this.isCheckboxList_) {
                    throw new Error('MDCListFoundation: Expected array of index for checkbox based list but got number: ' + index);
                }
                return this.isIndexInRange_(index);
            }
            else {
                return false;
            }
        };
        MDCListFoundation.prototype.isIndexInRange_ = function (index) {
            var listSize = this.adapter_.getListItemCount();
            return index >= 0 && index < listSize;
        };
        MDCListFoundation.prototype.setSelectedIndexOnAction_ = function (index, toggleCheckbox) {
            if (toggleCheckbox === void 0) { toggleCheckbox = true; }
            if (this.isCheckboxList_) {
                this.toggleCheckboxAtIndex_(index, toggleCheckbox);
            }
            else {
                this.setSelectedIndex(index);
            }
        };
        MDCListFoundation.prototype.toggleCheckboxAtIndex_ = function (index, toggleCheckbox) {
            var isChecked = this.adapter_.isCheckboxCheckedAtIndex(index);
            if (toggleCheckbox) {
                isChecked = !isChecked;
                this.adapter_.setCheckedCheckboxOrRadioAtIndex(index, isChecked);
            }
            this.adapter_.setAttributeForElementIndex(index, strings.ARIA_CHECKED, isChecked ? 'true' : 'false');
            // If none of the checkbox items are selected and selectedIndex is not initialized then provide a default value.
            var selectedIndexes = this.selectedIndex_ === numbers.UNSET_INDEX ? [] : this.selectedIndex_.slice();
            if (isChecked) {
                selectedIndexes.push(index);
            }
            else {
                selectedIndexes = selectedIndexes.filter(function (i) { return i !== index; });
            }
            this.selectedIndex_ = selectedIndexes;
        };
        return MDCListFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCList = /** @class */ (function (_super) {
        __extends(MDCList, _super);
        function MDCList() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(MDCList.prototype, "vertical", {
            set: function (value) {
                this.foundation_.setVerticalOrientation(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "listElements", {
            get: function () {
                return [].slice.call(this.root_.querySelectorAll("." + cssClasses.LIST_ITEM_CLASS));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "wrapFocus", {
            set: function (value) {
                this.foundation_.setWrapFocus(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "singleSelection", {
            set: function (isSingleSelectionList) {
                this.foundation_.setSingleSelection(isSingleSelectionList);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCList.prototype, "selectedIndex", {
            get: function () {
                return this.foundation_.getSelectedIndex();
            },
            set: function (index) {
                this.foundation_.setSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        MDCList.attachTo = function (root) {
            return new MDCList(root);
        };
        MDCList.prototype.initialSyncWithDOM = function () {
            this.handleClick_ = this.handleClickEvent_.bind(this);
            this.handleKeydown_ = this.handleKeydownEvent_.bind(this);
            this.focusInEventListener_ = this.handleFocusInEvent_.bind(this);
            this.focusOutEventListener_ = this.handleFocusOutEvent_.bind(this);
            this.listen('keydown', this.handleKeydown_);
            this.listen('click', this.handleClick_);
            this.listen('focusin', this.focusInEventListener_);
            this.listen('focusout', this.focusOutEventListener_);
            this.layout();
            this.initializeListType();
        };
        MDCList.prototype.destroy = function () {
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten('click', this.handleClick_);
            this.unlisten('focusin', this.focusInEventListener_);
            this.unlisten('focusout', this.focusOutEventListener_);
        };
        MDCList.prototype.layout = function () {
            var direction = this.root_.getAttribute(strings.ARIA_ORIENTATION);
            this.vertical = direction !== strings.ARIA_ORIENTATION_HORIZONTAL;
            // List items need to have at least tabindex=-1 to be focusable.
            [].slice.call(this.root_.querySelectorAll('.mdc-list-item:not([tabindex])'))
                .forEach(function (el) {
                el.setAttribute('tabindex', '-1');
            });
            // Child button/a elements are not tabbable until the list item is focused.
            [].slice.call(this.root_.querySelectorAll(strings.FOCUSABLE_CHILD_ELEMENTS))
                .forEach(function (el) { return el.setAttribute('tabindex', '-1'); });
            this.foundation_.layout();
        };
        /**
         * Initialize selectedIndex value based on pre-selected checkbox list items, single selection or radio.
         */
        MDCList.prototype.initializeListType = function () {
            var _this = this;
            var checkboxListItems = this.root_.querySelectorAll(strings.ARIA_ROLE_CHECKBOX_SELECTOR);
            var singleSelectedListItem = this.root_.querySelector("\n      ." + cssClasses.LIST_ITEM_ACTIVATED_CLASS + ",\n      ." + cssClasses.LIST_ITEM_SELECTED_CLASS + "\n    ");
            var radioSelectedListItem = this.root_.querySelector(strings.ARIA_CHECKED_RADIO_SELECTOR);
            if (checkboxListItems.length) {
                var preselectedItems = this.root_.querySelectorAll(strings.ARIA_CHECKED_CHECKBOX_SELECTOR);
                this.selectedIndex =
                    [].map.call(preselectedItems, function (listItem) { return _this.listElements.indexOf(listItem); });
            }
            else if (singleSelectedListItem) {
                if (singleSelectedListItem.classList.contains(cssClasses.LIST_ITEM_ACTIVATED_CLASS)) {
                    this.foundation_.setUseActivatedClass(true);
                }
                this.singleSelection = true;
                this.selectedIndex = this.listElements.indexOf(singleSelectedListItem);
            }
            else if (radioSelectedListItem) {
                this.selectedIndex = this.listElements.indexOf(radioSelectedListItem);
            }
        };
        MDCList.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.add(className);
                    }
                },
                focusItemAtIndex: function (index) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.focus();
                    }
                },
                getAttributeForElementIndex: function (index, attr) { return _this.listElements[index].getAttribute(attr); },
                getFocusedElementIndex: function () { return _this.listElements.indexOf(document.activeElement); },
                getListItemCount: function () { return _this.listElements.length; },
                hasCheckboxAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings.CHECKBOX_SELECTOR);
                },
                hasRadioAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    return !!listItem.querySelector(strings.RADIO_SELECTOR);
                },
                isCheckboxCheckedAtIndex: function (index) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings.CHECKBOX_SELECTOR);
                    return toggleEl.checked;
                },
                isFocusInsideList: function () {
                    return _this.root_.contains(document.activeElement);
                },
                isRootFocused: function () { return document.activeElement === _this.root_; },
                notifyAction: function (index) {
                    _this.emit(strings.ACTION_EVENT, { index: index }, /** shouldBubble */ true);
                },
                removeClassForElementIndex: function (index, className) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.classList.remove(className);
                    }
                },
                setAttributeForElementIndex: function (index, attr, value) {
                    var element = _this.listElements[index];
                    if (element) {
                        element.setAttribute(attr, value);
                    }
                },
                setCheckedCheckboxOrRadioAtIndex: function (index, isChecked) {
                    var listItem = _this.listElements[index];
                    var toggleEl = listItem.querySelector(strings.CHECKBOX_RADIO_SELECTOR);
                    toggleEl.checked = isChecked;
                    var event = document.createEvent('Event');
                    event.initEvent('change', true, true);
                    toggleEl.dispatchEvent(event);
                },
                setTabIndexForListItemChildren: function (listItemIndex, tabIndexValue) {
                    var element = _this.listElements[listItemIndex];
                    var listItemChildren = [].slice.call(element.querySelectorAll(strings.CHILD_ELEMENTS_TO_TOGGLE_TABINDEX));
                    listItemChildren.forEach(function (el) { return el.setAttribute('tabindex', tabIndexValue); });
                },
            };
            return new MDCListFoundation(adapter);
        };
        /**
         * Used to figure out which list item this event is targetting. Or returns -1 if
         * there is no list item
         */
        MDCList.prototype.getListItemIndex_ = function (evt) {
            var eventTarget = evt.target;
            var nearestParent = closest(eventTarget, "." + cssClasses.LIST_ITEM_CLASS + ", ." + cssClasses.ROOT);
            // Get the index of the element if it is a list item.
            if (nearestParent && matches$1(nearestParent, "." + cssClasses.LIST_ITEM_CLASS)) {
                return this.listElements.indexOf(nearestParent);
            }
            return -1;
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusInEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusIn(evt, index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleFocusOutEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            this.foundation_.handleFocusOut(evt, index);
        };
        /**
         * Used to figure out which element was focused when keydown event occurred before sending the event to the
         * foundation.
         */
        MDCList.prototype.handleKeydownEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            this.foundation_.handleKeydown(evt, target.classList.contains(cssClasses.LIST_ITEM_CLASS), index);
        };
        /**
         * Used to figure out which element was clicked before sending the event to the foundation.
         */
        MDCList.prototype.handleClickEvent_ = function (evt) {
            var index = this.getListItemIndex_(evt);
            var target = evt.target;
            // Toggle the checkbox only if it's not the target of the event, or the checkbox will have 2 change events.
            var toggleCheckbox = !matches$1(target, strings.CHECKBOX_RADIO_SELECTOR);
            this.foundation_.handleClick(index, toggleCheckbox);
        };
        return MDCList;
    }(MDCComponent));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        ANIMATE: 'mdc-drawer--animate',
        CLOSING: 'mdc-drawer--closing',
        DISMISSIBLE: 'mdc-drawer--dismissible',
        MODAL: 'mdc-drawer--modal',
        OPEN: 'mdc-drawer--open',
        OPENING: 'mdc-drawer--opening',
        ROOT: 'mdc-drawer',
    };
    var strings$1 = {
        APP_CONTENT_SELECTOR: '.mdc-drawer-app-content',
        CLOSE_EVENT: 'MDCDrawer:closed',
        OPEN_EVENT: 'MDCDrawer:opened',
        SCRIM_SELECTOR: '.mdc-drawer-scrim',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCDismissibleDrawerFoundation = /** @class */ (function (_super) {
        __extends(MDCDismissibleDrawerFoundation, _super);
        function MDCDismissibleDrawerFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCDismissibleDrawerFoundation.defaultAdapter, adapter)) || this;
            _this.animationFrame_ = 0;
            _this.animationTimer_ = 0;
            return _this;
        }
        Object.defineProperty(MDCDismissibleDrawerFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCDismissibleDrawerFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCDismissibleDrawerFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    elementHasClass: function () { return false; },
                    notifyClose: function () { return undefined; },
                    notifyOpen: function () { return undefined; },
                    saveFocus: function () { return undefined; },
                    restoreFocus: function () { return undefined; },
                    focusActiveNavigationItem: function () { return undefined; },
                    trapFocus: function () { return undefined; },
                    releaseFocus: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCDismissibleDrawerFoundation.prototype.destroy = function () {
            if (this.animationFrame_) {
                cancelAnimationFrame(this.animationFrame_);
            }
            if (this.animationTimer_) {
                clearTimeout(this.animationTimer_);
            }
        };
        /**
         * Opens the drawer from the closed state.
         */
        MDCDismissibleDrawerFoundation.prototype.open = function () {
            var _this = this;
            if (this.isOpen() || this.isOpening() || this.isClosing()) {
                return;
            }
            this.adapter_.addClass(cssClasses$1.OPEN);
            this.adapter_.addClass(cssClasses$1.ANIMATE);
            // Wait a frame once display is no longer "none", to establish basis for animation
            this.runNextAnimationFrame_(function () {
                _this.adapter_.addClass(cssClasses$1.OPENING);
            });
            this.adapter_.saveFocus();
        };
        /**
         * Closes the drawer from the open state.
         */
        MDCDismissibleDrawerFoundation.prototype.close = function () {
            if (!this.isOpen() || this.isOpening() || this.isClosing()) {
                return;
            }
            this.adapter_.addClass(cssClasses$1.CLOSING);
        };
        /**
         * Returns true if the drawer is in the open position.
         * @return true if drawer is in open state.
         */
        MDCDismissibleDrawerFoundation.prototype.isOpen = function () {
            return this.adapter_.hasClass(cssClasses$1.OPEN);
        };
        /**
         * Returns true if the drawer is animating open.
         * @return true if drawer is animating open.
         */
        MDCDismissibleDrawerFoundation.prototype.isOpening = function () {
            return this.adapter_.hasClass(cssClasses$1.OPENING) || this.adapter_.hasClass(cssClasses$1.ANIMATE);
        };
        /**
         * Returns true if the drawer is animating closed.
         * @return true if drawer is animating closed.
         */
        MDCDismissibleDrawerFoundation.prototype.isClosing = function () {
            return this.adapter_.hasClass(cssClasses$1.CLOSING);
        };
        /**
         * Keydown handler to close drawer when key is escape.
         */
        MDCDismissibleDrawerFoundation.prototype.handleKeydown = function (evt) {
            var keyCode = evt.keyCode, key = evt.key;
            var isEscape = key === 'Escape' || keyCode === 27;
            if (isEscape) {
                this.close();
            }
        };
        /**
         * Handles the `transitionend` event when the drawer finishes opening/closing.
         */
        MDCDismissibleDrawerFoundation.prototype.handleTransitionEnd = function (evt) {
            var OPENING = cssClasses$1.OPENING, CLOSING = cssClasses$1.CLOSING, OPEN = cssClasses$1.OPEN, ANIMATE = cssClasses$1.ANIMATE, ROOT = cssClasses$1.ROOT;
            // In Edge, transitionend on ripple pseudo-elements yields a target without classList, so check for Element first.
            var isRootElement = this.isElement_(evt.target) && this.adapter_.elementHasClass(evt.target, ROOT);
            if (!isRootElement) {
                return;
            }
            if (this.isClosing()) {
                this.adapter_.removeClass(OPEN);
                this.closed_();
                this.adapter_.restoreFocus();
                this.adapter_.notifyClose();
            }
            else {
                this.adapter_.focusActiveNavigationItem();
                this.opened_();
                this.adapter_.notifyOpen();
            }
            this.adapter_.removeClass(ANIMATE);
            this.adapter_.removeClass(OPENING);
            this.adapter_.removeClass(CLOSING);
        };
        /**
         * Extension point for when drawer finishes open animation.
         */
        MDCDismissibleDrawerFoundation.prototype.opened_ = function () { }; // tslint:disable-line:no-empty
        /**
         * Extension point for when drawer finishes close animation.
         */
        MDCDismissibleDrawerFoundation.prototype.closed_ = function () { }; // tslint:disable-line:no-empty
        /**
         * Runs the given logic on the next animation frame, using setTimeout to factor in Firefox reflow behavior.
         */
        MDCDismissibleDrawerFoundation.prototype.runNextAnimationFrame_ = function (callback) {
            var _this = this;
            cancelAnimationFrame(this.animationFrame_);
            this.animationFrame_ = requestAnimationFrame(function () {
                _this.animationFrame_ = 0;
                clearTimeout(_this.animationTimer_);
                _this.animationTimer_ = setTimeout(callback, 0);
            });
        };
        MDCDismissibleDrawerFoundation.prototype.isElement_ = function (element) {
            // In Edge, transitionend on ripple pseudo-elements yields a target without classList.
            return Boolean(element.classList);
        };
        return MDCDismissibleDrawerFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCModalDrawerFoundation = /** @class */ (function (_super) {
        __extends(MDCModalDrawerFoundation, _super);
        function MDCModalDrawerFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Handles click event on scrim.
         */
        MDCModalDrawerFoundation.prototype.handleScrimClick = function () {
            this.close();
        };
        /**
         * Called when drawer finishes open animation.
         */
        MDCModalDrawerFoundation.prototype.opened_ = function () {
            this.adapter_.trapFocus();
        };
        /**
         * Called when drawer finishes close animation.
         */
        MDCModalDrawerFoundation.prototype.closed_ = function () {
            this.adapter_.releaseFocus();
        };
        return MDCModalDrawerFoundation;
    }(MDCDismissibleDrawerFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = MDCDismissibleDrawerFoundation.cssClasses, strings$2 = MDCDismissibleDrawerFoundation.strings;
    /**
     * @events `MDCDrawer:closed {}` Emits when the navigation drawer has closed.
     * @events `MDCDrawer:opened {}` Emits when the navigation drawer has opened.
     */
    var MDCDrawer = /** @class */ (function (_super) {
        __extends(MDCDrawer, _super);
        function MDCDrawer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCDrawer.attachTo = function (root) {
            return new MDCDrawer(root);
        };
        Object.defineProperty(MDCDrawer.prototype, "open", {
            /**
             * @return boolean Proxies to the foundation's `open`/`close` methods.
             * Also returns true if drawer is in the open position.
             */
            get: function () {
                return this.foundation_.isOpen();
            },
            /**
             * Toggles the drawer open and closed.
             */
            set: function (isOpen) {
                if (isOpen) {
                    this.foundation_.open();
                }
                else {
                    this.foundation_.close();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCDrawer.prototype, "list", {
            get: function () {
                return this.list_;
            },
            enumerable: true,
            configurable: true
        });
        MDCDrawer.prototype.initialize = function (focusTrapFactory, listFactory) {
            if (focusTrapFactory === void 0) { focusTrapFactory = focusTrap_1; }
            if (listFactory === void 0) { listFactory = function (el) { return new MDCList(el); }; }
            var listEl = this.root_.querySelector("." + MDCListFoundation.cssClasses.ROOT);
            if (listEl) {
                this.list_ = listFactory(listEl);
                this.list_.wrapFocus = true;
            }
            this.focusTrapFactory_ = focusTrapFactory;
        };
        MDCDrawer.prototype.initialSyncWithDOM = function () {
            var _this = this;
            var MODAL = cssClasses$2.MODAL;
            var SCRIM_SELECTOR = strings$2.SCRIM_SELECTOR;
            this.scrim_ = this.root_.parentNode.querySelector(SCRIM_SELECTOR);
            if (this.scrim_ && this.root_.classList.contains(MODAL)) {
                this.handleScrimClick_ = function () { return _this.foundation_.handleScrimClick(); };
                this.scrim_.addEventListener('click', this.handleScrimClick_);
                this.focusTrap_ = createFocusTrapInstance(this.root_, this.focusTrapFactory_);
            }
            this.handleKeydown_ = function (evt) { return _this.foundation_.handleKeydown(evt); };
            this.handleTransitionEnd_ = function (evt) { return _this.foundation_.handleTransitionEnd(evt); };
            this.listen('keydown', this.handleKeydown_);
            this.listen('transitionend', this.handleTransitionEnd_);
        };
        MDCDrawer.prototype.destroy = function () {
            this.unlisten('keydown', this.handleKeydown_);
            this.unlisten('transitionend', this.handleTransitionEnd_);
            if (this.list_) {
                this.list_.destroy();
            }
            var MODAL = cssClasses$2.MODAL;
            if (this.scrim_ && this.handleScrimClick_ && this.root_.classList.contains(MODAL)) {
                this.scrim_.removeEventListener('click', this.handleScrimClick_);
                // Ensure drawer is closed to hide scrim and release focus
                this.open = false;
            }
        };
        MDCDrawer.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                elementHasClass: function (element, className) { return element.classList.contains(className); },
                saveFocus: function () { return _this.previousFocus_ = document.activeElement; },
                restoreFocus: function () {
                    var previousFocus = _this.previousFocus_;
                    if (previousFocus && previousFocus.focus && _this.root_.contains(document.activeElement)) {
                        previousFocus.focus();
                    }
                },
                focusActiveNavigationItem: function () {
                    var activeNavItemEl = _this.root_.querySelector("." + MDCListFoundation.cssClasses.LIST_ITEM_ACTIVATED_CLASS);
                    if (activeNavItemEl) {
                        activeNavItemEl.focus();
                    }
                },
                notifyClose: function () { return _this.emit(strings$2.CLOSE_EVENT, {}, true /* shouldBubble */); },
                notifyOpen: function () { return _this.emit(strings$2.OPEN_EVENT, {}, true /* shouldBubble */); },
                trapFocus: function () { return _this.focusTrap_.activate(); },
                releaseFocus: function () { return _this.focusTrap_.deactivate(); },
            };
            // tslint:enable:object-literal-sort-keys
            var DISMISSIBLE = cssClasses$2.DISMISSIBLE, MODAL = cssClasses$2.MODAL;
            if (this.root_.classList.contains(DISMISSIBLE)) {
                return new MDCDismissibleDrawerFoundation(adapter);
            }
            else if (this.root_.classList.contains(MODAL)) {
                return new MDCModalDrawerFoundation(adapter);
            }
            else {
                throw new Error("MDCDrawer: Failed to instantiate component. Supported variants are " + DISMISSIBLE + " and " + MODAL + ".");
            }
        };
        return MDCDrawer;
    }(MDCComponent));

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    function exclude(obj, keys) {
      let names = Object.getOwnPropertyNames(obj);
      const newObj = {};

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const cashIndex = name.indexOf('$');
        if (cashIndex !== -1 && keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
          continue;
        }
        if (keys.indexOf(name) !== -1) {
          continue;
        }
        newObj[name] = obj[name];
      }

      return newObj;
    }

    function useActions(node, actions) {
      let objects = [];

      if (actions) {
        for (let i = 0; i < actions.length; i++) {
          const isArray = Array.isArray(actions[i]);
          const action = isArray ? actions[i][0] : actions[i];
          if (isArray && actions[i].length > 1) {
            objects.push(action(node, actions[i][1]));
          } else {
            objects.push(action(node));
          }
        }
      }

      return {
        update(actions) {
          if ((actions && actions.length || 0) != objects.length) {
            throw new Error('You must not change the length of an actions array.');
          }

          if (actions) {
            for (let i = 0; i < actions.length; i++) {
              if (objects[i] && 'update' in objects[i]) {
                const isArray = Array.isArray(actions[i]);
                if (isArray && actions[i].length > 1) {
                  objects[i].update(actions[i][1]);
                } else {
                  objects[i].update();
                }
              }
            }
          }
        },

        destroy() {
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] && 'destroy' in objects[i]) {
              objects[i].destroy();
            }
          }
        }
      }
    }

    /* node_modules/@smui/drawer/Drawer.svelte generated by Svelte v3.9.2 */

    const file = "node_modules/@smui/drawer/Drawer.svelte";

    function create_fragment(ctx) {
    	var aside, useActions_action, forwardEvents_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var aside_levels = [
    		{ class: "mdc-drawer " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'variant', 'open'])
    	];

    	var aside_data = {};
    	for (var i = 0; i < aside_levels.length; i += 1) {
    		aside_data = assign(aside_data, aside_levels[i]);
    	}

    	return {
    		c: function create() {
    			aside = element("aside");

    			if (default_slot) default_slot.c();

    			set_attributes(aside, aside_data);
    			toggle_class(aside, "mdc-drawer--dismissible", ctx.variant === 'dismissible');
    			toggle_class(aside, "mdc-drawer--modal", ctx.variant === 'modal');
    			add_location(aside, file, 0, 0, 0);

    			dispose = [
    				listen(aside, "MDCDrawer:opened", ctx.updateOpen),
    				listen(aside, "MDCDrawer:closed", ctx.updateOpen)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(aside_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, aside, anchor);

    			if (default_slot) {
    				default_slot.m(aside, null);
    			}

    			ctx.aside_binding(aside);
    			useActions_action = useActions.call(null, aside, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, aside) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(aside, get_spread_update(aside_levels, [
    				(changed.className) && { class: "mdc-drawer " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'variant', 'open'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(aside, "mdc-drawer--dismissible", ctx.variant === 'dismissible');
    				toggle_class(aside, "mdc-drawer--modal", ctx.variant === 'modal');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(aside);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.aside_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component, ['MDCDrawer:opened', 'MDCDrawer:closed']);

      let { use = [], class: className = '', variant = null, open = false } = $$props;

      let element;
      let drawer;
      let listPromiseResolve;
      let listPromise = new Promise(resolve => { const $$result = listPromiseResolve = resolve; return $$result; });

      setContext('SMUI:list:nav', true);
      setContext('SMUI:list:item:nav', true);

      if (variant === 'dismissible' || variant === 'modal') {
        setContext('SMUI:list:instantiate', false);
        setContext('SMUI:list:getInstance', getListInstancePromise);
      }

      onMount(() => {
        if (variant === 'dismissible' || variant === 'modal') {
          $$invalidate('drawer', drawer = new MDCDrawer(element));
          listPromiseResolve(drawer.list_);
        }
      });

      onDestroy(() => {
        if (drawer) {
          drawer.destroy();
        }
      });

      afterUpdate(() => {
        if (drawer && !(variant === 'dismissible' || variant === 'modal')) {
          drawer.destroy();
          $$invalidate('drawer', drawer = undefined);
        } else if (!drawer && (variant === 'dismissible' || variant === 'modal')) {
          $$invalidate('drawer', drawer = new MDCDrawer(element));
          listPromiseResolve(drawer.list_);
        }
      });

      function getListInstancePromise() {
        return listPromise;
      }

      function updateOpen() {
        $$invalidate('open', open = drawer.open);
      }

      function setOpen(value) {
        $$invalidate('open', open = value);
      }

    	let { $$slots = {}, $$scope } = $$props;

    	function aside_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('variant' in $$new_props) $$invalidate('variant', variant = $$new_props.variant);
    		if ('open' in $$new_props) $$invalidate('open', open = $$new_props.open);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { drawer: 1, open: 1 }) => {
    		if ($$dirty.drawer || $$dirty.open) { if (drawer && drawer.open !== open) {
            drawer.open = open; $$invalidate('drawer', drawer), $$invalidate('open', open);
          } }
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		variant,
    		open,
    		element,
    		updateOpen,
    		setOpen,
    		$$props,
    		aside_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Drawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["use", "class", "variant", "open", "setOpen"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.setOpen === undefined && !('setOpen' in props)) {
    			console.warn("<Drawer> was created without expected prop 'setOpen'");
    		}
    	}

    	get use() {
    		throw new Error("<Drawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Drawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Drawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Drawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx.setOpen;
    	}

    	set setOpen(value) {
    		throw new Error("<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/ClassAdder.svelte generated by Svelte v3.9.2 */

    // (1:0) <svelte:component   this={component}   use={[forwardEvents, ...use]}   class="{smuiClass} {className}"   {...exclude($$props, ['use', 'class', 'component', 'forwardEvents'])} >
    function create_default_slot(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		{ use: [ctx.forwardEvents, ...ctx.use] },
    		{ class: "" + ctx.smuiClass + " " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'component', 'forwardEvents'])
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot] },
    			$$scope: { ctx }
    		};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.forwardEvents || changed.use || changed.smuiClass || changed.className || changed.exclude || changed.$$props) ? get_spread_update(switch_instance_spread_levels, [
    									(changed.forwardEvents || changed.use) && { use: [ctx.forwardEvents, ...ctx.use] },
    			(changed.smuiClass || changed.className) && { class: "" + ctx.smuiClass + " " + ctx.className },
    			(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'component', 'forwardEvents'])
    								]) : {};
    			if (changed.$$scope) switch_instance_changes.$$scope = { changed, ctx };

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    let internals = {
      component: null,
      smuiClass: null,
      contexts: {}
    };

    function instance$1($$self, $$props, $$invalidate) {
    	

      let { use = [], class: className = '', component = internals.component, forwardEvents: smuiForwardEvents = [] } = $$props;

      const smuiClass = internals.class;
      const contexts = internals.contexts;

      const forwardEvents = forwardEventsBuilder(current_component, smuiForwardEvents);

      for (let context in contexts) {
        if (contexts.hasOwnProperty(context)) {
          setContext(context, contexts[context]);
        }
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('forwardEvents' in $$new_props) $$invalidate('smuiForwardEvents', smuiForwardEvents = $$new_props.forwardEvents);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		use,
    		className,
    		component,
    		smuiForwardEvents,
    		smuiClass,
    		forwardEvents,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class ClassAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["use", "class", "component", "forwardEvents"]);
    	}

    	get use() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get forwardEvents() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set forwardEvents(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Div.svelte generated by Svelte v3.9.2 */

    const file$1 = "node_modules/@smui/common/Div.svelte";

    function create_fragment$2(ctx) {
    	var div, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		exclude(ctx.$$props, ['use'])
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			add_location(div, file$1, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			useActions_action = useActions.call(null, div, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, div) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [] } = $$props;

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Div extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["use"]);
    	}

    	get use() {
    		throw new Error("<Div>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function AppContent(...args) {
      internals.class = 'mdc-drawer-app-content';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    AppContent.prototype = ClassAdder;

    function Content(...args) {
      internals.class = 'mdc-drawer__content';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Content.prototype = ClassAdder;

    function Scrim(...args) {
      internals.class = 'mdc-drawer-scrim';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Scrim.prototype = ClassAdder;

    /* node_modules/@smui/list/List.svelte generated by Svelte v3.9.2 */

    const file$2 = "node_modules/@smui/list/List.svelte";

    // (14:0) {:else}
    function create_else_block(ctx) {
    	var ul, useActions_action, forwardEvents_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var ul_levels = [
    		{ class: "mdc-list " + ctx.className },
    		{ role: ctx.role },
    		exclude(ctx.$$props, ['use', 'class', 'nonInteractive', 'dense', 'avatarList', 'twoLine', 'vertical', 'wrapFocus', 'singleSelection', 'selectedIndex', 'radiolist', 'checklist'])
    	];

    	var ul_data = {};
    	for (var i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	return {
    		c: function create() {
    			ul = element("ul");

    			if (default_slot) default_slot.c();

    			set_attributes(ul, ul_data);
    			toggle_class(ul, "mdc-list--non-interactive", ctx.nonInteractive);
    			toggle_class(ul, "mdc-list--dense", ctx.dense);
    			toggle_class(ul, "mdc-list--avatar-list", ctx.avatarList);
    			toggle_class(ul, "mdc-list--two-line", ctx.twoLine);
    			add_location(ul, file$2, 14, 2, 545);
    			dispose = listen(ul, "MDCList:action", ctx.handleAction);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(ul_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			ctx.ul_binding(ul);
    			useActions_action = useActions.call(null, ul, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, ul) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(ul, get_spread_update(ul_levels, [
    				(changed.className) && { class: "mdc-list " + ctx.className },
    				(changed.role) && { role: ctx.role },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'nonInteractive', 'dense', 'avatarList', 'twoLine', 'vertical', 'wrapFocus', 'singleSelection', 'selectedIndex', 'radiolist', 'checklist'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.nonInteractive)) {
    				toggle_class(ul, "mdc-list--non-interactive", ctx.nonInteractive);
    			}

    			if ((changed.className || changed.dense)) {
    				toggle_class(ul, "mdc-list--dense", ctx.dense);
    			}

    			if ((changed.className || changed.avatarList)) {
    				toggle_class(ul, "mdc-list--avatar-list", ctx.avatarList);
    			}

    			if ((changed.className || changed.twoLine)) {
    				toggle_class(ul, "mdc-list--two-line", ctx.twoLine);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(ul);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.ul_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			dispose();
    		}
    	};
    }

    // (1:0) {#if nav}
    function create_if_block(ctx) {
    	var nav_1, useActions_action, forwardEvents_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var nav_1_levels = [
    		{ class: "mdc-list " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'nonInteractive', 'dense', 'avatarList', 'twoLine', 'vertical', 'wrapFocus', 'singleSelection', 'selectedIndex', 'radiolist', 'checklist'])
    	];

    	var nav_1_data = {};
    	for (var i = 0; i < nav_1_levels.length; i += 1) {
    		nav_1_data = assign(nav_1_data, nav_1_levels[i]);
    	}

    	return {
    		c: function create() {
    			nav_1 = element("nav");

    			if (default_slot) default_slot.c();

    			set_attributes(nav_1, nav_1_data);
    			toggle_class(nav_1, "mdc-list--non-interactive", ctx.nonInteractive);
    			toggle_class(nav_1, "mdc-list--dense", ctx.dense);
    			toggle_class(nav_1, "mdc-list--avatar-list", ctx.avatarList);
    			toggle_class(nav_1, "mdc-list--two-line", ctx.twoLine);
    			add_location(nav_1, file$2, 1, 2, 12);
    			dispose = listen(nav_1, "MDCList:action", ctx.handleAction);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nav_1_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav_1, anchor);

    			if (default_slot) {
    				default_slot.m(nav_1, null);
    			}

    			ctx.nav_1_binding(nav_1);
    			useActions_action = useActions.call(null, nav_1, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, nav_1) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(nav_1, get_spread_update(nav_1_levels, [
    				(changed.className) && { class: "mdc-list " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'nonInteractive', 'dense', 'avatarList', 'twoLine', 'vertical', 'wrapFocus', 'singleSelection', 'selectedIndex', 'radiolist', 'checklist'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.nonInteractive)) {
    				toggle_class(nav_1, "mdc-list--non-interactive", ctx.nonInteractive);
    			}

    			if ((changed.className || changed.dense)) {
    				toggle_class(nav_1, "mdc-list--dense", ctx.dense);
    			}

    			if ((changed.className || changed.avatarList)) {
    				toggle_class(nav_1, "mdc-list--avatar-list", ctx.avatarList);
    			}

    			if ((changed.className || changed.twoLine)) {
    				toggle_class(nav_1, "mdc-list--two-line", ctx.twoLine);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav_1);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.nav_1_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.nav) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component, ['MDCList:action']);

      let { use = [], class: className = '', nonInteractive = false, dense = false, avatarList = false, twoLine = false, vertical = true, wrapFocus = false, singleSelection = false, selectedIndex = null, radiolist = false, checklist = false } = $$props;

      let element;
      let list;
      let role = getContext('SMUI:list:role');
      let nav = getContext('SMUI:list:nav');
      let instantiate = getContext('SMUI:list:instantiate');
      let getInstance = getContext('SMUI:list:getInstance');

      setContext('SMUI:list:nonInteractive', nonInteractive);

      if (!role) {
        if (singleSelection) {
          $$invalidate('role', role = 'listbox');
          setContext('SMUI:list:item:role', 'option');
        } else if (radiolist) {
          $$invalidate('role', role = 'radiogroup');
          setContext('SMUI:list:item:role', 'radio');
        } else if (checklist) {
          $$invalidate('role', role = 'group');
          setContext('SMUI:list:item:role', 'checkbox');
        } else {
          $$invalidate('role', role = 'list');
          setContext('SMUI:list:item:role', undefined);
        }
      }

      onMount(async () => {
        if (instantiate !== false) {
          $$invalidate('list', list = new MDCList(element));
        } else {
          $$invalidate('list', list = await getInstance());
        }
        if (singleSelection) {
          list.initializeListType();
          $$invalidate('selectedIndex', selectedIndex = list.selectedIndex);
        }
      });

      onDestroy(() => {
        if (instantiate !== false) {
          list.destroy();
        }
      });

      function handleAction(e) {
        if (list && list.listElements[e.detail.index].classList.contains('mdc-list-item--disabled')) {
          e.preventDefault();
          list.selectedIndex = selectedIndex; $$invalidate('list', list), $$invalidate('vertical', vertical), $$invalidate('wrapFocus', wrapFocus), $$invalidate('singleSelection', singleSelection), $$invalidate('selectedIndex', selectedIndex);
        } else if (list && list.selectedIndex === e.detail.index) {
          $$invalidate('selectedIndex', selectedIndex = e.detail.index);
        }
      }

      function layout(...args) {
        return list.layout(...args);
      }

    	let { $$slots = {}, $$scope } = $$props;

    	function nav_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('nonInteractive' in $$new_props) $$invalidate('nonInteractive', nonInteractive = $$new_props.nonInteractive);
    		if ('dense' in $$new_props) $$invalidate('dense', dense = $$new_props.dense);
    		if ('avatarList' in $$new_props) $$invalidate('avatarList', avatarList = $$new_props.avatarList);
    		if ('twoLine' in $$new_props) $$invalidate('twoLine', twoLine = $$new_props.twoLine);
    		if ('vertical' in $$new_props) $$invalidate('vertical', vertical = $$new_props.vertical);
    		if ('wrapFocus' in $$new_props) $$invalidate('wrapFocus', wrapFocus = $$new_props.wrapFocus);
    		if ('singleSelection' in $$new_props) $$invalidate('singleSelection', singleSelection = $$new_props.singleSelection);
    		if ('selectedIndex' in $$new_props) $$invalidate('selectedIndex', selectedIndex = $$new_props.selectedIndex);
    		if ('radiolist' in $$new_props) $$invalidate('radiolist', radiolist = $$new_props.radiolist);
    		if ('checklist' in $$new_props) $$invalidate('checklist', checklist = $$new_props.checklist);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { list: 1, vertical: 1, wrapFocus: 1, singleSelection: 1, selectedIndex: 1 }) => {
    		if ($$dirty.list || $$dirty.vertical) { if (list && list.vertical !== vertical) {
            list.vertical = vertical; $$invalidate('list', list), $$invalidate('vertical', vertical), $$invalidate('wrapFocus', wrapFocus), $$invalidate('singleSelection', singleSelection), $$invalidate('selectedIndex', selectedIndex);
          } }
    		if ($$dirty.list || $$dirty.wrapFocus) { if (list && list.wrapFocus !== wrapFocus) {
            list.wrapFocus = wrapFocus; $$invalidate('list', list), $$invalidate('vertical', vertical), $$invalidate('wrapFocus', wrapFocus), $$invalidate('singleSelection', singleSelection), $$invalidate('selectedIndex', selectedIndex);
          } }
    		if ($$dirty.list || $$dirty.singleSelection) { if (list && list.singleSelection !== singleSelection) {
            list.singleSelection = singleSelection; $$invalidate('list', list), $$invalidate('vertical', vertical), $$invalidate('wrapFocus', wrapFocus), $$invalidate('singleSelection', singleSelection), $$invalidate('selectedIndex', selectedIndex);
          } }
    		if ($$dirty.list || $$dirty.singleSelection || $$dirty.selectedIndex) { if (list && singleSelection && list.selectedIndex !== selectedIndex) {
            list.selectedIndex = selectedIndex; $$invalidate('list', list), $$invalidate('vertical', vertical), $$invalidate('wrapFocus', wrapFocus), $$invalidate('singleSelection', singleSelection), $$invalidate('selectedIndex', selectedIndex);
          } }
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		nonInteractive,
    		dense,
    		avatarList,
    		twoLine,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		selectedIndex,
    		radiolist,
    		checklist,
    		element,
    		role,
    		nav,
    		handleAction,
    		layout,
    		$$props,
    		nav_1_binding,
    		ul_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["use", "class", "nonInteractive", "dense", "avatarList", "twoLine", "vertical", "wrapFocus", "singleSelection", "selectedIndex", "radiolist", "checklist", "layout"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.layout === undefined && !('layout' in props)) {
    			console.warn("<List> was created without expected prop 'layout'");
    		}
    	}

    	get use() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatarList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatarList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twoLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twoLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapFocus() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapFocus(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get singleSelection() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set singleSelection(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radiolist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radiolist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checklist() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checklist(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx.layout;
    	}

    	set layout(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function detectEdgePseudoVarBug(windowObj) {
        // Detect versions of Edge with buggy var() support
        // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11495448/
        var document = windowObj.document;
        var node = document.createElement('div');
        node.className = 'mdc-ripple-surface--test-edge-var-bug';
        document.body.appendChild(node);
        // The bug exists if ::before style ends up propagating to the parent element.
        // Additionally, getComputedStyle returns null in iframes with display: "none" in Firefox,
        // but Firefox is known to support CSS custom properties correctly.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        var computedStyle = windowObj.getComputedStyle(node);
        var hasPseudoVarBug = computedStyle !== null && computedStyle.borderTopStyle === 'solid';
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return hasPseudoVarBug;
    }
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        if (explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus) {
            supportsCssVars = !detectEdgePseudoVarBug(windowObj);
        }
        else {
            supportsCssVars = false;
        }
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Stores result from applyPassive to avoid redundant processing to detect
     * passive event listener support.
     */
    var supportsPassive_;
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj, forceRefresh) {
        if (globalObj === void 0) { globalObj = window; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        if (supportsPassive_ === undefined || forceRefresh) {
            var isSupported_1 = false;
            try {
                globalObj.document.addEventListener('test', function () { return undefined; }, {
                    get passive() {
                        isSupported_1 = true;
                        return isSupported_1;
                    },
                });
            }
            catch (e) {
            } // tslint:disable-line:no-empty cannot throw error due to tests. tslint also disables console.log.
            supportsPassive_ = isSupported_1;
        }
        return supportsPassive_ ? { passive: true } : false;
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$3 = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings$3 = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers$1 = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign({}, MDCRippleFoundation.defaultAdapter, adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.addClass(ROOT_1);
                    if (_this.adapter_.isUnbounded()) {
                        _this.adapter_.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter_.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter_.removeClass(ROOT_2);
                    _this.adapter_.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter_.addClass(UNBOUNDED);
            }
            else {
                this.adapter_.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () {
                return _this.adapter_.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED);
            });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter_.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter_.isUnbounded()) {
                    this.adapter_.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter_.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter_.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter_.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter_.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter_.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter_.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter_.isUnbounded()) {
                this.adapter_.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter_.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter_.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter_.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter_.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined && activatedTargets.length > 0 && activatedTargets.some(function (target) { return _this.adapter_.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ? this.adapter_.isSurfaceActive() : true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter_.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter_.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter_.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter_.computeBoundingRect();
            this.adapter_.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter_.getWindowPageOffset(), this.adapter_.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter_.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter_.removeClass(FG_DEACTIVATION);
                }, numbers$1.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter_.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter_.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter_.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter_.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            this.initialSize_ = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter_.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter_.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter_.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter_.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter_.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRipple = /** @class */ (function (_super) {
        __extends(MDCRipple, _super);
        function MDCRipple() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.disabled = false;
            return _this;
        }
        MDCRipple.attachTo = function (root, opts) {
            if (opts === void 0) { opts = { isUnbounded: undefined }; }
            var ripple = new MDCRipple(root);
            // Only override unbounded behavior if option is explicitly specified
            if (opts.isUnbounded !== undefined) {
                ripple.unbounded = opts.isUnbounded;
            }
            return ripple;
        };
        MDCRipple.createAdapter = function (instance) {
            return {
                addClass: function (className) { return instance.root_.classList.add(className); },
                browserSupportsCssVars: function () { return supportsCssVariables(window); },
                computeBoundingRect: function () { return instance.root_.getBoundingClientRect(); },
                containsEventTarget: function (target) { return instance.root_.contains(target); },
                deregisterDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterInteractionHandler: function (evtType, handler) {
                    return instance.root_.removeEventListener(evtType, handler, applyPassive());
                },
                deregisterResizeHandler: function (handler) { return window.removeEventListener('resize', handler); },
                getWindowPageOffset: function () { return ({ x: window.pageXOffset, y: window.pageYOffset }); },
                isSurfaceActive: function () { return matches$1(instance.root_, ':active'); },
                isSurfaceDisabled: function () { return Boolean(instance.disabled); },
                isUnbounded: function () { return Boolean(instance.unbounded); },
                registerDocumentInteractionHandler: function (evtType, handler) {
                    return document.documentElement.addEventListener(evtType, handler, applyPassive());
                },
                registerInteractionHandler: function (evtType, handler) {
                    return instance.root_.addEventListener(evtType, handler, applyPassive());
                },
                registerResizeHandler: function (handler) { return window.addEventListener('resize', handler); },
                removeClass: function (className) { return instance.root_.classList.remove(className); },
                updateCssVariable: function (varName, value) { return instance.root_.style.setProperty(varName, value); },
            };
        };
        Object.defineProperty(MDCRipple.prototype, "unbounded", {
            get: function () {
                return Boolean(this.unbounded_);
            },
            set: function (unbounded) {
                this.unbounded_ = Boolean(unbounded);
                this.setUnbounded_();
            },
            enumerable: true,
            configurable: true
        });
        MDCRipple.prototype.activate = function () {
            this.foundation_.activate();
        };
        MDCRipple.prototype.deactivate = function () {
            this.foundation_.deactivate();
        };
        MDCRipple.prototype.layout = function () {
            this.foundation_.layout();
        };
        MDCRipple.prototype.getDefaultFoundation = function () {
            return new MDCRippleFoundation(MDCRipple.createAdapter(this));
        };
        MDCRipple.prototype.initialSyncWithDOM = function () {
            var root = this.root_;
            this.unbounded = 'mdcRippleIsUnbounded' in root.dataset;
        };
        /**
         * Closure Compiler throws an access control error when directly accessing a
         * protected or private property inside a getter/setter, like unbounded above.
         * By accessing the protected property inside a method, we solve that problem.
         * That's why this function exists.
         */
        MDCRipple.prototype.setUnbounded_ = function () {
            this.foundation_.setUnbounded(Boolean(this.unbounded_));
        };
        return MDCRipple;
    }(MDCComponent));

    function Ripple(node, [ripple, props = {unbounded: false, color: null}]) {
      let instance = null;

      function handleProps(ripple, props) {
        if (ripple && !instance) {
          instance = new MDCRipple(node);
        } else if (instance && !ripple) {
          instance.destroy();
          instance = null;
        }
        if (ripple) {
          instance.unbounded = !!props.unbounded;
          switch (props.color) {
            case 'surface':
              node.classList.add('mdc-ripple-surface');
              node.classList.remove('mdc-ripple-surface--primary');
              node.classList.remove('mdc-ripple-surface--accent');
              return;
            case 'primary':
              node.classList.add('mdc-ripple-surface');
              node.classList.add('mdc-ripple-surface--primary');
              node.classList.remove('mdc-ripple-surface--accent');
              return;
            case 'secondary':
              node.classList.add('mdc-ripple-surface');
              node.classList.remove('mdc-ripple-surface--primary');
              node.classList.add('mdc-ripple-surface--accent');
              return;
          }
        }
        node.classList.remove('mdc-ripple-surface');
        node.classList.remove('mdc-ripple-surface--primary');
        node.classList.remove('mdc-ripple-surface--accent');
      }

      if (ripple) {
        handleProps(ripple, props);
      }

      return {
        update([ripple, props = {unbounded: false, color: null}]) {
          handleProps(ripple, props);
        },

        destroy() {
          if (instance) {
            instance.destroy();
            instance = null;
            node.classList.remove('mdc-ripple-surface');
            node.classList.remove('mdc-ripple-surface--primary');
            node.classList.remove('mdc-ripple-surface--accent');
          }
        }
      }
    }

    /* node_modules/@smui/list/Item.svelte generated by Svelte v3.9.2 */

    const file$3 = "node_modules/@smui/list/Item.svelte";

    // (34:0) {:else}
    function create_else_block$1(ctx) {
    	var li, useActions_action, forwardEvents_action, Ripple_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var li_levels = [
    		{ class: "mdc-list-item " + ctx.className },
    		{ role: ctx.role },
    		{ "aria-selected": ctx.role === 'option' ? (ctx.selected ? 'true' : 'false') : undefined },
    		{ "aria-checked": (ctx.role === 'radio' || ctx.role === 'checkbox') ? (ctx.checked ? 'true' : 'false') : undefined },
    		{ tabindex: ctx.tabindex },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    	];

    	var li_data = {};
    	for (var i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	return {
    		c: function create() {
    			li = element("li");

    			if (default_slot) default_slot.c();

    			set_attributes(li, li_data);
    			toggle_class(li, "mdc-list-item--activated", ctx.activated);
    			toggle_class(li, "mdc-list-item--selected", ctx.selected);
    			toggle_class(li, "mdc-list-item--disabled", ctx.disabled);
    			toggle_class(li, "mdc-menu-item--selected", ctx.role === 'menuitem' && ctx.selected);
    			add_location(li, file$3, 34, 2, 1253);

    			dispose = [
    				listen(li, "click", ctx.action),
    				listen(li, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(li_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			ctx.li_binding(li);
    			useActions_action = useActions.call(null, li, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, li) || {};
    			Ripple_action = Ripple.call(null, li, [ctx.ripple, {unbounded: false, color: ctx.color}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(li, get_spread_update(li_levels, [
    				(changed.className) && { class: "mdc-list-item " + ctx.className },
    				(changed.role) && { role: ctx.role },
    				(changed.role || changed.selected) && { "aria-selected": ctx.role === 'option' ? (ctx.selected ? 'true' : 'false') : undefined },
    				(changed.role || changed.checked) && { "aria-checked": (ctx.role === 'radio' || ctx.role === 'checkbox') ? (ctx.checked ? 'true' : 'false') : undefined },
    				(changed.tabindex) && { tabindex: ctx.tabindex },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && (changed.ripple || changed.color)) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false, color: ctx.color}]);
    			}

    			if ((changed.className || changed.activated)) {
    				toggle_class(li, "mdc-list-item--activated", ctx.activated);
    			}

    			if ((changed.className || changed.selected)) {
    				toggle_class(li, "mdc-list-item--selected", ctx.selected);
    			}

    			if ((changed.className || changed.disabled)) {
    				toggle_class(li, "mdc-list-item--disabled", ctx.disabled);
    			}

    			if ((changed.className || changed.role || changed.selected)) {
    				toggle_class(li, "mdc-menu-item--selected", ctx.role === 'menuitem' && ctx.selected);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.li_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    			run_all(dispose);
    		}
    	};
    }

    // (18:23) 
    function create_if_block_1(ctx) {
    	var span, useActions_action, forwardEvents_action, Ripple_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var span_levels = [
    		{ class: "mdc-list-item " + ctx.className },
    		{ "aria-current": ctx.activated ? 'page' : undefined },
    		{ tabindex: ctx.tabindex },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    	];

    	var span_data = {};
    	for (var i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c: function create() {
    			span = element("span");

    			if (default_slot) default_slot.c();

    			set_attributes(span, span_data);
    			toggle_class(span, "mdc-list-item--activated", ctx.activated);
    			toggle_class(span, "mdc-list-item--selected", ctx.selected);
    			toggle_class(span, "mdc-list-item--disabled", ctx.disabled);
    			add_location(span, file$3, 18, 2, 647);

    			dispose = [
    				listen(span, "click", ctx.action),
    				listen(span, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			ctx.span_binding(span);
    			useActions_action = useActions.call(null, span, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, span) || {};
    			Ripple_action = Ripple.call(null, span, [ctx.ripple, {unbounded: false, color: ctx.color}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(span, get_spread_update(span_levels, [
    				(changed.className) && { class: "mdc-list-item " + ctx.className },
    				(changed.activated) && { "aria-current": ctx.activated ? 'page' : undefined },
    				(changed.tabindex) && { tabindex: ctx.tabindex },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && (changed.ripple || changed.color)) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false, color: ctx.color}]);
    			}

    			if ((changed.className || changed.activated)) {
    				toggle_class(span, "mdc-list-item--activated", ctx.activated);
    			}

    			if ((changed.className || changed.selected)) {
    				toggle_class(span, "mdc-list-item--selected", ctx.selected);
    			}

    			if ((changed.className || changed.disabled)) {
    				toggle_class(span, "mdc-list-item--disabled", ctx.disabled);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.span_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    			run_all(dispose);
    		}
    	};
    }

    // (1:0) {#if nav && href}
    function create_if_block$1(ctx) {
    	var a, useActions_action, forwardEvents_action, Ripple_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ class: "mdc-list-item " + ctx.className },
    		{ href: ctx.href },
    		{ "aria-current": ctx.activated ? 'page' : undefined },
    		{ tabindex: ctx.tabindex },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			toggle_class(a, "mdc-list-item--activated", ctx.activated);
    			toggle_class(a, "mdc-list-item--selected", ctx.selected);
    			toggle_class(a, "mdc-list-item--disabled", ctx.disabled);
    			add_location(a, file$3, 1, 2, 20);

    			dispose = [
    				listen(a, "click", ctx.action),
    				listen(a, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			ctx.a_binding(a);
    			useActions_action = useActions.call(null, a, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, a) || {};
    			Ripple_action = Ripple.call(null, a, [ctx.ripple, {unbounded: false, color: ctx.color}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.className) && { class: "mdc-list-item " + ctx.className },
    				(changed.href) && { href: ctx.href },
    				(changed.activated) && { "aria-current": ctx.activated ? 'page' : undefined },
    				(changed.tabindex) && { tabindex: ctx.tabindex },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'nonInteractive', 'activated', 'selected', 'disabled', 'tabindex', 'href', 'inputId'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && (changed.ripple || changed.color)) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false, color: ctx.color}]);
    			}

    			if ((changed.className || changed.activated)) {
    				toggle_class(a, "mdc-list-item--activated", ctx.activated);
    			}

    			if ((changed.className || changed.selected)) {
    				toggle_class(a, "mdc-list-item--selected", ctx.selected);
    			}

    			if ((changed.className || changed.disabled)) {
    				toggle_class(a, "mdc-list-item--disabled", ctx.disabled);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.a_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$1,
    		create_if_block_1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.nav && ctx.href) return 0;
    		if (ctx.nav && !ctx.href) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    let counter = 0;

    function instance$4($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();
      const forwardEvents = forwardEventsBuilder(current_component);
      let checked = false;

      let { use = [], class: className = '', ripple = true, color = null, nonInteractive = getContext('SMUI:list:nonInteractive'), activated = false, role = getContext('SMUI:list:item:role'), selected = false, disabled = false, tabindex = !nonInteractive && !disabled && (selected || checked) && '0' || '-1', href = false, inputId = 'SMUI-form-field-list-'+(counter++) } = $$props;

      let element;
      let addTabindexIfNoItemsSelectedRaf;
      let nav = getContext('SMUI:list:item:nav');

      setContext('SMUI:generic:input:props', {id: inputId});
      setContext('SMUI:generic:input:setChecked', setChecked);

      onMount(() => {
        // Tabindex needs to be '0' if this is the first non-disabled list item, and
        // no other item is selected.

        if (!selected && !nonInteractive) {
          let first = true;
          let el = element;
          while (el.previousSibling) {
            el = el.previousSibling;
            if (el.nodeType === 1 && el.classList.contains('mdc-list-item') && !el.classList.contains('mdc-list-item--disabled')) {
              first = false;
              break;
            }
          }
          if (first) {
            // This is first, so now set up a check that no other items are
            // selected.
            addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(addTabindexIfNoItemsSelected);
          }
        }
      });

      onDestroy(() => {
        if (addTabindexIfNoItemsSelectedRaf) {
          window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
        }
      });

      function addTabindexIfNoItemsSelected() {
        // Look through next siblings to see if none of them are selected.
        let noneSelected = true;
        let el = element;
        while (el.nextSibling) {
          el = el.nextSibling;
          if (el.nodeType === 1 && el.classList.contains('mdc-list-item') && el.attributes['tabindex'] && el.attributes['tabindex'].value === '0') {
            noneSelected = false;
            break;
          }
        }
        if (noneSelected) {
          // This is the first element, and no other element is selected, so the
          // tabindex should be '0'.
          $$invalidate('tabindex', tabindex = '0');
        }
      }

      function action(e) {
        if (disabled) {
          e.preventDefault();
        } else {
          dispatch('SMUI:action', e);
        }
      }

      function handleKeydown(e) {
        const isEnter = e.key === 'Enter' || e.keyCode === 13;
        const isSpace = e.key === 'Space' || e.keyCode === 32;
        if (isEnter || isSpace) {
          action(e);
        }
      }

      function setChecked(isChecked) {
        $$invalidate('checked', checked = isChecked);
        $$invalidate('tabindex', tabindex = !nonInteractive && !disabled && (selected || checked) && '0' || '-1');
      }

    	let { $$slots = {}, $$scope } = $$props;

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate('ripple', ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate('color', color = $$new_props.color);
    		if ('nonInteractive' in $$new_props) $$invalidate('nonInteractive', nonInteractive = $$new_props.nonInteractive);
    		if ('activated' in $$new_props) $$invalidate('activated', activated = $$new_props.activated);
    		if ('role' in $$new_props) $$invalidate('role', role = $$new_props.role);
    		if ('selected' in $$new_props) $$invalidate('selected', selected = $$new_props.selected);
    		if ('disabled' in $$new_props) $$invalidate('disabled', disabled = $$new_props.disabled);
    		if ('tabindex' in $$new_props) $$invalidate('tabindex', tabindex = $$new_props.tabindex);
    		if ('href' in $$new_props) $$invalidate('href', href = $$new_props.href);
    		if ('inputId' in $$new_props) $$invalidate('inputId', inputId = $$new_props.inputId);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		checked,
    		use,
    		className,
    		ripple,
    		color,
    		nonInteractive,
    		activated,
    		role,
    		selected,
    		disabled,
    		tabindex,
    		href,
    		inputId,
    		element,
    		nav,
    		action,
    		handleKeydown,
    		$$props,
    		a_binding,
    		span_binding,
    		li_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["use", "class", "ripple", "color", "nonInteractive", "activated", "role", "selected", "disabled", "tabindex", "href", "inputId"]);
    	}

    	get use() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activated() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activated(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Span.svelte generated by Svelte v3.9.2 */

    const file$4 = "node_modules/@smui/common/Span.svelte";

    function create_fragment$5(ctx) {
    	var span, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var span_levels = [
    		exclude(ctx.$$props, ['use'])
    	];

    	var span_data = {};
    	for (var i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c: function create() {
    			span = element("span");

    			if (default_slot) default_slot.c();

    			set_attributes(span, span_data);
    			add_location(span, file$4, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			useActions_action = useActions.call(null, span, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, span) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(span, get_spread_update(span_levels, [
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [] } = $$props;

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Span extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["use"]);
    	}

    	get use() {
    		throw new Error("<Span>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Text(...args) {
      internals.class = 'mdc-list-item__text';
      internals.component = Span;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Text.prototype = ClassAdder;

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$4 = {
        FIXED_CLASS: 'mdc-top-app-bar--fixed',
        FIXED_SCROLLED_CLASS: 'mdc-top-app-bar--fixed-scrolled',
        SHORT_CLASS: 'mdc-top-app-bar--short',
        SHORT_COLLAPSED_CLASS: 'mdc-top-app-bar--short-collapsed',
        SHORT_HAS_ACTION_ITEM_CLASS: 'mdc-top-app-bar--short-has-action-item',
    };
    var numbers$2 = {
        DEBOUNCE_THROTTLE_RESIZE_TIME_MS: 100,
        MAX_TOP_APP_BAR_HEIGHT: 128,
    };
    var strings$4 = {
        ACTION_ITEM_SELECTOR: '.mdc-top-app-bar__action-item',
        NAVIGATION_EVENT: 'MDCTopAppBar:nav',
        NAVIGATION_ICON_SELECTOR: '.mdc-top-app-bar__navigation-icon',
        ROOT_SELECTOR: '.mdc-top-app-bar',
        TITLE_SELECTOR: '.mdc-top-app-bar__title',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTopAppBarBaseFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarBaseFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarBaseFoundation(adapter) {
            return _super.call(this, __assign({}, MDCTopAppBarBaseFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCTopAppBarBaseFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "cssClasses", {
            get: function () {
                return cssClasses$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "numbers", {
            get: function () {
                return numbers$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTopAppBarAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setStyle: function () { return undefined; },
                    getTopAppBarHeight: function () { return 0; },
                    notifyNavigationIconClicked: function () { return undefined; },
                    getViewportScrollY: function () { return 0; },
                    getTotalActionItems: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleTargetScroll = function () { }; // tslint:disable-line:no-empty
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleWindowResize = function () { }; // tslint:disable-line:no-empty
        MDCTopAppBarBaseFoundation.prototype.handleNavigationClick = function () {
            this.adapter_.notifyNavigationIconClicked();
        };
        return MDCTopAppBarBaseFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var INITIAL_VALUE = 0;
    var MDCTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarFoundation(adapter) {
            var _this = _super.call(this, adapter) || this;
            /**
             * Indicates if the top app bar was docked in the previous scroll handler iteration.
             */
            _this.wasDocked_ = true;
            /**
             * Indicates if the top app bar is docked in the fully shown position.
             */
            _this.isDockedShowing_ = true;
            /**
             * Variable for current scroll position of the top app bar
             */
            _this.currentAppBarOffsetTop_ = 0;
            /**
             * Used to prevent the top app bar from being scrolled out of view during resize events
             */
            _this.isCurrentlyBeingResized_ = false;
            /**
             * The timeout that's used to throttle the resize events
             */
            _this.resizeThrottleId_ = INITIAL_VALUE;
            /**
             * The timeout that's used to debounce toggling the isCurrentlyBeingResized_ variable after a resize
             */
            _this.resizeDebounceId_ = INITIAL_VALUE;
            _this.lastScrollPosition_ = _this.adapter_.getViewportScrollY();
            _this.topAppBarHeight_ = _this.adapter_.getTopAppBarHeight();
            return _this;
        }
        MDCTopAppBarFoundation.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.adapter_.setStyle('top', '');
        };
        /**
         * Scroll handler for the default scroll behavior of the top app bar.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScrollPosition = Math.max(this.adapter_.getViewportScrollY(), 0);
            var diff = currentScrollPosition - this.lastScrollPosition_;
            this.lastScrollPosition_ = currentScrollPosition;
            // If the window is being resized the lastScrollPosition_ needs to be updated but the
            // current scroll of the top app bar should stay in the same position.
            if (!this.isCurrentlyBeingResized_) {
                this.currentAppBarOffsetTop_ -= diff;
                if (this.currentAppBarOffsetTop_ > 0) {
                    this.currentAppBarOffsetTop_ = 0;
                }
                else if (Math.abs(this.currentAppBarOffsetTop_) > this.topAppBarHeight_) {
                    this.currentAppBarOffsetTop_ = -this.topAppBarHeight_;
                }
                this.moveTopAppBar_();
            }
        };
        /**
         * Top app bar resize handler that throttle/debounce functions that execute updates.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleWindowResize = function () {
            var _this = this;
            // Throttle resize events 10 p/s
            if (!this.resizeThrottleId_) {
                this.resizeThrottleId_ = setTimeout(function () {
                    _this.resizeThrottleId_ = INITIAL_VALUE;
                    _this.throttledResizeHandler_();
                }, numbers$2.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
            }
            this.isCurrentlyBeingResized_ = true;
            if (this.resizeDebounceId_) {
                clearTimeout(this.resizeDebounceId_);
            }
            this.resizeDebounceId_ = setTimeout(function () {
                _this.handleTargetScroll();
                _this.isCurrentlyBeingResized_ = false;
                _this.resizeDebounceId_ = INITIAL_VALUE;
            }, numbers$2.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
        };
        /**
         * Function to determine if the DOM needs to update.
         */
        MDCTopAppBarFoundation.prototype.checkForUpdate_ = function () {
            var offscreenBoundaryTop = -this.topAppBarHeight_;
            var hasAnyPixelsOffscreen = this.currentAppBarOffsetTop_ < 0;
            var hasAnyPixelsOnscreen = this.currentAppBarOffsetTop_ > offscreenBoundaryTop;
            var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
            // If it's partially showing, it can't be docked.
            if (partiallyShowing) {
                this.wasDocked_ = false;
            }
            else {
                // Not previously docked and not partially showing, it's now docked.
                if (!this.wasDocked_) {
                    this.wasDocked_ = true;
                    return true;
                }
                else if (this.isDockedShowing_ !== hasAnyPixelsOnscreen) {
                    this.isDockedShowing_ = hasAnyPixelsOnscreen;
                    return true;
                }
            }
            return partiallyShowing;
        };
        /**
         * Function to move the top app bar if needed.
         */
        MDCTopAppBarFoundation.prototype.moveTopAppBar_ = function () {
            if (this.checkForUpdate_()) {
                // Once the top app bar is fully hidden we use the max potential top app bar height as our offset
                // so the top app bar doesn't show if the window resizes and the new height > the old height.
                var offset = this.currentAppBarOffsetTop_;
                if (Math.abs(offset) >= this.topAppBarHeight_) {
                    offset = -numbers$2.MAX_TOP_APP_BAR_HEIGHT;
                }
                this.adapter_.setStyle('top', offset + 'px');
            }
        };
        /**
         * Throttled function that updates the top app bar scrolled values if the
         * top app bar height changes.
         */
        MDCTopAppBarFoundation.prototype.throttledResizeHandler_ = function () {
            var currentHeight = this.adapter_.getTopAppBarHeight();
            if (this.topAppBarHeight_ !== currentHeight) {
                this.wasDocked_ = false;
                // Since the top app bar has a different height depending on the screen width, this
                // will ensure that the top app bar remains in the correct location if
                // completely hidden and a resize makes the top app bar a different height.
                this.currentAppBarOffsetTop_ -= this.topAppBarHeight_ - currentHeight;
                this.topAppBarHeight_ = currentHeight;
            }
            this.handleTargetScroll();
        };
        return MDCTopAppBarFoundation;
    }(MDCTopAppBarBaseFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFixedTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCFixedTopAppBarFoundation, _super);
        function MDCFixedTopAppBarFoundation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * State variable for the previous scroll iteration top app bar state
             */
            _this.wasScrolled_ = false;
            return _this;
        }
        /**
         * Scroll handler for applying/removing the modifier class on the fixed top app bar.
         * @override
         */
        MDCFixedTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScroll = this.adapter_.getViewportScrollY();
            if (currentScroll <= 0) {
                if (this.wasScrolled_) {
                    this.adapter_.removeClass(cssClasses$4.FIXED_SCROLLED_CLASS);
                    this.wasScrolled_ = false;
                }
            }
            else {
                if (!this.wasScrolled_) {
                    this.adapter_.addClass(cssClasses$4.FIXED_SCROLLED_CLASS);
                    this.wasScrolled_ = true;
                }
            }
        };
        return MDCFixedTopAppBarFoundation;
    }(MDCTopAppBarFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCShortTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCShortTopAppBarFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCShortTopAppBarFoundation(adapter) {
            var _this = _super.call(this, adapter) || this;
            _this.isCollapsed_ = false;
            return _this;
        }
        Object.defineProperty(MDCShortTopAppBarFoundation.prototype, "isCollapsed", {
            // Public visibility for backward compatibility.
            get: function () {
                return this.isCollapsed_;
            },
            enumerable: true,
            configurable: true
        });
        MDCShortTopAppBarFoundation.prototype.init = function () {
            _super.prototype.init.call(this);
            if (this.adapter_.getTotalActionItems() > 0) {
                this.adapter_.addClass(cssClasses$4.SHORT_HAS_ACTION_ITEM_CLASS);
            }
            // this is intended as the short variant must calculate if the
            // page starts off from the top of the page.
            this.handleTargetScroll();
        };
        /**
         * Scroll handler for applying/removing the collapsed modifier class on the short top app bar.
         * @override
         */
        MDCShortTopAppBarFoundation.prototype.handleTargetScroll = function () {
            if (this.adapter_.hasClass(cssClasses$4.SHORT_COLLAPSED_CLASS)) {
                return;
            }
            var currentScroll = this.adapter_.getViewportScrollY();
            if (currentScroll <= 0) {
                if (this.isCollapsed_) {
                    this.adapter_.removeClass(cssClasses$4.SHORT_COLLAPSED_CLASS);
                    this.isCollapsed_ = false;
                }
            }
            else {
                if (!this.isCollapsed_) {
                    this.adapter_.addClass(cssClasses$4.SHORT_COLLAPSED_CLASS);
                    this.isCollapsed_ = true;
                }
            }
        };
        return MDCShortTopAppBarFoundation;
    }(MDCTopAppBarBaseFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTopAppBar = /** @class */ (function (_super) {
        __extends(MDCTopAppBar, _super);
        function MDCTopAppBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTopAppBar.attachTo = function (root) {
            return new MDCTopAppBar(root);
        };
        MDCTopAppBar.prototype.initialize = function (rippleFactory) {
            if (rippleFactory === void 0) { rippleFactory = function (el) { return MDCRipple.attachTo(el); }; }
            this.navIcon_ = this.root_.querySelector(strings$4.NAVIGATION_ICON_SELECTOR);
            // Get all icons in the toolbar and instantiate the ripples
            var icons = [].slice.call(this.root_.querySelectorAll(strings$4.ACTION_ITEM_SELECTOR));
            if (this.navIcon_) {
                icons.push(this.navIcon_);
            }
            this.iconRipples_ = icons.map(function (icon) {
                var ripple = rippleFactory(icon);
                ripple.unbounded = true;
                return ripple;
            });
            this.scrollTarget_ = window;
        };
        MDCTopAppBar.prototype.initialSyncWithDOM = function () {
            this.handleNavigationClick_ = this.foundation_.handleNavigationClick.bind(this.foundation_);
            this.handleWindowResize_ = this.foundation_.handleWindowResize.bind(this.foundation_);
            this.handleTargetScroll_ = this.foundation_.handleTargetScroll.bind(this.foundation_);
            this.scrollTarget_.addEventListener('scroll', this.handleTargetScroll_);
            if (this.navIcon_) {
                this.navIcon_.addEventListener('click', this.handleNavigationClick_);
            }
            var isFixed = this.root_.classList.contains(cssClasses$4.FIXED_CLASS);
            var isShort = this.root_.classList.contains(cssClasses$4.SHORT_CLASS);
            if (!isShort && !isFixed) {
                window.addEventListener('resize', this.handleWindowResize_);
            }
        };
        MDCTopAppBar.prototype.destroy = function () {
            this.iconRipples_.forEach(function (iconRipple) { return iconRipple.destroy(); });
            this.scrollTarget_.removeEventListener('scroll', this.handleTargetScroll_);
            if (this.navIcon_) {
                this.navIcon_.removeEventListener('click', this.handleNavigationClick_);
            }
            var isFixed = this.root_.classList.contains(cssClasses$4.FIXED_CLASS);
            var isShort = this.root_.classList.contains(cssClasses$4.SHORT_CLASS);
            if (!isShort && !isFixed) {
                window.removeEventListener('resize', this.handleWindowResize_);
            }
            _super.prototype.destroy.call(this);
        };
        MDCTopAppBar.prototype.setScrollTarget = function (target) {
            // Remove scroll handler from the previous scroll target
            this.scrollTarget_.removeEventListener('scroll', this.handleTargetScroll_);
            this.scrollTarget_ = target;
            // Initialize scroll handler on the new scroll target
            this.handleTargetScroll_ =
                this.foundation_.handleTargetScroll.bind(this.foundation_);
            this.scrollTarget_.addEventListener('scroll', this.handleTargetScroll_);
        };
        MDCTopAppBar.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
            var adapter = {
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                addClass: function (className) { return _this.root_.classList.add(className); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                setStyle: function (property, value) { return _this.root_.style.setProperty(property, value); },
                getTopAppBarHeight: function () { return _this.root_.clientHeight; },
                notifyNavigationIconClicked: function () { return _this.emit(strings$4.NAVIGATION_EVENT, {}); },
                getViewportScrollY: function () {
                    var win = _this.scrollTarget_;
                    var el = _this.scrollTarget_;
                    return win.pageYOffset !== undefined ? win.pageYOffset : el.scrollTop;
                },
                getTotalActionItems: function () { return _this.root_.querySelectorAll(strings$4.ACTION_ITEM_SELECTOR).length; },
            };
            // tslint:enable:object-literal-sort-keys
            var foundation;
            if (this.root_.classList.contains(cssClasses$4.SHORT_CLASS)) {
                foundation = new MDCShortTopAppBarFoundation(adapter);
            }
            else if (this.root_.classList.contains(cssClasses$4.FIXED_CLASS)) {
                foundation = new MDCFixedTopAppBarFoundation(adapter);
            }
            else {
                foundation = new MDCTopAppBarFoundation(adapter);
            }
            return foundation;
        };
        return MDCTopAppBar;
    }(MDCComponent));

    /* node_modules/@smui/top-app-bar/TopAppBar.svelte generated by Svelte v3.9.2 */

    const file$5 = "node_modules/@smui/top-app-bar/TopAppBar.svelte";

    function create_fragment$6(ctx) {
    	var header, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var header_levels = [
    		{ class: "mdc-top-app-bar " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'variant', 'color', 'collapsed', 'prominent', 'dense'])
    	];

    	var header_data = {};
    	for (var i = 0; i < header_levels.length; i += 1) {
    		header_data = assign(header_data, header_levels[i]);
    	}

    	return {
    		c: function create() {
    			header = element("header");

    			if (default_slot) default_slot.c();

    			set_attributes(header, header_data);
    			toggle_class(header, "mdc-top-app-bar--short", ctx.variant === 'short');
    			toggle_class(header, "mdc-top-app-bar--short-collapsed", ctx.collapsed);
    			toggle_class(header, "mdc-top-app-bar--fixed", ctx.variant === 'fixed');
    			toggle_class(header, "smui-top-app-bar--static", ctx.variant === 'static');
    			toggle_class(header, "smui-top-app-bar--color-secondary", ctx.color === 'secondary');
    			toggle_class(header, "mdc-top-app-bar--prominent", ctx.prominent);
    			toggle_class(header, "mdc-top-app-bar--dense", ctx.dense);
    			add_location(header, file$5, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(header_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);

    			if (default_slot) {
    				default_slot.m(header, null);
    			}

    			ctx.header_binding(header);
    			useActions_action = useActions.call(null, header, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, header) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(header, get_spread_update(header_levels, [
    				(changed.className) && { class: "mdc-top-app-bar " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'variant', 'color', 'collapsed', 'prominent', 'dense'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(header, "mdc-top-app-bar--short", ctx.variant === 'short');
    			}

    			if ((changed.className || changed.collapsed)) {
    				toggle_class(header, "mdc-top-app-bar--short-collapsed", ctx.collapsed);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(header, "mdc-top-app-bar--fixed", ctx.variant === 'fixed');
    				toggle_class(header, "smui-top-app-bar--static", ctx.variant === 'static');
    			}

    			if ((changed.className || changed.color)) {
    				toggle_class(header, "smui-top-app-bar--color-secondary", ctx.color === 'secondary');
    			}

    			if ((changed.className || changed.prominent)) {
    				toggle_class(header, "mdc-top-app-bar--prominent", ctx.prominent);
    			}

    			if ((changed.className || changed.dense)) {
    				toggle_class(header, "mdc-top-app-bar--dense", ctx.dense);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.header_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component, ['MDCList:action']);

      let { use = [], class: className = '', variant = 'standard', color = 'primary', collapsed = false, prominent = false, dense = false } = $$props;

      let element;
      let topAppBar;

      onMount(async () => {
        topAppBar = new MDCTopAppBar(element);
      });

      onDestroy(() => {
        topAppBar.destroy();
      });

    	let { $$slots = {}, $$scope } = $$props;

    	function header_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('variant' in $$new_props) $$invalidate('variant', variant = $$new_props.variant);
    		if ('color' in $$new_props) $$invalidate('color', color = $$new_props.color);
    		if ('collapsed' in $$new_props) $$invalidate('collapsed', collapsed = $$new_props.collapsed);
    		if ('prominent' in $$new_props) $$invalidate('prominent', prominent = $$new_props.prominent);
    		if ('dense' in $$new_props) $$invalidate('dense', dense = $$new_props.dense);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		variant,
    		color,
    		collapsed,
    		prominent,
    		dense,
    		element,
    		$$props,
    		header_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class TopAppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["use", "class", "variant", "color", "collapsed", "prominent", "dense"]);
    	}

    	get use() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Row(...args) {
      internals.class = 'mdc-top-app-bar__row';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Row.prototype = ClassAdder;

    /* node_modules/@smui/top-app-bar/Section.svelte generated by Svelte v3.9.2 */

    const file$6 = "node_modules/@smui/top-app-bar/Section.svelte";

    function create_fragment$7(ctx) {
    	var section, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var section_levels = [
    		{ class: "mdc-top-app-bar__section " + ctx.className },
    		ctx.roleProp,
    		exclude(ctx.$$props, ['use', 'class', 'align', 'toolbar'])
    	];

    	var section_data = {};
    	for (var i = 0; i < section_levels.length; i += 1) {
    		section_data = assign(section_data, section_levels[i]);
    	}

    	return {
    		c: function create() {
    			section = element("section");

    			if (default_slot) default_slot.c();

    			set_attributes(section, section_data);
    			toggle_class(section, "mdc-top-app-bar__section--align-start", ctx.align === 'start');
    			toggle_class(section, "mdc-top-app-bar__section--align-end", ctx.align === 'end');
    			add_location(section, file$6, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(section_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			useActions_action = useActions.call(null, section, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, section) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(section, get_spread_update(section_levels, [
    				(changed.className) && { class: "mdc-top-app-bar__section " + ctx.className },
    				(changed.roleProp) && ctx.roleProp,
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'align', 'toolbar'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.align)) {
    				toggle_class(section, "mdc-top-app-bar__section--align-start", ctx.align === 'start');
    				toggle_class(section, "mdc-top-app-bar__section--align-end", ctx.align === 'end');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component, ['MDCList:action']);

      let { use = [], class: className = '', align = 'start', toolbar = false } = $$props;

      setContext('SMUI:icon-button:context', toolbar ? 'top-app-bar:action' : 'top-app-bar:navigation');
      setContext('SMUI:button:context', toolbar ? 'top-app-bar:action' : 'top-app-bar:navigation');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('align' in $$new_props) $$invalidate('align', align = $$new_props.align);
    		if ('toolbar' in $$new_props) $$invalidate('toolbar', toolbar = $$new_props.toolbar);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let roleProp;

    	$$self.$$.update = ($$dirty = { toolbar: 1 }) => {
    		if ($$dirty.toolbar) { $$invalidate('roleProp', roleProp = toolbar ? {role: 'toolbar'} : {}); }
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		align,
    		toolbar,
    		roleProp,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["use", "class", "align", "toolbar"]);
    	}

    	get use() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toolbar() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toolbar(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Title(...args) {
      internals.class = 'mdc-top-app-bar__title';
      internals.component = Span;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Title.prototype = ClassAdder;

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$5 = {
        ICON_BUTTON_ON: 'mdc-icon-button--on',
        ROOT: 'mdc-icon-button',
    };
    var strings$5 = {
        ARIA_PRESSED: 'aria-pressed',
        CHANGE_EVENT: 'MDCIconButtonToggle:change',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCIconButtonToggleFoundation = /** @class */ (function (_super) {
        __extends(MDCIconButtonToggleFoundation, _super);
        function MDCIconButtonToggleFoundation(adapter) {
            return _super.call(this, __assign({}, MDCIconButtonToggleFoundation.defaultAdapter, adapter)) || this;
        }
        Object.defineProperty(MDCIconButtonToggleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "strings", {
            get: function () {
                return strings$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    notifyChange: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setAttr: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCIconButtonToggleFoundation.prototype.init = function () {
            this.adapter_.setAttr(strings$5.ARIA_PRESSED, "" + this.isOn());
        };
        MDCIconButtonToggleFoundation.prototype.handleClick = function () {
            this.toggle();
            this.adapter_.notifyChange({ isOn: this.isOn() });
        };
        MDCIconButtonToggleFoundation.prototype.isOn = function () {
            return this.adapter_.hasClass(cssClasses$5.ICON_BUTTON_ON);
        };
        MDCIconButtonToggleFoundation.prototype.toggle = function (isOn) {
            if (isOn === void 0) { isOn = !this.isOn(); }
            if (isOn) {
                this.adapter_.addClass(cssClasses$5.ICON_BUTTON_ON);
            }
            else {
                this.adapter_.removeClass(cssClasses$5.ICON_BUTTON_ON);
            }
            this.adapter_.setAttr(strings$5.ARIA_PRESSED, "" + isOn);
        };
        return MDCIconButtonToggleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$6 = MDCIconButtonToggleFoundation.strings;
    var MDCIconButtonToggle = /** @class */ (function (_super) {
        __extends(MDCIconButtonToggle, _super);
        function MDCIconButtonToggle() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ripple_ = _this.createRipple_();
            return _this;
        }
        MDCIconButtonToggle.attachTo = function (root) {
            return new MDCIconButtonToggle(root);
        };
        MDCIconButtonToggle.prototype.initialSyncWithDOM = function () {
            var _this = this;
            this.handleClick_ = function () { return _this.foundation_.handleClick(); };
            this.listen('click', this.handleClick_);
        };
        MDCIconButtonToggle.prototype.destroy = function () {
            this.unlisten('click', this.handleClick_);
            this.ripple_.destroy();
            _super.prototype.destroy.call(this);
        };
        MDCIconButtonToggle.prototype.getDefaultFoundation = function () {
            var _this = this;
            // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
            // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
            var adapter = {
                addClass: function (className) { return _this.root_.classList.add(className); },
                hasClass: function (className) { return _this.root_.classList.contains(className); },
                notifyChange: function (evtData) { return _this.emit(strings$6.CHANGE_EVENT, evtData); },
                removeClass: function (className) { return _this.root_.classList.remove(className); },
                setAttr: function (attrName, attrValue) { return _this.root_.setAttribute(attrName, attrValue); },
            };
            return new MDCIconButtonToggleFoundation(adapter);
        };
        Object.defineProperty(MDCIconButtonToggle.prototype, "ripple", {
            get: function () {
                return this.ripple_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggle.prototype, "on", {
            get: function () {
                return this.foundation_.isOn();
            },
            set: function (isOn) {
                this.foundation_.toggle(isOn);
            },
            enumerable: true,
            configurable: true
        });
        MDCIconButtonToggle.prototype.createRipple_ = function () {
            var ripple = new MDCRipple(this.root_);
            ripple.unbounded = true;
            return ripple;
        };
        return MDCIconButtonToggle;
    }(MDCComponent));

    /* node_modules/@smui/icon-button/IconButton.svelte generated by Svelte v3.9.2 */

    const file$7 = "node_modules/@smui/icon-button/IconButton.svelte";

    // (20:0) {:else}
    function create_else_block$2(ctx) {
    	var button, useActions_action, forwardEvents_action, Ripple_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var button_levels = [
    		{ class: "mdc-icon-button " + ctx.className },
    		{ "aria-hidden": "true" },
    		{ "aria-pressed": ctx.pressed },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'toggle', 'pressed', 'href'])
    	];

    	var button_data = {};
    	for (var i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	return {
    		c: function create() {
    			button = element("button");

    			if (default_slot) default_slot.c();

    			set_attributes(button, button_data);
    			toggle_class(button, "mdc-icon-button--on", ctx.pressed);
    			toggle_class(button, "mdc-card__action", ctx.context === 'card:action');
    			toggle_class(button, "mdc-card__action--icon", ctx.context === 'card:action');
    			toggle_class(button, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    			toggle_class(button, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    			toggle_class(button, "mdc-snackbar__dismiss", ctx.context === 'snackbar');
    			add_location(button, file$7, 20, 2, 792);
    			dispose = listen(button, "MDCIconButtonToggle:change", ctx.handleChange);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(button_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			ctx.button_binding(button);
    			useActions_action = useActions.call(null, button, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, button) || {};
    			Ripple_action = Ripple.call(null, button, [ctx.ripple && !ctx.toggle, {unbounded: true, color: ctx.color}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				(changed.className) && { class: "mdc-icon-button " + ctx.className },
    				{ "aria-hidden": "true" },
    				(changed.pressed) && { "aria-pressed": ctx.pressed },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'toggle', 'pressed', 'href'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && (changed.ripple || changed.toggle || changed.color)) {
    				Ripple_action.update.call(null, [ctx.ripple && !ctx.toggle, {unbounded: true, color: ctx.color}]);
    			}

    			if ((changed.className || changed.pressed)) {
    				toggle_class(button, "mdc-icon-button--on", ctx.pressed);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(button, "mdc-card__action", ctx.context === 'card:action');
    				toggle_class(button, "mdc-card__action--icon", ctx.context === 'card:action');
    				toggle_class(button, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    				toggle_class(button, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    				toggle_class(button, "mdc-snackbar__dismiss", ctx.context === 'snackbar');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.button_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    			dispose();
    		}
    	};
    }

    // (1:0) {#if href}
    function create_if_block$2(ctx) {
    	var a, useActions_action, forwardEvents_action, Ripple_action, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ class: "mdc-icon-button " + ctx.className },
    		{ "aria-hidden": "true" },
    		{ "aria-pressed": ctx.pressed },
    		{ href: ctx.href },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'toggle', 'pressed', 'href'])
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			toggle_class(a, "mdc-icon-button--on", ctx.pressed);
    			toggle_class(a, "mdc-card__action", ctx.context === 'card:action');
    			toggle_class(a, "mdc-card__action--icon", ctx.context === 'card:action');
    			toggle_class(a, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    			toggle_class(a, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    			toggle_class(a, "mdc-snackbar__dismiss", ctx.context === 'snackbar');
    			add_location(a, file$7, 1, 2, 13);
    			dispose = listen(a, "MDCIconButtonToggle:change", ctx.handleChange);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			ctx.a_binding(a);
    			useActions_action = useActions.call(null, a, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, a) || {};
    			Ripple_action = Ripple.call(null, a, [ctx.ripple && !ctx.toggle, {unbounded: true, color: ctx.color}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.className) && { class: "mdc-icon-button " + ctx.className },
    				{ "aria-hidden": "true" },
    				(changed.pressed) && { "aria-pressed": ctx.pressed },
    				(changed.href) && { href: ctx.href },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'toggle', 'pressed', 'href'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && (changed.ripple || changed.toggle || changed.color)) {
    				Ripple_action.update.call(null, [ctx.ripple && !ctx.toggle, {unbounded: true, color: ctx.color}]);
    			}

    			if ((changed.className || changed.pressed)) {
    				toggle_class(a, "mdc-icon-button--on", ctx.pressed);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(a, "mdc-card__action", ctx.context === 'card:action');
    				toggle_class(a, "mdc-card__action--icon", ctx.context === 'card:action');
    				toggle_class(a, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    				toggle_class(a, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    				toggle_class(a, "mdc-snackbar__dismiss", ctx.context === 'snackbar');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.a_binding(null);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    			dispose();
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.href) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component, ['MDCIconButtonToggle:change']);

      let { use = [], class: className = '', ripple = true, color = null, toggle = false, pressed = false, href = null } = $$props;

      let element;
      let toggleButton;
      let context = getContext('SMUI:icon-button:context');

      setContext('SMUI:icon:context', 'icon-button');

      let oldToggle = null;

      onDestroy(() => {
        if (toggleButton) {
          toggleButton.destroy();
        }
      });

      function handleChange(e) {
        $$invalidate('pressed', pressed = e.detail.isOn);
      }

    	let { $$slots = {}, $$scope } = $$props;

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('element', element = $$value);
    		});
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate('ripple', ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate('color', color = $$new_props.color);
    		if ('toggle' in $$new_props) $$invalidate('toggle', toggle = $$new_props.toggle);
    		if ('pressed' in $$new_props) $$invalidate('pressed', pressed = $$new_props.pressed);
    		if ('href' in $$new_props) $$invalidate('href', href = $$new_props.href);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { element: 1, toggle: 1, oldToggle: 1, ripple: 1, toggleButton: 1, pressed: 1 }) => {
    		if ($$dirty.element || $$dirty.toggle || $$dirty.oldToggle || $$dirty.ripple || $$dirty.toggleButton || $$dirty.pressed) { if (element && toggle !== oldToggle) {
            if (toggle) {
              $$invalidate('toggleButton', toggleButton = new MDCIconButtonToggle(element));
              if (!ripple) {
                toggleButton.ripple.destroy();
              }
              toggleButton.on = pressed; $$invalidate('toggleButton', toggleButton), $$invalidate('element', element), $$invalidate('toggle', toggle), $$invalidate('oldToggle', oldToggle), $$invalidate('ripple', ripple), $$invalidate('pressed', pressed);
            } else if (oldToggle) {
              toggleButton.destroy();
              $$invalidate('toggleButton', toggleButton = null);
            }
            $$invalidate('oldToggle', oldToggle = toggle);
          } }
    		if ($$dirty.toggleButton || $$dirty.pressed) { if (toggleButton && toggleButton.on !== pressed) {
            toggleButton.on = pressed; $$invalidate('toggleButton', toggleButton), $$invalidate('element', element), $$invalidate('toggle', toggle), $$invalidate('oldToggle', oldToggle), $$invalidate('ripple', ripple), $$invalidate('pressed', pressed);
          } }
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		ripple,
    		color,
    		toggle,
    		pressed,
    		href,
    		element,
    		context,
    		handleChange,
    		$$props,
    		a_binding,
    		button_binding,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class IconButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["use", "class", "ripple", "color", "toggle", "pressed", "href"]);
    	}

    	get use() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pressed() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pressed(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Icon.svelte generated by Svelte v3.9.2 */

    const file$8 = "node_modules/@smui/common/Icon.svelte";

    function create_fragment$9(ctx) {
    	var i, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var i_levels = [
    		{ class: ctx.className },
    		{ "aria-hidden": "true" },
    		exclude(ctx.$$props, ['use', 'class', 'on', 'leading', 'leadingHidden', 'trailing'])
    	];

    	var i_data = {};
    	for (var i_1 = 0; i_1 < i_levels.length; i_1 += 1) {
    		i_data = assign(i_data, i_levels[i_1]);
    	}

    	return {
    		c: function create() {
    			i = element("i");

    			if (default_slot) default_slot.c();

    			set_attributes(i, i_data);
    			toggle_class(i, "mdc-button__icon", ctx.context === 'button');
    			toggle_class(i, "mdc-fab__icon", ctx.context === 'fab');
    			toggle_class(i, "mdc-icon-button__icon", ctx.context === 'icon-button');
    			toggle_class(i, "mdc-icon-button__icon--on", ctx.context === 'icon-button' && ctx.on);
    			toggle_class(i, "mdc-chip__icon", ctx.context === 'chip');
    			toggle_class(i, "mdc-chip__icon--leading", ctx.context === 'chip' && ctx.leading);
    			toggle_class(i, "mdc-chip__icon--leading-hidden", ctx.context === 'chip' && ctx.leadingHidden);
    			toggle_class(i, "mdc-chip__icon--trailing", ctx.context === 'chip' && ctx.trailing);
    			toggle_class(i, "mdc-tab__icon", ctx.context === 'tab');
    			add_location(i, file$8, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(i_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			useActions_action = useActions.call(null, i, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, i) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(i, get_spread_update(i_levels, [
    				(changed.className) && { class: ctx.className },
    				{ "aria-hidden": "true" },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'on', 'leading', 'leadingHidden', 'trailing'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(i, "mdc-button__icon", ctx.context === 'button');
    				toggle_class(i, "mdc-fab__icon", ctx.context === 'fab');
    				toggle_class(i, "mdc-icon-button__icon", ctx.context === 'icon-button');
    			}

    			if ((changed.className || changed.context || changed.on)) {
    				toggle_class(i, "mdc-icon-button__icon--on", ctx.context === 'icon-button' && ctx.on);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(i, "mdc-chip__icon", ctx.context === 'chip');
    			}

    			if ((changed.className || changed.context || changed.leading)) {
    				toggle_class(i, "mdc-chip__icon--leading", ctx.context === 'chip' && ctx.leading);
    			}

    			if ((changed.className || changed.context || changed.leadingHidden)) {
    				toggle_class(i, "mdc-chip__icon--leading-hidden", ctx.context === 'chip' && ctx.leadingHidden);
    			}

    			if ((changed.className || changed.context || changed.trailing)) {
    				toggle_class(i, "mdc-chip__icon--trailing", ctx.context === 'chip' && ctx.trailing);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(i, "mdc-tab__icon", ctx.context === 'tab');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '', on = false, leading = false, leadingHidden = false, trailing = false } = $$props;

      const context = getContext('SMUI:icon:context');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('on' in $$new_props) $$invalidate('on', on = $$new_props.on);
    		if ('leading' in $$new_props) $$invalidate('leading', leading = $$new_props.leading);
    		if ('leadingHidden' in $$new_props) $$invalidate('leadingHidden', leadingHidden = $$new_props.leadingHidden);
    		if ('trailing' in $$new_props) $$invalidate('trailing', trailing = $$new_props.trailing);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		on,
    		leading,
    		leadingHidden,
    		trailing,
    		context,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["use", "class", "on", "leading", "leadingHidden", "trailing"]);
    	}

    	get use() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get on() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set on(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get leading() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leading(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get leadingHidden() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leadingHidden(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trailing() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trailing(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/card/Card.svelte generated by Svelte v3.9.2 */

    const file$9 = "node_modules/@smui/card/Card.svelte";

    function create_fragment$a(ctx) {
    	var div, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		{ class: "mdc-card " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'variant', 'padded'])
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			toggle_class(div, "mdc-card--outlined", ctx.variant === 'outlined');
    			toggle_class(div, "smui-card--padded", ctx.padded);
    			add_location(div, file$9, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			useActions_action = useActions.call(null, div, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, div) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.className) && { class: "mdc-card " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'variant', 'padded'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(div, "mdc-card--outlined", ctx.variant === 'outlined');
    			}

    			if ((changed.className || changed.padded)) {
    				toggle_class(div, "smui-card--padded", ctx.padded);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '', variant = 'raised', padded = false } = $$props;

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('variant' in $$new_props) $$invalidate('variant', variant = $$new_props.variant);
    		if ('padded' in $$new_props) $$invalidate('padded', padded = $$new_props.padded);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		variant,
    		padded,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["use", "class", "variant", "padded"]);
    	}

    	get use() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padded() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padded(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function Content$1(...args) {
      internals.class = 'smui-card__content';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    Content$1.prototype = ClassAdder;

    /* node_modules/@smui/card/Actions.svelte generated by Svelte v3.9.2 */

    const file$a = "node_modules/@smui/card/Actions.svelte";

    function create_fragment$b(ctx) {
    	var div, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var div_levels = [
    		{ class: "mdc-card__actions " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'fullBleed'])
    	];

    	var div_data = {};
    	for (var i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			set_attributes(div, div_data);
    			toggle_class(div, "mdc-card__actions--full-bleed", ctx.fullBleed);
    			add_location(div, file$a, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			useActions_action = useActions.call(null, div, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, div) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(div, get_spread_update(div_levels, [
    				(changed.className) && { class: "mdc-card__actions " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'fullBleed'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.fullBleed)) {
    				toggle_class(div, "mdc-card__actions--full-bleed", ctx.fullBleed);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '', fullBleed = false } = $$props;

      setContext('SMUI:button:context', 'card:action');
      setContext('SMUI:icon-button:context', 'card:action');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('fullBleed' in $$new_props) $$invalidate('fullBleed', fullBleed = $$new_props.fullBleed);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		fullBleed,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Actions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["use", "class", "fullBleed"]);
    	}

    	get use() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullBleed() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullBleed(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ActionButtons(...args) {
      internals.class = 'mdc-card__action-buttons';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    ActionButtons.prototype = ClassAdder;

    function ActionIcons(...args) {
      internals.class = 'mdc-card__action-icons';
      internals.component = Div;
      internals.contexts = {};
      return new ClassAdder(...args);
    }

    ActionIcons.prototype = ClassAdder;

    /* node_modules/@smui/button/Button.svelte generated by Svelte v3.9.2 */

    const file$b = "node_modules/@smui/button/Button.svelte";

    // (20:0) {:else}
    function create_else_block$3(ctx) {
    	var button, useActions_action, forwardEvents_action, Ripple_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var button_levels = [
    		{ class: "mdc-button " + ctx.className },
    		ctx.actionProp,
    		ctx.defaultProp,
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', 'href', ...ctx.dialogExcludes])
    	];

    	var button_data = {};
    	for (var i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	return {
    		c: function create() {
    			button = element("button");

    			if (default_slot) default_slot.c();

    			set_attributes(button, button_data);
    			toggle_class(button, "mdc-button--raised", ctx.variant === 'raised');
    			toggle_class(button, "mdc-button--unelevated", ctx.variant === 'unelevated');
    			toggle_class(button, "mdc-button--outlined", ctx.variant === 'outlined');
    			toggle_class(button, "mdc-button--dense", ctx.dense);
    			toggle_class(button, "smui-button--color-secondary", ctx.color === 'secondary');
    			toggle_class(button, "mdc-card__action", ctx.context === 'card:action');
    			toggle_class(button, "mdc-card__action--button", ctx.context === 'card:action');
    			toggle_class(button, "mdc-dialog__button", ctx.context === 'dialog:action');
    			toggle_class(button, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    			toggle_class(button, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    			toggle_class(button, "mdc-snackbar__action", ctx.context === 'snackbar');
    			add_location(button, file$b, 20, 2, 874);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(button_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			useActions_action = useActions.call(null, button, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, button) || {};
    			Ripple_action = Ripple.call(null, button, [ctx.ripple, {unbounded: false}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				(changed.className) && { class: "mdc-button " + ctx.className },
    				(changed.actionProp) && ctx.actionProp,
    				(changed.defaultProp) && ctx.defaultProp,
    				(changed.exclude || changed.$$props || changed.dialogExcludes) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', 'href', ...ctx.dialogExcludes])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && changed.ripple) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false}]);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(button, "mdc-button--raised", ctx.variant === 'raised');
    				toggle_class(button, "mdc-button--unelevated", ctx.variant === 'unelevated');
    				toggle_class(button, "mdc-button--outlined", ctx.variant === 'outlined');
    			}

    			if ((changed.className || changed.dense)) {
    				toggle_class(button, "mdc-button--dense", ctx.dense);
    			}

    			if ((changed.className || changed.color)) {
    				toggle_class(button, "smui-button--color-secondary", ctx.color === 'secondary');
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(button, "mdc-card__action", ctx.context === 'card:action');
    				toggle_class(button, "mdc-card__action--button", ctx.context === 'card:action');
    				toggle_class(button, "mdc-dialog__button", ctx.context === 'dialog:action');
    				toggle_class(button, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    				toggle_class(button, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    				toggle_class(button, "mdc-snackbar__action", ctx.context === 'snackbar');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    		}
    	};
    }

    // (1:0) {#if href}
    function create_if_block$3(ctx) {
    	var a, useActions_action, forwardEvents_action, Ripple_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var a_levels = [
    		{ class: "mdc-button " + ctx.className },
    		{ href: ctx.href },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', 'href'])
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			toggle_class(a, "mdc-button--raised", ctx.variant === 'raised');
    			toggle_class(a, "mdc-button--unelevated", ctx.variant === 'unelevated');
    			toggle_class(a, "mdc-button--outlined", ctx.variant === 'outlined');
    			toggle_class(a, "mdc-button--dense", ctx.dense);
    			toggle_class(a, "smui-button--color-secondary", ctx.color === 'secondary');
    			toggle_class(a, "mdc-card__action", ctx.context === 'card:action');
    			toggle_class(a, "mdc-card__action--button", ctx.context === 'card:action');
    			toggle_class(a, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    			toggle_class(a, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    			toggle_class(a, "mdc-snackbar__action", ctx.context === 'snackbar');
    			add_location(a, file$b, 1, 2, 13);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			useActions_action = useActions.call(null, a, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, a) || {};
    			Ripple_action = Ripple.call(null, a, [ctx.ripple, {unbounded: false}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.className) && { class: "mdc-button " + ctx.className },
    				(changed.href) && { href: ctx.href },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'variant', 'dense', 'href'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && changed.ripple) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false}]);
    			}

    			if ((changed.className || changed.variant)) {
    				toggle_class(a, "mdc-button--raised", ctx.variant === 'raised');
    				toggle_class(a, "mdc-button--unelevated", ctx.variant === 'unelevated');
    				toggle_class(a, "mdc-button--outlined", ctx.variant === 'outlined');
    			}

    			if ((changed.className || changed.dense)) {
    				toggle_class(a, "mdc-button--dense", ctx.dense);
    			}

    			if ((changed.className || changed.color)) {
    				toggle_class(a, "smui-button--color-secondary", ctx.color === 'secondary');
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(a, "mdc-card__action", ctx.context === 'card:action');
    				toggle_class(a, "mdc-card__action--button", ctx.context === 'card:action');
    				toggle_class(a, "mdc-top-app-bar__navigation-icon", ctx.context === 'top-app-bar:navigation');
    				toggle_class(a, "mdc-top-app-bar__action-item", ctx.context === 'top-app-bar:action');
    				toggle_class(a, "mdc-snackbar__action", ctx.context === 'snackbar');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$3,
    		create_else_block$3
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.href) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '', ripple = true, color = 'primary', variant = 'text', dense = false, href = null, action = 'close', default: defaultAction = false } = $$props;

      let context = getContext('SMUI:button:context');

      setContext('SMUI:label:context', 'button');
      setContext('SMUI:icon:context', 'button');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate('ripple', ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate('color', color = $$new_props.color);
    		if ('variant' in $$new_props) $$invalidate('variant', variant = $$new_props.variant);
    		if ('dense' in $$new_props) $$invalidate('dense', dense = $$new_props.dense);
    		if ('href' in $$new_props) $$invalidate('href', href = $$new_props.href);
    		if ('action' in $$new_props) $$invalidate('action', action = $$new_props.action);
    		if ('default' in $$new_props) $$invalidate('defaultAction', defaultAction = $$new_props.default);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let actionProp, defaultProp, dialogExcludes;

    	$$self.$$.update = ($$dirty = { context: 1, action: 1, defaultAction: 1 }) => {
    		if ($$dirty.context || $$dirty.action) { $$invalidate('actionProp', actionProp = context === 'dialog:action' && action !== null ? {'data-mdc-dialog-action': action} : {}); }
    		if ($$dirty.context || $$dirty.defaultAction) { $$invalidate('defaultProp', defaultProp = context === 'dialog:action' && defaultAction ? {'data-mdc-dialog-button-default': ''} : {}); }
    		if ($$dirty.context) { $$invalidate('dialogExcludes', dialogExcludes = context === 'dialog:action' ? ['action', 'default'] : []); }
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		ripple,
    		color,
    		variant,
    		dense,
    		href,
    		action,
    		defaultAction,
    		context,
    		actionProp,
    		defaultProp,
    		dialogExcludes,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, ["use", "class", "ripple", "color", "variant", "dense", "href", "action", "default"]);
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get default() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set default(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@smui/common/Label.svelte generated by Svelte v3.9.2 */

    const file$c = "node_modules/@smui/common/Label.svelte";

    function create_fragment$d(ctx) {
    	var span, useActions_action, forwardEvents_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var span_levels = [
    		{ class: ctx.className },
    		ctx.snackbarProps,
    		exclude(ctx.$$props, ['use', 'class'])
    	];

    	var span_data = {};
    	for (var i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	return {
    		c: function create() {
    			span = element("span");

    			if (default_slot) default_slot.c();

    			set_attributes(span, span_data);
    			toggle_class(span, "mdc-button__label", ctx.context === 'button');
    			toggle_class(span, "mdc-fab__label", ctx.context === 'fab');
    			toggle_class(span, "mdc-chip__text", ctx.context === 'chip');
    			toggle_class(span, "mdc-tab__text-label", ctx.context === 'tab');
    			toggle_class(span, "mdc-image-list__label", ctx.context === 'image-list');
    			toggle_class(span, "mdc-snackbar__label", ctx.context === 'snackbar');
    			add_location(span, file$c, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			useActions_action = useActions.call(null, span, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, span) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(span, get_spread_update(span_levels, [
    				(changed.className) && { class: ctx.className },
    				(changed.snackbarProps) && ctx.snackbarProps,
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if ((changed.className || changed.context)) {
    				toggle_class(span, "mdc-button__label", ctx.context === 'button');
    				toggle_class(span, "mdc-fab__label", ctx.context === 'fab');
    				toggle_class(span, "mdc-chip__text", ctx.context === 'chip');
    				toggle_class(span, "mdc-tab__text-label", ctx.context === 'tab');
    				toggle_class(span, "mdc-image-list__label", ctx.context === 'image-list');
    				toggle_class(span, "mdc-snackbar__label", ctx.context === 'snackbar');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '' } = $$props;

      const context = getContext('SMUI:label:context');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	let snackbarProps;

    	$$invalidate('snackbarProps', snackbarProps = context === 'snackbar' ? {role: 'status', 'aria-live': 'polite'} : {});

    	return {
    		forwardEvents,
    		use,
    		className,
    		context,
    		snackbarProps,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["use", "class"]);
    	}

    	get use() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Card.svelte generated by Svelte v3.9.2 */

    // (17:2) <Content class="mdc-typography--body2">
    function create_default_slot_11(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (23:8) <Label>
    function create_default_slot_10(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Filter");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (22:6) <Button>
    function create_default_slot_9(ctx) {
    	var current;

    	var label = new Label({
    		props: {
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			label.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var label_changes = {};
    			if (changed.$$scope) label_changes.$$scope = { changed, ctx };
    			label.$set(label_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};
    }

    // (21:4) <ActionButtons>
    function create_default_slot_8(ctx) {
    	var current;

    	var button = new Button({
    		props: {
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			button.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var button_changes = {};
    			if (changed.$$scope) button_changes.$$scope = { changed, ctx };
    			button.$set(button_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (28:8) <Icon class="material-icons" on>
    function create_default_slot_7(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("favorite");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (29:8) <Icon class="material-icons">
    function create_default_slot_6(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("favorite_border");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (27:6) <IconButton toggle aria-label="Add to favorites" title="Add to favorites">
    function create_default_slot_5(ctx) {
    	var t, current;

    	var icon0 = new Icon({
    		props: {
    		class: "material-icons",
    		on: true,
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var icon1 = new Icon({
    		props: {
    		class: "material-icons",
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			icon0.$$.fragment.c();
    			t = space();
    			icon1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(icon0, target, anchor);
    			insert(target, t, anchor);
    			mount_component(icon1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var icon0_changes = {};
    			if (changed.$$scope) icon0_changes.$$scope = { changed, ctx };
    			icon0.$set(icon0_changes);

    			var icon1_changes = {};
    			if (changed.$$scope) icon1_changes.$$scope = { changed, ctx };
    			icon1.$set(icon1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);

    			transition_in(icon1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(icon0, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(icon1, detaching);
    		}
    	};
    }

    // (31:6) <IconButton class="material-icons" title="Share">
    function create_default_slot_4(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("share");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (32:6) <IconButton class="material-icons" title="File download">
    function create_default_slot_3(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("file_download");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (26:4) <ActionIcons>
    function create_default_slot_2(ctx) {
    	var t0, t1, current;

    	var iconbutton0 = new IconButton({
    		props: {
    		toggle: true,
    		"aria-label": "Add to favorites",
    		title: "Add to favorites",
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var iconbutton1 = new IconButton({
    		props: {
    		class: "material-icons",
    		title: "Share",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var iconbutton2 = new IconButton({
    		props: {
    		class: "material-icons",
    		title: "File download",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			iconbutton0.$$.fragment.c();
    			t0 = space();
    			iconbutton1.$$.fragment.c();
    			t1 = space();
    			iconbutton2.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(iconbutton0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(iconbutton1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(iconbutton2, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var iconbutton0_changes = {};
    			if (changed.$$scope) iconbutton0_changes.$$scope = { changed, ctx };
    			iconbutton0.$set(iconbutton0_changes);

    			var iconbutton1_changes = {};
    			if (changed.$$scope) iconbutton1_changes.$$scope = { changed, ctx };
    			iconbutton1.$set(iconbutton1_changes);

    			var iconbutton2_changes = {};
    			if (changed.$$scope) iconbutton2_changes.$$scope = { changed, ctx };
    			iconbutton2.$set(iconbutton2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);

    			transition_in(iconbutton1.$$.fragment, local);

    			transition_in(iconbutton2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			transition_out(iconbutton2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(iconbutton0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(iconbutton1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(iconbutton2, detaching);
    		}
    	};
    }

    // (20:2) <Actions>
    function create_default_slot_1(ctx) {
    	var t, current;

    	var actionbuttons = new ActionButtons({
    		props: {
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var actionicons = new ActionIcons({
    		props: {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			actionbuttons.$$.fragment.c();
    			t = space();
    			actionicons.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(actionbuttons, target, anchor);
    			insert(target, t, anchor);
    			mount_component(actionicons, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var actionbuttons_changes = {};
    			if (changed.$$scope) actionbuttons_changes.$$scope = { changed, ctx };
    			actionbuttons.$set(actionbuttons_changes);

    			var actionicons_changes = {};
    			if (changed.$$scope) actionicons_changes.$$scope = { changed, ctx };
    			actionicons.$set(actionicons_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionbuttons.$$.fragment, local);

    			transition_in(actionicons.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(actionbuttons.$$.fragment, local);
    			transition_out(actionicons.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(actionbuttons, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(actionicons, detaching);
    		}
    	};
    }

    // (15:0) <Card   style="width: 80%; margin: 0 auto; margin-top: 20px; margin-bottom: 20px;">
    function create_default_slot$1(ctx) {
    	var t, current;

    	var content = new Content$1({
    		props: {
    		class: "mdc-typography--body2",
    		$$slots: { default: [create_default_slot_11] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var actions = new Actions({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			content.$$.fragment.c();
    			t = space();
    			actions.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			insert(target, t, anchor);
    			mount_component(actions, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var content_changes = {};
    			if (changed.$$scope) content_changes.$$scope = { changed, ctx };
    			content.$set(content_changes);

    			var actions_changes = {};
    			if (changed.$$scope) actions_changes.$$scope = { changed, ctx };
    			actions.$set(actions_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);

    			transition_in(actions.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			transition_out(actions.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(content, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(actions, detaching);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	var current;

    	var card = new Card({
    		props: {
    		style: "width: 80%; margin: 0 auto; margin-top: 20px; margin-bottom: 20px;",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			card.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var card_changes = {};
    			if (changed.$$scope) card_changes.$$scope = { changed, ctx };
    			card.$set(card_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Card_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, []);
    	}
    }

    /* src/charts/BarcelonaMapChart.svelte generated by Svelte v3.9.2 */

    const file$d = "src/charts/BarcelonaMapChart.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.feature = list[i];
    	return child_ctx;
    }

    // (98:6) {:else}
    function create_else_block$4(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("loading");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (82:6) {#if features}
    function create_if_block_1$1(ctx) {
    	var each_1_anchor;

    	var each_value = ctx.features;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.path || changed.features || changed.quantize || changed.Number || changed.filter) {
    				each_value = ctx.features;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (83:8) {#each features as feature}
    function create_each_block(ctx) {
    	var path_1, path_1_d_value, path_1_fill_value, text_1, t_value = ctx.feature.properties.NOMABS.replace('Barcelona - ', '') + "", t, text_1_transform_value, dispose;

    	function mousemove_handler(...args) {
    		return ctx.mousemove_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			path_1 = svg_element("path");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr(path_1, "d", path_1_d_value = ctx.path(ctx.feature));
    			attr(path_1, "fill", path_1_fill_value = ctx.quantize(ctx.Number(ctx.feature.properties.VALORES ? ctx.feature.properties.VALORES[ctx.filter] : 0)));
    			attr(path_1, "stroke", "black");
    			add_location(path_1, file$d, 83, 10, 2173);
    			set_style(text_1, "font-size", "10px");
    			attr(text_1, "transform", text_1_transform_value = `translate(${ctx.path.centroid(ctx.feature)})`);
    			add_location(text_1, file$d, 91, 10, 2516);

    			dispose = [
    				listen(path_1, "mouseover", ctx.handleMouseOver),
    				listen(path_1, "mousemove", mousemove_handler),
    				listen(path_1, "mouseout", ctx.handleMouseOut(ctx.feature))
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, path_1, anchor);
    			insert(target, text_1, anchor);
    			append(text_1, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.features) && path_1_d_value !== (path_1_d_value = ctx.path(ctx.feature))) {
    				attr(path_1, "d", path_1_d_value);
    			}

    			if ((changed.quantize || changed.features || changed.filter) && path_1_fill_value !== (path_1_fill_value = ctx.quantize(ctx.Number(ctx.feature.properties.VALORES ? ctx.feature.properties.VALORES[ctx.filter] : 0)))) {
    				attr(path_1, "fill", path_1_fill_value);
    			}

    			if ((changed.features) && t_value !== (t_value = ctx.feature.properties.NOMABS.replace('Barcelona - ', '') + "")) {
    				set_data(t, t_value);
    			}

    			if ((changed.features) && text_1_transform_value !== (text_1_transform_value = `translate(${ctx.path.centroid(ctx.feature)})`)) {
    				attr(text_1, "transform", text_1_transform_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(path_1);
    				detach(text_1);
    			}

    			run_all(dispose);
    		}
    	};
    }

    // (102:0) {#if showTooltip}
    function create_if_block$4(ctx) {
    	var div, p0, t0_value = ctx.tooltipValues.NOMABS + "", t0, t1, p1, t2_value = ctx.tooltipValues.NOMAGA + "", t2, t3, p2, t4_value = ctx.tooltipValues.NOMSS + "", t4, t5, p3, t6_value = ctx.tooltipValues.VALORES ? ctx.tooltipValues.VALORES[ctx.filter] : 'No Data' + "", t6, div_style_value;

    	return {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p3 = element("p");
    			t6 = text(t6_value);
    			add_location(p0, file$d, 105, 4, 2940);
    			add_location(p1, file$d, 106, 4, 2974);
    			add_location(p2, file$d, 107, 4, 3008);
    			add_location(p3, file$d, 108, 4, 3041);
    			attr(div, "class", "tooltip");
    			attr(div, "style", div_style_value = ctx.showTooltip ? `opacity: .9; top: ${ctx.tooltipValues.top}px; left: ${ctx.tooltipValues.left}px` : 'opacity: 0');
    			add_location(div, file$d, 102, 2, 2795);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p0);
    			append(p0, t0);
    			append(div, t1);
    			append(div, p1);
    			append(p1, t2);
    			append(div, t3);
    			append(div, p2);
    			append(p2, t4);
    			append(div, t5);
    			append(div, p3);
    			append(p3, t6);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.tooltipValues) && t0_value !== (t0_value = ctx.tooltipValues.NOMABS + "")) {
    				set_data(t0, t0_value);
    			}

    			if ((changed.tooltipValues) && t2_value !== (t2_value = ctx.tooltipValues.NOMAGA + "")) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.tooltipValues) && t4_value !== (t4_value = ctx.tooltipValues.NOMSS + "")) {
    				set_data(t4, t4_value);
    			}

    			if ((changed.tooltipValues || changed.filter) && t6_value !== (t6_value = ctx.tooltipValues.VALORES ? ctx.tooltipValues.VALORES[ctx.filter] : 'No Data' + "")) {
    				set_data(t6, t6_value);
    			}

    			if ((changed.showTooltip || changed.tooltipValues) && div_style_value !== (div_style_value = ctx.showTooltip ? `opacity: .9; top: ${ctx.tooltipValues.top}px; left: ${ctx.tooltipValues.left}px` : 'opacity: 0')) {
    				attr(div, "style", div_style_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	var div1, div0, button0, t1, button1, t3, button2, t5, svg, g, svg_viewBox_value, t6, if_block1_anchor, dispose;

    	function select_block_type(changed, ctx) {
    		if (ctx.features) return create_if_block_1$1;
    		return create_else_block$4;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block0 = current_block_type(ctx);

    	var if_block1 = (ctx.showTooltip) && create_if_block$4(ctx);

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "filter 1";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "filter 2";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "filter 3";
    			t5 = space();
    			svg = svg_element("svg");
    			g = svg_element("g");
    			if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			add_location(button0, file$d, 75, 4, 1860);
    			add_location(button1, file$d, 76, 4, 1920);
    			add_location(button2, file$d, 77, 4, 1980);
    			add_location(div0, file$d, 74, 2, 1850);
    			add_location(g, file$d, 80, 4, 2102);
    			attr(svg, "viewBox", svg_viewBox_value = `0 0 ${ctx.width || 0} ${ctx.height || 0}`);
    			add_location(svg, file$d, 79, 2, 2047);
    			attr(div1, "id", "map");
    			add_location(div1, file$d, 73, 0, 1833);

    			dispose = [
    				listen(button0, "click", ctx.click_handler),
    				listen(button1, "click", ctx.click_handler_1),
    				listen(button2, "click", ctx.click_handler_2)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, button0);
    			append(div0, t1);
    			append(div0, button1);
    			append(div0, t3);
    			append(div0, button2);
    			append(div1, t5);
    			append(div1, svg);
    			append(svg, g);
    			if_block0.m(g, null);
    			insert(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, if_block1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block0) {
    				if_block0.p(changed, ctx);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(g, null);
    				}
    			}

    			if ((changed.width || changed.height) && svg_viewBox_value !== (svg_viewBox_value = `0 0 ${ctx.width || 0} ${ctx.height || 0}`)) {
    				attr(svg, "viewBox", svg_viewBox_value);
    			}

    			if (ctx.showTooltip) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			if_block0.d();

    			if (detaching) {
    				detach(t6);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach(if_block1_anchor);
    			}

    			run_all(dispose);
    		}
    	};
    }

    const FINAL =
        "https://gist.githubusercontent.com/damianpumar/862fe8d75f92a0b114ad4ae2bf128e13/raw/21dc4b07207455034b1e48022ae53f3a84fe5ece/finaltopojson";

    function instance$f($$self, $$props, $$invalidate) {
    	

      const path = d3.geoPath();

      let widthParent;
      let features;
      let barcelona;
      let colorScaleExtent = [0, 0];

      onMount(async () => {
        const data = await fetch(FINAL);
        barcelona = await data.json();
        $$invalidate('features', features = await topojson.feature(barcelona, barcelona.objects.ABS_2018)
          .features);
        $$invalidate('colorScaleExtent', colorScaleExtent = d3.extent(
          barcelona.objects.ABS_2018.geometries.map(({ properties }) =>
            properties.VALORES ? properties.VALORES[filter] : 0
          )
        ));
        $$invalidate('widthParent', widthParent = d3
          .select("#map")
          .node()
          .getBoundingClientRect().width);
      });
      const COLORS = ["#ffffff", "#ffd333", "#ffde66", "#fff4cc", "#ffe999"];

      function setFilter(indexOfFilter) {
        $$invalidate('filter', filter = indexOfFilter);
      }

      function handleMouseOver() {
        $$invalidate('showTooltip', showTooltip = true);
        selectElement = d3.select(this);
        selectElement.attr("fill", "orange");
      }

      function handleMouseMove(d, event) {
        const { NOMABS, NOMAGA, NOMSS, VALORES } = d.properties;
        $$invalidate('tooltipValues', tooltipValues = {
          NOMABS,
          NOMAGA,
          NOMSS,
          VALORES,
          left: event.clientX,
          top: event.clientY
        });
      }

      const handleMouseOut = feature => () => {
        $$invalidate('showTooltip', showTooltip = false);
        const quantizedColor = quantize(
          Number(
            feature.properties.VALORES ? feature.properties.VALORES[filter] : 0
          )
        );
        selectElement.attr("fill", quantizedColor);
      };

    	function click_handler() {
    		return setFilter(0);
    	}

    	function click_handler_1() {
    		return setFilter(1);
    	}

    	function click_handler_2() {
    		return setFilter(2);
    	}

    	function mousemove_handler({ feature }, event) {
    		return handleMouseMove(feature, event);
    	}

    	let width, height, filter, quantize, selectElement, showTooltip, tooltipValues;

    	$$self.$$.update = ($$dirty = { widthParent: 1, colorScaleExtent: 1 }) => {
    		if ($$dirty.widthParent) { $$invalidate('width', width = widthParent); }
    		if ($$dirty.widthParent) { $$invalidate('height', height = widthParent); }
    		if ($$dirty.colorScaleExtent) { $$invalidate('quantize', quantize = d3
            .scaleQuantize()
            .domain(colorScaleExtent)
            .range(COLORS)); }
    	};

    	$$invalidate('filter', filter = 0);
    	selectElement = null;
    	$$invalidate('showTooltip', showTooltip = false);
    	$$invalidate('tooltipValues', tooltipValues = {});

    	return {
    		path,
    		features,
    		setFilter,
    		handleMouseOver,
    		handleMouseMove,
    		handleMouseOut,
    		width,
    		height,
    		filter,
    		quantize,
    		showTooltip,
    		tooltipValues,
    		Number,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		mousemove_handler
    	};
    }

    class BarcelonaMapChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, []);
    	}
    }

    /* src/charts/BarcelonaBarChart.svelte generated by Svelte v3.9.2 */

    const file$e = "src/charts/BarcelonaBarChart.svelte";

    function create_fragment$g(ctx) {
    	var div;

    	return {
    		c: function create() {
    			div = element("div");
    			attr(div, "id", "chart");
    			add_location(div, file$e, 53, 0, 1039);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	var options = {
        chart: {
          height: 1200,
          width: "90%",
          type: "bar",
          toolbar: {
            tools: {
              download: false
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        dataLabels: {
          enabled: false
        },
        series: [
          {
            name: "",
            data: []
          }
        ],
        xaxis: {
          categories: [],
          labels: {
            trim: false
          }
        }
      };

      onMount(async () => {
        const fetched = await fetch(
          "https://gist.githubusercontent.com/damianpumar/f5110a8cf1c2a99408a4cc40235e6790/raw/c7cfcac7a10a2cf25359454756fcd6c82763d7c8/barchart"
        );
        const data = await fetched.json();

        options.xaxis.categories = data.categories.map(category => category.name);    options.series[0].data = data.dataset.set.map(series =>
          parseFloat(series.value)
        );
        var chart = new ApexCharts(document.querySelector("#chart"), options);

        chart.render();
      });

    	return {};
    }

    class BarcelonaBarChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, []);
    	}
    }

    /* src/Charts.svelte generated by Svelte v3.9.2 */

    const file$f = "src/Charts.svelte";

    // (7:0) <Card>
    function create_default_slot_1$1(ctx) {
    	var current;

    	var barcelonamapchart = new BarcelonaMapChart({ $$inline: true });

    	return {
    		c: function create() {
    			barcelonamapchart.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(barcelonamapchart, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(barcelonamapchart.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(barcelonamapchart.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(barcelonamapchart, detaching);
    		}
    	};
    }

    // (11:0) <Card>
    function create_default_slot$2(ctx) {
    	var current;

    	var barcelonabarchart = new BarcelonaBarChart({ $$inline: true });

    	return {
    		c: function create() {
    			barcelonabarchart.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(barcelonabarchart, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(barcelonabarchart.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(barcelonabarchart.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(barcelonabarchart, detaching);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	var t0, br, t1, current;

    	var card0 = new Card_1({
    		props: {
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var card1 = new Card_1({
    		props: {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			card0.$$.fragment.c();
    			t0 = space();
    			br = element("br");
    			t1 = space();
    			card1.$$.fragment.c();
    			add_location(br, file$f, 9, 0, 233);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(card0, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, br, anchor);
    			insert(target, t1, anchor);
    			mount_component(card1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var card0_changes = {};
    			if (changed.$$scope) card0_changes.$$scope = { changed, ctx };
    			card0.$set(card0_changes);

    			var card1_changes = {};
    			if (changed.$$scope) card1_changes.$$scope = { changed, ctx };
    			card1.$set(card1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);

    			transition_in(card1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(card0, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(br);
    				detach(t1);
    			}

    			destroy_component(card1, detaching);
    		}
    	};
    }

    class Charts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, []);
    	}
    }

    /* node_modules/@smui/fab/Fab.svelte generated by Svelte v3.9.2 */

    const file$g = "node_modules/@smui/fab/Fab.svelte";

    function create_fragment$i(ctx) {
    	var button, useActions_action, forwardEvents_action, Ripple_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var button_levels = [
    		{ class: "mdc-fab " + ctx.className },
    		exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'mini', 'exited', 'extended'])
    	];

    	var button_data = {};
    	for (var i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	return {
    		c: function create() {
    			button = element("button");

    			if (default_slot) default_slot.c();

    			set_attributes(button, button_data);
    			toggle_class(button, "mdc-fab--mini", ctx.mini);
    			toggle_class(button, "mdc-fab--exited", ctx.exited);
    			toggle_class(button, "mdc-fab--extended", ctx.extended);
    			toggle_class(button, "smui-fab--color-primary", ctx.color === 'primary');
    			add_location(button, file$g, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(button_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			useActions_action = useActions.call(null, button, ctx.use) || {};
    			forwardEvents_action = ctx.forwardEvents.call(null, button) || {};
    			Ripple_action = Ripple.call(null, button, [ctx.ripple, {unbounded: false}]) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			set_attributes(button, get_spread_update(button_levels, [
    				(changed.className) && { class: "mdc-fab " + ctx.className },
    				(changed.exclude || changed.$$props) && exclude(ctx.$$props, ['use', 'class', 'ripple', 'color', 'mini', 'exited', 'extended'])
    			]));

    			if (typeof useActions_action.update === 'function' && changed.use) {
    				useActions_action.update.call(null, ctx.use);
    			}

    			if (typeof Ripple_action.update === 'function' && changed.ripple) {
    				Ripple_action.update.call(null, [ctx.ripple, {unbounded: false}]);
    			}

    			if ((changed.className || changed.mini)) {
    				toggle_class(button, "mdc-fab--mini", ctx.mini);
    			}

    			if ((changed.className || changed.exited)) {
    				toggle_class(button, "mdc-fab--exited", ctx.exited);
    			}

    			if ((changed.className || changed.extended)) {
    				toggle_class(button, "mdc-fab--extended", ctx.extended);
    			}

    			if ((changed.className || changed.color)) {
    				toggle_class(button, "smui-fab--color-primary", ctx.color === 'primary');
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (useActions_action && typeof useActions_action.destroy === 'function') useActions_action.destroy();
    			if (forwardEvents_action && typeof forwardEvents_action.destroy === 'function') forwardEvents_action.destroy();
    			if (Ripple_action && typeof Ripple_action.destroy === 'function') Ripple_action.destroy();
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	

      const forwardEvents = forwardEventsBuilder(current_component);

      let { use = [], class: className = '', ripple = true, color = 'secondary', mini = false, exited = false, extended = false } = $$props;

      setContext('SMUI:label:context', 'fab');
      setContext('SMUI:icon:context', 'fab');

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$new_props) $$invalidate('use', use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate('className', className = $$new_props.class);
    		if ('ripple' in $$new_props) $$invalidate('ripple', ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate('color', color = $$new_props.color);
    		if ('mini' in $$new_props) $$invalidate('mini', mini = $$new_props.mini);
    		if ('exited' in $$new_props) $$invalidate('exited', exited = $$new_props.exited);
    		if ('extended' in $$new_props) $$invalidate('extended', extended = $$new_props.extended);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	return {
    		forwardEvents,
    		use,
    		className,
    		ripple,
    		color,
    		mini,
    		exited,
    		extended,
    		$$props,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Fab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$i, safe_not_equal, ["use", "class", "ripple", "color", "mini", "exited", "extended"]);
    	}

    	get use() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mini() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mini(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exited() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exited(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extended() {
    		throw new Error("<Fab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extended(value) {
    		throw new Error("<Fab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.9.2 */

    const file$h = "src/App.svelte";

    // (8:6) <IconButton class="material-icons" style="margin-top: 0.5em;" on:click={() => drawerOpen = !drawerOpen}>
    function create_default_slot_20(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("menu");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (9:6) <Title>
    function create_default_slot_19(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("SiSalut - Demo");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (7:4) <Section>
    function create_default_slot_18(ctx) {
    	var t, current_1;

    	var iconbutton = new IconButton({
    		props: {
    		class: "material-icons",
    		style: "margin-top: 0.5em;",
    		$$slots: { default: [create_default_slot_20] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	iconbutton.$on("click", ctx.click_handler);

    	var title = new Title({
    		props: {
    		$$slots: { default: [create_default_slot_19] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			iconbutton.$$.fragment.c();
    			t = space();
    			title.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(iconbutton, target, anchor);
    			insert(target, t, anchor);
    			mount_component(title, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var iconbutton_changes = {};
    			if (changed.$$scope) iconbutton_changes.$$scope = { changed, ctx };
    			iconbutton.$set(iconbutton_changes);

    			var title_changes = {};
    			if (changed.$$scope) title_changes.$$scope = { changed, ctx };
    			title.$set(title_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(iconbutton.$$.fragment, local);

    			transition_in(title.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(iconbutton, detaching);

    			if (detaching) {
    				detach(t);
    			}

    			destroy_component(title, detaching);
    		}
    	};
    }

    // (6:2) <Row>
    function create_default_slot_17(ctx) {
    	var current_1;

    	var section = new Section({
    		props: {
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			section.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var section_changes = {};
    			if (changed.$$scope) section_changes.$$scope = { changed, ctx };
    			section.$set(section_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(section.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};
    }

    // (5:0) <TopAppBar variant="static" color="primary">
    function create_default_slot_16(ctx) {
    	var current_1;

    	var row = new Row({
    		props: {
    		$$slots: { default: [create_default_slot_17] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			row.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var row_changes = {};
    			if (changed.$$scope) row_changes.$$scope = { changed, ctx };
    			row.$set(row_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(row.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};
    }

    // (14:4) <Title>
    function create_default_slot_15(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Percentatge de persones grans que viuen soles per ABS i sexe. Barcelona, any 2017");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (13:0) <TopAppBar variant="static" color="secondary">
    function create_default_slot_14(ctx) {
    	var current_1;

    	var title = new Title({
    		props: {
    		$$slots: { default: [create_default_slot_15] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			title.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(title, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var title_changes = {};
    			if (changed.$$scope) title_changes.$$scope = { changed, ctx };
    			title.$set(title_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(title.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(title, detaching);
    		}
    	};
    }

    // (16:92) <Icon class="material-icons">
    function create_default_slot_13(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("search");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (16:0) <Fab on:click={doSomething} style="position: fixed; bottom: 1rem; right: 2rem; z-index: 1;">
    function create_default_slot_12(ctx) {
    	var current_1;

    	var icon = new Icon({
    		props: {
    		class: "material-icons",
    		$$slots: { default: [create_default_slot_13] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			icon.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var icon_changes = {};
    			if (changed.$$scope) icon_changes.$$scope = { changed, ctx };
    			icon.$set(icon_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(icon.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};
    }

    // (22:8) <Text>
    function create_default_slot_11$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Mapes i gràfics per ABS");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (21:6) <Item href="javascript:void(0)" on:click={() => go('main')} activated={current === 'main'}>
    function create_default_slot_10$1(ctx) {
    	var current_1;

    	var text_1 = new Text({
    		props: {
    		$$slots: { default: [create_default_slot_11$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			text_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var text_1_changes = {};
    			if (changed.$$scope) text_1_changes.$$scope = { changed, ctx };
    			text_1.$set(text_1_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(text_1.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    // (25:8) <Text>
    function create_default_slot_9$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ABS 1A - BCNeta");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (24:6) <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
    function create_default_slot_8$1(ctx) {
    	var current_1;

    	var text_1 = new Text({
    		props: {
    		$$slots: { default: [create_default_slot_9$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			text_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var text_1_changes = {};
    			if (changed.$$scope) text_1_changes.$$scope = { changed, ctx };
    			text_1.$set(text_1_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(text_1.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    // (28:8) <Text>
    function create_default_slot_7$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ABS 1B - Casc Antic");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (27:6) <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
    function create_default_slot_6$1(ctx) {
    	var current_1;

    	var text_1 = new Text({
    		props: {
    		$$slots: { default: [create_default_slot_7$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			text_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var text_1_changes = {};
    			if (changed.$$scope) text_1_changes.$$scope = { changed, ctx };
    			text_1.$set(text_1_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(text_1.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    // (31:8) <Text>
    function create_default_slot_5$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("ABS 1C - Gòtic");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    // (30:6) <Item href="javascript:void(0)" on:click={() => go('other')} activated={current === 'other'}>
    function create_default_slot_4$1(ctx) {
    	var current_1;

    	var text_1 = new Text({
    		props: {
    		$$slots: { default: [create_default_slot_5$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			text_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var text_1_changes = {};
    			if (changed.$$scope) text_1_changes.$$scope = { changed, ctx };
    			text_1.$set(text_1_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(text_1.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};
    }

    // (20:4) <List>
    function create_default_slot_3$1(ctx) {
    	var t0, t1, t2, current_1;

    	var item0 = new Item({
    		props: {
    		href: "javascript:void(0)",
    		activated: ctx.current === 'main',
    		$$slots: { default: [create_default_slot_10$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	item0.$on("click", ctx.click_handler_1);

    	var item1 = new Item({
    		props: {
    		href: "javascript:void(0)",
    		activated: ctx.current === 'other',
    		$$slots: { default: [create_default_slot_8$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	item1.$on("click", ctx.click_handler_2);

    	var item2 = new Item({
    		props: {
    		href: "javascript:void(0)",
    		activated: ctx.current === 'other',
    		$$slots: { default: [create_default_slot_6$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	item2.$on("click", ctx.click_handler_3);

    	var item3 = new Item({
    		props: {
    		href: "javascript:void(0)",
    		activated: ctx.current === 'other',
    		$$slots: { default: [create_default_slot_4$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	item3.$on("click", ctx.click_handler_4);

    	return {
    		c: function create() {
    			item0.$$.fragment.c();
    			t0 = space();
    			item1.$$.fragment.c();
    			t1 = space();
    			item2.$$.fragment.c();
    			t2 = space();
    			item3.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(item0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(item1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(item2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(item3, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var item0_changes = {};
    			if (changed.current) item0_changes.activated = ctx.current === 'main';
    			if (changed.$$scope) item0_changes.$$scope = { changed, ctx };
    			item0.$set(item0_changes);

    			var item1_changes = {};
    			if (changed.current) item1_changes.activated = ctx.current === 'other';
    			if (changed.$$scope) item1_changes.$$scope = { changed, ctx };
    			item1.$set(item1_changes);

    			var item2_changes = {};
    			if (changed.current) item2_changes.activated = ctx.current === 'other';
    			if (changed.$$scope) item2_changes.$$scope = { changed, ctx };
    			item2.$set(item2_changes);

    			var item3_changes = {};
    			if (changed.current) item3_changes.activated = ctx.current === 'other';
    			if (changed.$$scope) item3_changes.$$scope = { changed, ctx };
    			item3.$set(item3_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(item0.$$.fragment, local);

    			transition_in(item1.$$.fragment, local);

    			transition_in(item2.$$.fragment, local);

    			transition_in(item3.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(item0.$$.fragment, local);
    			transition_out(item1.$$.fragment, local);
    			transition_out(item2.$$.fragment, local);
    			transition_out(item3.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(item0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(item1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(item2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(item3, detaching);
    		}
    	};
    }

    // (19:2) <Content>
    function create_default_slot_2$1(ctx) {
    	var current_1;

    	var list = new List({
    		props: {
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			list.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var list_changes = {};
    			if (changed.$$scope || changed.current) list_changes.$$scope = { changed, ctx };
    			list.$set(list_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(list.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};
    }

    // (18:0) <Drawer variant="modal" bind:this={drawer} bind:open={drawerOpen}>
    function create_default_slot_1$2(ctx) {
    	var current_1;

    	var content = new Content({
    		props: {
    		$$slots: { default: [create_default_slot_2$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			content.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var content_changes = {};
    			if (changed.$$scope || changed.current) content_changes.$$scope = { changed, ctx };
    			content.$set(content_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(content.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};
    }

    // (39:0) <AppContent>
    function create_default_slot$3(ctx) {
    	var current_1;

    	var charts = new Charts({ $$inline: true });

    	return {
    		c: function create() {
    			charts.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(charts, target, anchor);
    			current_1 = true;
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(charts.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(charts.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(charts, detaching);
    		}
    	};
    }

    function create_fragment$j(ctx) {
    	var link0, t0, link1, t1, link2, t2, t3, t4, t5, updating_open, t6, t7, current_1;

    	var topappbar0 = new TopAppBar({
    		props: {
    		variant: "static",
    		color: "primary",
    		$$slots: { default: [create_default_slot_16] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var topappbar1 = new TopAppBar({
    		props: {
    		variant: "static",
    		color: "secondary",
    		$$slots: { default: [create_default_slot_14] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var fab = new Fab({
    		props: {
    		style: "position: fixed; bottom: 1rem; right: 2rem; z-index: 1;",
    		$$slots: { default: [create_default_slot_12] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});
    	fab.$on("click", doSomething);

    	function drawer_1_open_binding(value) {
    		ctx.drawer_1_open_binding.call(null, value);
    		updating_open = true;
    		add_flush_callback(() => updating_open = false);
    	}

    	let drawer_1_props = {
    		variant: "modal",
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	};
    	if (ctx.drawerOpen !== void 0) {
    		drawer_1_props.open = ctx.drawerOpen;
    	}
    	var drawer_1 = new Drawer({ props: drawer_1_props, $$inline: true });

    	ctx.drawer_1_binding(drawer_1);
    	binding_callbacks.push(() => bind(drawer_1, 'open', drawer_1_open_binding));

    	var scrim = new Scrim({ $$inline: true });

    	var appcontent = new AppContent({
    		props: {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			link0 = element("link");
    			t0 = space();
    			link1 = element("link");
    			t1 = space();
    			link2 = element("link");
    			t2 = space();
    			topappbar0.$$.fragment.c();
    			t3 = space();
    			topappbar1.$$.fragment.c();
    			t4 = space();
    			fab.$$.fragment.c();
    			t5 = space();
    			drawer_1.$$.fragment.c();
    			t6 = space();
    			scrim.$$.fragment.c();
    			t7 = space();
    			appcontent.$$.fragment.c();
    			attr(link0, "rel", "stylesheet");
    			attr(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link0, file$h, 0, 0, 0);
    			attr(link1, "rel", "stylesheet");
    			attr(link1, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700");
    			add_location(link1, file$h, 1, 0, 87);
    			attr(link2, "rel", "stylesheet");
    			attr(link2, "href", "https://fonts.googleapis.com/css?family=Roboto+Mono");
    			add_location(link2, file$h, 2, 0, 185);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, link0, anchor);
    			insert(target, t0, anchor);
    			insert(target, link1, anchor);
    			insert(target, t1, anchor);
    			insert(target, link2, anchor);
    			insert(target, t2, anchor);
    			mount_component(topappbar0, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(topappbar1, target, anchor);
    			insert(target, t4, anchor);
    			mount_component(fab, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(drawer_1, target, anchor);
    			insert(target, t6, anchor);
    			mount_component(scrim, target, anchor);
    			insert(target, t7, anchor);
    			mount_component(appcontent, target, anchor);
    			current_1 = true;
    		},

    		p: function update(changed, ctx) {
    			var topappbar0_changes = {};
    			if (changed.$$scope) topappbar0_changes.$$scope = { changed, ctx };
    			topappbar0.$set(topappbar0_changes);

    			var topappbar1_changes = {};
    			if (changed.$$scope) topappbar1_changes.$$scope = { changed, ctx };
    			topappbar1.$set(topappbar1_changes);

    			var fab_changes = {};
    			if (changed.$$scope) fab_changes.$$scope = { changed, ctx };
    			fab.$set(fab_changes);

    			var drawer_1_changes = {};
    			if (changed.$$scope || changed.current) drawer_1_changes.$$scope = { changed, ctx };
    			if (!updating_open && changed.drawerOpen) {
    				drawer_1_changes.open = ctx.drawerOpen;
    			}
    			drawer_1.$set(drawer_1_changes);

    			var appcontent_changes = {};
    			if (changed.$$scope) appcontent_changes.$$scope = { changed, ctx };
    			appcontent.$set(appcontent_changes);
    		},

    		i: function intro(local) {
    			if (current_1) return;
    			transition_in(topappbar0.$$.fragment, local);

    			transition_in(topappbar1.$$.fragment, local);

    			transition_in(fab.$$.fragment, local);

    			transition_in(drawer_1.$$.fragment, local);

    			transition_in(scrim.$$.fragment, local);

    			transition_in(appcontent.$$.fragment, local);

    			current_1 = true;
    		},

    		o: function outro(local) {
    			transition_out(topappbar0.$$.fragment, local);
    			transition_out(topappbar1.$$.fragment, local);
    			transition_out(fab.$$.fragment, local);
    			transition_out(drawer_1.$$.fragment, local);
    			transition_out(scrim.$$.fragment, local);
    			transition_out(appcontent.$$.fragment, local);
    			current_1 = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(link0);
    				detach(t0);
    				detach(link1);
    				detach(t1);
    				detach(link2);
    				detach(t2);
    			}

    			destroy_component(topappbar0, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(topappbar1, detaching);

    			if (detaching) {
    				detach(t4);
    			}

    			destroy_component(fab, detaching);

    			if (detaching) {
    				detach(t5);
    			}

    			ctx.drawer_1_binding(null);

    			destroy_component(drawer_1, detaching);

    			if (detaching) {
    				detach(t6);
    			}

    			destroy_component(scrim, detaching);

    			if (detaching) {
    				detach(t7);
    			}

    			destroy_component(appcontent, detaching);
    		}
    	};
    }

    function doSomething() {
      alert('something');
    }

    function instance$i($$self, $$props, $$invalidate) {
    	

      let current = 'main';
      let drawer;
      let drawerOpen = false;

      function go(key) {
        $$invalidate('current', current = key);
        $$invalidate('drawerOpen', drawerOpen = false);
      }

    	function click_handler() {
    		const $$result = drawerOpen = !drawerOpen;
    		$$invalidate('drawerOpen', drawerOpen);
    		return $$result;
    	}

    	function click_handler_1() {
    		return go('main');
    	}

    	function click_handler_2() {
    		return go('other');
    	}

    	function click_handler_3() {
    		return go('other');
    	}

    	function click_handler_4() {
    		return go('other');
    	}

    	function drawer_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('drawer', drawer = $$value);
    		});
    	}

    	function drawer_1_open_binding(value) {
    		drawerOpen = value;
    		$$invalidate('drawerOpen', drawerOpen);
    	}

    	return {
    		current,
    		drawer,
    		drawerOpen,
    		go,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		drawer_1_binding,
    		drawer_1_open_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$j, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
