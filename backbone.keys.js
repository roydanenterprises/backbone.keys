/*     Backbone.keys 0.1
 *
 *     Raymond Julin, Keyteq AS, Roydan Enterprises
 *     Licensed under the MIT license.
 */

(function(factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['underscore', 'backbone', 'jquery'], factory);
	} else {
		// Browser globals
		factory(_, Backbone, $);
	}
}(function(_, Backbone, $) {
	'use strict';

	// Alias the libraries from the global object
	var oldDelegateEvents = Backbone.View.prototype.delegateEvents;
	var oldUndelegateEvents = Backbone.View.prototype.undelegateEvents;
	var getKeyCode = function(key) {
		return (key.length === 1) ?
			key.toUpperCase().charCodeAt(0) : BackboneKeysMap[key];
	};

	// Map keyname to keycode
	var BackboneKeysMap = {
		backspace: 8,
		tab: 9,
		enter: 13,
		space: 32,

		// Temporal modifiers
		shift: 16,
		ctrl: 17,
		alt: 18,
		meta: 91,

		// Modal
		caps_lock: 20,
		esc: 27,
		num_lock: 144,

		// Navigation
		page_up: 33,
		page_down: 34,
		end: 35,
		home: 36,
		left: 37,
		up: 38,
		right: 39,
		down: 40,

		// Insert/delete
		insert: 45,
		'delete': 46,

		// F keys
		f1: 112,
		f2: 113,
		f3: 114,
		f4: 115,
		f5: 116,
		f6: 117,
		f7: 118,
		f8: 119,
		f9: 120,
		f10: 121,
		f11: 122,
		f12: 123,
		fslash : 191
	};

	// Aliased names to make sense on several platforms
	_.each({
		'options': 'alt',
		'return': 'enter'
	}, function(real, alias) {
		BackboneKeysMap[alias] = BackboneKeysMap[real];
	});


	Backbone.View = Backbone.View.extend({

		// Allow per view what specific event to use
		// Keyup is defaulted as it only fires once per keystroke
		bindKeysOn: 'keyup',

		// Hash of bound listeners
		_keyEventBindings: null,

		// Override delegate events
		delegateEvents: function () {
			oldDelegateEvents.apply(this, Array.prototype.slice.apply(arguments));
			this.delegateKeys();
			return this;
		},

		// Clears all callbacks previously bound to the view with `delegateEvents`.
		// You usually don't need to use this, but may wish to if you have multiple
		// Backbone views attached to the same DOM element.
		undelegateEvents: function() {
			this.undelegateKeys();
			oldUndelegateEvents.apply(this, arguments);
			return this;
		},

		// Actual delegate keys
		delegateKeys: function(keys) {
			this.undelegateKeys();
			this.bindTo = [];
			keys = keys || (this.keys);
			if (keys) {
				_.each(keys, function(args, key) {
					var triggerArgs = {};

					var keys = key;
					var target = '';

					if (key.indexOf(' ') >= 0){
						keys = key.split(' ')[0];
						target = key.substring(key.indexOf(' ') + 1);
					}

					var method;

					if (_.isFunction(args)) method = args;
					else if (_.isFunction(args.action)) method = args.action;
					else if (args.action) method = this[args.action];
					else method = this[args];

					triggerArgs.on = args.on || this.bindKeysOn;
					triggerArgs.action = method;
					triggerArgs.target = target;

					this.bindTo.push(target);
					var newKeys = keys.replace(/,/g, ' ');
					this.keyOn(newKeys, triggerArgs);
				}, this);

				this.bindTo = _.uniq(this.bindTo);
				_.each(this.bindTo, function (target) {
					var triggerArgs = { view: this, target: target };
					if (target !== '' && this.$el) {
						this.$el.on('keyup', target, _.bind(this.triggerKey, triggerArgs));
						this.$el.on('keydown', target, _.bind(this.triggerKey, triggerArgs));
					} else {
						this.$el.on('keyup', _.bind(this.triggerKey, triggerArgs));
						this.$el.on('keydown', _.bind(this.triggerKey, triggerArgs));
					}
				}, this);
			}


			return this;
		},

		// Undelegate keys
		undelegateKeys: function() {
			this._keyEventBindings = {};

			if (this.$el) {
				this.$el.off('keyup');
				this.$el.off('keydown');
			}

			if (this.bindTo) {
				_.each(this.bindTo, function(element) {
					if (!element) return;
					if (this.$el) {
						this.$el.find(element).off('keyup');
						this.$el.find(element).off('keydown');
					}
				}, this);
				this.bindTo = null;
			}
			return this;
		},

		// Utility to get the name of a key
		// based on its keyCode
		keyName: function(keyCode) {
			var keyName;
			for (keyName in BackboneKeysMap)
				if (BackboneKeysMap[keyName] === keyCode) return keyName;
			return String.fromCharCode(keyCode);
		},

		// Internal real listener for key events that
		// forwards any relevant key presses
		triggerKey: function(e) {
			var key;

			if (_.isObject(e)) key = e.which;
			else if (_.isString(e)) key = getKeyCode(e);
			else if (_.isNumber(e)) key = e;

			//Ctrl key support
			if (e.type === 'keydown' && !this.view.ctrlPressed) {
				this.view.ctrlPressed = e['ctrlKey'];
			}
			//Alt key support
			if (e.type === 'keydown' && !this.view.altPressed) {
				this.view.altPressed = e['altKey'];
			}

			_(this.view._keyEventBindings[key]).each(function(listener) {
				if (listener.target !== this.target) {
					return;
				}
				var trigger = e.type === listener.on;
				if (listener.modifiers.length > 0) {
					trigger = trigger && _(listener.modifiers).all(function(modifier) {
						return e[modifier + 'Key'] === true;
					});
				} else if (this.view.ctrlPressed || this.view.altPressed) {
					return;
				}
				if (trigger && listener.method) {
					if (this.view.preventKeyboardAction === true) {
						e.stopPropagation();
						return;
					}
					listener.method(e, listener.key);
				}
			}, this);

			//needs to go at the end.  this is a timing issue.
			if (e.type === 'keyup' && this.view.ctrlPressed) {
				this.view.ctrlPressed = e['ctrlKey'];
			}
			if (e.type === 'keyup' && this.view.altPressed) {
				this.view.altPressed = e['altKey'];
			}

			// return true;
			return this.view;
		},

		// Doing the real work of binding key events
		keyOn: function(key, args) {
			key = key.split(' ');
			if (key.length > 1) {
				var l = key.length;
				while (l--)
					this.keyOn(key[l], args);
				return;
			} else key = key.pop().toLowerCase();

			// Subtract modifiers
			var components = key.split('+');
			key = components.shift();
			var keyCode = getKeyCode(key);

			if (!this._keyEventBindings.hasOwnProperty(keyCode)) {
				this._keyEventBindings[keyCode] = [];
			}

			this._keyEventBindings[keyCode].push({
				key: key,
				modifiers: (components || false),
				method: args.action ? _.bind(args.action, this) : null,
				on: args.on,
				target: args.target
			});
			return this;
		},

		keyOff: function(key, method) {
			method = (method || false);
			if (key === null) {
				this._keyEventBindings = {};
				return this;
			}
			var keyCode = getKeyCode(key);
			if (!_.isFunction(method)) method = this[method];
			if (!method) {
				this._keyEventBindings[keyCode] = [];
				return this;
			}
			this._keyEventBindings[keyCode] = _.filter(
				this._keyEventBindings[keyCode],
				function(data, index) {
					return data.method === method;
				}
			);
			return this;
		}
	});

	return Backbone;
}));