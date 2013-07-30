define(['sge', './config'], function(sge, config){
    // Creates a proxying function that will call the real object.
    function createProxyFunction(functionName) {
        return function() {
            // 'this' in here is the proxy object.
            var realObject = this.__realObject__,
                realFunction = realObject[functionName];
 
            // Call the real function on the real object, passing any arguments we received.
            return realFunction.apply(realObject, arguments);
        };
    };
 
    // createProxyClass creates a function that will create Proxy objects.
    //   publicFunctions: an object of public functions for the proxy.
    var ProxyClass = sge.Class.extend({
        init: function(realObject) {
            // This is this Proxy object constructor.
            // Choose a reasonably obscure name for the real object property.
            // It should avoid any conflict with the public function names.
            // Also any code being naughty by using this property is quickly spotted!
            this.__realObject__ = realObject;
            
     
            // Create a proxy function for each of the public functions.
            for (functionName in publicFunctions) {
                func = publicFunctions[functionName];
                // We only want functions that are defined directly on the publicFunctions object.
                if (publicFunctions.hasOwnProperty(functionName)){
                    if (typeof func === "function") {
                        this[functionName] = this.__realObject__[functionName].bind(this.__realObject__);
                    } else {
                        this.__defineGetter__(functionName, function(){
                            return this.__realObject__[functionName];
                        });
                    }
                }
            }
        }
    });
            


    var Expr = sge.Class.extend({
        init: function(sourceCode){
            this._sourceCode = sourceCode;
            this._ctx = {};
        },
        addContext: function(key, value){
            this._ctx[key] = new ProxyObject(value);
        },
        loadContext: function(ctx){
            var vars = Object.keys(ctx);
            for (var i = vars.length - 1; i >= 0; i--) {
                this._ctx[vars[i]] = ctx[vars[i]];
            }
        },
        run: function(){
            var sourceCode = ""
            var vars = Object.keys(this._ctx);
            for (var i = vars.length - 1; i >= 0; i--) {
                var v = vars[i];
                sourceCode += ('var ' + v + ' = ctx["' + v + '"];\n'); 
            };
            sourceCode += this._sourceCode;

            var func = new Function('ctx', sourceCode);
            func(this._ctx);
        }
    })

    return Expr;
})