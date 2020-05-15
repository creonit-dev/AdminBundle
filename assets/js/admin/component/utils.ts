module Creonit.Admin.Component.Utils{
    export const ATTR_HANDLER = 'js-component';
    var increment = 0;


    export function escape(value:any){
        return value.toString().replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    export function createComponent(node:any, parent?:Component) {
        var componentData = node.attr(ATTR_HANDLER).match(/^((?:\w*\.)?\w+([A-Z][a-z\d]+))\s*(\{\s*.*?\s*\})?(?:\s(\{\s*.*\s*\}))?\s*$/);

        if (null === componentData) {
            throw 'Wrong component name format "' + node.attr(ATTR_HANDLER) + '"';
        }

        var componentName = componentData[1],
            componentType = componentData[2],
            componentQuery = componentData[3] ? eval('(function(){return ' + componentData[3] + '}())') : {},
            componentOptions = componentData[4] ? eval('(function(){return ' + componentData[4] + '}())') : {};

        switch (componentType) {
            case 'List':
                return new List(node, componentName, componentQuery, componentOptions, parent);
            case 'Table':
                return new Table(node, componentName, componentQuery, componentOptions, parent);
            case 'Editor':
                return new Editor(node, componentName, componentQuery, componentOptions, parent);
            default:
                throw 'Component with type "' + componentType + '" not found';
        }
    }

    export function initializeComponents(context?:any, parent?:Component){
        $('['+ ATTR_HANDLER +']', context).each(function(){
            var node = $(this);
            if(true == node.data('creonit-component-initialized')) return;
            var component = createComponent(node, parent);
            node.data('creonit-component-initialized', true);
            node.data('creonit-component', component);
        });
    }

    export function raw(string){
        var output:any = new String(string);
        output.twig_markup = true;
        return output;
    }

    export function generateId(){
        return ++increment;
    }

    export function functionArguments(func) {
        return (func + '')
            .replace(/[/][/].*$/mg,'')
            .replace(/\s+/g, '')
            .replace(/[/][*][^/*]*[*][/]/g, '')
            .split('){', 1)[0].replace(/^[^(]*[(]/, '')
            .replace(/=[^,]+/g, '')
            .split(',').filter(Boolean);
    }
}