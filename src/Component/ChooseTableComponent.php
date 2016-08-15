<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\Scope;
use Symfony\Component\HttpFoundation\ParameterBag;

abstract class ChooseTableComponent extends TableComponent
{


    public function schema()
    {
    }

    protected function decorate(ComponentRequest $request, ComponentResponse $response, ParameterBag $data, $entity, Scope $scope, $relation, $relationValue, $level)
    {
        if($data->get('_key') == $request->query->get('value')){
            $data->set('_row_class', 'success');
        }
    }




}