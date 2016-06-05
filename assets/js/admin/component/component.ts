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

        protected template:any;
        protected actions:any;

        constructor(node:any, name:string, query:any = {}, options:any = {}, parent?:Component) {
            this.manager = Manager.getInstance();
            this.name = name;

            this.query = $.extend({}, query);

            this.node = node;
            this.parent = parent;
            this.options = options;
            this.actions = {
                openComponent: function({name, query, options}){
                    this.openComponent(name, query, options);
                }
            };

            this.loadSchema();
        }

        action(name, options) {
            if (this.actions[name]) {
                return this.actions[name].call(this, options);
            } else {
                throw new Error(`Undefined method ${name} in component ${this.name}`);
            }
        }

        getName() {
            return this.name;
        }

        getQuery() {
            return this.query;
        }

        getOptions() {
            return this.options;
        }


        getPattern(name:string):Pattern {
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
            if (response.error) {
                this.node.html(response.error);
            } else {

                if (response.schema) {
                    this.applySchema(response.schema);
                }

                if (response.success && this.options.modal) {
                    this.node.arcticmodal('close');
                }

                if (response.success && this.parent) {
                    this.parent.loadData();
                }

                this.data = response.data || {};
                this.render();
            }
        }

        applySchema(schema:any) {
            this.template = twig({autoescape: true, data: schema.template});

            if (schema.patterns) {
                schema.patterns.forEach((pattern:any) => {
                    this.patterns.push(new Pattern(this, pattern));
                });
            }
        }

        render() {


        }


        protected request(type:string, data?:any) {

            this.manager.request(new Request(this, type, data));
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