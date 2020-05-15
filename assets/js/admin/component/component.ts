declare var CreonitAdminActiveModule:string;
module Creonit.Admin.Component {


    export class Component extends Scope{
        protected title:string;
        protected name:string;
        protected manager:Manager;
        protected parent:Component;

        protected query:any = {};
        protected options:any = {};
        protected data:any = {};
        protected node:any;

        protected actions:any = {};
        protected events:any = {};

        constructor(node:any, name:string, query:any = {}, options:any = {}, parent?:Component) {
            super();

            this.manager = Manager.getInstance();


            if(name.indexOf('.') == -1){
                if(parent) {
                    name = parent.getModuleName() + '.' + name;
                }else{
                    name = CreonitAdminActiveModule + '.' + name;
                }
            }else if(name.indexOf('.') == 0){
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

        initialize(){

        }

        getNode(){
            return this.node;
        }

        action(name, options, event) {
            if (this.actions[name]) {
                const functionArgs = Utils.functionArguments(this.actions[name]);
                let args = [];

                if (event && functionArgs.indexOf('$event') >= 0) {
                    for (let i = 0; i < functionArgs.length - 1; i++) {
                        args.push(options[i]);
                    }

                    args.push(event);

                } else {
                    args = options;
                }

                return this.actions[name].apply(this, args);

            } else {
                throw new Error(`Undefined method ${name} in component ${this.name}`);
            }
        }

        getName() {
            return this.name;
        }

        getModuleName(){
            return this.name.substring(0, this.name.indexOf('.'));
        }

        getQuery() {
            return $.extend({}, this.query);
        }

        loadSchema() {
            this.node.html('<div class="loading"><i class="fa fa-cog fa-spin fa-fw"></i></div>');
            this.request(Request.TYPE_LOAD_SCHEMA, this.getQuery(), null, (response) => {
                if(this.checkResponse(response, this.options.modal)){
                    this.applyResponse(response);
                    this.node.trigger('component-schema-loaded', this);
                }else{
                    if(this.options.modal){
                        this.close();
                    }else{
                        this.node.html(`<div class="loading is-error"><i class="fa fa-cog fa-spin fa-fw"></i>${response.error['_'] ? response.error['_'].join(", ") : 'Ошибка загрузки компонента'}</div>`);
                    }
                }
            });
        }

        loadData() {
            this.node.find('[data-toggle="tooltip"]').tooltip('destroy');

            if(this.parameters.reloadSchema){
                this.loadSchema();
            }else{
                this.node.stop(true).delay(300).animate({opacity: .85}, 600);
                this.request(Request.TYPE_LOAD_DATA, this.getQuery(), null, (response) => {
                    this.node.stop(true).animate({opacity: 1}, 300);
                    this.checkResponse(response) && this.applyResponse(response);
                });
            }
        }

        checkResponse(response:any, announce:boolean = true){
            if (response.error) {
                if(announce && response.error['_']){
                    alert(response.error['_'].join("\n"));
                }
                return false;
            }else{
                return true;
            }
        }

        applyResponse(response:Response) {
            if (response.schema) {
                this.applySchema(response.schema);
            }

            if(response.query){
                $.extend(this.query, response.query);
            }

            this.data = response.data || {};
            this.trigger('load', {});
            this.render();

            this.node.find('[js-component-external-field-reset]')
                .off('.component')
                .on('click.component', (e) => {
                    e.preventDefault();
                    var $input = $(e.currentTarget).prev('a').find('[js-component-external-field]');
                    $input.text($input.data('empty')).parent().parent().next('input').val('');
                });
        }

        applySchema(schema:any) {
            $.each(schema.actions, (name, action) => {
                this.actions[name] = eval('(function(){return ' + action + '})()');
            });

            $.each(schema.events, (name, action) => {
                this.on(name, eval('(function(){return ' + action + '})()'));
            });

            $.extend(this.actions, {
                openComponent: this.openComponent
            });

            if(this.options.external){
                this.actions['external'] = (value, title) => {
                    this.parent.node.find(`[js-component-external-field=${this.options.external}]`).text(title).parent().parent().next('input').val(value);
                    this.close();
                }
            }

            super.applySchema(schema);
        }

        render() {


        }

        close(){
            if(this.options.modal){
                this.node.arcticmodal('close');
            }
        }

        trigger(event:string, data:any){
            if(this.events[event]){
                this.events[event].forEach((listener:(data: any) => void) => {
                    listener.call(this, data);
                });
            }

            this.manager.trigger('component_' + event, $.extend({}, data, {component: this}));
        }

        on(event:string, callback: (data: any) => void){
            if(!this.events[event]){
                this.events[event] = [];
            }

            if(this.events[event].indexOf(callback) == -1){
                this.events[event].push(callback);
            }
        }


        protected request(type:string, query:any = {}, data?:any, callback?:(response:any)=>void) {
            this.manager.request(new Request(this, type, query, data, callback));
        }


        openComponent(name:string, query:any = {}, options:any = {}) {
            options.modal = true;
            var $modal = $(`
                <div class="modal-dialog modal-lg">
                    ${Helpers.component(name, query, options)}
                </div>
            `
            );

            $modal.arcticmodal({
                closeOnOverlayClick: false,
                closeOnEsc: false,
                beforeOpen: () => {
                    Utils.initializeComponents($modal, this);

                    $modal.find('[js-component]').one('component-schema-loaded', function(e, component){
                        component.trigger('open', {});
                    });
                },
                beforeClose: () => {
                    $modal.find('[js-component]').data('creonit-component').trigger('close', {});
                },
            });
        }

    }

}