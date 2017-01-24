var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
$.arcticmodal('setDefault', {
    modal: false,
    closeOnEsc: false,
    openEffect: {
        type: 'none'
    },
    closeEffect: {
        type: 'none'
    },
    //fixed: '.header.is-fixed',
    closeOnOverlayClick: true
});
$.fn.reverse = [].reverse;
$.fn.serializeObject = function () {
    var json = {};
    $.map($(this).serializeArray(), function (n, i) {
        json[n['name']] = n['value'];
    });
    return json;
};
$(function () {
    Creonit.Admin.Component.Utils.initializeComponents();
});
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Scope = (function () {
                function Scope() {
                    this.scopes = [];
                    this.parameters = {};
                }
                Scope.prototype.applySchema = function (schema) {
                    var _this = this;
                    schema = $.extend({}, schema);
                    if (schema.template) {
                        this.template = twig({ autoescape: true, data: schema.template, options: { asdas: 'vertal' } });
                        delete schema.template;
                    }
                    if (schema.scopes) {
                        schema.scopes.forEach(function (scope) {
                            var child = new Scope();
                            child.applySchema(scope);
                            _this.addScope(child);
                        });
                        delete schema.scopes;
                    }
                    $.extend(this.parameters, schema);
                };
                Scope.prototype.getScope = function (name) {
                    return this.scopes.filter(function (scope) { return scope.parameters.name == name; })[0];
                };
                Scope.prototype.addScope = function (scope) {
                    scope.setParentScope(this);
                    this.scopes.push(scope);
                    return this;
                };
                Scope.prototype.setParentScope = function (scope) {
                    this.parentScope = scope;
                    return this;
                };
                return Scope;
            }());
            Component.Scope = Scope;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component_1) {
            var Component = (function (_super) {
                __extends(Component, _super);
                function Component(node, name, query, options, parent) {
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    _super.call(this);
                    this.query = {};
                    this.options = {};
                    this.data = {};
                    this.actions = {};
                    this.events = {};
                    this.manager = Admin.Manager.getInstance();
                    if (name.indexOf('.') == -1) {
                        if (parent) {
                            name = parent.getModuleName() + '.' + name;
                        }
                        else {
                            name = CreonitAdminActiveModule + '.' + name;
                        }
                    }
                    else if (name.indexOf('.') == 0) {
                        name = CreonitAdminActiveModule + name;
                    }
                    this.name = name;
                    this.query = $.extend({}, query);
                    this.node = node;
                    this.parent = parent;
                    this.options = options;
                    this.initialize();
                    this.loadSchema();
                }
                Component.prototype.initialize = function () {
                };
                Component.prototype.getNode = function () {
                    return this.node;
                };
                Component.prototype.action = function (name, options) {
                    if (this.actions[name]) {
                        return this.actions[name].apply(this, options);
                    }
                    else {
                        throw new Error("Undefined method " + name + " in component " + this.name);
                    }
                };
                Component.prototype.getName = function () {
                    return this.name;
                };
                Component.prototype.getModuleName = function () {
                    return this.name.substring(0, this.name.indexOf('.'));
                };
                Component.prototype.getQuery = function () {
                    return $.extend({}, this.query);
                };
                Component.prototype.loadSchema = function () {
                    var _this = this;
                    this.node.html('<div class="loading"><i class="fa fa-cog fa-spin fa-fw"></i></div>');
                    this.request(Component_1.Request.TYPE_LOAD_SCHEMA, this.getQuery(), null, function (response) {
                        if (_this.checkResponse(response, _this.options.modal)) {
                            _this.applyResponse(response);
                        }
                        else {
                            if (_this.options.modal) {
                                _this.node.arcticmodal('close');
                            }
                            else {
                                _this.node.html("<div class=\"loading is-error\"><i class=\"fa fa-cog fa-spin fa-fw\"></i>" + (response.error['_'] ? response.error['_'].join(", ") : 'Ошибка загрузки компонента') + "</div>");
                            }
                        }
                    });
                };
                Component.prototype.loadData = function () {
                    var _this = this;
                    this.node.stop(true).delay(300).animate({ opacity: .85 }, 600);
                    this.request(Component_1.Request.TYPE_LOAD_DATA, this.getQuery(), null, function (response) {
                        _this.node.stop(true).animate({ opacity: 1 }, 300);
                        _this.checkResponse(response) && _this.applyResponse(response);
                    });
                };
                Component.prototype.checkResponse = function (response, announce) {
                    if (announce === void 0) { announce = true; }
                    if (response.error) {
                        if (announce && response.error['_']) {
                            alert(response.error['_'].join("\n"));
                        }
                        return false;
                    }
                    else {
                        return true;
                    }
                };
                Component.prototype.applyResponse = function (response) {
                    if (response.schema) {
                        this.applySchema(response.schema);
                    }
                    if (response.query) {
                        $.extend(this.query, response.query);
                    }
                    this.data = response.data || {};
                    this.render();
                    this.node.find('[js-component-external-field-reset]')
                        .off('.component')
                        .on('click.component', function (e) {
                        e.preventDefault();
                        var $input = $(e.currentTarget).prev('a').find('[js-component-external-field]');
                        $input.text($input.data('empty')).parent().parent().next('input').val('');
                    });
                };
                Component.prototype.applySchema = function (schema) {
                    var _this = this;
                    $.each(schema.actions, function (name, action) {
                        _this.actions[name] = eval('(function(){return ' + action + '})()');
                    });
                    $.each(schema.events, function (name, action) {
                        _this.on(name, eval('(function(){return ' + action + '})()'));
                    });
                    $.extend(this.actions, {
                        openComponent: this.openComponent
                    });
                    if (this.options.external) {
                        this.actions['external'] = function (value, title) {
                            _this.parent.node.find("[js-component-external-field=" + _this.options.external + "]").text(title).parent().parent().next('input').val(value);
                            _this.node.arcticmodal('close');
                        };
                    }
                    _super.prototype.applySchema.call(this, schema);
                };
                Component.prototype.render = function () {
                };
                Component.prototype.close = function () {
                    if (this.options.modal) {
                        this.node.arcticmodal('close');
                    }
                };
                Component.prototype.trigger = function (event, data) {
                    var _this = this;
                    if (this.events[event]) {
                        this.events[event].forEach(function (listener) {
                            listener.call(_this, data);
                        });
                    }
                    this.manager.trigger('component_' + event, $.extend({}, data, { component: this }));
                };
                Component.prototype.on = function (event, callback) {
                    if (!this.events[event]) {
                        this.events[event] = [];
                    }
                    if (this.events[event].indexOf(callback) == -1) {
                        this.events[event].push(callback);
                    }
                };
                Component.prototype.request = function (type, query, data, callback) {
                    if (query === void 0) { query = {}; }
                    this.manager.request(new Component_1.Request(this, type, query, data, callback));
                };
                Component.prototype.openComponent = function (name, query, options) {
                    var _this = this;
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    options.modal = true;
                    var interval;
                    $("\n                <div class=\"modal-dialog modal-lg\">\n                    " + Component_1.Helpers.component(name, query, options) + "\n                </div>\n            ").arcticmodal({
                        beforeOpen: function (modal, $modal) {
                            Component_1.Utils.initializeComponents($modal, _this);
                        },
                        afterOpen: function (modal, $modal) {
                            var $container = $modal.closest('.arcticmodal-container');
                            interval = setInterval(function () {
                                var $footer = $modal.find('.modal-footer');
                                if (!$footer.length) {
                                    return;
                                }
                                clearInterval(interval);
                                var fix = function () {
                                    $footer.offset({ top: $container.height() + $(window).scrollTop() - $footer.outerHeight() });
                                    if (parseInt($footer.css('top')) > 0) {
                                        $footer.removeAttr('style');
                                    }
                                };
                                interval = setInterval(fix, 1000);
                                fix();
                                $container.on('scroll', fix);
                            }, 10);
                        },
                        afterClose: function () {
                            clearInterval(interval);
                        }
                    });
                };
                return Component;
            }(Component_1.Scope));
            Component_1.Component = Component;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Editor = (function (_super) {
                __extends(Editor, _super);
                function Editor() {
                    _super.apply(this, arguments);
                    this.locked = false;
                }
                Editor.prototype.initialize = function () {
                    this.node.addClass('component component-editor');
                };
                Editor.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\"><span>\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.parameters.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body\">\n                        </div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-content').append("<div class=\"modal-footer\">" + Component.Helpers.submit('Сохранить и закрыть', { className: 'editor-save-and-close' }) + " " + Component.Helpers.submit('Сохранить') + " " + Component.Helpers.button('Закрыть') + "</div>");
                        this.node.find('.modal-footer button[type=button], .modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    node.append(this.template.render($.extend({}, this.data, { _query: this.query, _key: this.query.key || null })));
                    if (!this.options.modal) {
                        this.node.append(Component.Helpers.submit('Сохранить'));
                    }
                    var formId = "form" + ++Editor.increment, $form = $("<form id=\"" + formId + "\"></form>");
                    this.node.append($form);
                    this.node.find('input, textarea, select, button').attr('form', formId).filter('input').eq(0).focus();
                    this.node.find('select[js-component-select-reload]').change(function () {
                        var data = $form.serializeObject(), query = _this.getQuery();
                        _this.request('reload_data', query, data, function (response) {
                            if (_this.checkResponse(response)) {
                                _this.applyResponse(response);
                            }
                        });
                    });
                    this.node.find('.text-editor').tinymce({
                        doctype: 'html5',
                        element_format: 'html',
                        plugins: ['anchor autolink code colorpicker contextmenu image fullscreen hr link media paste nonbreaking  visualblocks table searchreplace charmap'],
                        resize: true,
                        height: 150,
                        visualblocks_default_state: true,
                        relative_urls: false,
                        paste_data_images: true,
                        paste_as_text: true,
                        keep_styles: false,
                        language: 'ru',
                        statusbar: false,
                        toolbar: 'styleselect | bold italic removeformat | link unlink | bullist numlist | image media | code fullscreen',
                        image_advtab: true,
                        menubar: 'edit insert view format table tools',
                        browser_spellcheck: true,
                        setup: function (editor) {
                        }
                    });
                    this.node.find('input')
                        .filter('[type="date"]').attr('type', 'text')
                        .end()
                        .inputmask();
                    this.node.find('.editor-save-and-close').on('click', function (e) {
                        $(e.currentTarget).attr('clicked', true);
                    });
                    this.node.find('[js-component-action]').on('click', function (e) {
                        e.preventDefault();
                        var $action = $(e.currentTarget);
                        _this.action($action.data('name'), $action.data('options'));
                    });
                    $form.on('submit', function (e) {
                        e.preventDefault();
                        if (_this.locked) {
                            return;
                        }
                        _this.locked = true;
                        var data = $form.serializeObject(), query = _this.getQuery(), $buttonCloseAfterSave = _this.node.find('.editor-save-and-close[clicked]'), closeAfterSave = !!$buttonCloseAfterSave.length;
                        $buttonCloseAfterSave.removeAttr('clicked');
                        if (closeAfterSave) {
                            query.closeAfterSave = 1;
                        }
                        _this.node.find("input[type=\"file\"][form=\"" + formId + "\"]").each(function () {
                            var value = $(this)[0].files[0];
                            if (value) {
                                data[$(this).attr('name')] = $(this)[0].files[0];
                            }
                        });
                        _this.node.find('.error-message').each(function () {
                            var $message = $(this), $group = $message.closest('.form-group');
                            $message.remove();
                            $group.removeClass('has-error');
                        });
                        _this.request('send_data', query, data, function (response) {
                            _this.locked = false;
                            if (_this.checkResponse(response)) {
                                if (closeAfterSave) {
                                    _this.node.arcticmodal('close');
                                }
                                else {
                                    _this.applyResponse(response);
                                }
                                if (_this.parent) {
                                }
                            }
                            else {
                                $.each(response.error, function (scope, messages) {
                                    if ('_' == scope)
                                        return;
                                    _this.node.find("input[name=" + scope + "], select[name=" + scope + "], textarea[name=" + scope + "]").each(function () {
                                        var $control = $(this), $group = $control.closest('.form-group');
                                        $group.addClass('has-error');
                                        $control.after("<span class=\"help-block error-message\">" + messages.join('<br>') + "</span>");
                                    });
                                });
                            }
                        });
                        if (_this.parent) {
                            _this.parent.loadData();
                        }
                    });
                    this.trigger('render', {});
                    Component.Utils.initializeComponents(this.node, this);
                };
                Editor.increment = 0;
                return Editor;
            }(Component.Component));
            Component.Editor = Editor;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Helpers;
            (function (Helpers) {
                var increment = 0;
                function cleanOptions(options) {
                    var result;
                    if ($.isArray(options)) {
                        result = [];
                    }
                    else {
                        result = {};
                    }
                    $.each(options, function (key, value) {
                        if (key == '_keys') {
                            return;
                        }
                        if ($.isPlainObject(value)) {
                            result[key] = cleanOptions(value);
                        }
                        else {
                            result[key] = value;
                        }
                    });
                    return result;
                }
                function resolveIconClass(icon) {
                    if (!icon.match(/^(fa-|glyphicon-)/)) {
                        icon = 'fa-' + icon;
                    }
                    return icon.split('-', 1)[0] + " " + icon;
                }
                // Twig Functions
                function button(caption, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'default' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f, _g = _b.disabled, disabled = _g === void 0 ? false : _g;
                    return ("<button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + " " + className + "\" \n                type=\"button\" \n                " + (disabled ? 'disabled' : '') + "\n            >\n                ") + (icon ? "<i class=\"" + (caption !== '' ? 'icon' : '') + " " + resolveIconClass(icon) + "\"></i>" : '') + (caption + "\n            </button>");
                }
                Helpers.button = button;
                function submit(caption, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'primary' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f;
                    return ("\n            <button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + " " + className + "\" \n                type=\"submit\" \n            >\n                ") + (icon ? "<i class=\"" + resolveIconClass(icon) + "\"></i>" + (caption ? ' ' : '') : '') + (caption + "\n            </button>\n        ");
                }
                Helpers.submit = submit;
                function component(name, query, options) {
                    query = JSON.stringify(cleanOptions(query));
                    options = JSON.stringify(cleanOptions(options));
                    return "<div js-component='" + name + " " + query + " " + options + "'></div>";
                }
                Helpers.component = component;
                // Twig Filters
                function controls(value, options) {
                    if (this.context._controls) {
                        return this.context._controls(value, options);
                    }
                    else {
                        return value;
                    }
                }
                Helpers.controls = controls;
                function tooltip(value, _a) {
                    var text = _a[0], _b = _a[1], placement = _b === void 0 ? 'top' : _b;
                    if (!text) {
                        return value;
                    }
                    var injection = "data-toggle=\"tooltip\" data-placement=\"" + placement + "\" title=\"" + text + "\"";
                    return value.toString().replace(/<(a|div|button)/, "<$1 " + injection);
                }
                Helpers.tooltip = tooltip;
                function icon(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], icon = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    if (!icon) {
                        return value;
                    }
                    if (options.nobr) {
                        return "<nobr><i class=\"icon " + resolveIconClass(icon) + "\"></i>" + value + "</nobr>";
                    }
                    else {
                        return "<i class=\"icon " + resolveIconClass(icon) + "\"></i>" + value;
                    }
                }
                Helpers.icon = icon;
                function action(value, _a) {
                    var name = _a[0], options = _a.slice(1);
                    if (!value && value !== 0) {
                        return '';
                    }
                    var injection = "js-component-action data-name=\"" + name + "\" data-options='" + JSON.stringify(cleanOptions(options)) + "'";
                    if (typeof value != 'object' || !value.twig_markup) {
                        value = Component.Utils.escape(value);
                    }
                    if (value.toString().match(/<(a|button)/)) {
                        return value.toString().replace(/<(a|button)/, "<$1 " + injection);
                    }
                    return "<a href=\"#\" " + injection + ">" + value + "</a>";
                }
                Helpers.action = action;
                function open(value, _a) {
                    var name = _a[0], _b = _a[1], query = _b === void 0 ? {} : _b, _c = _a[2], options = _c === void 0 ? {} : _c;
                    return action(value, ['openComponent', name, query, options]);
                }
                Helpers.open = open;
                function file(value, _a) {
                    var name = _a[0], _b = _a[1], options = _b === void 0 ? {} : _b;
                    var output = 'Файл не загружен';
                    if (value) {
                        output = "\n                <a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.original_name + "</a> (" + value.size + ")\n                <div class=\"checkbox\">\n                    <label class=\"small\">\n                        <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B\n                    </label>\n                </div>\n            ";
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.file = file;
                function video(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, name = _b[0], _c = _b[1], options = _c === void 0 ? {} : _c;
                    var output = 'Видео не загружено', url = '';
                    if (value) {
                        url = value.url;
                        output = "<a href=\"" + value.url + "\" target=\"_blank\">" + value.preview + "</a>";
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"text\" class=\"form-control\" name=\"" + name + "\" value=\"" + url + "\" placeholder=\"\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 YouTube\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.video = video;
                function external(value, _a) {
                    var _b = _a === void 0 ? ['', '', {}] : _a, name = _b[0], component = _b[1], _c = _b[2], options = _c === void 0 ? {} : _c;
                    var id = Component.Utils.generateId(), empty = options.empty || 'Значение не выбрано';
                    if (!value) {
                        value = {
                            title: empty,
                            value: '',
                        };
                    }
                    return "\n            <div class=\"input-group\">\n                <div class=\"input-group-addon\"><i class=\"fa fa-arrow-right\"></i></div>\n                " + open(Component.Utils.raw("\n                        <div class=\"form-control\" js-component-external-field=\"" + id + "\" data-empty=\"" + empty + "\">" + value.title + "</div>\n                    "), [component, $.extend(options.query || {}, { value: value.value }), { external: id }]) + "\n                <div class=\"input-group-addon\" js-component-external-field-reset><i class=\"fa fa-remove\"></i></div>\n            </div>\n           \n            <input type=\"hidden\" name=\"" + name + "\" value=\"" + value.value + "\">\n        ";
                }
                Helpers.external = external;
                function image(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, name = _b[0], _c = _b[1], options = _c === void 0 ? {} : _c;
                    options = $.extend({ deletable: true }, options);
                    var output = 'Изображение не загружено';
                    if (value) {
                        output = "<a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.preview + "</a>";
                        if (options.deletable) {
                            output += "   \n                    <div class=\"checkbox\">\n                        <label class=\"small\">\n                            <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435\n                        </label>\n                    </div>\n                ";
                        }
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.image = image;
                function gallery(value, options) {
                    var name = options && options[0] ? options[0] : '', output = 'Изображение не загружено';
                    return component('Media.GalleryTable', { field_name: name, gallery_id: value }, {}) + ("<input type=\"hidden\" name=\"" + name + "\" value=\"" + value + "\">");
                }
                Helpers.gallery = gallery;
                function select(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], name = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    if (!value) {
                        value = { options: [], value: '' };
                    }
                    var selectOptions = value.options.map(function (option) {
                        return "<option value=\"" + option.value + "\" " + (value.value == option.value ? 'selected' : '') + ">" + option.title + "</option>";
                    });
                    if (options.empty) {
                        selectOptions.unshift("<option value=\"\">" + options.empty + "</option>");
                    }
                    return "<select name=\"" + name + "\" class=\"form-control\" " + (options.reload ? 'js-component-select-reload' : '') + ">" + selectOptions.join('') + "</select>";
                }
                Helpers.select = select;
                function radio(value) {
                    return value;
                }
                Helpers.radio = radio;
                function checkbox(value, _a) {
                    var _b = _a === void 0 ? [] : _a, _c = _b[0], name = _c === void 0 ? '' : _c, _d = _b[1], caption = _d === void 0 ? '' : _d;
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<div class=\"checkbox\"><label><input type=\"checkbox\" name=\"" + name + "\" " + (value ? 'checked' : '') + "> " + caption + "</label></div>";
                }
                Helpers.checkbox = checkbox;
                function input(value, _a) {
                    var name = _a[0], type = _a[1], options = _a[2];
                    options = options || {};
                    var attributes = [], classes = ['form-control'];
                    if (options.size) {
                        classes.push('input-' + options.size);
                    }
                    switch (type) {
                        case 'date':
                            attributes.push("data-inputmask='\"mask\": \"d.m.y\", \"placeholder\": \"\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433\"'");
                            break;
                        case 'datetime':
                            attributes.push("data-inputmask='\"mask\": \"d.m.y h:s:s\", \"placeholder\": \"\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433 \u0447\u0447:\u043C\u043C:\u0441\u0441\"'");
                            break;
                    }
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    if (options.placeholder) {
                        options.placeholder = Component.Utils.escape(options.placeholder);
                    }
                    return "<input type=\"" + type + "\" class=\"" + classes.join(' ') + "\" name=\"" + name + "\" value=\"" + value + "\" placeholder=\"" + (options.placeholder || '') + "\" " + attributes.join(' ') + ">";
                }
                Helpers.input = input;
                function text(value, _a) {
                    var name = _a[0], options = _a[1];
                    return input(value, [name, 'text', options]);
                }
                Helpers.text = text;
                function textarea(value, options) {
                    var name = options && options[0] ? options[0] : '';
                    var options = options && options[1] ? options[1] : {};
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<textarea class=\"form-control\" name=\"" + name + "\">" + value + "</textarea>";
                }
                Helpers.textarea = textarea;
                function textedit(value, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], name = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    /*        var name = options && options[0] ? options[0] : '';
                            var options = options && options[1] ? options[1] : {};
                    
                    
                    
                    */
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<textarea class=\"text-editor\" name=\"" + name + "\">" + value + "</textarea>";
                }
                Helpers.textedit = textedit;
                function group(body, _a) {
                    var _b = _a === void 0 ? ['', {}] : _a, _c = _b[0], label = _c === void 0 ? '' : _c, _d = _b[1], options = _d === void 0 ? {} : _d;
                    var id = 'widget_' + (++increment);
                    body = body.replace(/<(input|textarea|select)/i, '<$1 id="' + id + '"');
                    if (label) {
                        return "\n            <div class=\"form-group\">\n                <label for=\"" + id + "\" class=\"control-label\">" + label + (options.notice ? "<span class=\"control-label-notice\">" + options.notice + "</span>" : '') + "</label>\n                " + body + "\n            </div>\n        ";
                    }
                    else {
                        return "\n            <div class=\"form-group\">\n                " + body + "\n            </div>\n        ";
                    }
                }
                Helpers.group = group;
                function panel(body, _a) {
                    var _b = _a === void 0 ? [] : _a, _c = _b[0], type = _c === void 0 ? 'default' : _c, _d = _b[1], heading = _d === void 0 ? '' : _d;
                    return "<div class=\"panel panel-" + type + "\">" + (heading ? "<div class=\"panel-heading\">" + heading + "</div>" : '') + "<div class=\"panel-body\">" + body + "</div></div>";
                }
                Helpers.panel = panel;
                function col(body, _a) {
                    var _b = (_a === void 0 ? [] : _a)[0], size = _b === void 0 ? 6 : _b;
                    return "<div class=\"col-md-" + size + "\">" + body + "</div>";
                }
                Helpers.col = col;
                function row(body) {
                    return "<div class=\"row\">" + body + "</div>";
                }
                Helpers.row = row;
                function buttons(value) {
                    return "<div class=\"btn-group\">" + value + "</div>";
                }
                Helpers.buttons = buttons;
                function registerTwigFunction(name, callable) {
                    Twig.extendFunction(name, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        var output = new String(callable.apply(this, args));
                        output.twig_markup = true;
                        output.twig_filter = name;
                        return output;
                    });
                }
                Helpers.registerTwigFunction = registerTwigFunction;
                function registerTwigFilter(name, callable) {
                    Twig.extendFilter(name, function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        var output = new String(callable.apply(this, args));
                        output.twig_markup = true;
                        output.twig_filter = name;
                        return output;
                    });
                }
                Helpers.registerTwigFilter = registerTwigFilter;
                function registerTwigFilters() {
                    [
                        'controls',
                        'checkbox',
                        'radio',
                        'text',
                        'input',
                        'content',
                        'textarea',
                        'textedit',
                        'file',
                        'video',
                        'image',
                        'external',
                        'gallery',
                        'select',
                        'buttons',
                        'group',
                        'tooltip',
                        'icon',
                        'action',
                        'open',
                        'panel',
                        'row',
                        'col'
                    ].forEach(function (name) {
                        registerTwigFilter(name, Helpers[name]);
                    });
                }
                function registerTwigFunctions() {
                    [
                        'button',
                        'submit',
                        'buttons',
                        'component',
                        'panel',
                        'group',
                        'row'
                    ].forEach(function (name) {
                        registerTwigFunction(name, Helpers[name]);
                    });
                }
                registerTwigFilters();
                registerTwigFunctions();
            })(Helpers = Component.Helpers || (Component.Helpers = {}));
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var List = (function (_super) {
                __extends(List, _super);
                function List() {
                    _super.apply(this, arguments);
                }
                List.prototype.render = function () {
                    this.node.html(this.template.render($.extend({}, this.data, { parameters: this.query })));
                    Component.Utils.initializeComponents(this.node, this);
                };
                return List;
            }(Component.Component));
            Component.List = List;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Manager = (function () {
            function Manager() {
                this.requestStack = [];
                this.events = {};
            }
            Manager.getInstance = function () {
                if (!this.instance) {
                    this.instance = new this;
                    this.instance.timer();
                }
                return this.instance;
            };
            Manager.prototype.trigger = function (event, data) {
                var _this = this;
                if (!this.events[event]) {
                    return;
                }
                this.events[event].forEach(function (listener) {
                    listener.call(_this, data);
                });
            };
            Manager.prototype.on = function (event, callback) {
                if (!this.events[event]) {
                    this.events[event] = [];
                }
                if (this.events[event].indexOf(callback) == -1) {
                    this.events[event].push(callback);
                }
            };
            Manager.prototype.request = function (request) {
                this.requestStack.push(request);
                if (this.requestStack.length > 100) {
                    this.requestSend();
                }
            };
            Manager.prototype.requestSend = function () {
                var stack = this.requestStack.splice(0, this.requestStack.length), form = new FormData;
                function getType(any) {
                    return Object.prototype.toString.call(any).slice(8, -1);
                }
                function toName(path) {
                    var array = path.map(function (part) { return ("[" + part + "]"); });
                    array[0] = path[0];
                    return array.join('');
                }
                stack.forEach(function (request) {
                    var appendToForm = function (path, node, filename) {
                        var name = toName(path);
                        if (typeof filename == 'undefined') {
                            form.append(name, node);
                        }
                        else {
                            form.append(name, node, filename);
                        }
                    };
                    var check = function (node) {
                        var type = getType(node);
                        switch (type) {
                            case 'Array':
                                return true; // step into
                            case 'Object':
                                return true; // step into
                            case 'FileList':
                                return true; // step into
                            default:
                                return false; // prevent step into
                        }
                    };
                    function iterator(object, parentPath) {
                        $.each(object, function (name, node) {
                            var path = parentPath.slice();
                            path.push(name);
                            var type = getType(node);
                            switch (type) {
                                case 'Array':
                                    break;
                                case 'Object':
                                    break;
                                case 'FileList':
                                    break;
                                case 'File':
                                    appendToForm(path, node);
                                    break;
                                case 'Blob':
                                    appendToForm(path, node, node.name);
                                    break;
                                default:
                                    appendToForm(path, node);
                                    break;
                            }
                            if (check(node)) {
                                iterator(node, path);
                            }
                        });
                    }
                    iterator(request.getQuery(), ['request[c' + request.getId() + ']']);
                });
                $.ajax({
                    url: '/admin/',
                    type: 'post',
                    dataType: 'json',
                    data: form,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        stack.forEach(function (request, i) {
                            request.passResponse(new Admin.Component.Response(response[i]));
                        });
                    },
                    complete: function (xhr) {
                        if (xhr.status == 401 || xhr.status == 403) {
                            document.location.reload();
                        }
                    },
                    error: function () {
                    }
                });
            };
            Manager.prototype.timer = function () {
                var _this = this;
                this.timerInstance = setTimeout(function () {
                    if (_this.requestStack.length) {
                        _this.requestSend();
                    }
                    _this.timer();
                }, 10);
            };
            return Manager;
        }());
        Admin.Manager = Manager;
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Request = (function () {
                function Request(component, type, query, data, callback) {
                    this.id = Request.increment++;
                    this.component = component;
                    this.name = component.getName();
                    this.type = type;
                    this.query = query;
                    this.data = data;
                    this.callback = callback ? callback.bind(component) : null;
                }
                Request.prototype.getId = function () {
                    return this.id;
                };
                Request.prototype.getQuery = function () {
                    return {
                        name: this.name,
                        type: this.type,
                        query: this.query,
                        data: this.data
                    };
                };
                Request.prototype.passResponse = function (response) {
                    console.log(response);
                    if (this.callback) {
                        this.callback(response);
                    }
                };
                Request.TYPE_LOAD_SCHEMA = 'load_schema';
                Request.TYPE_LOAD_DATA = 'load_data';
                Request.increment = 1;
                return Request;
            }());
            Component.Request = Request;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Response = (function () {
                function Response(response) {
                    $.extend(this, response);
                }
                return Response;
            }());
            Component.Response = Response;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Table = (function (_super) {
                __extends(Table, _super);
                function Table() {
                    _super.apply(this, arguments);
                    this.expanded = {};
                    this.pagination = {};
                }
                Table.prototype.initialize = function () {
                    this.node.addClass('component component-table');
                };
                Table.prototype.getQuery = function () {
                    return $.extend(_super.prototype.getQuery.call(this), { expanded: this.expanded, pagination: this.pagination });
                };
                Table.prototype.applySchema = function (schema) {
                    var _this = this;
                    _super.prototype.applySchema.call(this, schema);
                    this.actions['_visible'] = function (options) {
                        var $row = _this.findRowById(options.row_id), $button = $row.find('.table-row-visible'), visible = !$button.hasClass('mod-visible');
                        $button.toggleClass('mod-visible', visible);
                        _this.request('_visible', $.extend(_this.getQuery(), { key: options.key, scope: options.scope }), { visible: visible }, function (response) {
                            if (_this.checkResponse(response)) {
                                $button.toggleClass('mod-visible', response.data.visible);
                            }
                        });
                    };
                    this.actions['_delete'] = function (options) {
                        if (!confirm('Элемент будет удален, продолжить?')) {
                            return;
                        }
                        //this.findRowById(options.row_id).remove();
                        _this.request('_delete', $.extend(_this.getQuery(), options), null, function (response) {
                            _this.checkResponse(response);
                        });
                        _this.loadData();
                    };
                };
                Table.prototype.findRowById = function (id) {
                    var result = this.node.find("tr[data-row-id=" + id + "]:eq(0)");
                    return result.length ? result : null;
                };
                Table.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.parameters.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body mod-table\"></div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    node.html(this.template.render($.extend({}, this.data, { _query: this.query })));
                    this.scopes.forEach(function (scope) {
                        if (scope.parameters.independent) {
                            if (scope.parameters.recursive) {
                                $.each(_this.parameters.relations, function (i, relation) {
                                    if (relation.source.scope == scope.parameters.name) {
                                        _this.renderScope(scope, relation);
                                        return false;
                                    }
                                });
                            }
                            else {
                                _this.renderScope(scope);
                            }
                        }
                        /*
        
                        */
                    });
                    this.node.find('[js-component-action]').on('click', function (e) {
                        e.preventDefault();
                        var $action = $(e.currentTarget);
                        _this.action($action.data('name'), $action.data('options'));
                    });
                    if (!this.node.find('tbody').children().length) {
                        this.node.find('.table:eq(0)').replaceWith('<div class="component-table-empty">Список пуст</div>');
                    }
                    this.node.find('[data-toggle="tooltip"]').tooltip({ container: 'body', trigger: 'hover' });
                    var sortData, $table = this.node.find('table');
                    $table.find('.list-controls-flex.has-children').on('click', function (e) {
                        var $row = $(e.currentTarget).closest('tr'), mask = $row.data('mask'), key = $row.data('key'), index;
                        if (!_this.expanded[mask]) {
                            _this.expanded[mask] = [];
                        }
                        if ((index = _this.expanded[mask].indexOf(key)) >= 0) {
                            _this.expanded[mask].splice(index, 1);
                        }
                        else {
                            _this.expanded[mask].push(key);
                        }
                        _this.loadData();
                    });
                    $table.find('.list-pagination li:not(.active) span').on('click', function (e) {
                        var $button = $(e.currentTarget), $row = $button.closest('tr');
                        _this.pagination[$row.data('mask')] = $button.data('page');
                        _this.loadData();
                    });
                    $table.tableDnD({
                        onDragClass: 'move',
                        onDrop: function (_, row) {
                            if (sortData !== $.tableDnD.serialize()) {
                                var item = $(row).closest('tr'), mask = item.data('mask'), selector = 'tr[data-mask="' + mask + '"]:first', prev = $(row).prevAll(selector), next = $(row).nextAll(selector);
                                $table.addClass('sorting-send');
                                _this.request('_sort', $.extend(_this.getQuery(), { key: item.data('key'), scope: item.data('scope') }), { prev: (prev.length ? prev.data('key') : 0), next: (next.length ? next.data('key') : 0) }, function (response) { return _this.checkResponse(response); });
                                _this.loadData();
                            }
                            else {
                                $('> tbody > tr', _this.node.find('table')).removeClass('nodrop');
                                $table.removeClass('sorting');
                            }
                        },
                        onDragStart: function (_, row) {
                            var item = $(row).closest('tr'), mask = item.data('mask');
                            sortData = $.tableDnD.serialize();
                            $table.addClass('sorting');
                            item.addClass('sorting');
                            $('> thead > tr', _this.node.find('table')).addClass('nodrop');
                            $('> tbody > tr:not([data-mask="' + mask + '"])', _this.node.find('table')).addClass('nodrop');
                        },
                        dragHandle: '.list-controls-sort',
                        serializeRegexp: false
                    });
                    this.node.find('.panel-heading form').on('submit', function (e) {
                        e.preventDefault();
                        var $form = $(e.currentTarget);
                        $.extend(_this.query, $form.serializeObject());
                        _this.loadData();
                    });
                    Component.Utils.initializeComponents(this.node, this);
                };
                Table.prototype.renderScope = function (scope, relation, relationValue, level) {
                    var _this = this;
                    if (relation === void 0) { relation = null; }
                    if (relationValue === void 0) { relationValue = null; }
                    if (level === void 0) { level = 0; }
                    var mask = scope.parameters.name + "." + (relation ? relation.target.scope + "." + (relationValue || '') : '_');
                    if (!this.data.entities[mask]) {
                        return;
                    }
                    this.data.entities[mask].forEach(function (entity) {
                        var rowId = Component.Utils.generateId();
                        var className = entity._row_class;
                        var $entity = $(("<tr data-row-id=\"" + rowId + "\" data-key=\"" + JSON.stringify(entity._key) + "\" data-scope=\"" + scope.parameters.name + "\" data-mask=\"" + mask + "\" " + (className ? "class=\"" + className + "\"" : '') + ">") + scope.template.render($.extend({}, entity, {
                            _data: _this.data,
                            _query: _this.getQuery(),
                            _row_id: rowId,
                            _level: function () {
                                return Component.Utils.raw(new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'));
                            },
                            _visible: function () {
                                return Component.Utils.raw(Component.Helpers.action(Component.Utils.raw(Component.Helpers.button('', { size: 'xs', icon: 'eye', className: "table-row-visible " + (entity.visible ? 'mod-visible' : '') })), ['_visible', { scope: scope.parameters.name, key: entity._key, row_id: rowId }]));
                            },
                            _delete: function () {
                                return Component.Utils.raw(Component.Helpers.action(Component.Utils.raw(Component.Helpers.button('', { size: 'xs', icon: 'remove' })), ['_delete', { scope: scope.parameters.name, key: entity._key, row_id: rowId }]));
                            },
                            _controls: function (value, _a) {
                                var _b = (_a === void 0 ? [''] : _a)[0], options = _b === void 0 ? '' : _b;
                                return "\n                                <div class=\"list-controls\">\n                                    <div class=\"list-controls-level\">" + (new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')) + "</div>\n                                    " + (scope.parameters.collapsed ? "<div class=\"list-controls-flex " + (entity._has_children ? 'has-children' : '') + "\">" + (!entity._has_children ? '<i class="fa fa-square-o"></i>' : (_this.expanded[mask] && _this.expanded[mask].indexOf(entity._key) >= 0) ? '<i class="fa fa-minus-square-o"></i>' : '<i class="fa fa-plus-square-o"></i>') + "</div>" : '') + "\n                                    <div class=\"list-controls-value\">" + value + "</div>\n                                    " + (scope.parameters.sortable ? "<div class=\"list-controls-sort\"><i class=\"fa fa-arrows-v\"></i></div>" : '') + "\n                                    " + (options ? "<div class=\"list-controls-options\">" + options + "</div>" : '') + "\n                                </div>\n                            ";
                            }
                        })) + '</tr>');
                        _this.node.find('tbody').append($entity);
                        $.each(_this.parameters.relations, function (i, rel) {
                            if (rel.target.scope == scope.parameters.name) {
                                _this.renderScope(_this.getScope(rel.source.scope), rel, entity[rel.target.field], level + 1);
                            }
                        });
                    });
                    if (this.data.pagination && this.data.pagination[mask]) {
                        var pagination = this.data.pagination[mask];
                        if (pagination.last_page > 1) {
                            var paginationNumbers = '';
                            for (var i = 1; i <= pagination.last_page; i++) {
                                paginationNumbers += "<li " + (i == pagination.page ? 'class="active"' : '') + "><span data-page=\"" + i + "\">" + i + "</span></li>";
                            }
                            this.node.find('tbody').append($("<tr class=\"list-pagination\" data-mask=\"" + mask + "\"><td colspan=\"15\">" + (new Array(level + 1).join('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')) + "<ul class=\"pagination pagination-info\">" + paginationNumbers + "</ul></td></tr>"));
                        }
                    }
                };
                return Table;
            }(Component.Component));
            Component.Table = Table;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Utils;
            (function (Utils) {
                Utils.ATTR_HANDLER = 'js-component';
                var increment = 0;
                function escape(value) {
                    return value.toString().replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }
                Utils.escape = escape;
                function createComponent(node, parent) {
                    var componentData = node.attr(Utils.ATTR_HANDLER).match(/^((?:\w*\.)?\w+([A-Z][a-z\d]+))\s*(\{\s*.*?\s*\})?(?:\s(\{\s*.*\s*\}))?\s*$/);
                    if (null === componentData) {
                        throw 'Wrong component name format "' + node.attr(Utils.ATTR_HANDLER) + '"';
                    }
                    var componentName = componentData[1], componentType = componentData[2], componentQuery = componentData[3] ? eval('(function(){return ' + componentData[3] + '}())') : {}, componentOptions = componentData[4] ? eval('(function(){return ' + componentData[4] + '}())') : {};
                    switch (componentType) {
                        case 'List':
                            return new Component.List(node, componentName, componentQuery, componentOptions, parent);
                        case 'Table':
                            return new Component.Table(node, componentName, componentQuery, componentOptions, parent);
                        case 'Editor':
                            return new Component.Editor(node, componentName, componentQuery, componentOptions, parent);
                        default:
                            throw 'Component with type "' + componentType + '" not found';
                    }
                }
                Utils.createComponent = createComponent;
                function initializeComponents(context, parent) {
                    $('[' + Utils.ATTR_HANDLER + ']', context).each(function () {
                        var node = $(this);
                        if (true == node.data('creonit-component-initialized'))
                            return;
                        createComponent(node, parent);
                        node.data('creonit-component-initialized', true);
                    });
                }
                Utils.initializeComponents = initializeComponents;
                function raw(string) {
                    var output = new String(string);
                    output.twig_markup = true;
                    return output;
                }
                Utils.raw = raw;
                function generateId() {
                    return ++increment;
                }
                Utils.generateId = generateId;
            })(Utils = Component.Utils || (Component.Utils = {}));
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
