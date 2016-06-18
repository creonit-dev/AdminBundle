<?php

namespace Creonit\AdminBundle\Component;

use Creonit\AdminBundle\Component\Request\ComponentRequest;
use Creonit\AdminBundle\Component\Response\ComponentResponse;
use Creonit\AdminBundle\Component\Scope\Scope;
use Creonit\AdminBundle\Component\Scope\ScopeRelation;

abstract class ListComponent extends Component
{

    protected $header = '';

    protected $relations = [];


    public function addRelation(ScopeRelation $relation){
        $this->relations[] = $relation;
        return $this;
    }



    /**
     * @param string $header
     */
    public function setHeader($header)
    {
        $this->header = $header;
    }

    /**
     * @return string
     */
    public function getHeader()
    {
        return $this->header;
    }

    protected function prepareSchema()
    {

        $this->setTemplate(
<<<EOD
            <div class="component-list-filter"></div>
            <div class="component-list-body"></div>
            <div class="component-list-total">Итого: 1000 записей</div>
EOD
        );
        
        /*
        foreach ($schema as $annotation){
            $pattern = new ComponentPattern('');
            $pattern->parseAnnotations($annotation);
            $this->addPattern($pattern);
        }
        
        */
        

    }


    public function applySchemaAnnotation($annotation)
    {
        switch($annotation['key']){
            case 'header':
                $this->setHeader($annotation['value']);
                break;
            default:
                parent::applySchemaAnnotation($annotation);
        }
    }


    protected function loadData(ComponentRequest $request, ComponentResponse $response)
    {
        $entities = [];

        foreach($this->scopes as $scope){
            $data = $this->getData($scope);

            $entities[$scope->getName()] = $data;

        }


        $response->data->set('entities', $entities);

    }

    /**
     * @param Scope $scope
     * @param null|ScopeRelation $relation
     * @param null|mixed $relationId
     * @param int $level
     * @return array
     */
    protected function getData(Scope $scope, $relation = null, $relationValue = null, $level = 0){
        $entities = [];
        $query = $scope->createQuery();

        if(null !== $relation){
            $query->filterBy($relation->getSourceField(), $relationValue);
        }

        foreach($query->find() as $entity){
            $entityData = [];
            foreach($scope->getFields() as $field){
                $entityData[$field->getName()] = $field->load($entity);
                $entityData['_key'] = $entity->getPrimaryKey();
            }
            $entities[] = $entityData;
        }
        return $entities;
    }


}