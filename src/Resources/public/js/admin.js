var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
        (function (Component_1) {
            var Component = (function () {
                function Component(node, name, query, options, parent) {
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    this.patterns = [];
                    this.query = {};
                    this.options = {};
                    this.data = {};
                    this.manager = Component_1.Manager.getInstance();
                    this.name = name;
                    this.query = $.extend({}, query);
                    this.node = node;
                    this.parent = parent;
                    this.options = options;
                    this.actions = {
                        openComponent: function (_a) {
                            var name = _a.name, query = _a.query, options = _a.options;
                            this.openComponent(name, query, options);
                        }
                    };
                    this.loadSchema();
                }
                Component.prototype.action = function (name, options) {
                    if (this.actions[name]) {
                        return this.actions[name].call(this, options);
                    }
                    else {
                        throw new Error("Undefined method " + name + " in component " + this.name);
                    }
                };
                Component.prototype.getName = function () {
                    return this.name;
                };
                Component.prototype.getQuery = function () {
                    return this.query;
                };
                Component.prototype.getOptions = function () {
                    return this.options;
                };
                Component.prototype.getPattern = function (name) {
                    return this.patterns[name];
                };
                Component.prototype.loadSchema = function () {
                    this.request(Component_1.Request.TYPE_LOAD_SCHEMA);
                };
                Component.prototype.loadData = function () {
                    this.request(Component_1.Request.TYPE_LOAD_DATA);
                };
                Component.prototype.sendData = function (data) {
                    this.request(Component_1.Request.TYPE_SEND_DATA, data);
                    this.node.find('.error-message').each(function () {
                        var $message = $(this), $group = $message.closest('.form-group');
                        $message.remove();
                        $group.removeClass('has-error');
                    });
                };
                Component.prototype.applyResponse = function (response) {
                    var _this = this;
                    console.log(response);
                    if (response.error) {
                        //this.node.html(response.error);
                        if (response.error['_']) {
                            alert(response.error['_'].join("\n"));
                        }
                        else {
                            alert('При сохранении возникли ошибки');
                        }
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
                    else {
                        if (response.schema) {
                            this.applySchema(response.schema);
                        }
                        if (response.success && this.options.modal) {
                        }
                        if (response.success && this.parent) {
                            this.parent.loadData();
                        }
                        this.data = response.data || {};
                        this.render();
                    }
                };
                Component.prototype.applySchema = function (schema) {
                    var _this = this;
                    this.schema = schema;
                    this.template = twig({ autoescape: true, data: schema.template });
                    if (schema.patterns) {
                        schema.patterns.forEach(function (pattern) {
                            _this.patterns.push(new Component_1.Pattern(_this, pattern));
                        });
                    }
                };
                Component.prototype.render = function () {
                };
                Component.prototype.request = function (type, data) {
                    this.manager.request(new Component_1.Request(this, type, data));
                };
                Component.prototype.openComponent = function (name, query, options) {
                    var _this = this;
                    if (query === void 0) { query = {}; }
                    if (options === void 0) { options = {}; }
                    options.modal = true;
                    var component = Component_1.Helpers.component(name, query, options);
                    $("\n                <div class=\"modal-dialog modal-lg\">\n                    " + component + "\n                </div>\n            ").arcticmodal({
                        beforeOpen: function (modal, $modal) {
                            Component_1.Utils.initializeComponents($modal, _this);
                        }
                    });
                };
                return Component;
            }());
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
                }
                Editor.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\"><span>\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.schema.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body\">\n                        </div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-content').append("<div class=\"modal-footer\">" + Component.Helpers.submit('Сохранить и закрыть') + " " + Component.Helpers.submit('Сохранить') + " " + Component.Helpers.button('Закрыть') + "</div>");
                        this.node.find('.modal-footer button[type=button], .modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    this.patterns.forEach(function (pattern) {
                        node.append(pattern.template.render($.extend({}, _this.data, { parameters: _this.query })));
                    });
                    if (!this.options.modal) {
                        this.node.append(Component.Helpers.submit('Сохранить'));
                    }
                    var formId = "form" + ++Editor.increment, $form = $("<form id=\"" + formId + "\"></form>");
                    this.node.append($form);
                    this.node.find('input, textarea, select, button').attr('form', formId);
                    $form.on('submit', function (e) {
                        e.preventDefault();
                        var $form = $(e.currentTarget);
                        var data = $form.serializeObject();
                        _this.node.find("input[type=\"file\"][form=\"" + formId + "\"]").each(function () {
                            var value = $(this)[0].files[0];
                            if (value) {
                                data[$(this).attr('name')] = $(this)[0].files[0];
                            }
                        });
                        _this.sendData(data);
                    });
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
                    var result = {};
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
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'default' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f;
                    return ("\n            <button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + " " + className + "\" \n                type=\"button\" \n            >\n                ") + (icon ? "<i class=\"" + resolveIconClass(icon) + "\"></i>" + (caption ? ' ' : '') : '') + (caption + "\n            </button>\n        ");
                }
                Helpers.button = button;
                function submit(caption, _a) {
                    var _b = _a === void 0 ? {} : _a, _c = _b.size, size = _c === void 0 ? '' : _c, _d = _b.type, type = _d === void 0 ? 'primary' : _d, _e = _b.icon, icon = _e === void 0 ? '' : _e, _f = _b.className, className = _f === void 0 ? '' : _f;
                    return ("\n            <button \n                class=\"btn btn-" + type + " " + (size ? "btn-" + size : '') + "\" \n                type=\"submit\" \n            >\n                ") + (icon ? "<i class=\"" + resolveIconClass(icon) + "\"></i>" + (caption ? ' ' : '') : '') + (caption + "\n            </button>\n        ");
                }
                Helpers.submit = submit;
                function button_visible() {
                    return "<button class=\"btn btn-default btn-xs\" type=\"submit\"><i class=\"fa fa-eye\"></i></button>";
                }
                Helpers.button_visible = button_visible;
                function button_delete() {
                    return "<button class=\"btn btn-danger btn-xs\" type=\"submit\"><i class=\"fa fa-remove\"></i></button>";
                }
                Helpers.button_delete = button_delete;
                function component(name, query, options) {
                    query = JSON.stringify(cleanOptions(query));
                    options = JSON.stringify(cleanOptions(options));
                    return "<div js-component='" + name + " " + query + " " + options + "'></div>";
                }
                Helpers.component = component;
                // Twig Filters
                function tooltip(value, _a) {
                    var text = _a[0], _b = _a[1], placement = _b === void 0 ? 'right' : _b;
                    if (!text) {
                        return value;
                    }
                    var injection = "data-toggle=\"tooltip\" data-placement=\"" + placement + "\" title=\"" + text + "\"";
                    return value.toString().replace(/<(a|div|button)/, "<$1 " + injection);
                }
                Helpers.tooltip = tooltip;
                function action(value, _a) {
                    var name = _a[0], _b = _a[1], options = _b === void 0 ? {} : _b;
                    if (!value) {
                        return '';
                    }
                    options = JSON.stringify(cleanOptions(options));
                    var injection = "js-component-action data-name=\"" + name + "\" data-options='" + options + "'";
                    if (typeof value == 'object' && value.twig_function) {
                        return value.toString().replace(/<(div|button)/, "<$1 " + injection);
                    }
                    if (typeof value != 'object' || !value.twig_markup) {
                        value = Component.Utils.escape(value);
                    }
                    return "<a href=\"#\" " + injection + ">" + value + "</a>";
                }
                Helpers.action = action;
                function open(value, _a) {
                    var name = _a[0], _b = _a[1], query = _b === void 0 ? {} : _b, _c = _a[2], options = _c === void 0 ? {} : _c;
                    return action(value, ['openComponent', { name: name, query: query, options: options }]);
                }
                Helpers.open = open;
                function text(value, options) {
                    var name = options && options[0] ? options[0] : '';
                    var options = options && options[1] ? options[1] : {};
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<input type=\"text\" class=\"form-control\" name=\"" + name + "\" value=\"" + value + "\">";
                }
                Helpers.text = text;
                function file(value, options) {
                    var name = options && options[0] ? options[0] : '', output = 'Файл не загружен';
                    if (value) {
                        output = "\n                <a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.original_name + "</a> (" + value.size + ")\n                <div class=\"checkbox\">\n                    <label class=\"small\">\n                        <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B\n                    </label>\n                </div>\n            ";
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.file = file;
                function image(value, options) {
                    var name = options && options[0] ? options[0] : '', output = 'Изображение не загружено';
                    if (value) {
                        output = "\n                <a href=\"" + value.path + "/" + value.name + "\" target=\"_blank\">" + value.preview + "</a>\n                <div class=\"checkbox\">\n                    <label class=\"small\">\n                        <input type=\"checkbox\" name=\"" + name + "__delete\"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435\n                    </label>\n                </div>\n            ";
                    }
                    return "\n            <div class=\"panel panel-default\">\n                <div class=\"panel-heading\"><input type=\"file\" name=\"" + name + "\"></div>\n                <div class=\"panel-body\">" + output + "</div>\n            </div>\n        ";
                }
                Helpers.image = image;
                function select(value, options) {
                    var name = options && options[0] ? options[0] : '', options = value.options.map(function (option) {
                        return "<option value=\"" + option.value + "\" " + (value.value == option.value ? 'selected' : '') + ">" + option.title + "</option>";
                    }).join('');
                    return "<select name=\"" + name + "\" class=\"form-control\">" + options + "</select>";
                }
                Helpers.select = select;
                function textarea(value, options) {
                    var name = options && options[0] ? options[0] : '';
                    var options = options && options[1] ? options[1] : {};
                    value = value ? Component.Utils.escape(value.toString()) : '';
                    return "<textarea class=\"form-control\" name=\"" + name + "\">" + value + "</textarea>";
                }
                Helpers.textarea = textarea;
                function row(body, label) {
                    var id = 'widget_' + (++increment);
                    body = body.replace(/<(input|textarea)/i, '<$1 id="' + id + '"');
                    if (label) {
                        return "\n            <div class=\"form-group\">\n                <label for=\"" + id + "\" class=\"control-label\">" + label + "</label>\n                " + body + "\n            </div>\n        ";
                    }
                    else {
                        return "\n            <div class=\"form-group\">\n                " + body + "\n            </div>\n        ";
                    }
                }
                Helpers.row = row;
                function buttons(value) {
                    return "<div class=\"btn-group\">" + value + "</div>";
                }
                Helpers.buttons = buttons;
                function registerTwigFunctions() {
                    [
                        'button',
                        'submit',
                        'button_visible',
                        'button_delete',
                        'component'
                    ].forEach(function (name) {
                        Twig.extendFunction(name, function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var output = new String(Helpers[name].apply(this, args));
                            output.twig_markup = true;
                            output.twig_function = name;
                            return output;
                        });
                    });
                }
                Helpers.registerTwigFunctions = registerTwigFunctions;
                function registerTwigFilters() {
                    [
                        'text',
                        'textarea',
                        'file',
                        'image',
                        'select',
                        'buttons',
                        'image',
                        'row',
                        'tooltip',
                        'action',
                        'open'
                    ].forEach(function (name) {
                        Twig.extendFilter(name, function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var output = new String(Helpers[name].apply(this, args));
                            output.twig_markup = true;
                            output.twig_filter = name;
                            return output;
                        });
                    });
                    [].forEach(function (name) {
                        Twig.extendFilter(name, Helpers[name]);
                    });
                }
                Helpers.registerTwigFilters = registerTwigFilters;
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
                    var _this = this;
                    this.node.html(this.template.render($.extend({}, this.data, { parameters: this.query })));
                    this.patterns.forEach(function (pattern) {
                        _this.data[pattern.name].entities.forEach(function (entity) {
                            _this.node.find('.component-list-body').append(pattern.template.render(entity));
                        });
                    });
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
        var Component;
        (function (Component) {
            var Manager = (function () {
                function Manager() {
                    this.requestStack = [];
                }
                Manager.getInstance = function () {
                    if (!this.instance) {
                        this.instance = new this;
                        this.instance.timer();
                    }
                    return this.instance;
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
                                request.passResponse(new Component.Response(response[i]));
                            });
                        },
                        complete: function () {
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
            Component.Manager = Manager;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Pattern = (function () {
                function Pattern(component, options) {
                    $.extend(this, options);
                    this.component = component;
                    this.template = twig({ autoescape: true, data: this.template });
                    this.actions = {
                        openComponent: this.openComponent
                    };
                }
                Pattern.prototype.openComponent = function (options) {
                    this.component.action('openComponent', options);
                };
                Pattern.prototype.action = function (name, options) {
                    if (this.actions[name]) {
                        return this.actions[name].call(this, options);
                    }
                    else {
                        throw new Error("Undefined method " + name + " in pattern " + this.name);
                    }
                };
                return Pattern;
            }());
            Component.Pattern = Pattern;
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
var Creonit;
(function (Creonit) {
    var Admin;
    (function (Admin) {
        var Component;
        (function (Component) {
            var Request = (function () {
                function Request(component, type, data) {
                    this.id = Request.increment++;
                    this.component = component;
                    this.name = component.getName();
                    this.type = type;
                    this.data = data;
                    this.query = $.extend({}, component.getQuery());
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
                    this.component.applyResponse(response);
                };
                Request.TYPE_LOAD_SCHEMA = 'load_schema';
                Request.TYPE_LOAD_DATA = 'load_data';
                Request.TYPE_SEND_DATA = 'send_data';
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
                }
                Table.prototype.render = function () {
                    var _this = this;
                    this.node.empty();
                    var node = this.node;
                    if (this.options.modal) {
                        this.node.append(node = $("\n                    <div class=\"modal-content\"> \n                        <div class=\"modal-header\"> \n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">\u00D7</span></button> \n                            <h4 class=\"modal-title\">" + this.schema.title + "</h4> \n                        </div> \n                        \n                        <div class=\"modal-body\">\n                        </div>\n                   </div>    \n                "));
                        node = node.find('.modal-body');
                        this.node.find('.modal-header .close').on('click', function () {
                            _this.node.arcticmodal('close');
                        });
                    }
                    node.html(this.template.render($.extend({}, this.data, { parameters: this.query })));
                    this.node.find('[js-component-action]').on('click', function (e) {
                        e.preventDefault();
                        var $action = $(e.currentTarget);
                        _this.action($action.data('name'), $action.data('options'));
                    });
                    this.patterns.forEach(function (pattern) {
                        _this.data.entities.forEach(function (entity) {
                            var $entity = $('<tr>' + pattern.template.render(entity) + '</tr>');
                            $entity.find('[js-component-action]').on('click', function (e) {
                                e.preventDefault();
                                var $action = $(this);
                                pattern.action($action.data('name'), $action.data('options'));
                            });
                            _this.node.find('tbody').append($entity);
                        });
                    });
                    Component.Utils.initializeComponents(this.node, this);
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
                function escape(value) {
                    return value.toString().replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }
                Utils.escape = escape;
                function createComponent(node, parent) {
                    var componentData = node.attr(Utils.ATTR_HANDLER).match(/^(\w+\.\w+([A-Z][a-z\d]+))\s*(\{\s*.*?\s*\})?(?:\s(\{\s*.*\s*\}))?\s*$/);
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
            })(Utils = Component.Utils || (Component.Utils = {}));
        })(Component = Admin.Component || (Admin.Component = {}));
    })(Admin = Creonit.Admin || (Creonit.Admin = {}));
})(Creonit || (Creonit = {}));
