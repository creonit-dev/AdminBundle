<?php

namespace Creonit\AdminBundle\Component\Request;

use Symfony\Component\HttpFoundation\ParameterBag;

class ComponentRequest
{
    const TYPE_LOAD_SCHEMA = 'load_schema';
    const TYPE_LOAD_DATA = 'load_data';
    const TYPE_SEND_DATA = 'send_data';

    protected $type;
    public $query;
    public $data;
    public $options;

    public function __construct($request)
    {
        $this->type = $request['type'];
        $this->data = new ParameterBag(isset($request['data']) && is_array($request['data']) ? $request['data'] : []);
        $this->query = new ParameterBag(isset($request['query']) && is_array($request['query']) ? $request['query'] : []);
        $this->options = new ParameterBag(isset($request['options']) && is_array($request['options']) ? $request['options'] : []);
    }

    public function getType(){
        return $this->type;
    }
}