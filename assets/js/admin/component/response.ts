module Creonit {
    export module Admin {
        export module Component {
            export class Response{
                data:any;
                schema:any;
                error:any;
                success:any;

                constructor(response:any){
                    $.extend(this, response);
                }
    
            }
        }
    }
}