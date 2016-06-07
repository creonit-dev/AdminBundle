module Creonit.Admin.Component {
    

    export class Component {
        protected name:string;
        protected manager:Manager;
        protected patterns:Pattern[] = [];
        protected parent:Component;

        protected schema:any;

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

            this.node.find('.error-message').each(function(){
                var $message = $(this),
                    $group = $message.closest('.form-group');

                $message.remove();
                $group.removeClass('has-error');
            });
        }

        applyResponse(response:Response) {
            console.log(response);
            if (response.error) {
                //this.node.html(response.error);


                if(response.error['_']){
                    alert(response.error['_'].join("\n"));
                }else{
                    alert('При сохранении возникли ошибки');
                }

                $.each(response.error, (scope, messages) => {
                    if('_' == scope) return;
                    this.node.find(`input[name=${scope}], select[name=${scope}], textarea[name=${scope}]`).each(function(){
                        var $control = $(this),
                            $group = $control.closest('.form-group');

                        $group.addClass('has-error');
                        $control.after(`<span class="help-block error-message">${messages.join('<br>')}</span>`);
                    });
                });



            } else {

                if (response.schema) {
                    this.applySchema(response.schema);
                }

                if (response.success && this.options.modal) {
                    //this.node.arcticmodal('close');
                }

                if (response.success && this.parent) {
                    this.parent.loadData();
                }

                this.data = response.data || {};
                this.render();
            }
        }

        applySchema(schema:any) {
            this.schema = schema;

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