<?php

namespace Creonit\AdminBundle\Component\Request;

use Symfony\Component\HttpFoundation\ParameterBag;

class ComponentRequest
{
    const TYPE_LOAD_SCHEMA = 'load_schema';
    const TYPE_LOAD_DATA = 'load_data';
    const TYPE_SEND_DATA = 'send_data';

    protected $type;
    public $parameters;
    public $data;

    public function __construct($request)
    {
        $this->type = $request['type'];
        $this->data = new ParameterBag(isset($request['data']) && is_array($request['data']) ? $request['data'] : []);
        $this->parameters = new ParameterBag(isset($request['parameters']) && is_array($request['parameters']) ? $request['parameters'] : []);
    }

    public function getType(){
        return $this->type;
    }
}