module Creonit.Admin.Component {
    export class Pattern{
        public name:string;
        public template:any;
        protected component:Component;
        protected actions:any;

        constructor(component:Component, options:any){
            $.extend(this, options);

            this.component = component;
            this.template = twig({autoescape: true, data: this.template});

            this.actions = {
                openComponent: this.openComponent
            }
        }

        protected openComponent(options:any){
            this.component.action('openComponent', options);
        }

        public action(name, options){
            if(this.actions[name]){
                return this.actions[name].call(this, options);
            }else{
                throw new Error(`Undefined method ${name} in pattern ${this.name}`);
            }
        }

       
    }
}