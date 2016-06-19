module Creonit.Admin.Component {
    export class Scope{
        public template:any;
        public scopes:Scope[] = [];
        public parameters:any = {};
        public parentScope:Scope;

        constructor(){

        }

        applySchema(schema:any) {
            if(schema.template){
                this.template = twig({autoescape: true, data: schema.template});
                delete schema.template;
            }

            if(schema.scopes){
                schema.scopes.forEach((scope) => {
                    let child = new Scope();
                    child.applySchema(scope);
                    this.addScope(child);
                });
                delete schema.scopes;
            }

            $.extend(this.parameters, schema);

        }

        getScope(name:string){
            return this.scopes.filter(scope => scope.parameters.name == name)[0];
        }

        addScope(scope:Scope){
            scope.setParentScope(this);
            this.scopes.push(scope);
            return this;
        }

        setParentScope(scope:Scope){
            this.parentScope = scope;
            return this;
        }

    }
}