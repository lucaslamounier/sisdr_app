'use strict';

/**
 * @ngdoc directive
 * @name sisdrApp.directive:controlSwitch
 * @description
 * # controlSwitch
 */

function testImage(url, callback, popover, timeout) {
    timeout = timeout || 5000;
    var timedOut = false,
        timer;
    var img = new Image();
    img.onerror = img.onabort = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "error", popover);
        }
    };
    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "success", popover);
        }
    };
    img.src = url;
    timer = setTimeout(function() {
        timedOut = true;
        callback(url, "timeout", popover);
    }, timeout);
}

angular.module('sisdrApp')
    .directive('controlSwitch', function() {
        return {
            template: '<div></div>',
            restrict: 'A',
            transclude: true,
            link: function postLink(scope, element, attrs) {
                L.Control["Switch"] = L.Control.extend({
                    options: {
                        collapsed: true,
                        position: "topright",
                        autoZIndex: true,
                        enableTabs: false,
                        miscTabsName: "Outros"
                    },
                    initialize: function(baseLayers, overlayers, tabs, options) {
                        L.Util.setOptions(this, options);
                        this._layers = {};
                        this._lastZIndex = 0;
                        this._handlingClick = false;
                        this._baseLayers = [];
                        if (tabs) {
                            this._tabs = tabs;
                            this.options.enableTabs = true;
                        }
                        $.each(baseLayers, (function(_this) {
                            return function(name, obj) {
                                return _this._addLayer(obj.layer, name, false, false, null);
                            };
                        })(this));
                        return $.each(overlayers, (function(_this) {
                            return function(name, obj) {
                                var control;
                                control = typeof obj.overlayControl === "boolean" ? obj.overlayControl : false;
                                return _this._addLayer(obj.layer, name, true, control, obj.tab);
                            };
                        })(this));
                    },
                    onAdd: function(map) {
                        this._initLayout();
                        this._update();
                        map.on("layeradd", this._onLayerChange, this).on("layerremove", this._onLayerChange, this);
                        return this._container;
                    },
                    onRemove: function(map) {
                        return map.off("layeradd", this._onLayerChange).off("layerremove", this._onLayerChange);
                    },
                    addBaseLayer: function(layer, name) {
                        this._addLayer(layer, name);
                        this._update();
                        return this;
                    },
                    addOverLayer: function(layer, name, tab, allowRemove, showLegend, tooltip) {
                        this._addLayer(layer, name, true, tab, allowRemove, showLegend, tooltip);
                        this._update();
                        return this;
                    },
                    removeLayer: function(layer) {
                        var id;
                        id = L.stamp(layer);
                        delete this._layers[id];
                        this._update();
                        return this;
                    },
                    _initLayout: function() {
                        var className, container, form, link, obj;
                        className = "switch-control-layers";
                        container = this._container = L.DomUtil.create("div", "leaflet-bar " + className);
                        container.setAttribute('aria-haspopup', true);
                        if (!L.Browser.touch) {
                            L.DomEvent.disableClickPropagation(container);
                            L.DomEvent.on(container, "mousewheel", L.DomEvent.stopPropagation);
                        } else {
                            L.DomEvent.on(container, "click", L.DomEvent.stopPropagation);
                        }
                        form = this._form = L.DomUtil.create("form", className + "-list form-layer-list");
                        if (this.options.collapsed) {
                            L.DomEvent.on(container, "mouseover", this._expand, this).on(container, "mouseout", this._collapse, this);
                            link = this._layersLink = L.DomUtil.create("a", className + "-toggle", container);
                            link.href = "#";
                            link.title = "Layers";
                            if (L.Browser.touch) {
                                L.DomEvent.on(link, "click", L.DomEvent.stop).on(link, "click", this._activeTab, this).on(link, "click", this._expand, this);
                            } else {
                                L.DomEvent.on(link, "mouseover", this._activeTab, this).on(link, "focus", this._expand, this);
                            }
                            this._map.on("click", this._collapse, this);
                        } else {
                            this._expand();
                        }
                        this._baseLayersList = L.DomUtil.create('div', className + '-base' + ' base-padding', form);
                        if (!this.options.enableTabs) {
                            this._separator = L.DomUtil.create('div', className + '-separator', form);
                        }
                        this._overlayersList = L.DomUtil.create('div', className + '-overlayers', form);
                        if (this.options.enableTabs) {
                            this._tabsOverLayers = L.DomUtil.create('ul', 'nav nav-tabs', form);
                            $(this._tabsOverLayers).attr('id', 'tabsOverLayers');
                            this._tabsContentOverLayers = L.DomUtil.create('div', 'tab-content', form);
                            $(this._tabsContentOverLayers).attr('id', 'tabsContent');
                            this._tabsList = {};
                            $.each(this._tabs, (function(_this) {
                                return function(tab, obj) {
                                    _this._createTab(tab, obj);
                                    if (obj.tabs === void 0) {
                                        return _this.options.miscTabs = true;
                                    }
                                };
                            })(this));
                            if (this.options.miscTabs) {
                                obj = {
                                    icon: "images/icons/layers_black.png",
                                    selected: false
                                };
                                this._createTab(this.options.miscTabsName, obj);
                            }
                        }
                        return $(container).append(form);
                    },
                    _createTab: function(tab, obj) {
                        var newTab, newTabContent, newTabName;
                        newTab = L.DomUtil.create('li', '', this._tabsOverLayers);
                        newTabContent = L.DomUtil.create('div', 'tab-pane fade', this._tabsContentOverLayers);
                        $(newTabContent).attr('id', tab);
                        this._tabsList[tab] = newTabContent;
                        newTabName = L.DomUtil.create('a', 'tab-class', newTab);
                        $(newTabName).attr('id', "tabLink" + tab);
                        $(newTabName).attr('data-target', "#" + tab);
                        $(newTabName).attr('data-toggle', 'tab');
                        if (obj.name) {
                            newTabName.innerHTML = obj.name;
                        } else {
                            newTabName.innerHTML = '<img src=" ' + obj.icon + '" width="22px" height="22px">';
                        }
                        if (obj.selected) {
                            this._selectedTab = newTabName;
                            this._selectedTabContent = newTabContent;
                        }
                        L.DomEvent.on(newTabName, "click", (function() {
                            this._selectedTab = newTabName;
                            return this._selectedTabContent = newTabContent;
                        }), this);
                        if (L.Browser.touch) {
                            L.DomEvent.on(newTabName, "click", L.DomEvent.stop).on(newTabName, "click", this._activeTab, this).on(newTabName, "click", this._expand, this);
                        }
                    },
                    _activeTab: function() {
                        return $(this._selectedTab).trigger("click");
                    },
                    _addLayer: function(layer, name, overlayer, tab, allowRemove, showLegend, tooltip) {
                        var id;
                        id = L.stamp(layer);
                        this._layers[id] = {
                            layer: layer,
                            name: name,
                            overlayer: overlayer,
                            allowRemove: allowRemove,
                            tooltip: tooltip,
                            tab: tab,
                            showLegend: showLegend
                        };
                        if (this.options.autoZIndex && layer.setZIndex) {
                            this._lastZIndex++;
                            return layer.setZIndex(this._lastZIndex);
                        }
                    },
                    _update: function() {
                        var baseLayersPresent, i, obj, overlayersPresent, _results;
                        if (!this._container) {
                            return;
                        }
                        this._baseLayersList.innerHTML = "";
                        this._overlayersList.innerHTML = "";
                        if (this.options.enableTabs) {
                            $.each(this._tabsList, function() {
                                return $(this).html("");
                            });
                        }
                        baseLayersPresent = false;
                        overlayersPresent = false;
                        _results = [];
                        for (i in this._layers) {
                            obj = this._layers[i];
                            this._addItem(obj);
                            overlayersPresent = overlayersPresent || obj.overlayer;
                            baseLayersPresent = baseLayersPresent || !obj.overlayer;
                            if (!this.options.enableTabs) {
                                _results.push(this._separator.style.display = (overlayersPresent && baseLayersPresent ? "" : "none"));
                            } else {
                                _results.push(void 0);
                            }
                        }
                        return _results;
                    },
                    _onLayerChange: function(e) {
                        var obj, type;
                        obj = this._layers[L.stamp(e.layer)];
                        if (!obj) {
                            return;
                        }
                        if (!this._handlingClick) {
                            this._update();
                        }
                        type = (obj.overlayer ? (e.type === "layeradd" ? "overlayeradd" : "overlayerremove") : (e.type === "layeradd" ? "baselayerchange" : null));
                        if (type) {
                            return this._map.fire(type, obj);
                        }
                    },
                    _addItem: function(obj) {
                        var checked, container, control, controlgroup, input, label, name, slider, toggle, closeBtn;
                        var maxCharLen = 23;
                        if (obj.overlayer) {
                            if (this.options.enableTabs) {
                                if (obj.tab) {
                                    container = this._tabsList[obj.tab];
                                } else if (this.options.miscTabs) {
                                    container = this._tabsList[this.options.miscTabsName];
                                }
                            } else {
                                container = this._overlayersList;
                            }

                        } else {
                            container = this._baseLayersList;
                        }
                        controlgroup = L.DomUtil.create("div", "control-group", container);

                        if (obj.allowRemove) {
                            maxCharLen = 19
                            closeBtn = L.DomUtil.create("a", "close-btn", controlgroup);
                            closeBtn.setAttribute('title', obj.name);
                            closeBtn.innerHTML = '<span>&times;</span>';

                            L.DomEvent.addListener(closeBtn, "click", (function(e) {
                                L.DomEvent.stopPropagation(e);
                                var layers = this._layers,
                                    layer;
                                $.each(layers, function(value) {
                                    if (layers[value].name == obj.name)
                                        layer = layers[value];
                                })
                                this.removeLayer(layer.layer);
                                this._map.removeLayer(layer.layer);
                                delete scope.layers[layer.name];

                            }), this);
                        }

                        checked = this._map.hasLayer(obj.layer);
                        label = L.DomUtil.create("label", "control-label", controlgroup);

                        var legend = "";
                        if (obj.showLegend) {
                            maxCharLen = maxCharLen - 5;

                            var fill = ""
                            if (obj.showLegend.type == 'circle') {
                                fill = ' background: radial-gradient(circle at center center , ' + obj.showLegend.fill + ' 70%, transparent 65%);';
                            }

                            legend = "<img src='" + obj.showLegend.url + "' style='margin-right: 2px; margin-bottom: 2px;" + fill + "' width='14', height='14'> </img>";
                        }


                        if (obj.name.length > maxCharLen) {
                            name = obj.name.substr(0, maxCharLen) + "…";
                            label.innerHTML = legend + "<span title=\"" + obj.name + "\">" + name + "</span>";
                        } else {
                            label.innerHTML = legend + "<span title=\"" + obj.name + "\">" + obj.name + "</span>";
                        }

                        control = L.DomUtil.create("div", "control", controlgroup);
                        toggle = L.DomUtil.create("div", "switch-small", control);

                        input = L.DomUtil.create("input", "", toggle);

                        if (obj.overlayer) {
                            input.type = "checkbox";
                            L.DomUtil.addClass(input, "switch-control-layers-selector");

                        } else {
                            input.type = "radio";
                            $(input).attr("name", "leaflet-base-layers");
                            $(input).attr("data-radio-all-off", "false");
                        }

                        input.defaultChecked = checked;
                        input.layerId = L.stamp(obj.layer);
                        $(input).bootstrapSwitch({
                            size: "mini"
                        });
                        if (!obj.overlayer) {
                            this._baseLayers.push({
                                'input': input,
                                'obj': obj
                            });
                        }

                        $(input).on("switchChange.bootstrapSwitch", (function(_this) {
                            return function(e, data) {
                                if (!obj.overlayer) {
                                    return $.each(_this._baseLayers, function(key, value) {
                                        _this._onInputClick(value.input, value.obj);
                                    });

                                } else {
                                    return _this._onInputClick(input, obj);
                                }
                            };
                        })(this));
                        return controlgroup;
                    },
                    _onInputClick: function(input, obj) {
                        this._handlingClick = true;
                        if (input.checked && !this._map.hasLayer(obj.layer)) {
                            this._map.addLayer(obj.layer);
                        } else {
                            if (!(input.checked && this._map.hasLayer(obj.layer))) {
                                this._map.removeLayer(obj.layer);
                            }
                        }
                        return this._handlingClick = false;
                    },
                    _expand: function() {
                        L.DomUtil.addClass(this._form, "switch-control-layers-expanded");
                        if (scope.map.minimap) {
                            return scope.map.minimap.toggleMinimap(false);
                        }
                    },
                    _collapse: function() {
                        this._form.className = this._form.className.replace(" switch-control-layers-expanded", "");
                        if (scope.map.minimap) {
                            return scope.map.minimap.toggleMinimap(true);
                        }
                    }
                });

                L.control.switch = function(baseLayers, overlayers, tabs, options) {
                    return new L.Control['Switch'](baseLayers, overlayers, tabs, options);
                };
            }
        };
    });