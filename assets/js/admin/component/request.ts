module Creonit.Admin.Component {
    export class Request{
        public static TYPE_LOAD_SCHEMA = 'load_schema';
        public static TYPE_LOAD_DATA = 'load_data';

        protected static increment = 1;

        component:Component;
        id:number;
        name:string;
        type:string;
        data:any;
        query:any;
        
        protected callback;

        constructor(component:Component, type:string, query:any, data?:any, callback?: (response: any) => void){
            this.id = Request.increment++;
            this.component = component;
            this.name = component.getName();
            this.type = type;
            this.query = query;
            this.data = data;
            this.callback = callback.bind(component);
        }

        getId(){
            return this.id;
        }

        getQuery(){
            
            return {
                name: this.name,
                type: this.type,
                query: this.query,
                data: this.data
            };
        }

        passResponse(response:Response){
            this.callback(response);
        }
    }
}