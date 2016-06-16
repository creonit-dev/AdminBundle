<?php

namespace Creonit\AdminBundle\Component\Response;

use Creonit\AdminBundle\Exception\HandleException;
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
        $this->error = new ParameterBag();
    }

    public function error($message, $scope = '_')
    {
        $error = $this->error->get($scope);

        if(null === $error){
            $error = [];
        }

        $error[] = $message;

        $this->error->set($scope, $error);

        return $this;
    }

    public function flushError($message = null, $scope = '_'){
        if(null !== $message){
            $this->error($message, $scope);
        }
        if($this->hasError()){
            throw new HandleException();
        }
    }

    public function hasError(){
        return !!$this->error->count();
    }

    public function dump()
    {
        if($this->error->count()){
            return ['error' => $this->error->all()];
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