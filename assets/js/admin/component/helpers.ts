module Creonit.Admin.Component.Helpers {

    var increment = 0;

    function cleanOptions(options:any){
        var result;

        if($.isArray(options)){
            result = [];
        }else{
            result = {};
        }

        $.each(options, function(key, value){
            if(key == '_keys'){
                return;
            }
            if($.isPlainObject(value)){
                result[key] = cleanOptions(value);
            }else{
                result[key] = value;
            }
        });
        return result;
    }

    function resolveIconClass(icon:string){
        if(!icon.match(/^(fa-|glyphicon-)/)){
            icon = 'fa-' + icon;
        }
        return `${icon.split('-', 1)[0]} ${icon}`;
    }


    // Twig Functions

    export function button(caption:string, {size = '', type = 'default', icon = '', className = '', disabled = false} = {}){
        return `<button 
                class="btn btn-${type} ${size ? `btn-${size}` : ''} ${className}" 
                type="button" 
                ${disabled ? 'disabled' : ''}
            >
                `+ (icon ? `<i class="${caption !== '' ? 'icon' : ''} ${resolveIconClass(icon)}"></i>` : '') +`${caption}
            </button>`;
    }

    export function submit(caption:string, {size = '', type = 'primary', icon = '', className = ''} = {}){
        return `
            <button 
                class="btn btn-${type} ${size ? `btn-${size}` : ''} ${className}" 
                type="submit" 
            >
                `+ (icon ? `<i class="${resolveIconClass(icon)}"></i>${caption ? ' ' : ''}` : '') +`${caption}
            </button>
        `;
    }

    export function component(name:string, query:any, options:any){
        query = JSON.stringify(cleanOptions(query));
        options = JSON.stringify(cleanOptions(options));
        return `<div js-component='${name} ${query} ${options}'></div>`;

    }

    // Twig Filters

    export function controls(value:any, options?:any){
        if(this.context._controls){
            return this.context._controls(value, options);
        }else{
            return value;
        }
    }

    export function tooltip(value:any, [text, placement = 'top']){
        if(!text){
            return value;
        }
        let injection = `data-toggle="tooltip" data-placement="${placement}" title="${text}"`;
        return value.toString().replace(/<(a|div|button)/, `<$1 ${injection}`)
    }

    export function icon(value:any, [icon = '', options = {}]:[string, any] = ['', {}]){
        if(!icon){
            return value;
        }

        if(options.nobr){
            return `<nobr><i class="icon ${resolveIconClass(icon)}"></i>${value}</nobr>`;

        }else{
            return `<i class="icon ${resolveIconClass(icon)}"></i>${value}`;
        }

    }

    export function action(value:any, [name, ...options] : [string, any]){
        if(!value && value !== 0){
            return '';
        }

        let injection = `js-component-action data-name="${name}" data-options='${JSON.stringify(cleanOptions(options))}'`;

        if(typeof value != 'object' || !value.twig_markup){
            value = Utils.escape(value);
        }

        if(value.toString().match(/<(a|button)/)){
            return value.toString().replace(/<(a|button)/, `<$1 ${injection}`)
        }

        return `<a href="#" ${injection}>${value}</a>`;
    }

    export function open(value:any, [name, query = {}, options = {}]){
        return action(value, ['openComponent', name, query, options]);
    }

    export function external(value:any, [name, component, options = {}]:[string, string, any] = ['', '', {}]){
        var id = Utils.generateId(),
            empty = options.empty || 'Значение не выбрано';

        if(!value){
            value = {
                title: empty,
                value: '',
            };
        }

        return `
            <div class="input-group">
                <div class="input-group-addon"><i class="fa fa-arrow-right"></i></div>
                ${open(Utils.raw(`
                        <div class="form-control" js-component-external-field="${id}" data-empty="${empty}">${value.title}</div>
                    `), [component, $.extend(options.query || {}, {value: value.value}), {external: id}])
                }
                <div class="input-group-addon" js-component-external-field-reset><i class="fa fa-remove"></i></div>
            </div>
           
            <input type="hidden" name="${name}" value="${value.value}">
        `;
    }

    export function select(value:any, [name = '', options = {}]:[string, any] = ['', {}]){
        if(!value){
            value = {options: [], value: ''};
        }

        var selectOptions = value.options.map((option) => {
                return `<option value="${option.value}" ${value.value == option.value ? 'selected' : ''}>${option.title}</option>`;
            });

        if(options.empty){
            selectOptions.unshift(`<option value="">${options.empty}</option>`);
        }

        return `<select name="${name}" class="form-control" ${options.reload ? 'js-component-select-reload' : ''}>${selectOptions.join('')}</select>`;
    }


    export function radio(value:string){
        return value;
    }

    export function checkbox(value:string, [name = '', caption = '', options = null] = []){
        options = options || {};
        value = value ? Utils.escape(value.toString()) : '';

        return `<div class="checkbox"><label><input type="checkbox" name="${name}" ${value ? 'checked' : ''} ${options.reload ? 'js-component-checkbox-reload' : ''}> ${caption}</label></div>`;
    }

    export function input(value:string, [name, type, options]){
        options = options || {};
        var attributes = [], classes = ['form-control'];

        if(options.size){
            classes.push('input-' + options.size);
        }

        switch(type){
            case 'date':
                type = 'text';
                attributes.push(`data-datetimepicker='${JSON.stringify(cleanOptions($.extend({
                    format: 'DD.MM.YYYY'
                }, options.date || {})))}'`);
                // attributes.push(`data-inputmask='"alias": "dd/mm/yyyy", "mask": "1.2.y", "separator": ".", "placeholder": "дд.мм.гггг"'`);
                break;
            case 'datetime':
                type = 'text';
                attributes.push(`data-datetimepicker='${JSON.stringify(cleanOptions($.extend({
                    format: 'DD.MM.YYYY HH:mm',
                    sideBySide: true
                }, options.date || {})))}'`);
                // attributes.push(`data-inputmask='"alias": "datetime", "mask": "1.2.y h:s:s", "separator": ".", "placeholder": "дд.мм.гггг чч:мм:сс"'`);
                break;
        }

        value = value ? Utils.escape(value.toString()) : '';

        if(options.placeholder){
            options.placeholder = Utils.escape(options.placeholder);
        }


        return `<input type="${type}" class="${classes.join(' ')}" name="${name}" value="${value}" placeholder="${options.placeholder || ''}" ${attributes.join(' ')}>`;
    }

    export function text(value:string, [name, options]){
        return input(value, [name, 'text', options]);
    }

    export function textarea(value:string, options?:any){
        var name = options && options[0] ? options[0] : '';
        var options = options && options[1] ? options[1] : {};

        value = value ? Utils.escape(value.toString()) : '';

        return `<textarea class="form-control" name="${name}">${value}</textarea>`;
    }

    export function textedit(value:string, [name = '', options = {}]:[string, any] = ['', {}]){
/*        var name = options && options[0] ? options[0] : '';
        var options = options && options[1] ? options[1] : {};



*/
        value = value ? Utils.escape(value.toString()) : '';

        return `<textarea class="text-editor" name="${name}">${value}</textarea>`;
    }


    export function group(body:string, [label = '', options = {}]:[string, any] = ['', {}]) {
        var id = 'widget_'+(++increment);
        body = body.replace(/<(input|textarea|select)/i, '<$1 id="'+id+'"');
        if(label){
            return `
            <div class="form-group">
                <label for="${id}" class="control-label">${label}${options.notice ? `<span class="control-label-notice">${options.notice}</span>` : ''}</label>
                ${body}
            </div>
        `;
        }else{
            return `
            <div class="form-group">
                ${body}
            </div>
        `;
        }

    }

    export function panel(body:string, [type = 'default', heading = ''] = []) {
        return `<div class="panel panel-${type}">${heading ? `<div class="panel-heading">${heading}</div>` : ''}<div class="panel-body">${body}</div></div>`;
    }

    export function col(body:string, [size = 6] = []) {
        return `<div class="col-md-${size}">${body}</div>`;
    }

    export function row(body:string) {
        return `<div class="row">${body}</div>`;
    }

    export function buttons(value:string){
        return `<div class="btn-group">${value}</div>`;
    }


    export function registerTwigFunction(name, callable){
        Twig.extendFunction(name, function(...args){
            var output:any = new String(callable.apply(this, args));
            output.twig_markup = true;
            output.twig_filter = name;
            return output;
        });
    }

    export function registerTwigFilter(name, callable){
        Twig.extendFilter(name, function(...args){
            var output:any = new String(callable.apply(this, args));
            output.twig_markup = true;
            output.twig_filter = name;
            return output;
        });
    }

    function registerTwigFilters(){
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

        ].forEach(function(name:string){
            registerTwigFilter(name, Helpers[name]);
        });
    }

    function registerTwigFunctions(){
        [
            'button',
            'submit',
            'buttons',
            'component',
            'panel',
            'group',
            'row'

        ].forEach(function(name:string){
            registerTwigFunction(name, Helpers[name]);
        });
    }

    registerTwigFilters();
    registerTwigFunctions();

}