Backbone.keys
=============
Easily add keyboard support in your Backbone views.


## Usage ##
Backbone.keys is made to work declaratively with your existing views.

### Basic usage
To use, simply add a `keys` hash to the view. The name of each property should reflect the keys that trigger the event, and the value is the method to be called when the given key or keys are pressed. Multiple keys can be bound to the same action by comma separating them. Modifier keys can also be used by using the syntax `[key]+[modifier]`.
```javascript
MyView = Backbone.View.extend({
  keys: {
    'left,right,up,down': 'onNavigate'
  },

  // The name variable is the name of the pressed key
  onNavigate : function(e, name) {
    //Process action
  }
});
``` 

### Targets
Keys can be configured so they only fire when the given key or keys are pressed and a specific target is focused, instead of the entire view. To bind a key to fire on a specific element, add a jQuery selector after the key events you wish to bind:
```javascript
MyView = Backbone.View.extend({
  keys: {
    'esc .dropdown-menu':{
      action: function(e){
        $(e.target).closest('.dropdown').trigger('click');
        $(e.target).closest('.dropdown').children('.js-dropdown-toggle').focus();
        e.stopPropagation();
      }
    }
  }
});
```

### Additional configuration
For more fine-grained control of each event, an object can be used.
```javascript
MyView = Backbone.View.extend({
  keys: {
    's+ctrl': {
      action: function(e){
        this.save(e);
      },
      on: 'keyup'
    },
    'esc': {
      action: function(e){
        this.cancel(e);
      },
      on: 'keydown'
    }
  }
});
```

The following options are available:
- `action`: The function to execute when the given key combination occurs. Can be a function or the name of a function on the view.
- `on`: When the action should be executed. Optional. Valid options are `keyup` and `keydown`. If no value is provided, the `bindKeysOn` value is used.

## View-Level Configuration
You can specify the default behavior of key bindings by setting certain properties on the view.
- `bindKeysOn`: Specifies which event the binding should respond to. Possible values: `keyup`, `keydown`. Default: `keyup`
- `bindKeysScoped`: 

### Manually binding and unbinding ###

You can bind and unbind events manually:

```javascript
this.keyOn('return', this.onEnter);

this.keyOff('return', this.onEnter);

// Unbind all for key
this.keyOff('return');

// Unbind all
this.keyOff();
```


## Download & Include ##

### Manual download

* [Development](https://raw.github.com/roydanenterprises/backbone.keys/master/backbone.keys.js)
* [Production](https://raw.github.com/roydanenterprises/backbone.keys/master/dist/backbone.keys.min.js)

Depends on Underscore, Backbone and an underlying DOM library that handles event bindings.

Include in your application *after* DOM library, Underscore, and Backbone have been included.

``` html
<script src="/js/jquery.js"></script>
<script src="/js/underscore.js"></script>
<script src="/js/backbone.js"></script>

<script src="/js/backbone.keys.js"></script>
```

Note that backbone.keys currently overwrites `Backbone.View` to make its usage a no-op, part from including it.