module Creonit {
    export module Admin {
        export module Component {
            export class Request{
                public static TYPE_LOAD_SCHEMA = 'load_schema';
                public static TYPE_LOAD_DATA = 'load_data';
                public static TYPE_SEND_DATA = 'send_data';

                protected static increment = 1;

                component:Component;
                id:number;
                name:string;
                type:string;
                data:any;
                parameters:Object;
    
                constructor(component:Component, type:string, data?:any){
                    this.id = Request.increment++;
                    this.component = component;
                    this.name = component.getName();
                    this.type = type;
                    this.data = data;
                    this.parameters = $.extend({}, component.getParameters());
                }

                getId(){
                    return this.id;
                }


                getQuery(){
                    return {
                        name: this.name,
                        type: this.type,
                        parameters: this.parameters,
                        data: this.data
                    };
                }
    
                passResponse(response:Response){
                    this.component.applyResponse(response);
                }
            }
        }
    }
}