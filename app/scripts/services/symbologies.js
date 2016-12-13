'use strict';

/**
 * @ngdoc service
 * @name sisdrApp.symbologies
 * @description
 * # symbologies
 * Service in the sisdrApp.
 */
angular.module('sisdrApp')
    .provider('symbologies', function() {

        var styles = {};

        function registerStyle(name, leafletClass, options, optionsFunction) {
            styles[name] = {
                leafletCls: leafletClass,
                options: options,
                optionsFunction: optionsFunction
            };
            return this;
        }

        return {

            register: registerStyle,

            $get: function() {
                return {
                    make: function(geometry, styleName) {
                        var style = styles[styleName];
                        if (style.optionsFunction) {
                            style.optionsFunction(style.options, geometry, styleName);
                        }
                        return style.leafletCls(geometry, style.options);
                    }
                };
            }
        };
    });