module Creonit.Admin.Component {
    

    export class Component {
        protected name:string;
        protected manager:Manager;
        protected patterns:Pattern[] = [];
        protected parent:Component;

        protected query:any = {};
        protected options:any = {};
        protected data:any = {};
        protected node:any;

        protected schema:any;
        protected template:any;
        protected actions:any = {};

        constructor(node:any, name:string, query:any = {}, options:any = {}, parent?:Component) {
            this.manager = Manager.getInstance();
            this.name = name;

            this.query = $.extend({}, query);

            this.node = node;
            this.parent = parent;
            this.options = options;

            this.loadSchema();
        }

        action(name, options) {
            if (this.actions[name]) {
                return this.actions[name].apply(this, options);
            } else {
                throw new Error(`Undefined method ${name} in component ${this.name}`);
            }
        }

        getName() {
            return this.name;
        }

        getQuery() {
            return $.extend({}, this.query);
        }

        getPattern(name:string):Pattern {
            return this.patterns[name];
        }

        loadSchema() {
            this.request(Request.TYPE_LOAD_SCHEMA, this.getQuery(), null, (response) => {
                this.checkResponse(response) && this.applyResponse(response);
            });
        }

        loadData() {
            this.request(Request.TYPE_LOAD_DATA, this.getQuery(), null, (response) => {
                this.checkResponse(response) && this.applyResponse(response);
            });
        }

        checkResponse(response:any){
            if (response.error) {
                if(response.error['_']){
                    alert(response.error['_'].join("\n"));
                }
                return false;
            }else{
                return true;
            }
        }

        applyResponse(response:Response) {
            console.log(response);

            if (response.schema) {
                this.applySchema(response.schema);
            }

            if(response.query){
                $.extend(this.query, response.query);
            }
            
            this.data = response.data || {};
            this.render();
        }

        applySchema(schema:any) {
            this.schema = schema;
            this.template = twig({autoescape: true, data: schema.template});

            $.each(this.schema.actions, (name, action) => {
                this.actions[name] = eval('(function(){return ' + action + '})()');
            });

            $.extend(this.actions, {
                openComponent: this.openComponent
            });

            if (schema.patterns) {
                schema.patterns.forEach((pattern:any) => {
                    this.patterns.push(new Pattern(this, pattern));
                });
            }

        }

        render() {


        }


        protected request(type:string, query:any = {}, data?:any, callback?:(response:any)=>void) {
            this.manager.request(new Request(this, type, query, data, callback));
        }

        openComponent(name:string, query:any = {}, options:any = {}) {
            options.modal = true;
            let component = Helpers.component(name, query, options);
            $(`
                <div class="modal-dialog modal-lg">
                    ${component}
                </div>
            `
            ).arcticmodal({
                beforeOpen: (modal, $modal) => {
                    Utils.initializeComponents($modal, this);
                }
            });
        }

    }

}