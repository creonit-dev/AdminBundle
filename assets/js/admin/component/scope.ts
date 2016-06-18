module Creonit.Admin.Component {
    export class Scope{
        public name:string;
        public template:any;
        protected component:Component;

        constructor(component:Component, options:any){
            $.extend(this, options);

            this.component = component;
            this.template = twig({autoescape: true, data: this.template});
        }

    }
}