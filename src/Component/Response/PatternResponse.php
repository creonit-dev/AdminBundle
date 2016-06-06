<?php

namespace Creonit\AdminBundle\Component\Response;

use Symfony\Component\HttpFoundation\ParameterBag;

class PatternResponse
{

    /** @var ParameterBag  */
    public $error;

    /** @var ParameterBag  */
    public $data;

    protected $success;

    public function __construct()
    {
        $this->error = new ParameterBag();
        $this->data = new ParameterBag();
    }

    public function success()
    {
        $this->success = true;
        return $this;
    }

}