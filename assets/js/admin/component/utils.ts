module Creonit.Admin.Component.Utils{
    
    export function escape(value:any){
        return value.toString().replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
}