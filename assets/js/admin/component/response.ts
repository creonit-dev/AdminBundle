module Creonit.Admin.Component {
    export class Response{
        data:any;
        query:any;
        schema:any;
        error:any;
        success:any;

        constructor(response:any){
            $.extend(this, response);
        }

    }
}