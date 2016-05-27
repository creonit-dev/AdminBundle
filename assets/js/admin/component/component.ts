module Creonit {
    export module Admin {
        export module Component {
            export const ATTR_HANDLER = 'js-component';
            export class Component {
                protected name:string;
                protected manager:Manager;
                protected parameters:any = {};
                protected patterns:Pattern[] = [];
                protected parent:Component;
                protected data:any = {};
                protected node:any;
                protected template:any;
                protected modal:boolean = false;
                protected actions:any;

                constructor(name:string, options:any = {}) {
                    this.manager = Manager.getInstance();
                    this.name = name;
                    if (options.parameters) {
                        this.parameters = $.extend({}, options.parameters);
                    }

                    this.node = $('<div class="creonit-component"></div>');

                    if(options.attach){
                        $(options.attach).append(this.node);
                    }

                    if(options.parent){
                        this.parent = options.parent;
                    }

                    if(options.modal){
                        this.modal = options.modal;
                    }

                    this.actions = {
                        openComponent: this.openComponent
                    };

                    this.loadSchema();
                }

                action(name, options){
                    if(this.actions[name]){
                        return this.actions[name].call(this, options);
                    }else{
                        throw new Error(`Undefined method ${name} in component ${this.name}`);
                    }
                }

                getName() {
                    return this.name;
                }

                getParameters() {
                    return this.parameters;
                }


                getPattern(name:string):Pattern{
                    return this.patterns[name];
                }

                loadSchema() {
                    this.request(Request.TYPE_LOAD_SCHEMA);
                }

                loadData() {
                    this.request(Request.TYPE_LOAD_DATA);
                }

                sendData(data:Object) {
                    this.request(Request.TYPE_SEND_DATA, data);
                }

                applyResponse(response:Response) {
                    console.log(response);

                    if(response.error) {
                        this.node.html(response.error);
                    }else{

                        if(response.schema){
                            this.applySchema(response.schema);
                        }

                        if(response.success && this.modal){
                            this.node.arcticmodal('close');
                        }

                        if(response.success && this.parent){
                            this.parent.loadData();
                        }

                        this.data = response.data || {};
                        this.render();
                    }
                }

                applySchema(schema:any){
                    this.template = twig({autoescape: true, data: schema.template});

                    if(schema.patterns){
                        schema.patterns.forEach((pattern:any) => {
                            this.patterns.push(new Pattern(this, pattern));
                        });
                    }
                }

                render(){


                }


                protected request(type:string, data?:Object) {

                    this.manager.request(new Request(this, type, data));
                }

                openComponent({name, parameters}){
                    let component = Helpers.component(name, {parameters: parameters});
                    $(`
                        <div class="modal-dialog modal-lg">
                            ${component}
                        </div>
                    `
                    ).arcticmodal({
                        beforeOpen: (modal, $modal) => {
                            find($modal, {parent: this, modal: true});
                        }
                    });
                }

            }

            export function createFromNode($component:any, options?:any) {
                var componentData = $component.attr(ATTR_HANDLER).match(/^(\w+\.\w+([A-Z][a-z\d]+))\s*(\{\s*[\w\W]*\s*\})?\s*$/);

                if (null === componentData) {
                    throw 'Wrong component name format "' + $component.attr(ATTR_HANDLER) + '"';
                }

                var componentName = componentData[1],
                    componentType = componentData[2],
                    componentOptions = componentData[3] ? eval('(function(){return ' + componentData[3] + '}())') : {};

                $.extend(componentOptions, options || {});
                componentOptions.attach = $component;



                switch (componentType) {
                    case 'List':
                        return new List($component, componentName, componentOptions);
                    case 'Table':
                        return new Table($component, componentName, componentOptions);
                    case 'Editor':
                        return new Editor($component, componentName, componentOptions);
                    default:
                        throw 'Component with type "' + componentType + '" not found';
                }
            }
            
            export function find(context?:any, options?:any){

                $('['+ Creonit.Admin.Component.ATTR_HANDLER +']').each(function(){
                    var $component = $(this);

                    if(true == $component.data('creonit-component-initialized')){
                        return;
                    }

                    var component = Creonit.Admin.Component.createFromNode($component, options);


                    $component.data('creonit-component-initialized', true);

                }, context);
            }
        }
    }

}