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

    export function button(caption:string, {size = '', type = 'default', icon = '', className = ''} = {}){
        return `<button 
                class="btn btn-${type} ${size ? `btn-${size}` : ''} ${className}" 
                type="button" 
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

    export function icon(value:any, [icon = ''] = ['']){
        if(!icon){
            return value;
        }
        return `<i class="icon ${resolveIconClass(icon)}"></i>${value}`;
    }

    export function action(value:any, [name, ...options] : [string, any]){
        if(!value){
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


    export function file(value:any, [name, options = {}]){
        var output = 'Файл не загружен';

        if(value){
            output = `
                <a href="${value.path}/${value.name}" target="_blank">${value.original_name}</a> (${value.size})
                <div class="checkbox">
                    <label class="small">
                        <input type="checkbox" name="${name}__delete"> Удалить файл
                    </label>
                </div>
            `;
        }


        return `
            <div class="panel panel-default">
                <div class="panel-heading"><input type="file" name="${name}"></div>
                <div class="panel-body">${output}</div>
            </div>
        `;
    }

    export function video(value:any, [name, options = {}]:[string, any] = ['', {}]){
        var output = 'Видео не загружено',
            url = '';

        if(value){
            url = value.url;
            output = `<a href="${value.url}" target="_blank">${value.preview}</a>`;
        }

        return `
            <div class="panel panel-default">
                <div class="panel-heading"><input type="text" class="form-control" name="${name}" value="${url}" placeholder="Ссылка на YouTube"></div>
                <div class="panel-body">${output}</div>
            </div>
        `;
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
    export function image(value:any, [name, options = {}]:[string, any] = ['', {}]){
        options = $.extend({deletable: true}, options);

        var output = 'Изображение не загружено';

        if(value){
            output = `<a href="${value.path}/${value.name}" target="_blank">${value.preview}</a>`;

            if(options.deletable){
                output += `   
                    <div class="checkbox">
                        <label class="small">
                            <input type="checkbox" name="${name}__delete"> Удалить изображение
                        </label>
                    </div>
                `;
            }
        }

        return `
            <div class="panel panel-default">
                <div class="panel-heading"><input type="file" name="${name}"></div>
                <div class="panel-body">${output}</div>
            </div>
        `;
    }

    export function gallery(value:any, options?:any){
        var name = options && options[0] ? options[0] : '',
            output = 'Изображение не загружено';

        return component('Media.GalleryTable', {field_name: name, gallery_id: value}, {}) + `<input type="hidden" name="${name}" value="${value}">`;
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

        return `<select name="${name}" class="form-control">${selectOptions.join('')}</select>`;
    }


    export function radio(value:string){
        return value;
    }

    export function checkbox(value:string, [name = '', caption = ''] = []){
        value = value ? Utils.escape(value.toString()) : '';

        return `<div class="checkbox"><label><input type="checkbox" name="${name}" ${value ? 'checked' : ''}> ${caption}</label></div>`;
    }

    export function input(value:string, [name, type, options]){
        options = options || {};
        var attributes = [], classes = ['form-control'];

        if(options.size){
            classes.push('input-' + options.size);
        }

        switch(type){
            case 'date':
                attributes.push(`data-inputmask='"mask": "d.m.y", "placeholder": "дд.мм.гггг"'`);
                break;
            case 'datetime':
                attributes.push(`data-inputmask='"mask": "d.m.y h:s:s", "placeholder": "дд.мм.гггг чч:мм:сс"'`);
                break;
        }

        value = value ? Utils.escape(value.toString()) : '';



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

    export function panel(body:string) {
        return `<div class="panel panel-default"><div class="panel-body">${body}</div></div>`;
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

    export function registerTwigFunctions(){
        [
            'button',
            'submit',
            'buttons',
            'component',
            'panel',
            'group',
            'row'

        ].forEach(function(name:string){
            Twig.extendFunction(name, function(...args){
                var output:any = new String(Helpers[name].apply(this, args));
                output.twig_markup = true;
                output.twig_function = name;
                return output;
            });
        });
    }

    export function registerTwigFilters(){
        [
            'controls',
            'checkbox',
            'radio',
            'text',
            'input',
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
            Twig.extendFilter(name, function(...args){
                var output:any = new String(Helpers[name].apply(this, args));
                output.twig_markup = true;
                output.twig_filter = name;
                return output;
            });
        });

        [].forEach(function(name:string){
            Twig.extendFilter(name, Helpers[name]);
        });
    }

    registerTwigFilters();
    registerTwigFunctions();

}