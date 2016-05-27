<?php

namespace Creonit\AdminBundle\Component\Response;

use Symfony\Component\HttpFoundation\ParameterBag;

class ComponentResponse
{

    public $data;
    protected $schema;
    protected $error;
    protected $success;

    public function __construct()
    {
        $this->data = new ParameterBag();
    }

    public function error($message)
    {
        $this->error = $message;
        return $this;
    }

    public function dump()
    {
        if($this->error){
            return ['error' => $this->error];
        }else{
            $response = [];
            if($this->data->count()){
                $response['data'] = $this->data->all();
            }

            if($this->schema){
                $response['schema'] = $this->schema;
            }
            if($this->success){
                $response['success'] = 1;
            }

            return $response;
        }
    }

    public function setSchema($schema)
    {
        $this->schema = $schema;
    }

    public function sendSuccess()
    {
        $this->success = true;
    }

}